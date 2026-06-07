import { describe, expect, it } from "vitest";
import { checkKiwoomSetup } from "../src/providers/kiwoom/setup-check.js";
import { normalizeKiwoomTokenResponse } from "../src/providers/kiwoom/token-client.js";
import type { MarketDataProvider } from "../src/providers/types.js";
import { getKoreanMarketDataContextTool } from "../src/tools/get-korean-market-data-context.js";
import type { KoreanMarketDataContext } from "../src/tools/korean-market-query-resolver.js";

describe("real market data context UX", () => {
  it("reports Kiwoom setup blocked when real API opt-in is false", () => {
    const result = checkKiwoomSetup({
      KIWOOM_ENABLE_REAL_API_CALLS: "false",
      KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH: "true",
      KIWOOM_APP_KEY: "dummy_app_key",
      KIWOOM_SECRET_KEY: "dummy_secret_key",
      KIWOOM_INVESTMENT_ENV: "mock"
    });

    expect(result).toMatchObject({
      status: "blocked",
      provider: "kiwoom",
      real_api_enabled: false,
      public_quote_real_path_enabled: true,
      credentials_present: true,
      placeholder_credentials: false,
      kiwoom_investment_environment: "mock",
      quote_real_path_ready: false
    });
    expect(result.blocked_reasons).toContain("KIWOOM_ENABLE_REAL_API_CALLS must be true.");
  });

  it("reports Kiwoom setup blocked for missing credentials", () => {
    const result = checkKiwoomSetup({
      KIWOOM_ENABLE_REAL_API_CALLS: "true",
      KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH: "true",
      KIWOOM_INVESTMENT_ENV: "real"
    });

    expect(result.status).toBe("blocked");
    expect(result.credentials_present).toBe(false);
    expect(result.blocked_reasons).toContain("KIWOOM_APP_KEY and KIWOOM_SECRET_KEY must be present.");
  });

  it("reports Kiwoom setup blocked for placeholder credentials", () => {
    const result = checkKiwoomSetup({
      KIWOOM_ENABLE_REAL_API_CALLS: "true",
      KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH: "true",
      KIWOOM_APP_KEY: "YOUR_KIWOOM_APP_KEY",
      KIWOOM_SECRET_KEY: "YOUR_KIWOOM_SECRET_KEY",
      KIWOOM_INVESTMENT_ENV: "mock"
    });

    expect(result.status).toBe("blocked");
    expect(result.placeholder_credentials).toBe(true);
    expect(result.blocked_reasons).toContain("Placeholder credentials cannot be used.");
  });

  it("normalizes Kiwoom investment environment mismatch token errors", () => {
    try {
      normalizeKiwoomTokenResponse({
        return_code: "2",
        return_msg: "8030: Appkey cannot be used for the selected real/mock investment environment."
      });
      throw new Error("Expected normalizeKiwoomTokenResponse to throw.");
    } catch (error) {
      expect(error).toMatchObject({
      code: "KIWOOM_INVESTMENT_ENV_MISMATCH",
      message: "Kiwoom App Key does not match the configured investment environment.",
      hint: "Check whether the App Key is for real trading or mock trading, then set KIWOOM_INVESTMENT_ENV accordingly.",
      returnCode: "2"
      });
    }
  });

  it("returns blocked Kiwoom context without mock fallback when credentials are unavailable", async () => {
    const result = await getKoreanMarketDataContextTool.handler(
      { query: "삼성전자 실제 데이터 가져와줘" },
      { provider: createKiwoomLikeProvider() }
    ) as KoreanMarketDataContext;

    expect(result).toMatchObject({
      provider: "kiwoom",
      environment: "local",
      data_status: "blocked"
    });
    expect(result.resolved_assets[0]).toMatchObject({
      symbol: "005930",
      assetType: "stock"
    });
    expect(result.data.quotes[0]).toMatchObject({
      status: "blocked",
      provider: "kiwoom",
      symbol: "005930",
      reason_code: "PUBLIC_TOOL_EXPOSURE_DISABLED"
    });
    expect(result.data.daily_charts[0]).toMatchObject({
      status: "unavailable",
      reason: "Real Kiwoom daily chart context is not implemented yet."
    });
    expect(result.data.related_indices[0]).toMatchObject({
      status: "unavailable",
      reason: "Real index context is not implemented yet."
    });
    expect(JSON.stringify(result)).not.toContain("Samsung Electronics mock");
  });

  it("returns unavailable Kiwoom index context without mock fallback", async () => {
    const result = await getKoreanMarketDataContextTool.handler(
      { query: "코스피 실제 데이터 가져와줘" },
      { provider: createKiwoomLikeProvider() }
    ) as KoreanMarketDataContext;

    expect(result.data_status).toBe("partial");
    expect(result.resolved_assets[0]).toMatchObject({
      symbol: "KOSPI",
      assetType: "index"
    });
    expect(result.data.quotes).toEqual([]);
    expect(result.data.daily_charts).toEqual([]);
    expect(result.data.related_indices[0]).toMatchObject({
      status: "unavailable",
      symbol: "KOSPI"
    });
  });

  function createKiwoomLikeProvider(): MarketDataProvider {
    return {
      metadata: {
        id: "kiwoom",
        name: "Kiwoom Securities REST API",
        isReadOnly: true
      },
      capabilities: {
        symbolSearch: false,
        stockQuote: false,
        etfQuote: false,
        marketIndex: false,
        dailyChart: false,
        minuteChart: false,
        realtimeQuote: false
      },
      async searchSymbol() {
        throw new Error("Kiwoom symbol search is unavailable.");
      },
      async getStockQuote() {
        throw new Error("Unexpected mock fallback.");
      },
      async getEtfQuote() {
        throw new Error("Unexpected mock fallback.");
      },
      async getMarketIndex() {
        throw new Error("Unexpected mock fallback.");
      },
      async getDailyChart() {
        throw new Error("Unexpected mock fallback.");
      }
    };
  }
});
