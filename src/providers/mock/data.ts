import type { DailyCandle, NormalizedIndex, NormalizedQuote, SymbolSearchResult } from "../../schemas/index.js";

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

export const mockStockQuotes: Record<string, Omit<NormalizedQuote, "requestTimestamp">> = {
  "005930": {
    symbol: "005930",
    name: "Samsung Electronics",
    market: "KOSPI",
    assetType: "stock",
    currency: "KRW",
    price: 70000,
    previousClose: 69500,
    open: 69800,
    high: 70500,
    low: 69200,
    change: 500,
    changeRate: 0.72,
    volume: 12000000,
    value: 840000000000,
    provider: "mock",
    sourceSymbol: "005930",
    providerTimestamp: null,
    isDelayed: false
  }
};

export const mockEtfQuotes: Record<string, Omit<NormalizedQuote, "requestTimestamp">> = {
  "069500": {
    symbol: "069500",
    name: "KODEX 200",
    market: "ETF",
    assetType: "etf",
    currency: "KRW",
    price: 36250,
    previousClose: 36000,
    open: 36100,
    high: 36400,
    low: 35950,
    change: 250,
    changeRate: 0.69,
    volume: 1500000,
    value: 54375000000,
    provider: "mock",
    sourceSymbol: "069500",
    providerTimestamp: null,
    isDelayed: false
  }
};

export const mockIndices: Record<string, Omit<NormalizedIndex, "requestTimestamp">> = {
  KOSPI: {
    indexCode: "KOSPI",
    name: "KOSPI",
    market: "KRX",
    currency: "KRW",
    value: 2725.14,
    change: 12.31,
    changeRate: 0.45,
    provider: "mock",
    providerTimestamp: null,
    isDelayed: false
  },
  KOSDAQ: {
    indexCode: "KOSDAQ",
    name: "KOSDAQ",
    market: "KRX",
    currency: "KRW",
    value: 864.72,
    change: -3.21,
    changeRate: -0.37,
    provider: "mock",
    providerTimestamp: null,
    isDelayed: false
  },
  KOSPI200: {
    indexCode: "KOSPI200",
    name: "KOSPI 200",
    market: "KRX",
    currency: "KRW",
    value: 371.82,
    change: 1.92,
    changeRate: 0.52,
    provider: "mock",
    providerTimestamp: null,
    isDelayed: false
  }
};

export const mockDailyCandles: DailyCandle[] = [
  {
    date: "2026-05-25",
    open: 69200,
    high: 70100,
    low: 69000,
    close: 69800,
    volume: 10800000,
    value: 753840000000
  },
  {
    date: "2026-05-26",
    open: 69800,
    high: 70500,
    low: 69200,
    close: 70000,
    volume: 12000000,
    value: 840000000000
  },
  {
    date: "2026-05-27",
    open: 70100,
    high: 70600,
    low: 69700,
    close: 70300,
    volume: 11200000,
    value: 787360000000
  }
];
