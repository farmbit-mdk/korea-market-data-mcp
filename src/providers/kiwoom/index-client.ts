import { MarketDataProviderError } from "../errors.js";
import { redactSecrets } from "../../safety/redact-secret.js";
import { nowIso } from "../../utils/time.js";
import { kiwoomQuoteEndpointMappings } from "./quote-endpoints.js";
import { createFetchKiwoomMarketIndexTransport } from "./transport.js";
import type {
  KiwoomMarketIndexCode,
  KiwoomMarketIndexRequest,
  KiwoomMarketIndexResponse,
  KiwoomMarketIndexTransport,
  KiwoomMarketIndexTransportRequest,
  NormalizedKiwoomMarketIndex
} from "./types.js";

export interface KiwoomIndexClient {
  getMarketIndex(request: KiwoomMarketIndexRequest): Promise<NormalizedKiwoomMarketIndex>;
}

export interface KiwoomIndexClientOptions {
  transport?: KiwoomMarketIndexTransport;
  indexEndpointPath?: string;
  baseUrl?: string;
  accessToken?: string;
  apiId?: string;
}

export const kiwoomMarketIndexMappings: Record<KiwoomMarketIndexCode, {
  indexCode: KiwoomMarketIndexCode;
  name: string;
  market: "KRX";
  currency: "KRW";
  publicIndexCode: KiwoomMarketIndexCode;
  kiwoomMarketType: "0" | "1" | "2";
  kiwoomSectorCode: string;
  aliases: string[];
}> = {
  KOSPI: {
    indexCode: "KOSPI",
    name: "KOSPI",
    market: "KRX",
    currency: "KRW",
    publicIndexCode: "KOSPI",
    kiwoomMarketType: "0",
    kiwoomSectorCode: "001",
    aliases: ["KOSPI", "\uCF54\uC2A4\uD53C"]
  },
  KOSDAQ: {
    indexCode: "KOSDAQ",
    name: "KOSDAQ",
    market: "KRX",
    currency: "KRW",
    publicIndexCode: "KOSDAQ",
    kiwoomMarketType: "1",
    kiwoomSectorCode: "101",
    aliases: ["KOSDAQ", "\uCF54\uC2A4\uB2E5"]
  },
  KOSPI200: {
    indexCode: "KOSPI200",
    name: "KOSPI 200",
    market: "KRX",
    currency: "KRW",
    publicIndexCode: "KOSPI200",
    kiwoomMarketType: "2",
    kiwoomSectorCode: "201",
    aliases: ["KOSPI200", "KOSPI 200", "\uCF54\uC2A4\uD53C200", "\uCF54\uC2A4\uD53C 200"]
  }
};

export class DefaultKiwoomIndexClient implements KiwoomIndexClient {
  private readonly transport: KiwoomMarketIndexTransport;

  constructor(private readonly options: KiwoomIndexClientOptions = {}) {
    this.transport = options.transport ?? createFetchKiwoomMarketIndexTransport();
  }

  async getMarketIndex(request: KiwoomMarketIndexRequest): Promise<NormalizedKiwoomMarketIndex> {
    assertReadOnlyIndexRequest(request);

    if (this.options.indexEndpointPath === undefined || this.options.baseUrl === undefined) {
      throw new MarketDataProviderError(
        "KIWOOM_MARKET_INDEX_NOT_IMPLEMENTED",
        "Kiwoom market index endpoint is not configured yet.",
        "kiwoom",
        false
      );
    }

    const indexMapping = kiwoomMarketIndexMappings[request.indexCode];
    const transportRequest: KiwoomMarketIndexTransportRequest = {
      url: `${this.options.baseUrl}${this.options.indexEndpointPath}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...(this.options.accessToken === undefined ? {} : { Authorization: `Bearer ${this.options.accessToken}` }),
        ...(this.options.apiId === undefined ? {} : { "api-id": this.options.apiId })
      },
      body: {
        mrkt_tp: indexMapping.kiwoomMarketType,
        inds_cd: indexMapping.kiwoomSectorCode
      }
    };

    try {
      return normalizeKiwoomMarketIndexResponse(
        await this.transport.requestMarketIndex(transportRequest),
        request,
        this.options.apiId ?? String(kiwoomQuoteEndpointMappings.marketIndex.apiId),
        this.options.indexEndpointPath
      );
    } catch (error) {
      throw normalizeKiwoomMarketIndexError(error);
    }
  }
}

export function createKiwoomIndexClient(options: KiwoomIndexClientOptions = {}): KiwoomIndexClient {
  return new DefaultKiwoomIndexClient(options);
}

export function normalizeKiwoomMarketIndexCode(value: string): KiwoomMarketIndexCode | undefined {
  const normalized = value.trim().toLocaleLowerCase();
  const compact = normalized.replace(/\s+/g, "");

  for (const mapping of Object.values(kiwoomMarketIndexMappings)) {
    const aliases = [mapping.indexCode, mapping.name, ...mapping.aliases];
    if (aliases.some((alias) => {
      const normalizedAlias = alias.toLocaleLowerCase();
      return normalizedAlias === normalized || normalizedAlias.replace(/\s+/g, "") === compact;
    })) {
      return mapping.indexCode;
    }
  }

  return undefined;
}

export function normalizeKiwoomMarketIndexResponse(
  response: KiwoomMarketIndexResponse,
  request: KiwoomMarketIndexRequest,
  sourceTr: string = kiwoomQuoteEndpointMappings.marketIndex.apiId,
  endpoint?: string
): NormalizedKiwoomMarketIndex {
  const returnCode = response.return_code === undefined ? undefined : String(response.return_code);

  if (returnCode !== undefined && returnCode !== "0") {
    throw new MarketDataProviderError(
      "KIWOOM_MARKET_INDEX_REQUEST_FAILED",
      "Kiwoom market index request failed.",
      "kiwoom",
      false,
      returnCode,
      response.return_msg === undefined ? undefined : redactSecrets(response.return_msg)
    );
  }

  const row = readIndexRow(response);
  const mapping = kiwoomMarketIndexMappings[request.indexCode];
  const value = normalizeRequiredNumber(readFirstField(row, ["cur_prc", "value", "price", "current_price", "close"]), "value");

  return {
    provider: "kiwoom",
    source: "real",
    source_tr: sourceTr,
    endpoint,
    public_index_code: mapping.publicIndexCode,
    kiwoom_market_type: mapping.kiwoomMarketType,
    kiwoom_sector_code: mapping.kiwoomSectorCode,
    index_code: mapping.indexCode,
    symbol: mapping.indexCode,
    name: mapping.name,
    market: mapping.market,
    currency: mapping.currency,
    value,
    price: value,
    change: normalizeOptionalNumber(readFirstField(row, ["pred_pre", "change"])),
    change_rate: normalizeOptionalNumber(readFirstField(row, ["flu_rt", "change_rate"])),
    open: normalizeOptionalNumber(readFirstField(row, ["open_pric", "open"])),
    high: normalizeOptionalNumber(readFirstField(row, ["high_pric", "high"])),
    low: normalizeOptionalNumber(readFirstField(row, ["low_pric", "low"])),
    volume: normalizeOptionalNumber(readFirstField(row, ["trde_qty", "volume"])),
    trading_value: normalizeOptionalNumber(readFirstField(row, ["trde_prica", "trading_value"])),
    fetched_at: nowIso(),
    returnCode,
    returnMessage: response.return_msg
  };
}

export function normalizeKiwoomMarketIndexError(error: unknown): MarketDataProviderError {
  if (error instanceof MarketDataProviderError) {
    return error;
  }

  const message = error instanceof Error ? redactSecrets(error.message) : "Kiwoom market index request failed.";
  return new MarketDataProviderError("KIWOOM_MARKET_INDEX_REQUEST_FAILED", message, "kiwoom", true);
}

function readIndexRow(response: KiwoomMarketIndexResponse): Record<string, string | number | undefined> {
  const responseRecord = response as Record<string, string | number | undefined>;
  if (readFirstField(responseRecord, ["cur_prc", "value", "price", "current_price", "close"]) !== undefined) {
    return responseRecord;
  }

  const candidates = [
    response.output1,
    Array.isArray(response.output) ? response.output : undefined
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate[0];
    }
  }

  throw new MarketDataProviderError("KIWOOM_MARKET_INDEX_BAD_RESPONSE", "Kiwoom market index response missing value.", "kiwoom", false);
}

function readFirstField(row: Record<string, string | number | undefined>, fieldNames: string[]): string | number | undefined {
  for (const fieldName of fieldNames) {
    const value = row[fieldName];

    if ((typeof value === "string" && value.trim() !== "") || typeof value === "number") {
      return value;
    }
  }

  return undefined;
}

function normalizeRequiredNumber(value: string | number | undefined, fieldName: string): number {
  const normalized = normalizeOptionalNumber(value);

  if (normalized === undefined) {
    throw new MarketDataProviderError("KIWOOM_MARKET_INDEX_BAD_RESPONSE", `Kiwoom market index response missing ${fieldName}.`, "kiwoom", false);
  }

  return Math.abs(normalized);
}

function normalizeOptionalNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const normalized = typeof value === "number" ? value : Number(value.replace(/,/g, "").trim());
  return Number.isFinite(normalized) ? normalized : undefined;
}

function assertReadOnlyIndexRequest(request: KiwoomMarketIndexRequest): void {
  const unsafeKeys = ["account", "accountNo", "order", "quantity", "balance", "holding", "holdings"];
  const requestRecord = request as unknown as Record<string, unknown>;
  const presentUnsafeKey = unsafeKeys.find((key) => Object.hasOwn(requestRecord, key));

  if (presentUnsafeKey !== undefined) {
    throw new MarketDataProviderError("INVALID_INPUT", "Kiwoom market index request must remain read-only market data only.", "kiwoom", false);
  }
}
