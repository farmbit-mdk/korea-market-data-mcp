import { describe, expect, it, vi } from "vitest";
import { toToolErrorResponse } from "../src/providers/errors.js";
import {
  createKiwoomQuoteClient,
  normalizeKiwoomQuoteResponse
} from "../src/providers/kiwoom/index.js";
import type { KiwoomQuoteTransport } from "../src/providers/kiwoom/index.js";
import { getRegisteredToolNames } from "../src/tools/index.js";

describe("Kiwoom read-only quote adapter skeleton", () => {
  it("normalizes a mocked quote response", () => {
    const quote = normalizeKiwoomQuoteResponse(
      {
        symbol: "005930",
        name: "Samsung Electronics",
        market: "KOSPI",
        price: "70,000",
        change: "-500",
        change_rate: "-0.71",
        volume: "12,345,678",
        as_of: "2026-06-02T09:00:00.000Z",
        return_code: "0",
        return_msg: "OK"
      },
      { symbol: "005930", market: "KOSPI" }
    );

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
  });

  it("returns a safe provider error for malformed quote responses", () => {
    expect(() =>
      normalizeKiwoomQuoteResponse(
        {
          symbol: "005930",
          price: "not-a-number",
          return_code: "0"
        },
        { symbol: "005930" }
      )
    ).toThrowError(/invalid price/);
  });

  it("returns a safe provider error for Kiwoom quote failure responses", async () => {
    const transport = createMockQuoteTransport({
      return_code: "Q1001",
      return_msg: "Quote endpoint unavailable."
    });
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
    const transport = createMockQuoteTransport({
      symbol: "005930",
      price: "70000",
      return_code: "0"
    });
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
    const transport = createMockQuoteTransport({
      symbol: "005930",
      price: "70000",
      return_code: "0"
    });
    const client = createKiwoomQuoteClient({ transport });

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
