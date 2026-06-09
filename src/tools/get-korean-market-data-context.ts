import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
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
      const includeChart = input.includeChart !== false;
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
      dailyCharts.push(unavailable("Real daily chart provider is not implemented.", asset.symbol));
      unavailableCount += 1;
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
    data_status: getKiwoomDataStatus(options.resolvedAssets.length, blockedCount, errorCount, unavailableCount),
    unresolved_assets: unresolvedAssets.length > 0 ? unresolvedAssets : undefined,
    provider_error: providerError
  };
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

function unavailable(reason: string, symbol?: string): Record<string, unknown> {
  return {
    status: "unavailable",
    symbol,
    reason
  };
}

function getKiwoomDataStatus(
  assetCount: number,
  blockedCount: number,
  errorCount: number,
  unavailableCount: number
): KoreanMarketDataContext["data_status"] {
  if (assetCount === 0) {
    return "unresolved";
  }

  if (errorCount > 0) {
    return "provider_error";
  }

  if (blockedCount > 0) {
    return "blocked";
  }

  if (unavailableCount > 0) {
    return "partial";
  }

  return "ok";
}
