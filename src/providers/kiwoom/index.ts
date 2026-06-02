import { KiwoomMarketDataProvider } from "./client.js";
import type { MarketDataProvider } from "../types.js";

export function createKiwoomProvider(): MarketDataProvider {
  return new KiwoomMarketDataProvider();
}

export { createKiwoomAuthClient, KiwoomAuthClient, loadKiwoomAuthConfig } from "./auth.js";
export { KiwoomMarketDataProvider };
export {
  createKiwoomQuoteClient,
  DefaultKiwoomQuoteClient,
  normalizeKiwoomQuoteError,
  normalizeKiwoomQuoteResponse
} from "./quote-client.js";
export {
  createKiwoomTokenClient,
  DefaultKiwoomTokenClient,
  normalizeKiwoomTokenError,
  normalizeKiwoomTokenResponse
} from "./token-client.js";
export {
  FetchKiwoomTokenTransport,
  FetchKiwoomTransport,
  createFetchKiwoomQuoteTransport,
  createFetchKiwoomTokenTransport
} from "./transport.js";
export { InMemoryKiwoomTokenCache } from "./token-cache.js";
export type {
  KiwoomAccessToken,
  KiwoomQuoteRequest,
  KiwoomQuoteResponse,
  KiwoomQuoteTransport,
  KiwoomQuoteTransportRequest,
  KiwoomRawTokenResponse,
  KiwoomTokenCache,
  KiwoomTokenCacheEntry,
  KiwoomTokenRequest,
  KiwoomTokenTransport,
  KiwoomTokenTransportRequest,
  NormalizedKiwoomQuote
} from "./types.js";
