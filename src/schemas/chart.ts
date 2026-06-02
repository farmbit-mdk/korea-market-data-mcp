import type { AssetType } from "./common.js";

export interface DailyCandle {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume?: number | null;
  value?: number | null;
}

export interface NormalizedDailyChart {
  symbol: string;
  name?: string;
  market: string;
  assetType: AssetType;
  currency: "KRW" | "USD" | string;
  candles: DailyCandle[];
  provider: string;
  sourceSymbol?: string;
  requestTimestamp: string;
  isDelayed?: boolean;
}
