import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import { nowIso } from "../utils/time.js";
import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote } from "../schemas/index.js";
import type { ToolDefinition } from "./types.js";
import type { KoreanMarketDataContext, ResolvedKoreanMarketAsset } from "./korean-market-query-resolver.js";
import { resolveKoreanMarketQuery } from "./korean-market-query-resolver.js";

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
