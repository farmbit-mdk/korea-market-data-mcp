import { MarketDataProviderError } from "../errors.js";
import { redactSecrets } from "../../safety/redact-secret.js";
import { kiwoomQuoteEndpointMappings } from "./quote-endpoints.js";
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
  useMappedQuoteEndpoint?: boolean;
  accessToken?: string;
  apiId?: string;
  debugProviderResponse?: boolean;
}

export class DefaultKiwoomQuoteClient implements KiwoomQuoteClient {
  private readonly transport: KiwoomQuoteTransport;

  constructor(private readonly options: KiwoomQuoteClientOptions = {}) {
    this.transport = options.transport ?? createFetchKiwoomQuoteTransport();
  }

  async getQuote(request: KiwoomQuoteRequest): Promise<NormalizedKiwoomQuote> {
    assertReadOnlyQuoteRequest(request);

    const quoteEndpointPath = this.resolveQuoteEndpointPath();

    if (quoteEndpointPath === undefined || this.options.baseUrl === undefined) {
      throw new MarketDataProviderError(
        "KIWOOM_QUOTE_NOT_IMPLEMENTED",
        "Kiwoom quote endpoint is not configured yet.",
        "kiwoom",
        false
      );
    }

    const transportRequest: KiwoomQuoteTransportRequest = {
      url: `${this.options.baseUrl}${quoteEndpointPath}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.resolveKiwoomHeaders()
      },
      body: this.resolveQuoteRequestBody(request)
    };

    try {
      const rawResponse = await this.transport.requestQuote(transportRequest);
      this.writeDebugProviderResponse(transportRequest, rawResponse);
      return normalizeKiwoomQuoteResponse(rawResponse, request);
    } catch (error) {
      throw normalizeKiwoomQuoteError(error);
    }
  }

  private resolveQuoteEndpointPath(): string | undefined {
    if (this.options.quoteEndpointPath !== undefined) {
      return this.options.quoteEndpointPath;
    }

    if (
      this.options.useMappedQuoteEndpoint === true &&
      kiwoomQuoteEndpointMappings.quote.enabled &&
      kiwoomQuoteEndpointMappings.quote.manualOnly &&
      kiwoomQuoteEndpointMappings.quote.readOnly
    ) {
      return kiwoomQuoteEndpointMappings.quote.path;
    }

    return undefined;
  }

  private resolveKiwoomHeaders(): Record<string, string> {
    return {
      ...(this.options.accessToken === undefined ? {} : { Authorization: `Bearer ${this.options.accessToken}` }),
      ...(this.options.apiId === undefined ? {} : { "api-id": this.options.apiId })
    };
  }

  private resolveQuoteRequestBody(request: KiwoomQuoteRequest): Record<string, string | undefined> {
    if (this.options.apiId === kiwoomQuoteEndpointMappings.quote.apiId) {
      return { stk_cd: request.symbol };
    }

    return {
      symbol: request.symbol,
      market: request.market
    };
  }

  private writeDebugProviderResponse(
    request: KiwoomQuoteTransportRequest,
    response: KiwoomQuoteResponse
  ): void {
    if (this.options.debugProviderResponse !== true) {
      return;
    }

    const responseRecord = response as Record<string, unknown>;
    const priceCandidateFields = ["cur_prc", "현재가", "price", "current_price", "close", "stck_prpr", "trade_price"];
    const summary = {
      provider: "kiwoom",
      debug: "quote_provider_response",
      endpoint: request.url,
      method: request.method,
      api_id: this.options.apiId,
      request_body: request.body,
      response_top_level_keys: Object.keys(responseRecord),
      price_candidate_fields: Object.fromEntries(
        priceCandidateFields.map((field) => [field, hasNonEmptyField(responseRecord, field)])
      ),
      redacted_response: redactSecrets(responseRecord)
    };

    process.stderr.write(`${JSON.stringify(summary, null, 2)}\n`);
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

  const responseRecord = response as Record<string, unknown>;
  const symbol = normalizeRequiredString(response.symbol ?? response.stock_code ?? readStringField(responseRecord, "stk_cd") ?? request.symbol, "symbol");
  const price = normalizeRequiredPrice(readFirstField(responseRecord, [
    "cur_prc",
    "현재가",
    "price",
    "current_price",
    "close",
    "stck_prpr",
    "trade_price"
  ]), "price");

  return {
    provider: "kiwoom",
    symbol,
    name: normalizeOptionalString(response.name ?? readStringField(responseRecord, "stk_nm")),
    market: normalizeOptionalString(response.market ?? request.market),
    currency: "KRW",
    price,
    change: normalizeOptionalNumber(response.change ?? readFirstField(responseRecord, ["pred_pre", "change"]), "change"),
    change_rate: normalizeOptionalNumber(response.change_rate ?? readFirstField(responseRecord, ["flu_rt", "change_rate"]), "change_rate"),
    volume: normalizeOptionalNumber(response.volume ?? readFirstField(responseRecord, ["trde_qty", "volume"]), "volume"),
    as_of: normalizeOptionalString(response.as_of ?? response.timestamp),
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

function normalizeRequiredPrice(value: string | number | undefined, fieldName: string): number {
  const normalized = normalizeRequiredNumber(value, fieldName);
  return Math.abs(normalized);
}

function normalizeRequiredNumber(value: string | number | undefined, fieldName: string): number {
  const normalized = normalizeOptionalNumber(value, fieldName);

  if (normalized === undefined) {
    throw new MarketDataProviderError("KIWOOM_QUOTE_BAD_RESPONSE", `Kiwoom quote response missing ${fieldName}.`, "kiwoom", false);
  }

  return normalized;
}

function readFirstField(record: Record<string, unknown>, fieldNames: string[]): string | number | undefined {
  for (const fieldName of fieldNames) {
    const value = record[fieldName];

    if ((typeof value === "string" && value.trim() !== "") || typeof value === "number") {
      return value;
    }
  }

  return undefined;
}

function readStringField(record: Record<string, unknown>, fieldName: string): string | undefined {
  const value = record[fieldName];
  return typeof value === "string" ? value : undefined;
}

function hasNonEmptyField(record: Record<string, unknown>, fieldName: string): boolean {
  const value = record[fieldName];
  return (typeof value === "string" && value.trim() !== "") || typeof value === "number";
}
