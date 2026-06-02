import { MarketDataProviderError } from "../errors.js";
import { redactSecrets } from "../../safety/redact-secret.js";
import type { KiwoomRawTokenResponse, KiwoomTokenTransport, KiwoomTokenTransportRequest } from "./types.js";

export class FetchKiwoomTokenTransport implements KiwoomTokenTransport {
  async requestToken(request: KiwoomTokenTransportRequest): Promise<KiwoomRawTokenResponse> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(request.body)
      });

      if (!response.ok) {
        throw new MarketDataProviderError("PROVIDER_AUTH_FAILED", "Provider authentication failed.", "kiwoom", false);
      }

      return (await response.json()) as KiwoomRawTokenResponse;
    } catch (error) {
      if (error instanceof MarketDataProviderError) {
        throw error;
      }

      const message = error instanceof Error ? redactSecrets(error.message) : "Provider token request failed.";
      throw new MarketDataProviderError("PROVIDER_UNAVAILABLE", message, "kiwoom", true);
    }
  }
}

export function createFetchKiwoomTokenTransport(): KiwoomTokenTransport {
  return new FetchKiwoomTokenTransport();
}
