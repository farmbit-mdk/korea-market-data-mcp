import { MarketDataProviderError } from "../errors.js";
import { redactSecrets } from "../../safety/redact-secret.js";
import { nowIso } from "../../utils/time.js";
import { InMemoryKiwoomTokenCache } from "./token-cache.js";
import { createFetchKiwoomTokenTransport } from "./transport.js";
import type {
  KiwoomAccessToken,
  KiwoomAuthConfig,
  KiwoomRawTokenResponse,
  KiwoomTokenCache,
  KiwoomTokenRequest,
  KiwoomTokenTransport
} from "./types.js";

export interface KiwoomTokenClient {
  getAccessToken(): Promise<KiwoomAccessToken>;
  requestToken(request: KiwoomTokenRequest): Promise<KiwoomAccessToken>;
  clearCache(): void;
}

export interface KiwoomTokenClientOptions {
  config: KiwoomAuthConfig;
  transport?: KiwoomTokenTransport;
  cache?: KiwoomTokenCache;
}

export class DefaultKiwoomTokenClient implements KiwoomTokenClient {
  private readonly transport: KiwoomTokenTransport;
  private readonly cache: KiwoomTokenCache;

  constructor(private readonly options: KiwoomTokenClientOptions) {
    this.transport = options.transport ?? createFetchKiwoomTokenTransport();
    this.cache = options.cache ?? new InMemoryKiwoomTokenCache();
  }

  async getAccessToken(): Promise<KiwoomAccessToken> {
    const cachedToken = this.cache.get();

    if (cachedToken !== undefined) {
      return cachedToken.token;
    }

    if (this.options.config.appKey === undefined || this.options.config.appSecret === undefined) {
      throw new MarketDataProviderError(
        "PROVIDER_AUTH_FAILED",
        "Provider credentials are missing or invalid.",
        "kiwoom",
        false
      );
    }

    return this.requestToken({
      appKey: this.options.config.appKey,
      appSecret: this.options.config.appSecret,
      env: this.options.config.env
    });
  }

  async requestToken(request: KiwoomTokenRequest): Promise<KiwoomAccessToken> {
    if (!this.options.config.enableRealApiCalls) {
      throw new MarketDataProviderError(
        "UNSUPPORTED_PROVIDER_CAPABILITY",
        "Kiwoom token requests are disabled by default.",
        "kiwoom",
        false
      );
    }

    const rawResponse = await this.requestTokenThroughTransport(request);
    const token = normalizeKiwoomTokenResponse(rawResponse);

    this.cache.set({
      token,
      cachedAt: nowIso()
    });

    return token;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private get baseUrl(): string {
    return this.options.config.env === "mock"
      ? this.options.config.mockApiBaseUrl
      : this.options.config.apiBaseUrl;
  }

  private async requestTokenThroughTransport(request: KiwoomTokenRequest): Promise<KiwoomRawTokenResponse> {
    try {
      return await this.transport.requestToken({
        url: `${this.baseUrl}/oauth2/token`,
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          appkey: request.appKey,
          secretkey: request.appSecret,
          grant_type: "client_credentials"
        }
      });
    } catch (error) {
      throw normalizeKiwoomTokenError(error);
    }
  }
}

export function createKiwoomTokenClient(options: KiwoomTokenClientOptions): KiwoomTokenClient {
  return new DefaultKiwoomTokenClient(options);
}

export function normalizeKiwoomTokenResponse(response: KiwoomRawTokenResponse): KiwoomAccessToken {
  const returnCode = response.return_code === undefined ? undefined : String(response.return_code);
  const returnMessage = response.return_msg;

  if (returnCode !== undefined && returnCode !== "0") {
    if (isInvestmentEnvironmentMismatch(returnCode, returnMessage)) {
      throw new MarketDataProviderError(
        "KIWOOM_INVESTMENT_ENV_MISMATCH",
        "Kiwoom App Key does not match the configured investment environment.",
        "kiwoom",
        false,
        returnCode,
        returnMessage === undefined ? undefined : redactSecrets(returnMessage),
        "Check whether the App Key is for real trading or mock trading, then set KIWOOM_INVESTMENT_ENV accordingly."
      );
    }

    throw new MarketDataProviderError(
      "KIWOOM_TOKEN_REQUEST_FAILED",
      "Kiwoom token request failed.",
      "kiwoom",
      false,
      returnCode,
      returnMessage === undefined ? undefined : redactSecrets(returnMessage)
    );
  }

  const accessToken = response.access_token ?? response.token;

  if (accessToken === undefined || accessToken.trim() === "") {
    throw new MarketDataProviderError("PROVIDER_BAD_RESPONSE", "Provider token response was invalid.", "kiwoom", false);
  }

  return {
    accessToken,
    tokenType: response.token_type ?? "Bearer",
    expiresAt: normalizeExpiresAt(response),
    provider: "kiwoom",
    returnCode,
    returnMessage
  };
}

function isInvestmentEnvironmentMismatch(returnCode: string, returnMessage: string | undefined): boolean {
  const message = returnMessage ?? "";
  return returnCode === "2" && (
    message.includes("8030") ||
    message.toLocaleLowerCase().includes("appkey") ||
    message.includes("실전") ||
    message.includes("모의")
  );
}

export function normalizeKiwoomTokenError(error: unknown): MarketDataProviderError {
  if (error instanceof MarketDataProviderError) {
    return error;
  }

  const message = error instanceof Error ? redactSecrets(error.message) : "Provider token request failed.";
  return new MarketDataProviderError("PROVIDER_UNAVAILABLE", message, "kiwoom", true);
}

function normalizeExpiresAt(response: KiwoomRawTokenResponse): string {
  if (response.expires_at !== undefined && !Number.isNaN(Date.parse(response.expires_at))) {
    return response.expires_at;
  }

  if (response.expires_dt !== undefined && !Number.isNaN(Date.parse(response.expires_dt))) {
    return response.expires_dt;
  }

  if (response.expires_in !== undefined && Number.isFinite(response.expires_in)) {
    return new Date(Date.now() + response.expires_in * 1000).toISOString();
  }

  throw new MarketDataProviderError("PROVIDER_BAD_RESPONSE", "Provider token response was invalid.", "kiwoom", false);
}
