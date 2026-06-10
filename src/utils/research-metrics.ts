export interface ResearchMetricPeriod {
  requested_days?: number;
  candle_count: number;
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
    .map((index) => buildRelatedIndexResearchMetric(index, assetMetric.period_return));

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
  const start = candlesWithClose.length >= 2 ? candlesWithClose[0] : undefined;
  const end = candlesWithClose.length >= 2 ? candlesWithClose.at(-1) : undefined;
  const periodReturn = start?.close !== null && start?.close !== undefined && end?.close !== null && end?.close !== undefined && start.close !== 0
    ? roundMetric((end.close - start.close) / start.close)
    : null;
  const high = findExtreme(candles, "high", "max");
  const low = findExtreme(candles, "low", "min");
  const volumes = candles.map((candle) => candle.volume).filter((volume): volume is number => volume !== null);
  const averageVolume = volumes.length > 0 ? roundMetric(volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length) : null;
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
    volume_ratio: latestVolume !== null && averageVolume !== null && averageVolume !== 0
      ? roundMetric(latestVolume / averageVolume)
      : null
  };
}

function buildPeriodMetric(candles: NormalizedCandle[], requestedDays: number | undefined): ResearchMetricPeriod {
  return {
    requested_days: requestedDays,
    candle_count: candles.length,
    period_start_date: candles[0]?.date ?? null,
    period_end_date: candles.at(-1)?.date ?? null
  };
}

function buildRelatedIndexResearchMetric(
  index: Record<string, unknown>,
  assetPeriodReturn: number | null
): RelatedIndexResearchMetric {
  const symbol = readString(index.index_code) ?? readString(index.symbol) ?? "";
  const indexPeriodReturn = readNumber(index.period_return) ?? buildAssetResearchMetricFromCandles(index.candles).period_return;

  return {
    symbol,
    name: readString(index.name),
    period_return: indexPeriodReturn,
    asset_vs_index_return_diff: assetPeriodReturn !== null && indexPeriodReturn !== null
      ? roundMetric(assetPeriodReturn - indexPeriodReturn)
      : null
  };
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

function roundMetric(value: number): number {
  return Number(value.toFixed(6));
}
