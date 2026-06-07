import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote } from "../../schemas/index.js";
import type { DailyChartInput } from "../types.js";

export function mapMockStockQuote(symbol: string, requestTimestamp: string): NormalizedQuote | undefined {
  void symbol;
  void requestTimestamp;
  return undefined;
}

export function mapMockEtfQuote(symbol: string, requestTimestamp: string): NormalizedQuote | undefined {
  void symbol;
  void requestTimestamp;
  return undefined;
}

export function mapMockIndex(indexCode: string, requestTimestamp: string): NormalizedIndex | undefined {
  void indexCode;
  void requestTimestamp;
  return undefined;
}

export function mapMockDailyChart(input: DailyChartInput, requestTimestamp: string): NormalizedDailyChart | undefined {
  void input;
  void requestTimestamp;
  return undefined;
}
