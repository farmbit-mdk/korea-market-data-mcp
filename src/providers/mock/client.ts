import { MarketDataProviderError } from "../errors.js";
import type {
  DailyChartInput,
  MarketDataProvider,
  MarketIndexInput,
  QuoteInput,
  SymbolSearchInput
} from "../types.js";
import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote, SymbolSearchResult } from "../../schemas/index.js";
import { nowIso } from "../../utils/time.js";
import { mockSymbols } from "./data.js";
import { mapMockDailyChart, mapMockEtfQuote, mapMockIndex, mapMockStockQuote } from "./mapper.js";

export class MockMarketDataProvider implements MarketDataProvider {
  readonly metadata = {
    id: "mock",
    name: "Mock Market Data Provider",
    version: "0.32.0-alpha",
    supportsRealtime: false,
    supportsHistoricalChart: true,
    supportsEtfData: true,
    supportsIndexData: true,
    supportsSymbolSearch: true,
    isReadOnly: true
  } as const;

  readonly capabilities = {
    symbolSearch: true,
    stockQuote: true,
    etfQuote: true,
    marketIndex: true,
    dailyChart: true,
    minuteChart: false,
    realtimeQuote: false
  };

  async searchSymbol(input: SymbolSearchInput): Promise<SymbolSearchResult[]> {
    assertNonEmpty(input.query, "query");
    const query = normalizeSearchText(input.query);
    const limit = clampLimit(input.limit, 10, 1, 50);

    return mockSymbols
      .filter((item) => {
        const searchableValues = [item.symbol, item.name, item.koreanName, ...item.aliases].filter(
          (value): value is string => value !== undefined
        );
        const matchesQuery = searchableValues.some((value) => matchesSearchValue(value, query));
        const matchesMarket = input.market === undefined || input.market === "UNKNOWN" || item.market === input.market;
        const matchesAssetType =
          input.assetType === undefined || input.assetType === "unknown" || item.assetType === input.assetType;

        return matchesQuery && matchesMarket && matchesAssetType;
      })
      .map(({ aliases: _aliases, koreanName: _koreanName, ...result }) => result)
      .slice(0, limit);
  }

  async getStockQuote(input: QuoteInput): Promise<NormalizedQuote> {
    assertNonEmpty(input.symbol, "symbol");
    const quote = mapMockStockQuote(input.symbol, nowIso());

    if (quote === undefined) {
      throw new MarketDataProviderError("SYMBOL_NOT_FOUND", "Symbol was not found.", "mock", false);
    }

    return quote;
  }

  async getEtfQuote(input: QuoteInput): Promise<NormalizedQuote> {
    assertNonEmpty(input.symbol, "symbol");
    const quote = mapMockEtfQuote(input.symbol, nowIso());

    if (quote === undefined) {
      throw new MarketDataProviderError("SYMBOL_NOT_FOUND", "Symbol was not found.", "mock", false);
    }

    return quote;
  }

  async getMarketIndex(input: MarketIndexInput): Promise<NormalizedIndex> {
    assertNonEmpty(input.indexCode, "indexCode");
    const index = mapMockIndex(input.indexCode, nowIso());

    if (index === undefined) {
      throw new MarketDataProviderError("SYMBOL_NOT_FOUND", "Index code was not found.", "mock", false);
    }

    return index;
  }

  async getDailyChart(input: DailyChartInput): Promise<NormalizedDailyChart> {
    assertNonEmpty(input.symbol, "symbol");
    const chart = mapMockDailyChart(input, nowIso());

    if (chart === undefined) {
      throw new MarketDataProviderError("SYMBOL_NOT_FOUND", "Symbol was not found.", "mock", false);
    }

    return chart;
  }
}

function assertNonEmpty(value: string | undefined, fieldName: string): void {
  if (value === undefined || value.trim() === "") {
    throw new MarketDataProviderError("INVALID_INPUT", `${fieldName} is required.`, "mock", false);
  }
}

function clampLimit(value: number | undefined, defaultValue: number, minimum: number, maximum: number): number {
  if (value === undefined) {
    return defaultValue;
  }

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new MarketDataProviderError("INVALID_INPUT", `limit must be between ${minimum} and ${maximum}.`, "mock", false);
  }

  return value;
}

function matchesSearchValue(value: string, normalizedQuery: string): boolean {
  const normalizedValue = normalizeSearchText(value);
  return normalizedValue.includes(normalizedQuery) || compactText(normalizedValue).includes(compactText(normalizedQuery));
}

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function compactText(value: string): string {
  return value.replace(/\s+/g, "");
}
