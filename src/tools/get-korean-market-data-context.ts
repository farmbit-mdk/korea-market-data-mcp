import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import { createKiwoomAuthClient, loadKiwoomAuthConfig } from "../providers/kiwoom/auth.js";
import { createKiwoomChartClient } from "../providers/kiwoom/chart-client.js";
import { getEffectiveKiwoomDailyChartEndpointMapping } from "../providers/kiwoom/quote-endpoints.js";
import { nowIso } from "../utils/time.js";
import type { ToolDefinition } from "./types.js";
import type { KoreanMarketDataContext, ResolvedKoreanMarketAsset } from "./korean-market-query-resolver.js";
import { resolveKoreanMarketQuery } from "./korean-market-query-resolver.js";
import { runGuardedKiwoomPublicQuote } from "./get-kiwoom-stock-quote.js";

const quoteConfidenceThreshold = 0.8;

export const getKoreanMarketDataContextTool: ToolDefinition = {
  name: "get_korean_market_data_context",
  description: "Resolve a natural-language Korean market query and return structured market data context from real providers when configured. Does not return mock market prices; if real provider data is unavailable, returns blocked/provider_error/unavailable status.",
  inputSchema: {
    query: z.string().trim().min(1),
    includeQuote: z.boolean().default(true),
    includeChart: z.boolean().default(true),
    includeRelatedIndices: z.boolean().default(true),
    maxAssets: z.number().int().min(1).max(10).default(3)
  },
  async handler(input, context) {
    try {
      const query = input.query as string;
      const includeQuote = input.includeQuote !== false;
      const includeChart = input.includeChart === true || (input.includeChart !== false && shouldFetchDailyChart(query));
      const includeRelatedIndices = input.includeRelatedIndices !== false;
      const maxAssets = typeof input.maxAssets === "number" ? input.maxAssets : 3;
      const resolution = await resolveKoreanMarketQuery({
        provider: context.provider,
        query,
        maxResults: maxAssets
      });

      if (context.provider.metadata.id === "kiwoom") {
        return await getKiwoomMarketDataContext({
          query,
          resolvedAssets: resolution.resolved_assets.slice(0, maxAssets),
          includeQuote,
          includeChart,
          includeRelatedIndices
        });
      }

      return getRealProviderNotReadyContext({
        query,
        resolvedAssets: resolution.resolved_assets.slice(0, maxAssets),
        includeChart,
        includeRelatedIndices
      });
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};

async function getKiwoomMarketDataContext(options: {
  query: string;
  resolvedAssets: ResolvedKoreanMarketAsset[];
  includeQuote: boolean;
  includeChart: boolean;
  includeRelatedIndices: boolean;
}): Promise<KoreanMarketDataContext> {
  const quotes: Array<Record<string, unknown>> = [];
  const dailyCharts: Array<Record<string, unknown>> = [];
  const relatedIndices: Array<Record<string, unknown>> = [];
  const unresolvedAssets: NonNullable<KoreanMarketDataContext["unresolved_assets"]> = [];
  const unresolvedKeys = new Set<string>();
  let blockedCount = 0;
  let errorCount = 0;
  let unavailableCount = 0;
  let successCount = 0;
  let providerError: KoreanMarketDataContext["provider_error"];

  for (const asset of options.resolvedAssets) {
    if (asset.confidence < quoteConfidenceThreshold) {
      const unresolvedKey = `${asset.assetType}:${asset.matchedTerm}`;
      if (!unresolvedKeys.has(unresolvedKey)) {
        unresolvedKeys.add(unresolvedKey);
        unresolvedAssets.push({
          query: asset.matchedTerm,
          reason: "Resolver confidence is too low to request a real Kiwoom quote automatically.",
          candidates: options.resolvedAssets.filter((candidate) =>
            candidate.assetType === asset.assetType &&
            candidate.matchedTerm === asset.matchedTerm
          )
        });
      }
      unavailableCount += 1;
      continue;
    }

    if (asset.assetType === "index") {
      if (options.includeRelatedIndices) {
        relatedIndices.push(unavailable("Real index context is not implemented yet.", asset.symbol));
        unavailableCount += 1;
      }
      continue;
    }

    if (options.includeQuote) {
      const quoteResult = await runGuardedKiwoomPublicQuote({
        symbol: asset.symbol,
        market: asset.market,
        provider: "kiwoom"
      });

      if (quoteResult.status === "ok") {
        const price = typeof quoteResult.quote.price === "number" ? quoteResult.quote.price : undefined;
        successCount += 1;
        quotes.push({
          ...quoteResult.quote,
          quantity: asset.quantity,
          position_value: asset.quantity !== undefined && price !== undefined ? asset.quantity * price : undefined,
          fetched_at: nowIso(),
          source: "real"
        });
      } else if (quoteResult.status === "blocked") {
        blockedCount += 1;
        providerError = {
          code: quoteResult.reason_code,
          message: quoteResult.reason
        };
      } else {
        errorCount += 1;
        providerError = {
          code: quoteResult.error.code,
          message: quoteResult.error.message
        };
      }
    }

    if (options.includeChart) {
      const chartResult = await runGuardedKiwoomDailyChart({
        symbol: asset.symbol,
        name: asset.name,
        market: asset.market,
        limit: inferDailyChartLimit(options.query)
      });

      if (chartResult.status === "ok") {
        successCount += 1;
        dailyCharts.push(chartResult.chart);
      } else if (chartResult.status === "blocked") {
        unavailableCount += 1;
        dailyCharts.push(unavailable(chartResult.reason, asset.symbol));
      } else {
        errorCount += 1;
        providerError = {
          code: chartResult.error.code,
          message: chartResult.error.message
        };
      }
    }

    if (options.includeRelatedIndices) {
      relatedIndices.push(unavailable("Real index provider is not implemented.", asset.symbol));
      unavailableCount += 1;
    }
  }

  return {
    query: options.query,
    resolved_assets: options.resolvedAssets.map((asset) => ({
      ...asset,
      provider: asset.provider === "mock" ? "resolver" : asset.provider
    })),
    data: {
      quotes,
      daily_charts: dailyCharts,
      related_indices: relatedIndices
    },
    provider: "kiwoom",
    environment: "local",
    fetched_at: nowIso(),
    data_status: getKiwoomDataStatus(options.resolvedAssets.length, successCount, blockedCount, errorCount, unavailableCount),
    unresolved_assets: unresolvedAssets.length > 0 ? unresolvedAssets : undefined,
    provider_error: providerError
  };
}

async function runGuardedKiwoomDailyChart(input: {
  symbol: string;
  name?: string;
  market?: string;
  limit?: number;
}): Promise<
  | { status: "ok"; chart: Record<string, unknown> }
  | { status: "blocked"; reason: string }
  | { status: "error"; error: { code: string; message: string } }
> {
  try {
    const env = process.env;
    const mapping = getEffectiveKiwoomDailyChartEndpointMapping(env);

    if (!mapping.enabled || !mapping.readOnly || !mapping.manualOnly) {
      return { status: "blocked", reason: "Kiwoom daily chart endpoint mapping is not enabled for local verification." };
    }

    const config = loadKiwoomAuthConfig(env);

    if (!config.enableRealApiCalls) {
      return { status: "blocked", reason: "KIWOOM_ENABLE_REAL_API_CALLS must be true." };
    }

    if (config.appKey === undefined || config.appSecret === undefined) {
      return { status: "blocked", reason: "Kiwoom credentials are missing or invalid." };
    }

    const token = await createKiwoomAuthClient(config).getAccessToken();

    if (token.accessToken.trim() === "") {
      return { status: "blocked", reason: "A Kiwoom access token must be present before daily chart lookup." };
    }

    const chart = await createKiwoomChartClient({
      baseUrl: config.env === "mock" ? config.mockApiBaseUrl : config.apiBaseUrl,
      chartEndpointPath: mapping.path,
      accessToken: token.accessToken,
      apiId: mapping.apiId
    }).getDailyChart({
      symbol: input.symbol,
      name: input.name,
      market: input.market as never,
      limit: input.limit
    });

    return { status: "ok", chart: chart as unknown as Record<string, unknown> };
  } catch (error) {
    const toolError = toToolErrorResponse(error, "kiwoom").error;
    return {
      status: "error",
      error: {
        code: toolError.code,
        message: toolError.message
      }
    };
  }
}

function getRealProviderNotReadyContext(options: {
  query: string;
  resolvedAssets: ResolvedKoreanMarketAsset[];
  includeChart: boolean;
  includeRelatedIndices: boolean;
}): KoreanMarketDataContext {
  const dailyCharts: Array<Record<string, unknown>> = [];
  const relatedIndices: Array<Record<string, unknown>> = [];

  for (const asset of options.resolvedAssets) {
    if (options.includeChart && asset.assetType !== "index") {
      dailyCharts.push(unavailable("Real daily chart provider is not implemented.", asset.symbol));
    }

    if (options.includeRelatedIndices) {
      relatedIndices.push(unavailable("Real index provider is not implemented.", asset.symbol));
    }
  }

  return {
    query: options.query,
    resolved_assets: options.resolvedAssets.map((asset) => ({
      ...asset,
      provider: asset.provider === "mock" ? "resolver" : asset.provider
    })),
    data: {
      quotes: [],
      daily_charts: dailyCharts,
      related_indices: relatedIndices
    },
    provider: "kiwoom",
    environment: "local",
    fetched_at: nowIso(),
    data_status: options.resolvedAssets.length === 0 ? "unresolved" : "blocked",
    provider_error: options.resolvedAssets.length === 0
      ? undefined
      : {
          code: "KIWOOM_REAL_PROVIDER_NOT_READY",
          message: "Real Kiwoom provider is not enabled or credentials are missing."
        }
  };
}

function shouldFetchDailyChart(query: string): boolean {
  const normalizedQuery = query.toLocaleLowerCase();
  const chartTerms = [
    "최근 흐름",
    "최근 20일",
    "최근 60일",
    "일봉",
    "차트",
    "추세",
    "변동성",
    "수익률",
    "고점",
    "저점",
    "거래량 흐름",
    "가격 흐름",
    "daily chart",
    "chart",
    "trend",
    "volume"
  ];

  return chartTerms.some((term) => normalizedQuery.includes(term));
}

function inferDailyChartLimit(query: string): number {
  const match = /최근\s*([0-9]{1,2})\s*일/.exec(query);

  if (match !== null) {
    const limit = Number(match[1]);
    return Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 60) : 20;
  }

  return 20;
}

function unavailable(reason: string, symbol?: string): Record<string, unknown> {
  return {
    status: "unavailable",
    symbol,
    reason
  };
}

function getKiwoomDataStatus(
  assetCount: number,
  successCount: number,
  blockedCount: number,
  errorCount: number,
  unavailableCount: number
): KoreanMarketDataContext["data_status"] {
  if (assetCount === 0) {
    return "unresolved";
  }

  if (errorCount > 0 && successCount === 0) {
    return "provider_error";
  }

  if (blockedCount > 0 && successCount === 0) {
    return "blocked";
  }

  if (errorCount > 0 || blockedCount > 0 || unavailableCount > 0) {
    return "partial";
  }

  return "ok";
}
