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
  access_token?: string;
  token?: string;
  appkey?: string;
  secretkey?: string;
}

export interface KiwoomQuoteEndpointMapping {
  enabled: boolean;
  manualOnly: boolean;
  readOnly: boolean;
  requiresToken: boolean;
  exposesPublicTool: boolean;
  forbiddenScopes: readonly ["account", "order", "balance", "holdings", "trading"];
  method: "POST";
  path: string;
  apiId: string;
  description: string;
  verified: boolean;
}

export type KiwoomMarketIndexCode = "KOSPI" | "KOSDAQ" | "KOSPI200";

export interface KiwoomMarketIndexRequest {
  indexCode: KiwoomMarketIndexCode;
}

export interface KiwoomMarketIndexResponse {
  return_code?: string | number;
  return_msg?: string;
  cur_prc?: string | number;
  pred_pre?: string | number;
  flu_rt?: string | number;
  open_pric?: string | number;
  high_pric?: string | number;
  low_pric?: string | number;
  trde_qty?: string | number;
  trde_prica?: string | number;
  output?: Array<Record<string, string | number | undefined>> | Record<string, unknown>;
  output1?: Array<Record<string, string | number | undefined>>;
  [key: string]: unknown;
}

export interface NormalizedKiwoomMarketIndex {
  provider: "kiwoom";
  source: "real";
  source_tr: string;
  endpoint?: string;
  public_index_code: KiwoomMarketIndexCode;
  kiwoom_market_type: string;
  kiwoom_sector_code: string;
  index_code: KiwoomMarketIndexCode;
  symbol: KiwoomMarketIndexCode;
  name: string;
  market: "KRX";
  currency: "KRW";
  value: number;
  price: number;
  change?: number;
  change_rate?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  trading_value?: number;
  fetched_at: string;
  returnCode?: string;
  returnMessage?: string;
}

export interface KiwoomChartRequest {
  symbol: string;
  name?: string;
  market?: KiwoomQuoteMarket;
  limit?: number;
  baseDate?: string;
}

export interface KiwoomChartResponse {
  return_code?: string | number;
  return_msg?: string;
  stk_dt_pole_chart_qry?: Array<Record<string, string | number | undefined>>;
  output?: Array<Record<string, string | number | undefined>> | Record<string, unknown>;
  output1?: Array<Record<string, string | number | undefined>>;
  ka10081OutBlock1?: Array<Record<string, string | number | undefined>>;
  [key: string]: unknown;
}

export interface NormalizedKiwoomDailyCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change?: number;
  change_rate?: number;
  trading_value?: number;
}

export interface NormalizedKiwoomDailyChart {
  provider: "kiwoom";
  source: "real";
  symbol: string;
  name?: string;
  market?: string;
  currency: "KRW";
  timeframe: "1d";
  limit: number;
  fetched_at: string;
  source_tr: string;
  candles: NormalizedKiwoomDailyCandle[];
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
  body: Record<string, string | undefined>;
}

export interface KiwoomQuoteTransport {
  requestQuote(request: KiwoomQuoteTransportRequest): Promise<KiwoomQuoteResponse>;
}

export interface KiwoomChartTransportRequest {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: Record<string, string | undefined>;
}

export interface KiwoomChartTransport {
  requestChart(request: KiwoomChartTransportRequest): Promise<KiwoomChartResponse>;
}

export interface KiwoomMarketIndexTransportRequest {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: Record<string, string | undefined>;
}

export interface KiwoomMarketIndexTransport {
  requestMarketIndex(request: KiwoomMarketIndexTransportRequest): Promise<KiwoomMarketIndexResponse>;
}
