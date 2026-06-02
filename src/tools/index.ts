import { getDailyChartTool } from "./get-daily-chart.js";
import { getEtfQuoteTool } from "./get-etf-quote.js";
import { getKiwoomStockQuoteTool } from "./get-kiwoom-stock-quote.js";
import { getMarketIndexTool } from "./get-market-index.js";
import { getStockQuoteTool } from "./get-stock-quote.js";
import { searchKoreanSymbolTool } from "./search-korean-symbol.js";
import type { ToolDefinition } from "./types.js";

export const toolDefinitions: ToolDefinition[] = [
  searchKoreanSymbolTool,
  getStockQuoteTool,
  getKiwoomStockQuoteTool,
  getEtfQuoteTool,
  getMarketIndexTool,
  getDailyChartTool
];

export function getRegisteredToolNames(): string[] {
  return toolDefinitions.map((tool) => tool.name);
}

export type { ToolContext, ToolDefinition, ToolHandlerResult } from "./types.js";
