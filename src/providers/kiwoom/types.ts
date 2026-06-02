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
