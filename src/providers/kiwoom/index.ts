import { KiwoomMarketDataProvider } from "./client.js";
import type { MarketDataProvider } from "../types.js";

export function createKiwoomProvider(): MarketDataProvider {
  return new KiwoomMarketDataProvider();
}

export { createKiwoomAuthClient, KiwoomAuthClient, loadKiwoomAuthConfig } from "./auth.js";
export { KiwoomMarketDataProvider };
export {
  createKiwoomTokenClient,
  DefaultKiwoomTokenClient,
  normalizeKiwoomTokenResponse
} from "./token-client.js";
export { FetchKiwoomTokenTransport, createFetchKiwoomTokenTransport } from "./transport.js";
export { InMemoryKiwoomTokenCache } from "./token-cache.js";
export type {
  KiwoomAccessToken,
  KiwoomRawTokenResponse,
  KiwoomTokenCache,
  KiwoomTokenCacheEntry,
  KiwoomTokenRequest,
  KiwoomTokenTransport,
  KiwoomTokenTransportRequest
} from "./types.js";
