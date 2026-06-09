import { MarketDataProviderError } from "../errors.js";
import { redactSecrets } from "../../safety/redact-secret.js";
import { nowIso } from "../../utils/time.js";
import { kiwoomQuoteEndpointMappings } from "./quote-endpoints.js";
import { createFetchKiwoomChartTransport } from "./transport.js";
import type {
  KiwoomChartRequest,
  KiwoomChartResponse,
  KiwoomChartTransport,
  KiwoomChartTransportRequest,
  NormalizedKiwoomDailyCandle,
  NormalizedKiwoomDailyChart
} from "./types.js";

export interface KiwoomChartClient {
  getDailyChart(request: KiwoomChartRequest): Promise<NormalizedKiwoomDailyChart>;
}

export interface KiwoomChartClientOptions {
  transport?: KiwoomChartTransport;
  chartEndpointPath?: string;
  baseUrl?: string;
  accessToken?: string;
  apiId?: string;
}

export class DefaultKiwoomChartClient implements KiwoomChartClient {
  private readonly transport: KiwoomChartTransport;

  constructor(private readonly options: KiwoomChartClientOptions = {}) {
    this.transport = options.transport ?? createFetchKiwoomChartTransport();
  }

  async getDailyChart(request: KiwoomChartRequest): Promise<NormalizedKiwoomDailyChart> {
    assertReadOnlyChartRequest(request);

    if (this.options.chartEndpointPath === undefined || this.options.baseUrl === undefined) {
      throw new MarketDataProviderError(
        "KIWOOM_DAILY_CHART_NOT_IMPLEMENTED",
        "Kiwoom daily chart endpoint is not configured yet.",
        "kiwoom",
        false
      );
    }

    const limit = clampLimit(request.limit);
    const transportRequest: KiwoomChartTransportRequest = {
      url: `${this.options.baseUrl}${this.options.chartEndpointPath}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.options.accessToken === undefined ? {} : { Authorization: `Bearer ${this.options.accessToken}` }),
        ...(this.options.apiId === undefined ? {} : { "api-id": this.options.apiId })
      },
      body: {
        stk_cd: request.symbol,
        base_dt: request.baseDate ?? currentYyyymmdd(),
        upd_stkpc_tp: "1"
      }
    };

    try {
      return normalizeKiwoomDailyChartResponse(
        await this.transport.requestChart(transportRequest),
        request,
        limit,
        this.options.apiId ?? String(kiwoomQuoteEndpointMappings.dailyChart.apiId)
      );
    } catch (error) {
      throw normalizeKiwoomChartError(error);
    }
  }
}

export function createKiwoomChartClient(options: KiwoomChartClientOptions = {}): KiwoomChartClient {
  return new DefaultKiwoomChartClient(options);
}

export function normalizeKiwoomDailyChartResponse(
  response: KiwoomChartResponse,
  request: KiwoomChartRequest,
  limit: number = 20,
  sourceTr: string = kiwoomQuoteEndpointMappings.dailyChart.apiId
): NormalizedKiwoomDailyChart {
  const returnCode = response.return_code === undefined ? undefined : String(response.return_code);

  if (returnCode !== undefined && returnCode !== "0") {
    throw new MarketDataProviderError(
      "KIWOOM_DAILY_CHART_REQUEST_FAILED",
      "Kiwoom daily chart request failed.",
      "kiwoom",
      false,
      returnCode,
      response.return_msg === undefined ? undefined : redactSecrets(response.return_msg)
    );
  }

  const rows = readChartRows(response).slice(0, limit);

  if (rows.length === 0) {
    throw new MarketDataProviderError("KIWOOM_DAILY_CHART_BAD_RESPONSE", "Kiwoom daily chart response missing candles.", "kiwoom", false);
  }

  return {
    provider: "kiwoom",
    source: "real",
    symbol: request.symbol,
    name: request.name,
    market: request.market,
    currency: "KRW",
    timeframe: "1d",
    limit,
    fetched_at: nowIso(),
    source_tr: sourceTr,
    candles: rows.map(normalizeCandle)
  };
}

function readChartRows(response: KiwoomChartResponse): Array<Record<string, string | number | undefined>> {
  const candidates = [
    response.stk_dt_pole_chart_qry,
    response.output1,
    response.ka10081OutBlock1,
    Array.isArray(response.output) ? response.output : undefined
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate;
    }
  }

  return [];
}

function normalizeCandle(row: Record<string, string | number | undefined>): NormalizedKiwoomDailyCandle {
  return {
    date: normalizeDate(readRequiredField(row, ["dt", "date", "trde_dt", "stk_bsop_date"], "date")),
    open: normalizeRequiredNumber(readRequiredField(row, ["open_pric", "open", "stck_oprc"], "open"), "open"),
    high: normalizeRequiredNumber(readRequiredField(row, ["high_pric", "high", "stck_hgpr"], "high"), "high"),
    low: normalizeRequiredNumber(readRequiredField(row, ["low_pric", "low", "stck_lwpr"], "low"), "low"),
    close: normalizeRequiredNumber(readRequiredField(row, ["cur_prc", "close", "stck_clpr", "trade_price"], "close"), "close"),
    volume: normalizeRequiredNumber(readRequiredField(row, ["trde_qty", "volume", "acml_vol"], "volume"), "volume"),
    change: normalizeOptionalNumber(readFirstField(row, ["pred_pre", "change"])),
    change_rate: normalizeOptionalNumber(readFirstField(row, ["flu_rt", "change_rate"])),
    trading_value: normalizeOptionalNumber(readFirstField(row, ["trde_prica", "trading_value", "acml_tr_pbmn"]))
  };
}

function readRequiredField(
  row: Record<string, string | number | undefined>,
  fieldNames: string[],
  fieldLabel: string
): string | number {
  const value = readFirstField(row, fieldNames);

  if (value === undefined) {
    throw new MarketDataProviderError("KIWOOM_DAILY_CHART_BAD_RESPONSE", `Kiwoom daily chart response missing ${fieldLabel}.`, "kiwoom", false);
  }

  return value;
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

function normalizeRequiredNumber(value: string | number, fieldName: string): number {
  const normalized = normalizeOptionalNumber(value);

  if (normalized === undefined) {
    throw new MarketDataProviderError("KIWOOM_DAILY_CHART_BAD_RESPONSE", `Kiwoom daily chart response missing ${fieldName}.`, "kiwoom", false);
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

function normalizeDate(value: string | number): string {
  const rawDate = String(value).trim();

  if (/^\d{8}$/.test(rawDate)) {
    return `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }

  throw new MarketDataProviderError("KIWOOM_DAILY_CHART_BAD_RESPONSE", "Kiwoom daily chart response had invalid date.", "kiwoom", false);
}

function normalizeKiwoomChartError(error: unknown): MarketDataProviderError {
  if (error instanceof MarketDataProviderError) {
    return error;
  }

  const message = error instanceof Error ? redactSecrets(error.message) : "Kiwoom daily chart request failed.";
  return new MarketDataProviderError("KIWOOM_DAILY_CHART_REQUEST_FAILED", message, "kiwoom", true);
}

function assertReadOnlyChartRequest(request: KiwoomChartRequest): void {
  const unsafeKeys = ["account", "accountNo", "order", "quantity", "balance", "holding", "holdings"];
  const requestRecord = request as unknown as Record<string, unknown>;
  const presentUnsafeKey = unsafeKeys.find((key) => Object.hasOwn(requestRecord, key));

  if (presentUnsafeKey !== undefined) {
    throw new MarketDataProviderError("INVALID_INPUT", "Kiwoom chart request must remain read-only market data only.", "kiwoom", false);
  }
}

function clampLimit(value: number | undefined): number {
  if (value === undefined || !Number.isInteger(value)) {
    return 20;
  }

  return Math.min(Math.max(value, 1), 60);
}

function currentYyyymmdd(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}
