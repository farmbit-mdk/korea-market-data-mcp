import { describe, expect, it } from "vitest";
import { createMockProvider } from "../src/providers/mock/index.js";

describe("normalized responses", () => {
  const provider = createMockProvider();

  it("includes provider attribution and freshness fields on quotes", async () => {
    const quote = await provider.getStockQuote({ symbol: "005930" });

    expect(quote.provider).toBe("mock");
    expect(quote.sourceSymbol).toBe("005930");
    expect(quote).toHaveProperty("requestTimestamp");
    expect(quote).toHaveProperty("providerTimestamp");
    expect(quote).toHaveProperty("isDelayed");
  });

  it("includes provider attribution and freshness fields on indices", async () => {
    const index = await provider.getMarketIndex({ indexCode: "KOSPI" });

    expect(index.provider).toBe("mock");
    expect(index).toHaveProperty("requestTimestamp");
    expect(index).toHaveProperty("providerTimestamp");
    expect(index).toHaveProperty("isDelayed");
  });

  it("includes provider attribution and source symbol on daily charts", async () => {
    const chart = await provider.getDailyChart({ symbol: "069500" });

    expect(chart.provider).toBe("mock");
    expect(chart.sourceSymbol).toBe("069500");
    expect(chart).toHaveProperty("requestTimestamp");
    expect(chart).toHaveProperty("isDelayed");
    expect(chart.candles.length).toBeGreaterThan(0);
  });
});
