import type { AssetType } from "./common.js";

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  market: string;
  assetType: AssetType;
  currency: "KRW" | "USD" | string;
  provider: string;
  sourceSymbol?: string;
}

export interface NormalizedQuote {
  symbol: string;
  name?: string;
  market: string;
  assetType: "stock" | "etf" | "index" | "unknown";
  currency: "KRW" | "USD" | string;
  price: number | null;
  previousClose?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  change?: number | null;
  changeRate?: number | null;
  volume?: number | null;
  value?: number | null;
  provider: string;
  sourceSymbol?: string;
  providerTimestamp?: string | null;
  requestTimestamp: string;
  isDelayed?: boolean;
}

export interface NormalizedIndex {
  indexCode: string;
  name?: string;
  market: string;
  currency: "KRW" | "USD" | string;
  value: number | null;
  change?: number | null;
  changeRate?: number | null;
  provider: string;
  providerTimestamp?: string | null;
  requestTimestamp: string;
  isDelayed?: boolean;
}
