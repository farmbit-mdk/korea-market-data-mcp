import type { z } from "zod";
import type { MarketDataProvider } from "../providers/types.js";
import type { ToolErrorResponse } from "../schemas/index.js";

export type ToolHandlerResult = unknown | ToolErrorResponse;

export interface ToolContext {
  provider: MarketDataProvider;
}

export interface ToolDefinition<TSchema extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  description: string;
  inputSchema: TSchema;
  handler(input: Record<string, unknown>, context: ToolContext): Promise<ToolHandlerResult>;
}
