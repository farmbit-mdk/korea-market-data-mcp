import { describe, expect, it, vi } from "vitest";
import { toToolErrorResponse } from "../src/providers/errors.js";
import {
  createKiwoomQuoteClient,
  kiwoomQuoteEndpointMappings,
  normalizeKiwoomQuoteResponse
} from "../src/providers/kiwoom/index.js";
import type { KiwoomQuoteTransport } from "../src/providers/kiwoom/index.js";
import { getRegisteredToolNames } from "../src/tools/index.js";
import {
  malformedKiwoomQuoteResponse,
  missingPriceKiwoomQuoteResponse,
  providerErrorKiwoomQuoteResponse,
  successfulKiwoomQuoteLikeResponse
} from "./fixtures/kiwoom-quote-responses.js";

describe("Kiwoom read-only quote adapter skeleton", () => {
  it("normalizes a mocked quote response", () => {
    const quote = normalizeKiwoomQuoteResponse(successfulKiwoomQuoteLikeResponse, { symbol: "005930", market: "KOSPI" });

    expect(quote).toEqual({
      provider: "kiwoom",
      symbol: "005930",
      name: "Samsung Electronics",
      market: "KOSPI",
      currency: "KRW",
      price: 70000,
      change: -500,
      change_rate: -0.71,
      volume: 12345678,
      as_of: "2026-06-02T09:00:00.000Z",
      raw_available: false,
      returnCode: "0",
      returnMessage: "OK"
    });
    expect(quote).not.toHaveProperty("account");
    expect(quote).not.toHaveProperty("order");
    expect(quote).not.toHaveProperty("balance");
    expect(quote).not.toHaveProperty("holdings");
  });

  it("keeps quote endpoint mapping disabled until the official endpoint is verified", () => {
    expect(kiwoomQuoteEndpointMappings.quote).toMatchObject({
      enabled: false,
      method: "POST",
      path: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_ENDPOINT",
      apiId: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_API_ID",
      verified: false
    });
  });

  it("returns a safe provider error for malformed quote responses", () => {
    expect(() =>
      normalizeKiwoomQuoteResponse(malformedKiwoomQuoteResponse, { symbol: "005930" })
    ).toThrowError(/invalid price/);
  });

  it("returns a safe provider error for missing price responses", () => {
    expect(() =>
      normalizeKiwoomQuoteResponse(missingPriceKiwoomQuoteResponse, { symbol: "005930" })
    ).toThrowError(/missing price/);
  });

  it("returns a safe provider error for Kiwoom quote failure responses", async () => {
    const transport = createMockQuoteTransport(providerErrorKiwoomQuoteResponse);
    const client = createKiwoomQuoteClient({
      baseUrl: "https://mock.local",
      quoteEndpointPath: "/quote-placeholder",
      transport
    });

    const response = await client.getQuote({ symbol: "005930" }).catch((error: unknown) => toToolErrorResponse(error, "kiwoom"));

    expect(response).toMatchObject({
      error: {
        code: "KIWOOM_QUOTE_REQUEST_FAILED",
        provider: "kiwoom",
        retryable: false,
        return_code: "Q1001",
        return_msg: "Quote endpoint unavailable."
      }
    });
    expect(JSON.stringify(response)).not.toContain("appkey");
    expect(JSON.stringify(response)).not.toContain("secretkey");
  });

  it("uses quote transport abstraction when endpoint config is supplied", async () => {
    const transport = createMockQuoteTransport(successfulKiwoomQuoteLikeResponse);
    const client = createKiwoomQuoteClient({
      baseUrl: "https://mock.local",
      quoteEndpointPath: "/quote-placeholder",
      transport
    });

    await expect(client.getQuote({ symbol: "005930", market: "KOSPI" })).resolves.toMatchObject({
      provider: "kiwoom",
      symbol: "005930",
      price: 70000
    });
    expect(transport.requestQuote).toHaveBeenCalledWith({
      url: "https://mock.local/quote-placeholder",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        symbol: "005930",
        market: "KOSPI"
      }
    });
  });

  it("does not hardcode or call an unconfirmed quote endpoint by default", async () => {
    const transport = createMockQuoteTransport(successfulKiwoomQuoteLikeResponse);
    const client = createKiwoomQuoteClient({ transport });

    await expect(client.getQuote({ symbol: "005930" })).rejects.toMatchObject({
      code: "KIWOOM_QUOTE_NOT_IMPLEMENTED",
      provider: "kiwoom"
    });
    expect(transport.requestQuote).not.toHaveBeenCalled();
  });

  it("does not call mapped quote endpoint while the mapping is disabled", async () => {
    const transport = createMockQuoteTransport(successfulKiwoomQuoteLikeResponse);
    const client = createKiwoomQuoteClient({
      baseUrl: "https://mock.local",
      useMappedQuoteEndpoint: true,
      transport
    });

    await expect(client.getQuote({ symbol: "005930" })).rejects.toMatchObject({
      code: "KIWOOM_QUOTE_NOT_IMPLEMENTED",
      provider: "kiwoom"
    });
    expect(transport.requestQuote).not.toHaveBeenCalled();
  });

  it("rejects account, order, balance, and holdings fields on quote requests", async () => {
    const client = createKiwoomQuoteClient();

    await expect(
      client.getQuote({
        symbol: "005930",
        account: "12345678"
      } as never)
    ).rejects.toMatchObject({
      code: "INVALID_INPUT",
      provider: "kiwoom"
    });
  });

  it("keeps public MCP tool registry unchanged", () => {
    expect(getRegisteredToolNames()).toEqual([
      "search_korean_symbol",
      "get_stock_quote",
      "get_etf_quote",
      "get_market_index",
      "get_daily_chart"
    ]);
  });

  function createMockQuoteTransport(response = {}): KiwoomQuoteTransport {
    return {
      requestQuote: vi.fn().mockResolvedValue(response)
    };
  }
});
