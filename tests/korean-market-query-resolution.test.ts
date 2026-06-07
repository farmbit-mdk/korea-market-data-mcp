import { describe, expect, it } from "vitest";
import { createMockProvider } from "../src/providers/mock/index.js";
import { getKoreanMarketDataContextTool } from "../src/tools/get-korean-market-data-context.js";
import type { KoreanMarketDataContext, KoreanMarketQueryResolution } from "../src/tools/korean-market-query-resolver.js";
import { resolveKoreanMarketQueryTool } from "../src/tools/resolve-korean-market-query.js";
import { getRegisteredToolNames } from "../src/tools/index.js";

describe("Korean market data query resolution", () => {
  const provider = createMockProvider();
  const context = { provider };

  it.each([
    ["삼성전자", "005930", "stock"],
    ["삼전", "005930", "stock"],
    ["Samsung Electronics", "005930", "stock"],
    ["KODEX 200", "069500", "etf"],
    ["코덱스200", "069500", "etf"],
    ["코스피", "KOSPI", "index"],
    ["코스닥", "KOSDAQ", "index"],
    ["코스피200", "KOSPI200", "index"]
  ])("resolves %s to %s", async (query, symbol, assetType) => {
    const result = await resolveKoreanMarketQueryTool.handler({ query }, context) as KoreanMarketQueryResolution;

    expect(result.intent).toBe("market_data_lookup");
    expect(result.resolved_assets[0]).toMatchObject({
      symbol,
      assetType,
      provider: "mock"
    });
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.unresolved_terms).toEqual([]);
    expect(result.provider).toBe("mock");
    expect(result.environment).toBe("mock");
  });

  it("resolves natural-language stock, ETF, and index phrases", async () => {
    await expectResolvedAsset("삼성전자 요즘 어때?", "005930", "stock");
    await expectResolvedAsset("삼전 흐름 알려줘", "005930", "stock");
    await expectResolvedAsset("코덱스200 조회해줘", "069500", "etf");
    await expectResolvedAsset("코스피 흐름 알려줘", "KOSPI", "index");
  });

  it("returns unresolved terms for unknown queries", async () => {
    const result = await resolveKoreanMarketQueryTool.handler(
      { query: "알수없는종목 흐름 알려줘" },
      context
    ) as KoreanMarketQueryResolution;

    expect(result.intent).toBe("unknown");
    expect(result.resolved_assets).toEqual([]);
    expect(result.unresolved_terms).toEqual(["알수없는종목 흐름 알려줘"]);
    expect(result.confidence).toBe(0);
    expect(result.data_requirements).toEqual([]);
    expect(result.suggested_next_tools).toEqual([]);
  });

  it("returns stock quote, chart, and related index context for Samsung Electronics", async () => {
    const result = await getKoreanMarketDataContextTool.handler(
      { query: "삼성전자 요즘 어때?" },
      context
    ) as KoreanMarketDataContext;

    expect(result.data_status).toBe("ok");
    expect(result.resolved_assets[0]).toMatchObject({ symbol: "005930", assetType: "stock" });
    expect(result.data.quotes[0]).toMatchObject({ symbol: "005930", assetType: "stock" });
    expect(result.data.daily_charts[0]).toMatchObject({ symbol: "005930", assetType: "stock" });
    expect(result.data.related_indices.map((index) => index.indexCode)).toEqual(expect.arrayContaining(["KOSPI", "KOSPI200"]));
    expect(Date.parse(result.fetched_at)).not.toBeNaN();
  });

  it("returns ETF quote, chart, and related index context for KODEX 200", async () => {
    const result = await getKoreanMarketDataContextTool.handler(
      { query: "KODEX 200 조회해줘" },
      context
    ) as KoreanMarketDataContext;

    expect(result.data_status).toBe("ok");
    expect(result.resolved_assets[0]).toMatchObject({ symbol: "069500", assetType: "etf", market: "KOSPI" });
    expect(result.data.quotes[0]).toMatchObject({ symbol: "069500", assetType: "etf" });
    expect(result.data.daily_charts[0]).toMatchObject({ symbol: "069500", assetType: "etf" });
    expect(result.data.related_indices.map((index) => index.indexCode)).toEqual(expect.arrayContaining(["KOSPI", "KOSPI200"]));
  });

  it("returns index context for KOSPI queries", async () => {
    const result = await getKoreanMarketDataContextTool.handler(
      { query: "코스피 흐름 알려줘" },
      context
    ) as KoreanMarketDataContext;

    expect(result.data_status).toBe("ok");
    expect(result.resolved_assets[0]).toMatchObject({ symbol: "KOSPI", assetType: "index" });
    expect(result.data.quotes).toEqual([]);
    expect(result.data.daily_charts).toEqual([]);
    expect(result.data.related_indices[0]).toMatchObject({ indexCode: "KOSPI" });
  });

  it("registers the new public read-only query resolution tools without removing existing tools", () => {
    expect(getRegisteredToolNames()).toEqual([
      "resolve_korean_market_query",
      "get_korean_market_data_context",
      "search_korean_symbol",
      "get_stock_quote",
      "get_kiwoom_stock_quote",
      "get_etf_quote",
      "get_market_index",
      "get_daily_chart"
    ]);
  });

  async function expectResolvedAsset(query: string, symbol: string, assetType: string): Promise<void> {
    const result = await resolveKoreanMarketQueryTool.handler({ query }, context) as KoreanMarketQueryResolution;

    expect(result.resolved_assets[0]).toMatchObject({
      symbol,
      assetType
    });
  }
});
