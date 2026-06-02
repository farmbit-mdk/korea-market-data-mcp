import { describe, expect, it, vi } from "vitest";
import { MockMarketDataProvider } from "../src/providers/mock/client.js";
import type { KiwoomQuoteEndpointMapping, NormalizedKiwoomQuote } from "../src/providers/kiwoom/index.js";
import {
  getKiwoomStockQuoteTool,
  normalizeMockQuoteForKiwoomPublicTool,
  runGuardedKiwoomPublicQuote
} from "../src/tools/get-kiwoom-stock-quote.js";
import { getRegisteredToolNames } from "../src/tools/index.js";

describe("Kiwoom public quote guarded skeleton", () => {
  it("registers the guarded public quote tool", () => {
    expect(getRegisteredToolNames()).toContain("get_kiwoom_stock_quote");
  });

  it("requires symbol", async () => {
    await expect(runGuardedKiwoomPublicQuote({})).resolves.toMatchObject({
      status: "error",
      provider: "kiwoom",
      quote_present: false,
      error: {
        code: "INVALID_INPUT",
        provider: "kiwoom",
        retryable: false
      }
    });
  });

  it.each(["", "   ", "00593", "0059300", "ABCDEF", "005930;DROP", { code: "005930" }])(
    "returns a safe validation error for invalid symbol %s",
    async (symbol) => {
      const response = await runGuardedKiwoomPublicQuote({ symbol });

      expect(response).toMatchObject({
        status: "error",
        provider: "kiwoom",
        quote_present: false,
        error: {
          code: "INVALID_INPUT",
          provider: "kiwoom",
          retryable: false
        }
      });
      expect(JSON.stringify(response)).not.toContain("app_key");
      expect(JSON.stringify(response)).not.toContain("secret");
      expect(JSON.stringify(response)).not.toContain("access_token");
    }
  );

  it.each([
    "account_no",
    "order_no",
    "balance",
    "holdings",
    "quantity",
    "price_type",
    "side",
    "position",
    "leverage",
    "recommendation"
  ])("rejects forbidden input field %s", async (field) => {
    await expect(runGuardedKiwoomPublicQuote({ symbol: "005930", [field]: "forbidden" })).resolves.toMatchObject({
      status: "error",
      provider: "kiwoom",
      quote_present: false,
      error: {
        code: "INVALID_INPUT",
        provider: "kiwoom"
      }
    });
  });

  it("does not expose forbidden fields in the public input schema", () => {
    expect(Object.keys(getKiwoomStockQuoteTool.inputSchema)).toEqual(["symbol", "market", "provider"]);
  });

  it("returns blocked when exposesPublicTool is false and does not call clients", async () => {
    const tokenClient = createMockTokenClient();
    const quoteClient = createMockQuoteClient();

    const response = await runGuardedKiwoomPublicQuote(
      { symbol: "005930", provider: "kiwoom" },
      {
        quoteEndpointMapping: {
          ...enabledPublicMapping,
          exposesPublicTool: false
        },
        tokenClient,
        quoteClient
      }
    );

    expect(response).toMatchObject({
      provider: "kiwoom",
      status: "blocked",
      symbol: "005930",
      quote_present: false
    });
    expect(JSON.stringify(response)).not.toContain("fixture_access_token");
    expect(tokenClient.getAccessToken).not.toHaveBeenCalled();
    expect(quoteClient.getQuote).not.toHaveBeenCalled();
  });

  it("returns blocked when real API calls are disabled and does not call clients", async () => {
    const tokenClient = createMockTokenClient();
    const quoteClient = createMockQuoteClient();

    const response = await runGuardedKiwoomPublicQuote(
      { symbol: "005930" },
      {
        env: {
          KIWOOM_ENABLE_REAL_API_CALLS: "false",
          KIWOOM_APP_KEY: "dummy_app_key",
          KIWOOM_SECRET_KEY: "dummy_secret_key",
          KIWOOM_ENV: "mock"
        },
        quoteEndpointMapping: enabledPublicMapping,
        tokenClient,
        quoteClient
      }
    );

    expect(response).toMatchObject({
      status: "blocked",
      quote_present: false,
      reason: expect.stringContaining("KIWOOM_ENABLE_REAL_API_CALLS")
    });
    expect(tokenClient.getAccessToken).not.toHaveBeenCalled();
    expect(quoteClient.getQuote).not.toHaveBeenCalled();
  });

  it("returns blocked when endpoint mapping is disabled and does not call clients", async () => {
    const tokenClient = createMockTokenClient();
    const quoteClient = createMockQuoteClient();

    const response = await runGuardedKiwoomPublicQuote(
      { symbol: "005930" },
      {
        env: validEnabledEnv,
        quoteEndpointMapping: {
          ...enabledPublicMapping,
          enabled: false
        },
        tokenClient,
        quoteClient
      }
    );

    expect(response).toMatchObject({
      status: "blocked",
      quote_present: false,
      reason: expect.stringContaining("disabled")
    });
    expect(tokenClient.getAccessToken).not.toHaveBeenCalled();
    expect(quoteClient.getQuote).not.toHaveBeenCalled();
  });

  it("does not expose app key, secret, or access token in blocked output", async () => {
    const response = await runGuardedKiwoomPublicQuote(
      { symbol: "005930" },
      {
        env: {
          KIWOOM_ENABLE_REAL_API_CALLS: "false",
          KIWOOM_APP_KEY: "dummy_app_key",
          KIWOOM_SECRET_KEY: "dummy_secret_key",
          KIWOOM_ENV: "mock"
        },
        quoteEndpointMapping: enabledPublicMapping
      }
    );
    const serialized = JSON.stringify(response);

    expect(serialized).not.toContain("dummy_app_key");
    expect(serialized).not.toContain("dummy_secret_key");
    expect(serialized).not.toContain("fixture_access_token");
  });

  it("returns a stable mocked ok response only when every guard is explicitly enabled in tests", async () => {
    const tokenClient = createMockTokenClient();
    const quoteClient = createMockQuoteClient();

    const response = await runGuardedKiwoomPublicQuote(
      { symbol: "005930", market: "KOSPI", provider: "kiwoom" },
      {
        env: validEnabledEnv,
        quoteEndpointMapping: enabledPublicMapping,
        tokenClient,
        quoteClient
      }
    );

    expect(response).toMatchObject({
      status: "ok",
      quote_present: true,
      provider: "kiwoom",
      symbol: "005930",
      quote: {
        provider: "kiwoom",
        symbol: "005930",
        name: "Samsung Electronics",
        market: "KOSPI",
        currency: "KRW",
        price: 70000,
        change: -500,
        change_rate: -0.71,
        volume: 12345678,
        as_of: "2026-06-03T09:00:00.000Z",
        raw_available: false
      }
    });
    expect(JSON.stringify(response)).not.toContain("fixture_access_token");
    expect(tokenClient.getAccessToken).toHaveBeenCalledOnce();
    expect(quoteClient.getQuote).toHaveBeenCalledWith({ symbol: "005930", market: "KOSPI" });
  });

  it("can build a mocked ok response from the existing mock provider quote flow", async () => {
    const mockProvider = new MockMarketDataProvider();
    const mockQuote = await mockProvider.getStockQuote({ symbol: "005930", market: "KOSPI" });
    const tokenClient = createMockTokenClient();
    const quoteClient = createMockQuoteClient(normalizeMockQuoteForKiwoomPublicTool(mockQuote));

    const response = await runGuardedKiwoomPublicQuote(
      { symbol: "005930", market: "KOSPI", provider: "kiwoom" },
      {
        env: validEnabledEnv,
        quoteEndpointMapping: enabledPublicMapping,
        tokenClient,
        quoteClient
      }
    );

    expect(response).toMatchObject({
      status: "ok",
      provider: "kiwoom",
      symbol: "005930",
      quote_present: true,
      quote: {
        provider: "kiwoom",
        symbol: "005930",
        name: "Samsung Electronics",
        market: "KOSPI",
        currency: "KRW",
        price: 70000,
        change: 500,
        change_rate: 0.72,
        volume: 12000000
      }
    });
  });

  const validEnabledEnv = {
    KIWOOM_ENABLE_REAL_API_CALLS: "true",
    KIWOOM_APP_KEY: "dummy_app_key",
    KIWOOM_SECRET_KEY: "dummy_secret_key",
    KIWOOM_ENV: "mock"
  };

  const enabledPublicMapping: KiwoomQuoteEndpointMapping = {
    enabled: true,
    manualOnly: false,
    readOnly: true,
    requiresToken: true,
    exposesPublicTool: true,
    forbiddenScopes: ["account", "order", "balance", "holdings", "trading"],
    method: "POST",
    path: "/quote-placeholder",
    apiId: "ka10001",
    description: "Test-only public guarded quote mapping.",
    verified: false
  };

  function createMockTokenClient() {
    return {
      getAccessToken: vi.fn().mockResolvedValue({
        accessToken: "fixture_access_token_value_that_must_not_escape"
      })
    };
  }

  function createMockQuoteClient(quote: NormalizedKiwoomQuote = {
    provider: "kiwoom",
    symbol: "005930",
    name: "Samsung Electronics",
    market: "KOSPI",
    currency: "KRW",
    price: 70000,
    change: -500,
    change_rate: -0.71,
    volume: 12345678,
    as_of: "2026-06-03T09:00:00.000Z",
    raw_available: false,
    returnCode: "0",
    returnMessage: "OK"
  }) {
    return {
      getQuote: vi.fn().mockResolvedValue(quote)
    };
  }
});
