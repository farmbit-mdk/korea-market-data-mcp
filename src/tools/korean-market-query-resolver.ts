import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote, SymbolSearchResult } from "../schemas/index.js";
import type { AssetType } from "../schemas/common.js";
import type { MarketDataProvider } from "../providers/types.js";

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
    quotes: NormalizedQuote[];
    daily_charts: NormalizedDailyChart[];
    related_indices: NormalizedIndex[];
  };
  provider: string;
  environment: string;
  fetched_at: string;
  data_status: "ok" | "partial" | "unresolved";
}

export interface ResolveKoreanMarketQueryOptions {
  provider: MarketDataProvider;
  query: string;
  preferredAssetTypes?: ResolvableAssetType[];
  maxResults?: number;
}

const knownTerms: Array<{ term: string; canonicalQuery: string; assetType: ResolvableAssetType; confidence: number }> = [
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
  { term: "kospi200", canonicalQuery: "KOSPI200", assetType: "index", confidence: 0.98 },
  { term: "kospi 200", canonicalQuery: "KOSPI200", assetType: "index", confidence: 0.98 },
  { term: "코스피 200", canonicalQuery: "코스피200", assetType: "index", confidence: 0.98 },
  { term: "코스피200", canonicalQuery: "코스피200", assetType: "index", confidence: 0.98 },
  { term: "kosdaq", canonicalQuery: "KOSDAQ", assetType: "index", confidence: 0.98 },
  { term: "코스닥", canonicalQuery: "코스닥", assetType: "index", confidence: 0.98 },
  { term: "kospi", canonicalQuery: "KOSPI", assetType: "index", confidence: 0.96 },
  { term: "코스피", canonicalQuery: "코스피", assetType: "index", confidence: 0.96 }
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
    const results = await options.provider.searchSymbol({
      query: match.canonicalQuery,
      assetType: match.assetType,
      limit: maxResults
    });

    for (const result of results) {
      if (!isResolvableAssetType(result.assetType) || !preferred.has(result.assetType)) {
        continue;
      }

      const key = `${result.assetType}:${result.symbol}`;
      const existing = resolved.get(key);
      const candidate = mapResolvedAsset(result, match.term, match.confidence);

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

function findMatchedTerms(query: string): typeof knownTerms {
  const normalizedQuery = normalizeSearchText(query);
  const compactQuery = compactText(normalizedQuery);

  return knownTerms
    .filter((candidate) => {
      const normalizedTerm = normalizeSearchText(candidate.term);
      return normalizedQuery.includes(normalizedTerm) || compactQuery.includes(compactText(normalizedTerm));
    })
    .sort((a, b) => compactText(b.term).length - compactText(a.term).length);
}

function mapResolvedAsset(
  result: SymbolSearchResult,
  matchedTerm: string,
  confidence: number
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
    matchedTerm
  };
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
