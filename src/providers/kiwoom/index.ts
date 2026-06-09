import { KiwoomMarketDataProvider } from "./client.js";
import type { MarketDataProvider } from "../types.js";

export function createKiwoomProvider(): MarketDataProvider {
  return new KiwoomMarketDataProvider();
}

export { createKiwoomAuthClient, KiwoomAuthClient, loadKiwoomAuthConfig } from "./auth.js";
export {
  createKiwoomChartClient,
  DefaultKiwoomChartClient,
  normalizeKiwoomDailyChartResponse
} from "./chart-client.js";
export { KiwoomMarketDataProvider };
export {
  createKiwoomQuoteClient,
  DefaultKiwoomQuoteClient,
  normalizeKiwoomQuoteError,
  normalizeKiwoomQuoteResponse
} from "./quote-client.js";
export { kiwoomQuoteEndpointMappings } from "./quote-endpoints.js";
export {
  createKiwoomTokenClient,
  DefaultKiwoomTokenClient,
  normalizeKiwoomTokenError,
  normalizeKiwoomTokenResponse
} from "./token-client.js";
export {
  FetchKiwoomTokenTransport,
  FetchKiwoomTransport,
  createFetchKiwoomChartTransport,
  createFetchKiwoomQuoteTransport,
  createFetchKiwoomTokenTransport
} from "./transport.js";
export { InMemoryKiwoomTokenCache } from "./token-cache.js";
export type {
  KiwoomAccessToken,
  KiwoomChartRequest,
  KiwoomChartResponse,
  KiwoomChartTransport,
  KiwoomChartTransportRequest,
  KiwoomQuoteRequest,
  KiwoomQuoteEndpointMapping,
  KiwoomQuoteResponse,
  KiwoomQuoteTransport,
  KiwoomQuoteTransportRequest,
  KiwoomRawTokenResponse,
  KiwoomTokenCache,
  KiwoomTokenCacheEntry,
  KiwoomTokenRequest,
  KiwoomTokenTransport,
  KiwoomTokenTransportRequest,
  NormalizedKiwoomDailyChart,
  NormalizedKiwoomQuote
} from "./types.js";
