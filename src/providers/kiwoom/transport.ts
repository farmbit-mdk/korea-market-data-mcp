import { MarketDataProviderError } from "../errors.js";
import { redactSecrets } from "../../safety/redact-secret.js";
import type {
  KiwoomQuoteResponse,
  KiwoomQuoteTransport,
  KiwoomQuoteTransportRequest,
  KiwoomRawTokenResponse,
  KiwoomTokenTransport,
  KiwoomTokenTransportRequest
} from "./types.js";

export class FetchKiwoomTransport implements KiwoomTokenTransport, KiwoomQuoteTransport {
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

  async requestQuote(request: KiwoomQuoteTransportRequest): Promise<KiwoomQuoteResponse> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(request.body)
      });

      if (!response.ok) {
        throw new MarketDataProviderError("KIWOOM_QUOTE_REQUEST_FAILED", "Kiwoom quote request failed.", "kiwoom", false);
      }

      return (await response.json()) as KiwoomQuoteResponse;
    } catch (error) {
      if (error instanceof MarketDataProviderError) {
        throw error;
      }

      const message = error instanceof Error ? redactSecrets(error.message) : "Kiwoom quote request failed.";
      throw new MarketDataProviderError("KIWOOM_QUOTE_REQUEST_FAILED", message, "kiwoom", true);
    }
  }
}

export function createFetchKiwoomTokenTransport(): KiwoomTokenTransport {
  return new FetchKiwoomTransport();
}

export function createFetchKiwoomQuoteTransport(): KiwoomQuoteTransport {
  return new FetchKiwoomTransport();
}

export { FetchKiwoomTransport as FetchKiwoomTokenTransport };
