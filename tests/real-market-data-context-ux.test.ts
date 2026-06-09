import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkKiwoomSetup } from "../src/providers/kiwoom/setup-check.js";
import { normalizeKiwoomTokenResponse } from "../src/providers/kiwoom/token-client.js";
import type { MarketDataProvider } from "../src/providers/types.js";
import { getKoreanMarketDataContextTool } from "../src/tools/get-korean-market-data-context.js";
import { getKiwoomSetupStatusTool } from "../src/tools/get-kiwoom-setup-status.js";
import type { KoreanMarketDataContext } from "../src/tools/korean-market-query-resolver.js";
import { getRegisteredToolNames } from "../src/tools/index.js";
import { getMarketIndexTool } from "../src/tools/get-market-index.js";

describe("real market data context UX", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      KIWOOM_ENABLE_REAL_API_CALLS: "false",
      KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH: "false",
      KIWOOM_APP_KEY: "",
      KIWOOM_SECRET_KEY: "",
      KIWOOM_APP_SECRET: "",
      KIWOOM_ENV: "prod",
      KIWOOM_INVESTMENT_ENV: "real"
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

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

  it("reports Kiwoom setup ready when local quote verification opt-in is complete", () => {
    const result = checkKiwoomSetup({
      KIWOOM_ENABLE_REAL_API_CALLS: "true",
      KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH: "true",
      KIWOOM_APP_KEY: "dummy_app_key",
      KIWOOM_SECRET_KEY: "dummy_secret_key",
      KIWOOM_ENV: "prod",
      KIWOOM_INVESTMENT_ENV: "real"
    });

    expect(result).toMatchObject({
      status: "ready",
      real_api_enabled: true,
      public_quote_real_path_enabled: true,
      credentials_present: true,
      placeholder_credentials: false,
      kiwoom_investment_environment: "real",
      quote_real_path_ready: true,
      blocked_reasons: [],
      next_step: "Run npm run kiwoom:token:manual, then npm run kiwoom:quote:manual."
    });
  });

  it("returns environment setup guidance when setup env is incomplete", () => {
    const result = checkKiwoomSetup({
      KIWOOM_ENABLE_REAL_API_CALLS: "true",
      KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH: "true",
      KIWOOM_APP_KEY: "dummy_app_key",
      KIWOOM_SECRET_KEY: "dummy_secret_key"
    });

    expect(result.status).toBe("blocked");
    expect(result.blocked_reasons).toContain("Kiwoom quote endpoint mapping is not enabled for local/manual verification.");
    expect(result.next_step).toContain("Set required Kiwoom environment variables");
  });

  it("registers get_kiwoom_setup_status and returns setup payload without quote lookup", async () => {
    const originalEnv = { ...process.env };
    process.env = {
      ...originalEnv,
      KIWOOM_ENABLE_REAL_API_CALLS: "false",
      KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH: "false"
    };

    try {
      const result = await getKiwoomSetupStatusTool.handler({ provider: "kiwoom" }, { provider: createKiwoomLikeProvider() });

      expect(getRegisteredToolNames()).toContain("get_kiwoom_setup_status");
      expect(result).toMatchObject({
        status: "blocked",
        provider: "kiwoom",
        quote_real_path_ready: false
      });
    } finally {
      process.env = originalEnv;
    }
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
    expect(result.data.quotes).toEqual([]);
    expect(result.provider_error).toMatchObject({
      code: "PUBLIC_TOOL_EXPOSURE_DISABLED"
    });
    expect(result.data.daily_charts).toEqual([]);
    expect(result.data.related_indices[0]).toMatchObject({
      status: "unavailable",
      reason: "Kiwoom market index endpoint mapping is not enabled for local verification."
    });
    expect(JSON.stringify(result)).not.toContain("Samsung Electronics mock");
  });

  it("returns unavailable Kiwoom index context without mock fallback", async () => {
    const result = await getKoreanMarketDataContextTool.handler(
      { query: "코스피 실제 데이터 가져와줘" },
      { provider: createKiwoomLikeProvider() }
    ) as KoreanMarketDataContext;

    expect(result.data_status).toBe("blocked");
    expect(result.resolved_assets[0]).toMatchObject({
      symbol: "KOSPI",
      assetType: "index"
    });
    expect(result.data.quotes).toEqual([]);
    expect(result.data.daily_charts).toEqual([]);
    expect(result.data.related_indices[0]).toMatchObject({
      status: "unavailable",
      symbol: "KOSPI",
      reason: "Kiwoom market index endpoint mapping is not enabled for local verification."
    });
  });

  it("returns blocked get_market_index payload without mock fallback when Kiwoom guard is disabled", async () => {
    const result = await getMarketIndexTool.handler(
      { indexCode: "코스피200" },
      { provider: createKiwoomLikeProvider() }
    );

    expect(result).toMatchObject({
      status: "blocked",
      provider: "kiwoom",
      source: "real",
      index_present: false,
      reason_code: "MARKET_INDEX_ENDPOINT_DISABLED"
    });
    expect(JSON.stringify(result)).not.toContain("mock");
  });

  it("keeps unsupported raw Kiwoom sector codes out of the public market index input", async () => {
    const result = await getMarketIndexTool.handler(
      { indexCode: "0001" },
      { provider: createKiwoomLikeProvider() }
    );

    expect(result).toMatchObject({
      status: "blocked",
      provider: "kiwoom",
      index_present: false,
      reason_code: "UNSUPPORTED_MARKET_INDEX"
    });
  });

  it("adds related index placeholders for stock context without user-facing mock market data", async () => {
    const result = await getKoreanMarketDataContextTool.handler(
      { query: "삼성전자우 최근 20일 일봉과 코스피 지수 데이터를 같이 가져와줘" },
      { provider: createKiwoomLikeProvider() }
    ) as KoreanMarketDataContext;

    expect(result.resolved_assets[0]).toMatchObject({
      symbol: "005935",
      assetType: "stock"
    });
    expect(result.data.related_indices).toEqual(expect.arrayContaining([
      expect.objectContaining({
        status: "unavailable",
        symbol: "KOSPI"
      })
    ]));
    expect(JSON.stringify(result)).not.toContain("mock");
  });

  it("does not invent an S&P500 index fallback for a domestic S&P500 ETF context", async () => {
    const result = await getKoreanMarketDataContextTool.handler(
      { query: "TIGER 미국S&P500 최근 20일 흐름을 가져와줘" },
      { provider: createKiwoomLikeProvider() }
    ) as KoreanMarketDataContext;

    expect(result.resolved_assets[0]).toMatchObject({
      symbol: "360750",
      assetType: "etf"
    });
    expect(result.data.related_indices).toEqual([]);
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
