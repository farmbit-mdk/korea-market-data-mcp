import { MarketDataProviderError } from "../errors.js";
import { redactSecrets } from "../../safety/redact-secret.js";
import { createFetchKiwoomQuoteTransport } from "./transport.js";
import type {
  KiwoomQuoteRequest,
  KiwoomQuoteResponse,
  KiwoomQuoteTransport,
  KiwoomQuoteTransportRequest,
  NormalizedKiwoomQuote
} from "./types.js";

export interface KiwoomQuoteClient {
  getQuote(request: KiwoomQuoteRequest): Promise<NormalizedKiwoomQuote>;
}

export interface KiwoomQuoteClientOptions {
  transport?: KiwoomQuoteTransport;
  quoteEndpointPath?: string;
  baseUrl?: string;
}

export class DefaultKiwoomQuoteClient implements KiwoomQuoteClient {
  private readonly transport: KiwoomQuoteTransport;

  constructor(private readonly options: KiwoomQuoteClientOptions = {}) {
    this.transport = options.transport ?? createFetchKiwoomQuoteTransport();
  }

  async getQuote(request: KiwoomQuoteRequest): Promise<NormalizedKiwoomQuote> {
    assertReadOnlyQuoteRequest(request);

    if (this.options.quoteEndpointPath === undefined || this.options.baseUrl === undefined) {
      throw new MarketDataProviderError(
        "KIWOOM_QUOTE_NOT_IMPLEMENTED",
        "Kiwoom quote endpoint is not configured yet.",
        "kiwoom",
        false
      );
    }

    const transportRequest: KiwoomQuoteTransportRequest = {
      url: `${this.options.baseUrl}${this.options.quoteEndpointPath}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        symbol: request.symbol,
        market: request.market
      }
    };

    try {
      return normalizeKiwoomQuoteResponse(await this.transport.requestQuote(transportRequest), request);
    } catch (error) {
      throw normalizeKiwoomQuoteError(error);
    }
  }
}

export function createKiwoomQuoteClient(options: KiwoomQuoteClientOptions = {}): KiwoomQuoteClient {
  return new DefaultKiwoomQuoteClient(options);
}

export function normalizeKiwoomQuoteResponse(
  response: KiwoomQuoteResponse,
  request: KiwoomQuoteRequest
): NormalizedKiwoomQuote {
  const returnCode = response.return_code === undefined ? undefined : String(response.return_code);

  if (returnCode !== undefined && returnCode !== "0") {
    throw new MarketDataProviderError(
      "KIWOOM_QUOTE_REQUEST_FAILED",
      "Kiwoom quote request failed.",
      "kiwoom",
      false,
      returnCode,
      response.return_msg === undefined ? undefined : redactSecrets(response.return_msg)
    );
  }

  const symbol = normalizeRequiredString(response.symbol ?? request.symbol, "symbol");

  return {
    provider: "kiwoom",
    symbol,
    name: normalizeOptionalString(response.name),
    market: normalizeOptionalString(response.market ?? request.market),
    currency: "KRW",
    price: normalizeOptionalNumber(response.price, "price"),
    change: normalizeOptionalNumber(response.change, "change"),
    change_rate: normalizeOptionalNumber(response.change_rate, "change_rate"),
    volume: normalizeOptionalNumber(response.volume, "volume"),
    as_of: normalizeOptionalString(response.as_of),
    raw_available: false,
    returnCode,
    returnMessage: response.return_msg
  };
}

export function normalizeKiwoomQuoteError(error: unknown): MarketDataProviderError {
  if (error instanceof MarketDataProviderError) {
    return error;
  }

  const message = error instanceof Error ? redactSecrets(error.message) : "Kiwoom quote request failed.";
  return new MarketDataProviderError("KIWOOM_QUOTE_REQUEST_FAILED", message, "kiwoom", true);
}

function assertReadOnlyQuoteRequest(request: KiwoomQuoteRequest): void {
  const unsafeKeys = [
    "account",
    "accountNo",
    "accountNumber",
    "order",
    "orderId",
    "side",
    "quantity",
    "qty",
    "amount",
    "balance",
    "holding",
    "holdings"
  ];
  const requestRecord = request as unknown as Record<string, unknown>;
  const presentUnsafeKey = unsafeKeys.find((key) => Object.hasOwn(requestRecord, key));

  if (presentUnsafeKey !== undefined) {
    throw new MarketDataProviderError(
      "INVALID_INPUT",
      "Kiwoom quote request must remain read-only market data only.",
      "kiwoom",
      false
    );
  }
}

function normalizeRequiredString(value: string | undefined, fieldName: string): string {
  if (value === undefined || value.trim() === "") {
    throw new MarketDataProviderError("KIWOOM_QUOTE_BAD_RESPONSE", `Kiwoom quote response missing ${fieldName}.`, "kiwoom", false);
  }

  return value.trim();
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value.trim();
}

function normalizeOptionalNumber(value: string | number | undefined, fieldName: string): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const normalized = typeof value === "number" ? value : Number(value.replace(/,/g, "").trim());

  if (!Number.isFinite(normalized)) {
    throw new MarketDataProviderError("KIWOOM_QUOTE_BAD_RESPONSE", `Kiwoom quote response had invalid ${fieldName}.`, "kiwoom", false);
  }

  return normalized;
}
