export interface ResearchMetricPeriod {
  requested_days?: number;
  candle_count: number;
  requested_period_complete: boolean | null;
  period_start_date: string | null;
  period_end_date: string | null;
}

export interface AssetResearchMetric {
  period_start_price: number | null;
  period_end_price: number | null;
  period_return: number | null;
  period_high: number | null;
  period_high_date: string | null;
  period_low: number | null;
  period_low_date: string | null;
  latest_close: number | null;
  latest_volume: number | null;
  average_volume: number | null;
  volume_ratio: number | null;
}

export interface RelatedIndexResearchMetric {
  symbol: string;
  name?: string;
  comparison_status: "ok" | "comparison_unavailable";
  comparison_unavailable_reason?: "missing_comparable_index_period" | "insufficient_index_candles" | "period_mismatch" | "asset_period_return_unavailable";
  index_period_start_date: string | null;
  index_period_end_date: string | null;
  index_period_return: number | null;
  period_return: number | null;
  asset_vs_index_return_diff: number | null;
}

export interface MarketDataResearchMetric {
  symbol: string;
  name?: string;
  asset_type?: string;
  source: "daily_chart";
  metric_status: "ok" | "unavailable";
  unavailable_reason?: string;
  period: ResearchMetricPeriod;
  asset: AssetResearchMetric;
  related_indices: RelatedIndexResearchMetric[];
}

interface NormalizedCandle {
  date: string;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

const emptyAssetMetric: AssetResearchMetric = {
  period_start_price: null,
  period_end_price: null,
  period_return: null,
  period_high: null,
  period_high_date: null,
  period_low: null,
  period_low_date: null,
  latest_close: null,
  latest_volume: null,
  average_volume: null,
  volume_ratio: null
};

export function buildMarketDataResearchMetrics(options: {
  resolvedAssets: Array<{ symbol: string; name?: string; assetType?: string }>;
  dailyCharts: Array<Record<string, unknown>>;
  relatedIndices: Array<Record<string, unknown>>;
  requestedDays?: number;
}): MarketDataResearchMetric[] {
  return options.dailyCharts
    .filter((chart) => chart.status !== "unavailable")
    .map((chart) => {
      const symbol = readString(chart.symbol) ?? "";
      const asset = options.resolvedAssets.find((candidate) => candidate.symbol === symbol);
      return buildSingleMarketDataResearchMetric({
        chart,
        relatedIndices: options.relatedIndices,
        requestedDays: options.requestedDays,
        symbol,
        name: readString(chart.name) ?? asset?.name,
        assetType: asset?.assetType
      });
    });
}

export function buildSingleMarketDataResearchMetric(options: {
  chart: Record<string, unknown>;
  relatedIndices: Array<Record<string, unknown>>;
  requestedDays?: number;
  symbol?: string;
  name?: string;
  assetType?: string;
}): MarketDataResearchMetric {
  const candles = normalizeCandles(options.chart.candles);
  const period = buildPeriodMetric(candles, options.requestedDays);
  const assetMetric = buildAssetResearchMetric(candles);
  const relatedIndices = options.relatedIndices
    .filter((index) => index.status !== "unavailable")
    .map((index) => buildRelatedIndexResearchMetric(index, assetMetric.period_return, period));

  return {
    symbol: options.symbol ?? readString(options.chart.symbol) ?? "",
    name: options.name ?? readString(options.chart.name),
    asset_type: options.assetType,
    source: "daily_chart",
    metric_status: assetMetric.period_return === null ? "unavailable" : "ok",
    unavailable_reason: assetMetric.period_return === null ? "At least two candles with close prices are required." : undefined,
    period,
    asset: assetMetric,
    related_indices: relatedIndices
  };
}

export function buildAssetResearchMetricFromCandles(candlesInput: unknown): AssetResearchMetric {
  return buildAssetResearchMetric(normalizeCandles(candlesInput));
}

function buildAssetResearchMetric(candles: NormalizedCandle[]): AssetResearchMetric {
  if (candles.length === 0) {
    return { ...emptyAssetMetric };
  }

  const candlesWithClose = candles.filter((candle) => candle.close !== null);
  const start = candlesWithClose[0];
  const end = candlesWithClose.at(-1);
  const startClose = start?.close ?? null;
  const endClose = end?.close ?? null;
  const periodReturn = candlesWithClose.length >= 2 && startClose !== null && endClose !== null && startClose > 0
    ? safeRoundMetric((endClose - startClose) / startClose)
    : null;
  const high = findExtreme(candles, "high", "max");
  const low = findExtreme(candles, "low", "min");
  const volumes = candles.map((candle) => candle.volume).filter((volume): volume is number => volume !== null);
  const averageVolume = volumes.length > 0 ? safeRoundMetric(volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length) : null;
  const latestVolume = candles.at(-1)?.volume ?? null;

  return {
    period_start_price: start?.close ?? null,
    period_end_price: end?.close ?? null,
    period_return: periodReturn,
    period_high: high.value,
    period_high_date: high.date,
    period_low: low.value,
    period_low_date: low.date,
    latest_close: end?.close ?? null,
    latest_volume: latestVolume,
    average_volume: averageVolume,
    volume_ratio: latestVolume !== null && averageVolume !== null && averageVolume > 0
      ? safeRoundMetric(latestVolume / averageVolume)
      : null
  };
}

function buildPeriodMetric(candles: NormalizedCandle[], requestedDays: number | undefined): ResearchMetricPeriod {
  return {
    requested_days: requestedDays,
    candle_count: candles.length,
    requested_period_complete: requestedDays === undefined ? null : candles.length >= requestedDays,
    period_start_date: candles[0]?.date ?? null,
    period_end_date: candles.at(-1)?.date ?? null
  };
}

function buildRelatedIndexResearchMetric(
  index: Record<string, unknown>,
  assetPeriodReturn: number | null,
  assetPeriod: ResearchMetricPeriod
): RelatedIndexResearchMetric {
  const symbol = readString(index.index_code) ?? readString(index.symbol) ?? "";
  const indexCandles = normalizeCandles(index.candles);
  const indexPeriod = buildPeriodMetric(indexCandles, assetPeriod.requested_days);
  const rawIndexPeriodReturn = readNumber(index.index_period_return) ?? readNumber(index.period_return);
  const indexPeriodReturn = indexPeriod.candle_count > 0
    ? rawIndexPeriodReturn ?? buildAssetResearchMetric(indexCandles).period_return
    : null;
  const unavailableReason = getComparisonUnavailableReason(assetPeriodReturn, assetPeriod, indexPeriod, indexPeriodReturn);

  return {
    symbol,
    name: readString(index.name),
    comparison_status: unavailableReason === undefined ? "ok" : "comparison_unavailable",
    comparison_unavailable_reason: unavailableReason,
    index_period_start_date: indexPeriod.period_start_date,
    index_period_end_date: indexPeriod.period_end_date,
    index_period_return: indexPeriodReturn,
    period_return: indexPeriodReturn,
    asset_vs_index_return_diff: unavailableReason === undefined && assetPeriodReturn !== null && indexPeriodReturn !== null
      ? safeRoundMetric(assetPeriodReturn - indexPeriodReturn)
      : null
  };
}

function getComparisonUnavailableReason(
  assetPeriodReturn: number | null,
  assetPeriod: ResearchMetricPeriod,
  indexPeriod: ResearchMetricPeriod,
  indexPeriodReturn: number | null
): RelatedIndexResearchMetric["comparison_unavailable_reason"] | undefined {
  if (assetPeriodReturn === null) {
    return "asset_period_return_unavailable";
  }

  if (indexPeriod.candle_count === 0) {
    return "missing_comparable_index_period";
  }

  if (indexPeriodReturn === null) {
    return "insufficient_index_candles";
  }

  if (
    assetPeriod.period_start_date !== indexPeriod.period_start_date ||
    assetPeriod.period_end_date !== indexPeriod.period_end_date
  ) {
    return "period_mismatch";
  }

  return undefined;
}

function normalizeCandles(value: unknown): NormalizedCandle[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (item === null || typeof item !== "object") {
        return undefined;
      }

      const record = item as Record<string, unknown>;
      const date = readString(record.date) ?? readString(record.dt) ?? readString(record.trde_dt);

      if (date === undefined) {
        return undefined;
      }

      return {
        date,
        high: readNumber(record.high),
        low: readNumber(record.low),
        close: readNumber(record.close),
        volume: readNumber(record.volume)
      };
    })
    .filter((candle): candle is NormalizedCandle => candle !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function findExtreme(candles: NormalizedCandle[], field: "high" | "low", mode: "max" | "min"): { value: number | null; date: string | null } {
  let selected: { value: number; date: string } | undefined;

  for (const candle of candles) {
    const value = candle[field];
    if (value === null) {
      continue;
    }

    if (
      selected === undefined ||
      (mode === "max" && value > selected.value) ||
      (mode === "min" && value < selected.value)
    ) {
      selected = { value, date: candle.date };
    }
  }

  return selected ?? { value: null, date: null };
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const normalized = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(normalized) ? normalized : null;
}

function safeRoundMetric(value: number): number | null {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(6));
}
