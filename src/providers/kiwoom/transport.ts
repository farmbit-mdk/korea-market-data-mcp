import { MarketDataProviderError } from "../errors.js";
import { redactSecrets } from "../../safety/redact-secret.js";
import type {
  KiwoomChartResponse,
  KiwoomChartTransport,
  KiwoomChartTransportRequest,
  KiwoomMarketIndexResponse,
  KiwoomMarketIndexTransport,
  KiwoomMarketIndexTransportRequest,
  KiwoomQuoteResponse,
  KiwoomQuoteTransport,
  KiwoomQuoteTransportRequest,
  KiwoomRawTokenResponse,
  KiwoomTokenTransport,
  KiwoomTokenTransportRequest
} from "./types.js";

export class FetchKiwoomTransport implements KiwoomTokenTransport, KiwoomQuoteTransport, KiwoomChartTransport, KiwoomMarketIndexTransport {
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

  async requestChart(request: KiwoomChartTransportRequest): Promise<KiwoomChartResponse> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(request.body)
      });

      if (!response.ok) {
        throw new MarketDataProviderError("KIWOOM_DAILY_CHART_REQUEST_FAILED", "Kiwoom daily chart request failed.", "kiwoom", false);
      }

      return (await response.json()) as KiwoomChartResponse;
    } catch (error) {
      if (error instanceof MarketDataProviderError) {
        throw error;
      }

      const message = error instanceof Error ? redactSecrets(error.message) : "Kiwoom daily chart request failed.";
      throw new MarketDataProviderError("KIWOOM_DAILY_CHART_REQUEST_FAILED", message, "kiwoom", true);
    }
  }

  async requestMarketIndex(request: KiwoomMarketIndexTransportRequest): Promise<KiwoomMarketIndexResponse> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(request.body)
      });

      if (!response.ok) {
        const providerResponse = await readJsonResponse(response);
        throw new MarketDataProviderError(
          "KIWOOM_MARKET_INDEX_REQUEST_FAILED",
          readProviderErrorMessage(providerResponse) ?? "Kiwoom market index request failed.",
          "kiwoom",
          false,
          readProviderReturnCode(providerResponse),
          readProviderReturnMessage(providerResponse)
        );
      }

      return (await response.json()) as KiwoomMarketIndexResponse;
    } catch (error) {
      if (error instanceof MarketDataProviderError) {
        throw error;
      }

      const message = error instanceof Error ? redactSecrets(error.message) : "Kiwoom market index request failed.";
      throw new MarketDataProviderError("KIWOOM_MARKET_INDEX_REQUEST_FAILED", message, "kiwoom", true);
    }
  }
}

async function readJsonResponse(response: Response): Promise<Record<string, unknown> | undefined> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function readProviderErrorMessage(response: Record<string, unknown> | undefined): string | undefined {
  const message = readProviderReturnMessage(response);
  return message === undefined ? undefined : redactSecrets(message);
}

function readProviderReturnCode(response: Record<string, unknown> | undefined): string | undefined {
  const value = response?.return_code;
  return value === undefined ? undefined : String(value);
}

function readProviderReturnMessage(response: Record<string, unknown> | undefined): string | undefined {
  const value = response?.return_msg;
  return typeof value === "string" && value.trim() !== "" ? redactSecrets(value) : undefined;
}

export function createFetchKiwoomTokenTransport(): KiwoomTokenTransport {
  return new FetchKiwoomTransport();
}

export function createFetchKiwoomQuoteTransport(): KiwoomQuoteTransport {
  return new FetchKiwoomTransport();
}

export function createFetchKiwoomChartTransport(): KiwoomChartTransport {
  return new FetchKiwoomTransport();
}

export function createFetchKiwoomMarketIndexTransport(): KiwoomMarketIndexTransport {
  return new FetchKiwoomTransport();
}

export { FetchKiwoomTransport as FetchKiwoomTokenTransport };
