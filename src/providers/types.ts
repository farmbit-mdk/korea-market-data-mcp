import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote, SymbolSearchResult } from "../schemas/index.js";
import type { AssetType, KoreanMarket } from "../schemas/common.js";

export interface ProviderMetadata {
  id: string;
  name: string;
  version?: string;
  website?: string;
  supportsRealtime?: boolean;
  supportsHistoricalChart?: boolean;
  supportsEtfData?: boolean;
  supportsIndexData?: boolean;
  supportsSymbolSearch?: boolean;
  isReadOnly: true;
}

export interface ProviderCapabilities {
  symbolSearch: boolean;
  stockQuote: boolean;
  etfQuote: boolean;
  marketIndex: boolean;
  dailyChart: boolean;
  minuteChart: boolean;
  realtimeQuote: boolean;
}

export interface SymbolSearchInput {
  query: string;
  market?: KoreanMarket;
  assetType?: AssetType;
  limit?: number;
}

export interface QuoteInput {
  symbol: string;
  market?: KoreanMarket;
}

export interface MarketIndexInput {
  indexCode: string;
}

export interface DailyChartInput {
  symbol: string;
  market?: KoreanMarket;
  assetType?: AssetType;
  from?: string;
  to?: string;
  adjusted?: boolean;
  limit?: number;
}

export interface MarketDataProvider {
  readonly metadata: ProviderMetadata;
  readonly capabilities: ProviderCapabilities;

  searchSymbol(input: SymbolSearchInput): Promise<SymbolSearchResult[]>;
  getStockQuote(input: QuoteInput): Promise<NormalizedQuote>;
  getEtfQuote(input: QuoteInput): Promise<NormalizedQuote>;
  getMarketIndex(input: MarketIndexInput): Promise<NormalizedIndex>;
  getDailyChart(input: DailyChartInput): Promise<NormalizedDailyChart>;
}
