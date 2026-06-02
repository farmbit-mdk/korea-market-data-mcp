import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import type { QuoteInput } from "../providers/types.js";
import { koreanMarketSchema } from "../schemas/common.js";
import type { ToolDefinition } from "./types.js";

export const getEtfQuoteTool: ToolDefinition = {
  name: "get_etf_quote",
  description: "Get a read-only quote for a Korean listed ETF.",
  inputSchema: {
    symbol: z.string().trim().min(1),
    market: koreanMarketSchema.optional()
  },
  async handler(input, context) {
    try {
      return await context.provider.getEtfQuote(input as unknown as QuoteInput);
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};
