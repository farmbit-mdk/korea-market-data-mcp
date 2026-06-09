import { z } from "zod";
import { MarketDataProviderError, toToolErrorResponse } from "../providers/errors.js";
import { createKiwoomAuthClient, loadKiwoomAuthConfig } from "../providers/kiwoom/auth.js";
import { createKiwoomChartClient } from "../providers/kiwoom/chart-client.js";
import { getEffectiveKiwoomDailyChartEndpointMapping } from "../providers/kiwoom/quote-endpoints.js";
import type { DailyChartInput, MarketDataProvider } from "../providers/types.js";
import { assetTypeSchema, koreanMarketSchema } from "../schemas/common.js";
import type { ToolDefinition } from "./types.js";
import { resolveKoreanMarketQuery } from "./korean-market-query-resolver.js";

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
      if (shouldUseKiwoomDailyChart(context.provider)) {
        return await getKiwoomDailyChart(input as unknown as DailyChartInput);
      }

      return await context.provider.getDailyChart(input as unknown as DailyChartInput);
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};

async function getKiwoomDailyChart(input: DailyChartInput) {
  const env = process.env;
  const mapping = getEffectiveKiwoomDailyChartEndpointMapping(env);

  if (!mapping.enabled || !mapping.readOnly || !mapping.manualOnly) {
    throw new MarketDataProviderError(
      "KIWOOM_DAILY_CHART_NOT_IMPLEMENTED",
      "Kiwoom daily chart endpoint mapping is not enabled for local verification.",
      "kiwoom",
      false
    );
  }

  const config = loadKiwoomAuthConfig(env);
  const token = await createKiwoomAuthClient(config).getAccessToken();
  const resolvedAsset = await resolveChartSymbol(input.symbol);

  return createKiwoomChartClient({
    baseUrl: config.env === "mock" ? config.mockApiBaseUrl : config.apiBaseUrl,
    chartEndpointPath: mapping.path,
    accessToken: token.accessToken,
    apiId: mapping.apiId
  }).getDailyChart({
    symbol: resolvedAsset.symbol,
    name: resolvedAsset.name,
    market: input.market === "ETF" ? "KOSPI" : input.market ?? resolvedAsset.market,
    limit: input.limit
  });
}

function shouldUseKiwoomDailyChart(provider: MarketDataProvider): boolean {
  return provider.metadata.id === "kiwoom" || getEffectiveKiwoomDailyChartEndpointMapping(process.env).enabled;
}

async function resolveChartSymbol(inputSymbol: string): Promise<{
  symbol: string;
  name?: string;
  market?: "KRX" | "KOSPI" | "KOSDAQ" | "KONEX" | "UNKNOWN";
}> {
  const symbol = inputSymbol.trim();

  if (/^(?=.*\d)[0-9A-Za-z]{6}$/.test(symbol)) {
    return {
      symbol: symbol.toUpperCase()
    };
  }

  const resolution = await resolveKoreanMarketQuery({
    provider: resolverOnlyProvider,
    query: symbol,
    preferredAssetTypes: ["stock", "etf"],
    maxResults: 3
  });
  const asset = resolution.resolved_assets[0];

  if (asset === undefined || asset.confidence < 0.8) {
    throw new MarketDataProviderError(
      "SYMBOL_NOT_FOUND",
      "Could not resolve a Korean stock or ETF symbol for Kiwoom daily chart lookup.",
      "kiwoom",
      false
    );
  }

  return {
    symbol: asset.symbol,
    name: asset.name,
    market: asset.market === "KRX" || asset.market === "KOSPI" || asset.market === "KOSDAQ" || asset.market === "KONEX"
      ? asset.market
      : "UNKNOWN"
  };
}

const resolverOnlyProvider: MarketDataProvider = {
  metadata: {
    id: "kiwoom",
    name: "Kiwoom resolver-only provider",
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
    throw new MarketDataProviderError("UNSUPPORTED_PROVIDER_CAPABILITY", "Kiwoom symbol search is unavailable.", "kiwoom", false);
  },
  async getStockQuote() {
    throw new MarketDataProviderError("UNSUPPORTED_PROVIDER_CAPABILITY", "Kiwoom stock quote is unavailable here.", "kiwoom", false);
  },
  async getEtfQuote() {
    throw new MarketDataProviderError("UNSUPPORTED_PROVIDER_CAPABILITY", "Kiwoom ETF quote is unavailable here.", "kiwoom", false);
  },
  async getMarketIndex() {
    throw new MarketDataProviderError("UNSUPPORTED_PROVIDER_CAPABILITY", "Kiwoom market index is unavailable here.", "kiwoom", false);
  },
  async getDailyChart() {
    throw new MarketDataProviderError("UNSUPPORTED_PROVIDER_CAPABILITY", "Kiwoom daily chart is unavailable here.", "kiwoom", false);
  }
};
