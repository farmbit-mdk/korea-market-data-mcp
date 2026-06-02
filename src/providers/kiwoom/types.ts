export type KiwoomEnvironment = "prod" | "mock";

export interface KiwoomAuthConfig {
  env: KiwoomEnvironment;
  appKey?: string;
  appSecret?: string;
  apiBaseUrl: string;
  mockApiBaseUrl: string;
  enableRealApiCalls: boolean;
}

export interface KiwoomAccessToken {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
  provider: "kiwoom";
}
