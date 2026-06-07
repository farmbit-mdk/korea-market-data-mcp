import { MarketDataProviderError } from "../errors.js";
import { createKiwoomTokenClient, type KiwoomTokenClient } from "./token-client.js";
import { parseKiwoomEnvironment } from "./env.js";
import type { KiwoomAccessToken, KiwoomAuthConfig } from "./types.js";

const defaultApiBaseUrl = "https://api.kiwoom.com";
const defaultMockApiBaseUrl = "https://mockapi.kiwoom.com";

export function loadKiwoomAuthConfig(env: NodeJS.ProcessEnv = process.env): KiwoomAuthConfig {
  return {
    env: parseKiwoomEnvironment(env.KIWOOM_ENV),
    appKey: emptyToUndefined(env.KIWOOM_APP_KEY),
    appSecret: emptyToUndefined(env.KIWOOM_SECRET_KEY) ?? emptyToUndefined(env.KIWOOM_APP_SECRET),
    apiBaseUrl: env.KIWOOM_API_BASE_URL ?? defaultApiBaseUrl,
    mockApiBaseUrl: env.KIWOOM_MOCK_API_BASE_URL ?? defaultMockApiBaseUrl,
    enableRealApiCalls: env.KIWOOM_ENABLE_REAL_API_CALLS === "true"
  };
}

export class KiwoomAuthClient {
  private readonly tokenClient: KiwoomTokenClient;

  constructor(
    private readonly config: KiwoomAuthConfig = loadKiwoomAuthConfig(),
    tokenClient?: KiwoomTokenClient
  ) {
    this.tokenClient = tokenClient ?? createKiwoomTokenClient({ config });
  }

  async getAccessToken(): Promise<KiwoomAccessToken> {
    return this.tokenClient.getAccessToken();
  }

  assertCredentialsPresent(): void {
    if (this.config.appKey === undefined || this.config.appSecret === undefined) {
      throw new MarketDataProviderError(
        "PROVIDER_AUTH_FAILED",
        "Provider credentials are missing or invalid.",
        "kiwoom",
        false
      );
    }
  }

  get baseUrl(): string {
    return this.config.env === "mock" ? this.config.mockApiBaseUrl : this.config.apiBaseUrl;
  }
}

export function createKiwoomAuthClient(config: KiwoomAuthConfig = loadKiwoomAuthConfig()): KiwoomAuthClient {
  return new KiwoomAuthClient(config);
}

function emptyToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value;
}
