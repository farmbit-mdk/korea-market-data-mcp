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
  expires_at?: string;
  expires_in?: number;
}

export interface KiwoomAccessToken {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
  provider: "kiwoom";
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
