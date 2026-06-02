import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { runManualKiwoomQuoteVerification } from "../scripts/kiwoom-manual-quote-test.js";
import type {
  KiwoomQuoteEndpointMapping,
  KiwoomQuoteTransport,
  KiwoomTokenTransport
} from "../src/providers/kiwoom/index.js";
import {
  providerErrorKiwoomQuoteResponse,
  sensitiveMalformedKiwoomQuoteResponse,
  sensitiveProviderErrorKiwoomQuoteResponse,
  successfulKiwoomQuoteLikeResponse
} from "./fixtures/kiwoom-quote-responses.js";
import { kiwoomErrorTokenResponse, successfulKiwoomTokenResponse } from "./fixtures/kiwoom-token-responses.js";

describe("Kiwoom manual quote verification workflow", () => {
  it("blocks when real API opt-in is false", async () => {
    const tokenTransport = createMockTokenTransport();
    const quoteTransport = createMockQuoteTransport();
    const summary = await runManualKiwoomQuoteVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "false",
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_SECRET_KEY: "dummy_secret_key",
        KIWOOM_QUOTE_SYMBOL: "005930"
      },
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );

    expect(summary).toMatchObject({
      status: "blocked",
      provider: "kiwoom",
      quote_present: false
    });
    expect(tokenTransport.requestToken).not.toHaveBeenCalled();
    expect(quoteTransport.requestQuote).not.toHaveBeenCalled();
  });

  it("blocks when credentials are missing", async () => {
    const tokenTransport = createMockTokenTransport();
    const quoteTransport = createMockQuoteTransport();
    const summary = await runManualKiwoomQuoteVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "true",
        KIWOOM_QUOTE_SYMBOL: "005930"
      },
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );

    expect(summary.status).toBe("blocked");
    expect(tokenTransport.requestToken).not.toHaveBeenCalled();
    expect(quoteTransport.requestQuote).not.toHaveBeenCalled();
  });

  it("blocks placeholder credentials", async () => {
    const tokenTransport = createMockTokenTransport();
    const quoteTransport = createMockQuoteTransport();
    const summary = await runManualKiwoomQuoteVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "true",
        KIWOOM_APP_KEY: "YOUR_APP_KEY",
        KIWOOM_SECRET_KEY: "YOUR_SECRET_KEY",
        KIWOOM_QUOTE_SYMBOL: "005930"
      },
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );

    expect(summary).toMatchObject({
      status: "blocked",
      quote_present: false,
      reason: expect.stringContaining("Placeholder credentials")
    });
    expect(JSON.stringify(summary)).not.toContain("YOUR_APP_KEY");
    expect(JSON.stringify(summary)).not.toContain("YOUR_SECRET_KEY");
    expect(tokenTransport.requestToken).not.toHaveBeenCalled();
    expect(quoteTransport.requestQuote).not.toHaveBeenCalled();
  });

  it("blocks .env.example placeholder credentials", async () => {
    const tokenTransport = createMockTokenTransport();
    const quoteTransport = createMockQuoteTransport();
    const summary = await runManualKiwoomQuoteVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "true",
        KIWOOM_APP_KEY: "YOUR_KIWOOM_APP_KEY",
        KIWOOM_SECRET_KEY: "YOUR_KIWOOM_SECRET_KEY",
        KIWOOM_QUOTE_SYMBOL: "005930"
      },
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );

    expect(summary).toMatchObject({
      status: "blocked",
      quote_present: false,
      reason: expect.stringContaining("Placeholder credentials")
    });
    expect(JSON.stringify(summary)).not.toContain("YOUR_KIWOOM_APP_KEY");
    expect(JSON.stringify(summary)).not.toContain("YOUR_KIWOOM_SECRET_KEY");
    expect(tokenTransport.requestToken).not.toHaveBeenCalled();
    expect(quoteTransport.requestQuote).not.toHaveBeenCalled();
  });

  it("blocks when symbol is missing", async () => {
    const tokenTransport = createMockTokenTransport();
    const quoteTransport = createMockQuoteTransport();
    const summary = await runManualKiwoomQuoteVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "true",
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_SECRET_KEY: "dummy_secret_key"
      },
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );

    expect(summary).toMatchObject({
      status: "blocked",
      quote_present: false,
      reason: expect.stringContaining("symbol")
    });
    expect(tokenTransport.requestToken).not.toHaveBeenCalled();
    expect(quoteTransport.requestQuote).not.toHaveBeenCalled();
  });

  it("blocks when quote endpoint mapping is disabled", async () => {
    const tokenTransport = createMockTokenTransport();
    const quoteTransport = createMockQuoteTransport();
    const summary = await runManualKiwoomQuoteVerification(
      validQuoteEnv,
      { tokenTransport, quoteTransport }
    );

    expect(summary).toMatchObject({
      status: "blocked",
      symbol: "005930",
      quote_present: false,
      reason: expect.stringContaining("disabled")
    });
    expect(tokenTransport.requestToken).not.toHaveBeenCalled();
    expect(quoteTransport.requestQuote).not.toHaveBeenCalled();
  });

  it("does not request a quote when token request fails", async () => {
    const tokenTransport = createMockTokenTransport(kiwoomErrorTokenResponse);
    const quoteTransport = createMockQuoteTransport(successfulKiwoomQuoteLikeResponse);
    const summary = await runManualKiwoomQuoteVerification(
      validQuoteEnv,
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );

    expect(summary).toMatchObject({
      status: "error",
      quote_present: false,
      error: {
        code: "KIWOOM_TOKEN_REQUEST_FAILED",
        provider: "kiwoom",
        retryable: false
      }
    });
    expect(tokenTransport.requestToken).toHaveBeenCalledOnce();
    expect(quoteTransport.requestQuote).not.toHaveBeenCalled();
  });

  it("returns ok output for a quote success fixture", async () => {
    const tokenTransport = createMockTokenTransport(successfulKiwoomTokenResponse);
    const quoteTransport = createMockQuoteTransport(successfulKiwoomQuoteLikeResponse);
    const summary = await runManualKiwoomQuoteVerification(
      validQuoteEnv,
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );

    expect(summary).toMatchObject({
      status: "ok",
      provider: "kiwoom",
      environment: "mock",
      symbol: "005930",
      quote_present: true,
      quote: {
        provider: "kiwoom",
        symbol: "005930",
        currency: "KRW",
        price: 70000,
        as_of: "2026-06-02T09:00:00.000Z"
      }
    });
    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain("fixture_access_token_value");
    expect(serialized).not.toContain("dummy_app_key");
    expect(serialized).not.toContain("dummy_secret_key");
    expect(quoteTransport.requestQuote).toHaveBeenCalledOnce();
  });

  it("returns safe error output for quote error fixtures", async () => {
    const tokenTransport = createMockTokenTransport(successfulKiwoomTokenResponse);
    const quoteTransport = createMockQuoteTransport(providerErrorKiwoomQuoteResponse);
    const summary = await runManualKiwoomQuoteVerification(
      validQuoteEnv,
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );

    expect(summary).toMatchObject({
      status: "error",
      quote_present: false,
      error: {
        code: "KIWOOM_QUOTE_REQUEST_FAILED",
        provider: "kiwoom",
        retryable: false,
        return_code: "Q1001"
      }
    });
    expect(JSON.stringify(summary)).not.toContain("dummy_app_key");
    expect(JSON.stringify(summary)).not.toContain("dummy_secret_key");
    expect(JSON.stringify(summary)).not.toContain("fixture_access_token_value");
  });

  it("does not expose access tokens in quote provider error output", async () => {
    const tokenTransport = createMockTokenTransport(successfulKiwoomTokenResponse);
    const quoteTransport = createMockQuoteTransport(sensitiveProviderErrorKiwoomQuoteResponse);
    const summary = await runManualKiwoomQuoteVerification(
      validQuoteEnv,
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );
    const serialized = JSON.stringify(summary);

    expect(summary).toMatchObject({
      status: "error",
      quote_present: false,
      error: {
        code: "KIWOOM_QUOTE_REQUEST_FAILED",
        provider: "kiwoom",
        retryable: false,
        return_code: "Q2001"
      }
    });
    expect(serialized).not.toContain("fixture_access_token_value");
    expect(serialized).not.toContain("fixture_quote_access_token");
    expect(serialized).not.toContain("dummy_app_key");
    expect(serialized).not.toContain("dummy_secret_key");
    expect(serialized).not.toContain("access_token=");
  });

  it("does not expose raw malformed quote response bodies", async () => {
    const tokenTransport = createMockTokenTransport(successfulKiwoomTokenResponse);
    const quoteTransport = createMockQuoteTransport(sensitiveMalformedKiwoomQuoteResponse);
    const summary = await runManualKiwoomQuoteVerification(
      validQuoteEnv,
      { tokenTransport, quoteTransport, quoteEndpointMapping: enabledQuoteMapping }
    );
    const serialized = JSON.stringify(summary);

    expect(summary).toMatchObject({
      status: "error",
      quote_present: false,
      error: {
        code: "KIWOOM_QUOTE_BAD_RESPONSE",
        provider: "kiwoom",
        retryable: false
      }
    });
    expect(serialized).not.toContain("not-a-number-with-token");
    expect(serialized).not.toContain("fixture_quote_access_token");
    expect(serialized).not.toContain("fixture_secret");
  });

  it("keeps fetch isolated to Kiwoom transport", () => {
    const scriptSource = readFileSync("scripts/kiwoom-manual-quote-test.ts", "utf8");
    const transportSource = readFileSync("src/providers/kiwoom/transport.ts", "utf8");

    expect(scriptSource).not.toContain("fetch(");
    expect(transportSource).toContain("fetch(");
  });

  const validQuoteEnv = {
    KIWOOM_ENABLE_REAL_API_CALLS: "true",
    KIWOOM_APP_KEY: "dummy_app_key",
    KIWOOM_SECRET_KEY: "dummy_secret_key",
    KIWOOM_ENV: "mock",
    KIWOOM_QUOTE_SYMBOL: "005930"
  };

  const enabledQuoteMapping: KiwoomQuoteEndpointMapping = {
    enabled: true,
    manualOnly: true,
    readOnly: true,
    method: "POST",
    path: "/quote-placeholder",
    apiId: "ka10001",
    description: "Test-only enabled quote endpoint mapping.",
    requiresToken: true,
    exposesPublicTool: false,
    forbiddenScopes: ["account", "order", "balance", "holdings", "trading"],
    verified: false
  };

  function createMockTokenTransport(response = successfulKiwoomTokenResponse): KiwoomTokenTransport {
    return {
      requestToken: vi.fn().mockResolvedValue(response)
    };
  }

  function createMockQuoteTransport(response = {}): KiwoomQuoteTransport {
    return {
      requestQuote: vi.fn().mockResolvedValue(response)
    };
  }
});
