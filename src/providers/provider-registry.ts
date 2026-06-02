import { createMockProvider } from "./mock/index.js";
import type { MarketDataProvider } from "./types.js";

export function createProvider(providerId: string = "mock"): MarketDataProvider {
  if (providerId === "mock") {
    return createMockProvider();
  }

  throw new Error(`Unsupported provider: ${providerId}. Only mock is implemented.`);
}
