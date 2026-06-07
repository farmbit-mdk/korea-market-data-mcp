import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import type { ToolDefinition } from "./types.js";
import { resolveKoreanMarketQuery } from "./korean-market-query-resolver.js";

const preferredAssetTypeSchema = z.enum(["stock", "etf", "index"]);

export const resolveKoreanMarketQueryTool: ToolDefinition = {
  name: "resolve_korean_market_query",
  description: "Resolve a natural-language Korean market query into stock, ETF, or index data targets.",
  inputSchema: {
    query: z.string().trim().min(1),
    preferredAssetTypes: z.array(preferredAssetTypeSchema).optional(),
    maxResults: z.number().int().min(1).max(10).default(5)
  },
  async handler(input, context) {
    try {
      return await resolveKoreanMarketQuery({
        provider: context.provider,
        query: input.query as string,
        preferredAssetTypes: input.preferredAssetTypes as Array<"stock" | "etf" | "index"> | undefined,
        maxResults: input.maxResults as number | undefined
      });
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};
