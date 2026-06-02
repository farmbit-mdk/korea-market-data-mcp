import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import type { MarketIndexInput } from "../providers/types.js";
import type { ToolDefinition } from "./types.js";

export const getMarketIndexTool: ToolDefinition = {
  name: "get_market_index",
  description: "Get a read-only quote for a Korean market index.",
  inputSchema: {
    indexCode: z.string().trim().min(1)
  },
  async handler(input, context) {
    try {
      return await context.provider.getMarketIndex(input as unknown as MarketIndexInput);
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};
