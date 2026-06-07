export const allowedToolNames = [
  "resolve_korean_market_query",
  "get_korean_market_data_context",
  "search_korean_symbol",
  "get_stock_quote",
  "get_kiwoom_stock_quote",
  "get_etf_quote",
  "get_market_index",
  "get_daily_chart"
] as const;

export const forbiddenToolNames = [
  "buy_stock",
  "sell_stock",
  "place_order",
  "cancel_order",
  "modify_order",
  "get_account_balance",
  "get_deposit",
  "get_holdings",
  "get_order_history",
  "get_trade_history",
  "run_strategy",
  "auto_trade",
  "rebalance_portfolio",
  "recommend_stock",
  "recommend_etf"
] as const;

export type AllowedToolName = (typeof allowedToolNames)[number];

export function validateRegisteredTools(toolNames: string[]): void {
  const registered = new Set(toolNames);
  const missingAllowedTools = allowedToolNames.filter((toolName) => !registered.has(toolName));
  const forbiddenRegisteredTools = forbiddenToolNames.filter((toolName) => registered.has(toolName));
  const unsupportedTools = toolNames.filter(
    (toolName) => !allowedToolNames.includes(toolName as AllowedToolName)
  );

  if (missingAllowedTools.length > 0) {
    throw new Error(`Missing allowed read-only tools: ${missingAllowedTools.join(", ")}`);
  }

  if (forbiddenRegisteredTools.length > 0) {
    throw new Error(`Forbidden tools registered: ${forbiddenRegisteredTools.join(", ")}`);
  }

  if (unsupportedTools.length > 0) {
    throw new Error(`Unsupported tools registered: ${unsupportedTools.join(", ")}`);
  }
}
