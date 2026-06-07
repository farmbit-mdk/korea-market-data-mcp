import { describe, expect, it } from "vitest";
import { createMockProvider } from "../src/providers/mock/index.js";

describe("normalized responses", () => {
  const provider = createMockProvider();

  it("returns normalized unsupported capability errors instead of mock quotes", async () => {
    await expect(provider.getStockQuote({ symbol: "005930" })).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "mock",
      retryable: false
    });
  });

  it("returns normalized unsupported capability errors instead of mock indices", async () => {
    await expect(provider.getMarketIndex({ indexCode: "KOSPI" })).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "mock",
      retryable: false
    });
  });

  it("returns normalized unsupported capability errors instead of mock daily charts", async () => {
    await expect(provider.getDailyChart({ symbol: "069500" })).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "mock",
      retryable: false
    });
  });
});
