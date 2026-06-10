import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote, SymbolSearchResult } from "../schemas/index.js";
import type { AssetType } from "../schemas/common.js";
import type { MarketDataProvider } from "../providers/types.js";
import type { MarketDataResearchMetric } from "../utils/research-metrics.js";

export type ResolvableAssetType = "stock" | "etf" | "index";

export interface ResolvedKoreanMarketAsset {
  symbol: string;
  name: string;
  assetType: ResolvableAssetType;
  market: string;
  currency: string;
  provider: string;
  sourceSymbol?: string;
  confidence: number;
  matchedTerm: string;
  quantity?: number;
}

export interface KoreanMarketQueryResolution {
  query: string;
  intent: "market_data_lookup" | "unknown";
  resolved_assets: ResolvedKoreanMarketAsset[];
  unresolved_terms: string[];
  confidence: number;
  data_requirements: string[];
  suggested_next_tools: string[];
  provider: string;
  environment: string;
}

export interface KoreanMarketDataContext {
  query: string;
  resolved_assets: ResolvedKoreanMarketAsset[];
  data: {
    quotes: Array<NormalizedQuote | Record<string, unknown>>;
    daily_charts: Array<NormalizedDailyChart | Record<string, unknown>>;
    related_indices: Array<NormalizedIndex | Record<string, unknown>>;
  };
  provider: string;
  environment: string;
  fetched_at: string;
  research_metrics?: MarketDataResearchMetric[];
  data_status: "ok" | "partial" | "unresolved" | "blocked" | "provider_error" | "unavailable";
  unresolved_assets?: Array<{
    query: string;
    reason: string;
    candidates: ResolvedKoreanMarketAsset[];
  }>;
  provider_error?: {
    code: string;
    message: string;
  };
}

export interface ResolveKoreanMarketQueryOptions {
  provider: MarketDataProvider;
  query: string;
  preferredAssetTypes?: ResolvableAssetType[];
  maxResults?: number;
}

const knownTerms: Array<{ term: string; canonicalQuery: string; assetType: ResolvableAssetType; confidence: number }> = [
  { term: "005935", canonicalQuery: "005935", assetType: "stock", confidence: 1 },
  { term: "삼성전자우", canonicalQuery: "삼성전자우", assetType: "stock", confidence: 0.99 },
  { term: "삼전우", canonicalQuery: "삼성전자우", assetType: "stock", confidence: 0.96 },
  { term: "005930", canonicalQuery: "005930", assetType: "stock", confidence: 1 },
  { term: "삼성전자", canonicalQuery: "삼성전자", assetType: "stock", confidence: 0.98 },
  { term: "삼전", canonicalQuery: "삼성전자", assetType: "stock", confidence: 0.94 },
  { term: "samsung electronics", canonicalQuery: "Samsung Electronics", assetType: "stock", confidence: 0.98 },
  { term: "samsung", canonicalQuery: "Samsung", assetType: "stock", confidence: 0.92 },
  { term: "069500", canonicalQuery: "069500", assetType: "etf", confidence: 1 },
  { term: "kodex 200", canonicalQuery: "KODEX 200", assetType: "etf", confidence: 0.98 },
  { term: "kodex200", canonicalQuery: "KODEX 200", assetType: "etf", confidence: 0.96 },
  { term: "코덱스 200", canonicalQuery: "코덱스 200", assetType: "etf", confidence: 0.98 },
  { term: "코덱스200", canonicalQuery: "코덱스200", assetType: "etf", confidence: 0.98 },
  { term: "360750", canonicalQuery: "360750", assetType: "etf", confidence: 1 },
  { term: "tiger \uBBF8\uAD6Ds&p500", canonicalQuery: "TIGER \uBBF8\uAD6DS&P500", assetType: "etf", confidence: 0.99 },
  { term: "tiger \uBBF8\uAD6D s&p500", canonicalQuery: "TIGER \uBBF8\uAD6DS&P500", assetType: "etf", confidence: 0.99 },
  { term: "tiger 미국s&p500", canonicalQuery: "TIGER 미국S&P500", assetType: "etf", confidence: 0.99 },
  { term: "tiger 미국 s&p500", canonicalQuery: "TIGER 미국S&P500", assetType: "etf", confidence: 0.99 },
  { term: "tiger s&p500", canonicalQuery: "TIGER 미국S&P500", assetType: "etf", confidence: 0.94 },
  { term: "491010", canonicalQuery: "TIGER 글로벌AI전력인프라액티브", assetType: "etf", confidence: 1 },
  { term: "tiger 글로벌ai전력인프라액티브", canonicalQuery: "TIGER 글로벌AI전력인프라액티브", assetType: "etf", confidence: 0.99 },
  { term: "tiger 글로벌 ai 전력 인프라 액티브", canonicalQuery: "TIGER 글로벌AI전력인프라액티브", assetType: "etf", confidence: 0.99 },
  { term: "tiger ai전력", canonicalQuery: "TIGER AI전력", assetType: "etf", confidence: 0.62 },
  { term: "tiger ai 전력", canonicalQuery: "TIGER AI전력", assetType: "etf", confidence: 0.62 },
  { term: "491010", canonicalQuery: "TIGER \uAE00\uB85C\uBC8CAI\uC804\uB825\uC778\uD504\uB77C\uC561\uD2F0\uBE0C", assetType: "etf", confidence: 1 },
  { term: "tiger \uAE00\uB85C\uBC8Cai\uC804\uB825\uC778\uD504\uB77C\uC561\uD2F0\uBE0C", canonicalQuery: "TIGER \uAE00\uB85C\uBC8CAI\uC804\uB825\uC778\uD504\uB77C\uC561\uD2F0\uBE0C", assetType: "etf", confidence: 0.99 },
  { term: "0117v0", canonicalQuery: "0117V0", assetType: "etf", confidence: 1 },
  { term: "tiger \uCF54\uB9AC\uC544ai\uC804\uB825\uAE30\uAE30top3\uD50C\uB7EC\uC2A4", canonicalQuery: "TIGER \uCF54\uB9AC\uC544AI\uC804\uB825\uAE30\uAE30TOP3\uD50C\uB7EC\uC2A4", assetType: "etf", confidence: 0.99 },
  { term: "tiger \uCF54\uB9AC\uC544 ai \uC804\uB825\uAE30\uAE30 top3 \uD50C\uB7EC\uC2A4", canonicalQuery: "TIGER \uCF54\uB9AC\uC544AI\uC804\uB825\uAE30\uAE30TOP3\uD50C\uB7EC\uC2A4", assetType: "etf", confidence: 0.99 },
  { term: "tiger ai\uC804\uB825", canonicalQuery: "TIGER AI\uC804\uB825", assetType: "etf", confidence: 0.62 },
  { term: "tiger ai \uC804\uB825", canonicalQuery: "TIGER AI\uC804\uB825", assetType: "etf", confidence: 0.62 },
  { term: "kospi200", canonicalQuery: "KOSPI200", assetType: "index", confidence: 0.98 },
  { term: "kospi 200", canonicalQuery: "KOSPI200", assetType: "index", confidence: 0.98 },
  { term: "코스피 200", canonicalQuery: "코스피200", assetType: "index", confidence: 0.98 },
  { term: "코스피200", canonicalQuery: "코스피200", assetType: "index", confidence: 0.98 },
  { term: "kosdaq", canonicalQuery: "KOSDAQ", assetType: "index", confidence: 0.98 },
  { term: "코스닥", canonicalQuery: "코스닥", assetType: "index", confidence: 0.98 },
  { term: "kospi", canonicalQuery: "KOSPI", assetType: "index", confidence: 0.96 },
  { term: "코스피", canonicalQuery: "코스피", assetType: "index", confidence: 0.96 }
];

const builtInAssets: Array<SymbolSearchResult & { aliases: string[] }> = [
  {
    symbol: "005935",
    name: "Samsung Electronics Preferred",
    market: "KOSPI",
    assetType: "stock",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "005935",
    aliases: ["삼성전자우", "삼전우", "Samsung Electronics Preferred", "Samsung Electronics Pref", "005935"]
  },
  {
    symbol: "005930",
    name: "Samsung Electronics",
    market: "KOSPI",
    assetType: "stock",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "005930",
    aliases: ["삼성전자", "삼전", "Samsung", "Samsung Electronics", "005930"]
  },
  {
    symbol: "069500",
    name: "KODEX 200",
    market: "KOSPI",
    assetType: "etf",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "069500",
    aliases: ["KODEX 200", "KODEX200", "코덱스 200", "코덱스200", "069500"]
  },
  {
    symbol: "360750",
    name: "TIGER 미국S&P500",
    market: "KOSPI",
    assetType: "etf",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "360750",
    aliases: ["TIGER 미국S&P500", "TIGER 미국 S&P500", "TIGER S&P500", "TIGER US S&P500", "360750"]
  },
  {
    symbol: "491010",
    name: "TIGER 글로벌AI전력인프라액티브",
    market: "KOSPI",
    assetType: "etf",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "491010",
    aliases: [
      "TIGER 글로벌AI전력인프라액티브",
      "TIGER 글로벌 AI 전력 인프라 액티브",
      "TIGER AI전력",
      "TIGER AI 전력",
      "491010"
    ]
  },
  {
    symbol: "360750",
    name: "TIGER \uBBF8\uAD6DS&P500",
    market: "KOSPI",
    assetType: "etf",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "360750",
    aliases: ["TIGER \uBBF8\uAD6DS&P500", "TIGER \uBBF8\uAD6D S&P500", "TIGER S&P500", "360750"]
  },
  {
    symbol: "491010",
    name: "TIGER \uAE00\uB85C\uBC8CAI\uC804\uB825\uC778\uD504\uB77C\uC561\uD2F0\uBE0C",
    market: "KOSPI",
    assetType: "etf",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "491010",
    aliases: [
      "TIGER \uAE00\uB85C\uBC8CAI\uC804\uB825\uC778\uD504\uB77C\uC561\uD2F0\uBE0C",
      "TIGER \uAE00\uB85C\uBC8C AI \uC804\uB825 \uC778\uD504\uB77C \uC561\uD2F0\uBE0C",
      "TIGER AI\uC804\uB825",
      "TIGER AI \uC804\uB825",
      "491010"
    ]
  },
  {
    symbol: "0117V0",
    name: "TIGER \uCF54\uB9AC\uC544AI\uC804\uB825\uAE30\uAE30TOP3\uD50C\uB7EC\uC2A4",
    market: "KOSPI",
    assetType: "etf",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "0117V0",
    aliases: [
      "TIGER \uCF54\uB9AC\uC544AI\uC804\uB825\uAE30\uAE30TOP3\uD50C\uB7EC\uC2A4",
      "TIGER \uCF54\uB9AC\uC544 AI \uC804\uB825\uAE30\uAE30 TOP3 \uD50C\uB7EC\uC2A4",
      "TIGER AI\uC804\uB825",
      "TIGER AI \uC804\uB825",
      "0117V0"
    ]
  },
  {
    symbol: "KOSPI",
    name: "KOSPI",
    market: "KRX",
    assetType: "index",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "KOSPI",
    aliases: ["KOSPI", "코스피"]
  },
  {
    symbol: "KOSDAQ",
    name: "KOSDAQ",
    market: "KRX",
    assetType: "index",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "KOSDAQ",
    aliases: ["KOSDAQ", "코스닥"]
  },
  {
    symbol: "KOSPI200",
    name: "KOSPI 200",
    market: "KRX",
    assetType: "index",
    currency: "KRW",
    provider: "resolver",
    sourceSymbol: "KOSPI200",
    aliases: ["KOSPI200", "KOSPI 200", "코스피200", "코스피 200"]
  }
];

export async function resolveKoreanMarketQuery(
  options: ResolveKoreanMarketQueryOptions
): Promise<KoreanMarketQueryResolution> {
  const maxResults = clampInteger(options.maxResults, 5, 1, 10);
  const preferred = new Set(options.preferredAssetTypes ?? ["stock", "etf", "index"]);
  const matchedTerms = findMatchedTerms(options.query).filter((match) => preferred.has(match.assetType));
  const searchQueries = matchedTerms.length > 0 ? matchedTerms : [
    { term: options.query, canonicalQuery: options.query, assetType: "stock" as const, confidence: 0.55 }
  ];
  const resolved = new Map<string, ResolvedKoreanMarketAsset>();

  for (const match of searchQueries) {
    const results = await searchSymbols(options.provider, match, maxResults);

    for (const result of results) {
      if (!isResolvableAssetType(result.assetType) || !preferred.has(result.assetType)) {
        continue;
      }

      const key = `${result.assetType}:${result.symbol}`;
      const existing = resolved.get(key);
      const candidate = mapResolvedAsset(result, match.term, match.confidence, options.query);

      if (existing === undefined || candidate.confidence > existing.confidence) {
        resolved.set(key, candidate);
      }
    }
  }

  const resolvedAssets = [...resolved.values()]
    .sort((a, b) => b.confidence - a.confidence || a.symbol.localeCompare(b.symbol))
    .slice(0, maxResults);

  return {
    query: options.query,
    intent: resolvedAssets.length > 0 ? "market_data_lookup" : "unknown",
    resolved_assets: resolvedAssets,
    unresolved_terms: resolvedAssets.length > 0 ? [] : [options.query.trim()],
    confidence: resolvedAssets[0]?.confidence ?? 0,
    data_requirements: inferDataRequirements(resolvedAssets),
    suggested_next_tools: inferSuggestedNextTools(resolvedAssets),
    provider: options.provider.metadata.id,
    environment: options.provider.metadata.id === "mock" ? "mock" : "local"
  };
}

async function searchSymbols(
  provider: MarketDataProvider,
  match: { canonicalQuery: string; assetType: ResolvableAssetType },
  maxResults: number
): Promise<SymbolSearchResult[]> {
  try {
    const results = await provider.searchSymbol({
      query: match.canonicalQuery,
      assetType: match.assetType,
      limit: maxResults
    });

    if (results.length > 0) {
      return results;
    }
  } catch {
    // Kiwoom does not provide symbol search yet. Fall back to a tiny built-in
    // resolver catalog so natural-language queries can still reach guarded
    // real quote flow without mock market data fallback.
  }

  const normalizedQuery = normalizeSearchText(match.canonicalQuery);
  const compactQuery = compactText(normalizedQuery);

  return builtInAssets
    .filter((asset) => asset.assetType === match.assetType)
    .filter((asset) => {
      const values = [asset.symbol, asset.name, asset.sourceSymbol, ...asset.aliases].filter((value): value is string => value !== undefined);
      return values.some((value) => {
        const normalizedValue = normalizeSearchText(value);
        const compactValue = compactText(normalizedValue);

        return normalizedValue === normalizedQuery ||
          compactValue === compactQuery ||
          normalizedValue.includes(normalizedQuery) ||
          compactValue.includes(compactQuery);
      });
    })
    .slice(0, maxResults);
}

function findMatchedTerms(query: string): typeof knownTerms {
  const normalizedQuery = normalizeSearchText(query);
  const compactQuery = compactText(normalizedQuery);

  return knownTerms
    .filter((candidate) => {
      const normalizedTerm = normalizeSearchText(candidate.term);
      const compactTerm = compactText(normalizedTerm);

      return normalizedQuery === normalizedTerm ||
        compactQuery === compactTerm ||
        normalizedQuery.includes(normalizedTerm) ||
        compactQuery.includes(compactTerm);
    })
    .sort((a, b) => compactText(b.term).length - compactText(a.term).length)
    .filter((candidate, index, candidates) => {
      const compactCandidate = compactText(normalizeSearchText(candidate.term));
      return !candidates.slice(0, index).some((moreSpecific) => {
        const compactSpecific = compactText(normalizeSearchText(moreSpecific.term));
        return moreSpecific.assetType === candidate.assetType &&
          compactSpecific.length > compactCandidate.length &&
          compactSpecific.includes(compactCandidate);
      });
    });
}

function mapResolvedAsset(
  result: SymbolSearchResult,
  matchedTerm: string,
  confidence: number,
  query: string
): ResolvedKoreanMarketAsset {
  return {
    symbol: result.symbol,
    name: result.name,
    assetType: result.assetType as ResolvableAssetType,
    market: result.market,
    currency: result.currency,
    provider: result.provider,
    sourceSymbol: result.sourceSymbol,
    confidence,
    matchedTerm,
    quantity: extractQuantity(query, result, matchedTerm)
  };
}

function extractQuantity(query: string, result: SymbolSearchResult, matchedTerm: string): number | undefined {
  const matchedTermQuantity = extractQuantityNearTerm(query, matchedTerm);

  if (matchedTermQuantity !== undefined) {
    return matchedTermQuantity;
  }

  const resultWithAliases = result as SymbolSearchResult & { aliases?: string[] };
  const candidateTerms = [
    result.symbol,
    result.name,
    result.sourceSymbol,
    ...(resultWithAliases.aliases ?? [])
  ].filter((value): value is string => value !== undefined && value.trim() !== "");

  for (const term of candidateTerms.sort((a, b) => compactText(b).length - compactText(a).length)) {
    const quantity = extractQuantityNearTerm(query, term);

    if (quantity !== undefined) {
      return quantity;
    }
  }

  return undefined;
}

function extractQuantityNearTerm(query: string, term: string): number | undefined {
  const compactQuery = compactText(normalizeSearchText(query));
  const compactTerm = compactText(normalizeSearchText(term));
  const index = compactQuery.indexOf(compactTerm);

  if (index < 0) {
    return undefined;
  }

  const afterTerm = compactQuery.slice(index + compactTerm.length, index + compactTerm.length + 16);
  const beforeTerm = compactQuery.slice(Math.max(0, index - 16), index);
  const afterMatch = /^(?:etf|stock)?([0-9,]+)(?:\uC8FC|shares)/.exec(afterTerm);
  const beforeMatch = /([0-9,]+)(?:\uC8FC|shares)$/.exec(beforeTerm);
  const rawQuantity = afterMatch?.[1] ?? beforeMatch?.[1];

  if (rawQuantity === undefined) {
    return undefined;
  }

  const quantity = Number(rawQuantity.replace(/,/g, ""));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : undefined;
}

function inferDataRequirements(assets: ResolvedKoreanMarketAsset[]): string[] {
  const requirements = new Set<string>();

  for (const asset of assets) {
    if (asset.assetType === "index") {
      requirements.add("market_index");
    } else {
      requirements.add("quote");
      requirements.add("daily_chart");
      requirements.add("related_indices");
    }
  }

  return [...requirements];
}

function inferSuggestedNextTools(assets: ResolvedKoreanMarketAsset[]): string[] {
  const tools = new Set<string>();

  for (const asset of assets) {
    if (asset.assetType === "stock") {
      tools.add("get_stock_quote");
      tools.add("get_daily_chart");
      tools.add("get_market_index");
    } else if (asset.assetType === "etf") {
      tools.add("get_etf_quote");
      tools.add("get_daily_chart");
      tools.add("get_market_index");
    } else {
      tools.add("get_market_index");
    }
  }

  return [...tools];
}

function isResolvableAssetType(assetType: AssetType): assetType is ResolvableAssetType {
  return assetType === "stock" || assetType === "etf" || assetType === "index";
}

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function compactText(value: string): string {
  return value.replace(/\s+/g, "");
}

function clampInteger(value: number | undefined, defaultValue: number, minimum: number, maximum: number): number {
  if (value === undefined) {
    return defaultValue;
  }

  if (!Number.isInteger(value)) {
    return defaultValue;
  }

  return Math.min(Math.max(value, minimum), maximum);
}
