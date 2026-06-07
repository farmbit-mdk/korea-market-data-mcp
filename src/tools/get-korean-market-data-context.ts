import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import { nowIso } from "../utils/time.js";
import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote } from "../schemas/index.js";
import type { ToolDefinition } from "./types.js";
import type { KoreanMarketDataContext, ResolvedKoreanMarketAsset } from "./korean-market-query-resolver.js";
import { resolveKoreanMarketQuery } from "./korean-market-query-resolver.js";
import { runGuardedKiwoomPublicQuote } from "./get-kiwoom-stock-quote.js";

export const getKoreanMarketDataContextTool: ToolDefinition = {
  name: "get_korean_market_data_context",
  description: "Resolve a natural-language Korean market query and return structured quote, chart, and index context.",
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

      const quotes: NormalizedQuote[] = [];
      const dailyCharts: NormalizedDailyChart[] = [];
      const relatedIndices = new Map<string, NormalizedIndex>();
      let failedFetches = 0;

      for (const asset of resolution.resolved_assets.slice(0, maxAssets)) {
        try {
          if (asset.assetType === "index") {
            relatedIndices.set(asset.symbol, await context.provider.getMarketIndex({ indexCode: asset.symbol }));
            continue;
          }

          if (includeQuote) {
            quotes.push(await getQuoteForAsset(context.provider, asset));
          }

          if (includeChart) {
            dailyCharts.push(await context.provider.getDailyChart({
              symbol: asset.symbol,
              market: asset.market as never,
              assetType: asset.assetType,
              limit: 30
            }));
          }

          if (includeRelatedIndices) {
            for (const indexCode of getRelatedIndexCodes(asset)) {
              relatedIndices.set(indexCode, await context.provider.getMarketIndex({ indexCode }));
            }
          }
        } catch {
          failedFetches += 1;
        }
      }

      const response: KoreanMarketDataContext = {
        query,
        resolved_assets: resolution.resolved_assets,
        data: {
          quotes,
          daily_charts: dailyCharts,
          related_indices: [...relatedIndices.values()]
        },
        provider: context.provider.metadata.id,
        environment: context.provider.metadata.id === "mock" ? "mock" : "local",
        fetched_at: nowIso(),
        data_status: getDataStatus(resolution.resolved_assets, failedFetches)
      };

      return response;
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};

async function getQuoteForAsset(
  provider: Parameters<ToolDefinition["handler"]>[1]["provider"],
  asset: ResolvedKoreanMarketAsset
): Promise<NormalizedQuote> {
  if (asset.assetType === "etf") {
    return provider.getEtfQuote({ symbol: asset.symbol, market: asset.market as never });
  }

  return provider.getStockQuote({ symbol: asset.symbol, market: asset.market as never });
}

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
  let blockedCount = 0;
  let errorCount = 0;
  let unavailableCount = 0;

  for (const asset of options.resolvedAssets) {
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
        quotes.push({
          ...quoteResult.quote,
          source: "real"
        });
      } else if (quoteResult.status === "blocked") {
        blockedCount += 1;
        quotes.push({
          status: "blocked",
          provider: "kiwoom",
          symbol: asset.symbol,
          reason_code: quoteResult.reason_code,
          reason: quoteResult.reason
        });
      } else {
        errorCount += 1;
        quotes.push({
          status: "provider_error",
          provider: "kiwoom",
          symbol: asset.symbol,
          error: quoteResult.error
        });
      }
    }

    if (options.includeChart) {
      dailyCharts.push(unavailable("Real Kiwoom daily chart context is not implemented yet.", asset.symbol));
      unavailableCount += 1;
    }

    if (options.includeRelatedIndices) {
      relatedIndices.push(unavailable("Real index context is not implemented yet.", asset.symbol));
      unavailableCount += 1;
    }
  }

  return {
    query: options.query,
    resolved_assets: options.resolvedAssets,
    data: {
      quotes,
      daily_charts: dailyCharts,
      related_indices: relatedIndices
    },
    provider: "kiwoom",
    environment: "local",
    fetched_at: nowIso(),
    data_status: getKiwoomDataStatus(options.resolvedAssets.length, blockedCount, errorCount, unavailableCount)
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

function getRelatedIndexCodes(asset: ResolvedKoreanMarketAsset): string[] {
  if (asset.assetType === "etf") {
    return ["KOSPI200", "KOSPI"];
  }

  return asset.market === "KOSDAQ" ? ["KOSDAQ"] : ["KOSPI", "KOSPI200"];
}

function getDataStatus(assets: ResolvedKoreanMarketAsset[], failedFetches: number): KoreanMarketDataContext["data_status"] {
  if (assets.length === 0) {
    return "unresolved";
  }

  return failedFetches > 0 ? "partial" : "ok";
}
