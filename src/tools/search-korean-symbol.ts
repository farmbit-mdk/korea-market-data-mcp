import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import { assetTypeSchema, koreanMarketSchema } from "../schemas/common.js";
import { nowIso } from "../utils/time.js";
import type { SymbolSearchInput } from "../providers/types.js";
import type { ToolDefinition } from "./types.js";

export const searchKoreanSymbolTool: ToolDefinition = {
  name: "search_korean_symbol",
  description: "Search for a Korean stock, ETF, or index symbol by keyword.",
  inputSchema: {
    query: z.string().trim().min(1),
    market: koreanMarketSchema.optional(),
    assetType: assetTypeSchema.optional(),
    limit: z.number().int().min(1).max(50).default(10)
  },
  async handler(input, context) {
    try {
      const results = await context.provider.searchSymbol(input as unknown as SymbolSearchInput);

      return {
        query: input.query as string,
        results,
        provider: context.provider.metadata.id,
        requestTimestamp: nowIso()
      };
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};
