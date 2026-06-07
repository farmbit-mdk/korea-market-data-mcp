import { describe, expect, it } from "vitest";
import { MarketDataProviderError } from "../src/providers/errors.js";
import { createMockProvider } from "../src/providers/mock/index.js";

describe("mock provider", () => {
  const provider = createMockProvider();

  it("does not return mock stock quote market data", async () => {
    await expect(provider.getStockQuote({ symbol: "005930" })).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "mock",
      retryable: false
    });
  });

  it("does not return mock ETF quote market data", async () => {
    await expect(provider.getEtfQuote({ symbol: "069500" })).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "mock",
      retryable: false
    });
  });

  it("does not return mock market index values", async () => {
    await expect(provider.getMarketIndex({ indexCode: "KOSPI" })).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "mock",
      retryable: false
    });
  });

  it("does not return mock daily chart candles", async () => {
    await expect(provider.getDailyChart({ symbol: "005930", limit: 2 })).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "mock",
      retryable: false
    });
  });

  it("searches symbols using stable fixtures", async () => {
    const results = await provider.searchSymbol({ query: "KODEX", limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      symbol: "069500",
      assetType: "etf",
      provider: "mock"
    });
  });

  it("searches Samsung Electronics by Korean, English, and symbol aliases", async () => {
    await expectFirstSearchSymbol("삼성전자", "005930");
    await expectFirstSearchSymbol("삼전", "005930");
    await expectFirstSearchSymbol("Samsung Electronics", "005930");
    await expectFirstSearchSymbol("Samsung", "005930");
    await expectFirstSearchSymbol("005930", "005930");
  });

  it("searches KODEX 200 by Korean, English, and symbol aliases", async () => {
    await expectFirstSearchSymbol("코덱스200", "069500");
    await expectFirstSearchSymbol("코덱스 200", "069500");
    await expectFirstSearchSymbol("KODEX 200", "069500");
    await expectFirstSearchSymbol("069500", "069500");
  });

  it("searches Korean market indices by Korean and English aliases", async () => {
    await expectFirstSearchSymbol("코스피", "KOSPI");
    await expectFirstSearchSymbol("코스닥", "KOSDAQ");
    await expectFirstSearchSymbol("코스피200", "KOSPI200");
    await expectFirstSearchSymbol("KOSPI200", "KOSPI200");
  });

  it("throws normalized invalid input errors", async () => {
    await expect(provider.getStockQuote({ symbol: "" })).rejects.toMatchObject({
      code: "INVALID_INPUT",
      provider: "mock"
    });
  });

  it("throws normalized unsupported capability errors for market data payloads", async () => {
    await expect(provider.getStockQuote({ symbol: "000000" })).rejects.toBeInstanceOf(MarketDataProviderError);
    await expect(provider.getStockQuote({ symbol: "000000" })).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "mock",
      retryable: false
    });
  });

  async function expectFirstSearchSymbol(query: string, symbol: string): Promise<void> {
    const results = await provider.searchSymbol({ query });

    expect(results[0]).toMatchObject({
      symbol,
      provider: "mock"
    });
  }
});
