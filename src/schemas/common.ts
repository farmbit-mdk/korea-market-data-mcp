import { z } from "zod";

export const koreanMarketSchema = z.enum(["KRX", "KOSPI", "KOSDAQ", "ETF", "UNKNOWN"]);
export const assetTypeSchema = z.enum(["stock", "etf", "index", "unknown"]);

export type KoreanMarket = z.infer<typeof koreanMarketSchema>;
export type AssetType = z.infer<typeof assetTypeSchema>;
