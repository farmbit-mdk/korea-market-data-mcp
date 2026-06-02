import { createKiwoomProvider } from "./kiwoom/index.js";
import { createMockProvider } from "./mock/index.js";
import type { MarketDataProvider } from "./types.js";

export function createProvider(providerId: string = "mock"): MarketDataProvider {
  if (providerId === "mock") {
    return createMockProvider();
  }

  if (providerId === "kiwoom") {
    return createKiwoomProvider();
  }

  throw new Error(`Unsupported provider: ${providerId}. Supported providers: mock, kiwoom.`);
}
