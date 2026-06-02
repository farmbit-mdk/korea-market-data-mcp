import { KiwoomMarketDataProvider } from "./client.js";
import type { MarketDataProvider } from "../types.js";

export function createKiwoomProvider(): MarketDataProvider {
  return new KiwoomMarketDataProvider();
}

export { createKiwoomAuthClient, KiwoomAuthClient, loadKiwoomAuthConfig } from "./auth.js";
export { KiwoomMarketDataProvider };
