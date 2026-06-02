import { MockMarketDataProvider } from "./client.js";
import type { MarketDataProvider } from "../types.js";

export function createMockProvider(): MarketDataProvider {
  return new MockMarketDataProvider();
}

export { MockMarketDataProvider };
