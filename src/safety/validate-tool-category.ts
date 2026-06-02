import { forbiddenToolNames } from "./read-only-tools.js";

const forbiddenFragments = [
  "buy",
  "sell",
  "order",
  "account",
  "deposit",
  "holding",
  "trade_history",
  "strategy",
  "auto_trade",
  "rebalance",
  "recommend"
];

export function validateToolCategory(toolName: string): void {
  if (forbiddenToolNames.includes(toolName as never)) {
    throw new Error(`Forbidden read-write tool is not allowed: ${toolName}`);
  }

  const normalized = toolName.toLowerCase();
  const matchedFragment = forbiddenFragments.find((fragment) => normalized.includes(fragment));

  if (matchedFragment !== undefined) {
    throw new Error(`Tool name appears outside read-only market data scope: ${toolName}`);
  }
}
