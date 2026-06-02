export type KiwoomEnvironment = "prod" | "mock";

export interface KiwoomAuthConfig {
  env: KiwoomEnvironment;
  appKey?: string;
  appSecret?: string;
  apiBaseUrl: string;
  mockApiBaseUrl: string;
  enableRealApiCalls: boolean;
}

export interface KiwoomTokenRequest {
  appKey: string;
  appSecret: string;
  env: KiwoomEnvironment;
}

export interface KiwoomRawTokenResponse {
  token_type?: string;
  access_token?: string;
  token?: string;
  expires_at?: string;
  expires_dt?: string;
  expires_in?: number;
  return_code?: string | number;
  return_msg?: string;
}

export interface KiwoomAccessToken {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  provider: "kiwoom";
  returnCode?: string;
  returnMessage?: string;
}

export interface KiwoomTokenCacheEntry {
  token: KiwoomAccessToken;
  cachedAt: string;
}

export interface KiwoomTokenCache {
  get(): KiwoomTokenCacheEntry | undefined;
  set(entry: KiwoomTokenCacheEntry): void;
  clear(): void;
}

export interface KiwoomTokenTransportRequest {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: Record<string, string>;
}

export interface KiwoomTokenTransport {
  requestToken(request: KiwoomTokenTransportRequest): Promise<KiwoomRawTokenResponse>;
}

export type KiwoomQuoteMarket = "KRX" | "KOSPI" | "KOSDAQ" | "KONEX" | "UNKNOWN";

export interface KiwoomQuoteRequest {
  symbol: string;
  market?: KiwoomQuoteMarket;
}

export interface KiwoomQuoteResponse {
  symbol?: string;
  stock_code?: string;
  name?: string;
  market?: string;
  price?: string | number;
  current_price?: string | number;
  change?: string | number;
  change_rate?: string | number;
  volume?: string | number;
  as_of?: string;
  timestamp?: string;
  return_code?: string | number;
  return_msg?: string;
}

export interface KiwoomQuoteEndpointMapping {
  enabled: false;
  method: "POST";
  path: string;
  apiId: string;
  description: string;
  verified: false;
}

export interface NormalizedKiwoomQuote {
  provider: "kiwoom";
  symbol: string;
  name?: string;
  market?: string;
  currency: "KRW";
  price?: number;
  change?: number;
  change_rate?: number;
  volume?: number;
  as_of?: string;
  raw_available: false;
  returnCode?: string;
  returnMessage?: string;
}

export interface KiwoomQuoteTransportRequest {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: {
    symbol: string;
    market?: KiwoomQuoteMarket;
  };
}

export interface KiwoomQuoteTransport {
  requestQuote(request: KiwoomQuoteTransportRequest): Promise<KiwoomQuoteResponse>;
}
