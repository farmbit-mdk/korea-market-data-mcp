import { describe, expect, it } from "vitest";
import { MarketDataProviderError } from "../src/providers/errors.js";
import { createMockProvider } from "../src/providers/mock/index.js";

describe("mock provider", () => {
  const provider = createMockProvider();

  it("returns Samsung Electronics stock quote", async () => {
    const quote = await provider.getStockQuote({ symbol: "005930" });

    expect(quote).toMatchObject({
      symbol: "005930",
      name: "Samsung Electronics",
      market: "KOSPI",
      assetType: "stock",
      currency: "KRW",
      price: 70000,
      provider: "mock",
      sourceSymbol: "005930",
      providerTimestamp: null,
      isDelayed: false
    });
    expect(Date.parse(quote.requestTimestamp)).not.toBeNaN();
  });

  it("returns KODEX 200 ETF quote", async () => {
    const quote = await provider.getEtfQuote({ symbol: "069500" });

    expect(quote).toMatchObject({
      symbol: "069500",
      name: "KODEX 200",
      market: "ETF",
      assetType: "etf",
      provider: "mock",
      sourceSymbol: "069500",
      isDelayed: false
    });
  });

  it("returns supported market indices", async () => {
    await expect(provider.getMarketIndex({ indexCode: "KOSPI" })).resolves.toMatchObject({
      indexCode: "KOSPI",
      provider: "mock"
    });
    await expect(provider.getMarketIndex({ indexCode: "KOSDAQ" })).resolves.toMatchObject({
      indexCode: "KOSDAQ",
      provider: "mock"
    });
    await expect(provider.getMarketIndex({ indexCode: "KOSPI200" })).resolves.toMatchObject({
      indexCode: "KOSPI200",
      provider: "mock"
    });
  });

  it("returns daily chart candles", async () => {
    const chart = await provider.getDailyChart({ symbol: "005930", limit: 2 });

    expect(chart).toMatchObject({
      symbol: "005930",
      provider: "mock",
      sourceSymbol: "005930",
      isDelayed: false
    });
    expect(chart.candles).toHaveLength(2);
    expect(chart.candles[0]).toHaveProperty("date");
    expect(chart.candles[0]).toHaveProperty("open");
    expect(chart.candles[0]).toHaveProperty("close");
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

  it("throws normalized invalid input errors", async () => {
    await expect(provider.getStockQuote({ symbol: "" })).rejects.toMatchObject({
      code: "INVALID_INPUT",
      provider: "mock"
    });
  });

  it("throws normalized symbol not found errors", async () => {
    await expect(provider.getStockQuote({ symbol: "000000" })).rejects.toBeInstanceOf(MarketDataProviderError);
    await expect(provider.getStockQuote({ symbol: "000000" })).rejects.toMatchObject({
      code: "SYMBOL_NOT_FOUND",
      provider: "mock",
      retryable: false
    });
  });
});
