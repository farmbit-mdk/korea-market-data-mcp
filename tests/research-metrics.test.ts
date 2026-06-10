import { describe, expect, it } from "vitest";
import {
  buildMarketDataResearchMetrics,
  buildAssetResearchMetricFromCandles,
  buildSingleMarketDataResearchMetric
} from "../src/utils/research-metrics.js";

const candles = [
  { date: "2026-06-01", open: 100, high: 110, low: 95, close: 100, volume: 1000 },
  { date: "2026-06-02", open: 101, high: 120, low: 98, close: 105, volume: 2000 },
  { date: "2026-06-03", open: 106, high: 115, low: 90, close: 110, volume: 3000 }
];

describe("research metrics", () => {
  it("calculates period return, high/low dates, average volume, volume ratio, and candle count", () => {
    const result = buildSingleMarketDataResearchMetric({
      chart: {
        symbol: "005935",
        name: "Samsung Electronics Preferred",
        candles: [...candles].reverse()
      },
      relatedIndices: [],
      requestedDays: 20,
      assetType: "stock"
    });

    expect(result).toMatchObject({
      symbol: "005935",
      name: "Samsung Electronics Preferred",
      asset_type: "stock",
      metric_status: "ok",
      period: {
        requested_days: 20,
        candle_count: 3,
        period_start_date: "2026-06-01",
        period_end_date: "2026-06-03"
      },
      asset: {
        period_start_price: 100,
        period_end_price: 110,
        period_return: 0.1,
        period_high: 120,
        period_high_date: "2026-06-02",
        period_low: 90,
        period_low_date: "2026-06-03",
        latest_close: 110,
        latest_volume: 3000,
        average_volume: 2000,
        volume_ratio: 1.5
      }
    });
  });

  it("calculates related index period return and asset versus index return difference", () => {
    const result = buildSingleMarketDataResearchMetric({
      chart: {
        symbol: "069500",
        name: "KODEX 200",
        candles
      },
      relatedIndices: [
        {
          index_code: "KOSPI200",
          name: "KOSPI 200",
          candles: [
            { date: "2026-06-01", high: 300, low: 290, close: 1000, volume: 10 },
            { date: "2026-06-03", high: 310, low: 295, close: 1050, volume: 12 }
          ]
        }
      ],
      requestedDays: 20,
      assetType: "etf"
    });

    expect(result.related_indices[0]).toMatchObject({
      symbol: "KOSPI200",
      name: "KOSPI 200",
      period_return: 0.05,
      asset_vs_index_return_diff: 0.05
    });
  });

  it("returns null metrics when candles are missing or insufficient", () => {
    expect(buildAssetResearchMetricFromCandles([])).toMatchObject({
      period_start_price: null,
      period_end_price: null,
      period_return: null,
      latest_close: null,
      average_volume: null,
      volume_ratio: null
    });

    const result = buildSingleMarketDataResearchMetric({
      chart: {
        symbol: "005930",
        candles: [{ date: "2026-06-01", close: 100, volume: 1000 }]
      },
      relatedIndices: []
    });

    expect(result.period.candle_count).toBe(1);
    expect(result.metric_status).toBe("unavailable");
    expect(result.asset.period_return).toBeNull();
    expect(result.related_indices).toEqual([]);
  });

  it("builds context-level research metrics without mock data or judgment wording", () => {
    const metrics = buildMarketDataResearchMetrics({
      resolvedAssets: [{ symbol: "005935", name: "Samsung Electronics Preferred", assetType: "stock" }],
      dailyCharts: [{ symbol: "005935", candles }],
      relatedIndices: [{ status: "unavailable", symbol: "KOSPI", reason: "blocked" }],
      requestedDays: 20
    });
    const serialized = JSON.stringify(metrics);

    expect(metrics).toHaveLength(1);
    expect(metrics[0].asset.period_return).toBe(0.1);
    expect(serialized).not.toContain("mock");
    expect(serialized).not.toContain("매수");
    expect(serialized).not.toContain("매도");
    expect(serialized).not.toContain("추천");
    expect(serialized).not.toContain("목표가");
    expect(serialized).not.toContain("강세");
    expect(serialized).not.toContain("약세");
  });
});
