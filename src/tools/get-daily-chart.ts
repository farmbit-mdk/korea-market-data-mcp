import { z } from "zod";
import { toToolErrorResponse } from "../providers/errors.js";
import type { DailyChartInput } from "../providers/types.js";
import { assetTypeSchema, koreanMarketSchema } from "../schemas/common.js";
import type { ToolDefinition } from "./types.js";

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const getDailyChartTool: ToolDefinition = {
  name: "get_daily_chart",
  description: "Get read-only daily OHLCV chart data for a Korean stock, ETF, or index.",
  inputSchema: {
    symbol: z.string().trim().min(1),
    market: koreanMarketSchema.optional(),
    assetType: assetTypeSchema.optional(),
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional(),
    adjusted: z.boolean().optional(),
    limit: z.number().int().min(1).max(300).default(30)
  },
  async handler(input, context) {
    try {
      return await context.provider.getDailyChart(input as unknown as DailyChartInput);
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};
