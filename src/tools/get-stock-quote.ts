import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import type { QuoteInput } from "../providers/types.js";
import { koreanMarketSchema } from "../schemas/common.js";
import type { ToolDefinition } from "./types.js";

export const getStockQuoteTool: ToolDefinition = {
  name: "get_stock_quote",
  description: "Get a read-only quote for a Korean listed stock.",
  inputSchema: {
    symbol: z.string().trim().min(1),
    market: koreanMarketSchema.optional()
  },
  async handler(input, context) {
    try {
      return await context.provider.getStockQuote(input as unknown as QuoteInput);
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};
