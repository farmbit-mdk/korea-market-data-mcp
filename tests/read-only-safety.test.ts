import { describe, expect, it } from "vitest";
import { validateRegisteredTools } from "../src/safety/read-only-tools.js";
import { validateToolCategory } from "../src/safety/validate-tool-category.js";

describe("read-only safety", () => {
  it("rejects account, trading, and recommendation tool names", () => {
    expect(() => validateToolCategory("buy_stock")).toThrow();
    expect(() => validateToolCategory("get_account_balance")).toThrow();
    expect(() => validateToolCategory("place_order")).toThrow();
    expect(() => validateToolCategory("get_holdings")).toThrow();
    expect(() => validateToolCategory("auto_trade")).toThrow();
    expect(() => validateToolCategory("recommend_etf")).toThrow();
  });

  it("rejects unsupported extra registered tools", () => {
    expect(() => validateRegisteredTools(["search_korean_symbol"])).toThrow(/Missing allowed/);
    expect(() =>
      validateRegisteredTools([
        "search_korean_symbol",
        "get_stock_quote",
        "get_kiwoom_stock_quote",
        "get_etf_quote",
        "get_market_index",
        "get_daily_chart",
        "get_provider_status"
      ])
    ).toThrow(/Unsupported tools/);
  });
});
