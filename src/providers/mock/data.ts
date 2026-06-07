import type { SymbolSearchResult } from "../../schemas/index.js";

export interface MockSymbolSearchResult extends SymbolSearchResult {
  koreanName?: string;
  aliases: string[];
}

export const mockSymbols: MockSymbolSearchResult[] = [
  {
    symbol: "005930",
    name: "Samsung Electronics",
    koreanName: "삼성전자",
    aliases: ["Samsung", "Samsung Electronics", "삼성전자", "삼전", "005930"],
    market: "KOSPI",
    assetType: "stock",
    currency: "KRW",
    provider: "mock",
    sourceSymbol: "005930"
  },
  {
    symbol: "069500",
    name: "KODEX 200",
    koreanName: "코덱스 200",
    aliases: ["KODEX", "KODEX 200", "KODEX200", "코덱스 200", "코덱스200", "069500"],
    market: "KOSPI",
    assetType: "etf",
    currency: "KRW",
    provider: "mock",
    sourceSymbol: "069500"
  },
  {
    symbol: "KOSPI",
    name: "KOSPI",
    koreanName: "코스피",
    aliases: ["KOSPI", "코스피"],
    market: "KRX",
    assetType: "index",
    currency: "KRW",
    provider: "mock",
    sourceSymbol: "KOSPI"
  },
  {
    symbol: "KOSDAQ",
    name: "KOSDAQ",
    koreanName: "코스닥",
    aliases: ["KOSDAQ", "코스닥"],
    market: "KRX",
    assetType: "index",
    currency: "KRW",
    provider: "mock",
    sourceSymbol: "KOSDAQ"
  },
  {
    symbol: "KOSPI200",
    name: "KOSPI 200",
    koreanName: "코스피 200",
    aliases: ["KOSPI200", "KOSPI 200", "코스피200", "코스피 200"],
    market: "KRX",
    assetType: "index",
    currency: "KRW",
    provider: "mock",
    sourceSymbol: "KOSPI200"
  }
];
