import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote } from "../../schemas/index.js";
import type { DailyChartInput } from "../types.js";
import { mockDailyCandles, mockEtfQuotes, mockIndices, mockStockQuotes } from "./data.js";

export function mapMockStockQuote(symbol: string, requestTimestamp: string): NormalizedQuote | undefined {
  const quote = mockStockQuotes[normalizeSymbol(symbol)];
  return quote === undefined ? undefined : { ...quote, requestTimestamp };
}

export function mapMockEtfQuote(symbol: string, requestTimestamp: string): NormalizedQuote | undefined {
  const quote = mockEtfQuotes[normalizeSymbol(symbol)];
  return quote === undefined ? undefined : { ...quote, requestTimestamp };
}

export function mapMockIndex(indexCode: string, requestTimestamp: string): NormalizedIndex | undefined {
  const index = mockIndices[normalizeIndexCode(indexCode)];
  return index === undefined ? undefined : { ...index, requestTimestamp };
}

export function mapMockDailyChart(input: DailyChartInput, requestTimestamp: string): NormalizedDailyChart | undefined {
  const symbol = normalizeSymbol(input.symbol);
  const stock = mockStockQuotes[symbol];
  const etf = mockEtfQuotes[symbol];

  if (stock === undefined && etf === undefined) {
    return undefined;
  }

  const base = stock ?? etf;
  const limit = input.limit ?? 30;

  return {
    symbol: base.symbol,
    name: base.name,
    market: base.market,
    assetType: base.assetType,
    currency: base.currency,
    candles: mockDailyCandles.slice(0, limit),
    provider: "mock",
    sourceSymbol: base.sourceSymbol,
    requestTimestamp,
    isDelayed: false
  };
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function normalizeIndexCode(indexCode: string): string {
  return indexCode.trim().toUpperCase().replace(/\s+/g, "");
}
