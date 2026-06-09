import { z } from "zod";
import { createKiwoomAuthClient, loadKiwoomAuthConfig } from "../providers/kiwoom/auth.js";
import { createKiwoomIndexClient, kiwoomMarketIndexMappings, normalizeKiwoomMarketIndexCode } from "../providers/kiwoom/index-client.js";
import { getEffectiveKiwoomMarketIndexEndpointMapping } from "../providers/kiwoom/quote-endpoints.js";
import { toToolErrorResponse } from "../providers/errors.js";
import type { MarketIndexInput } from "../providers/types.js";
import type { ToolDefinition } from "./types.js";

export const getMarketIndexTool: ToolDefinition = {
  name: "get_market_index",
  description: "Get a read-only quote for a Korean market index.",
  inputSchema: {
    indexCode: z.string().trim().min(1)
  },
  async handler(input, context) {
    try {
      if (context.provider.metadata.id === "kiwoom") {
        return await runGuardedKiwoomMarketIndex(input as unknown as MarketIndexInput);
      }

      return await context.provider.getMarketIndex(input as unknown as MarketIndexInput);
    } catch (error) {
      return toToolErrorResponse(error, context.provider.metadata.id);
    }
  }
};

export async function runGuardedKiwoomMarketIndex(input: MarketIndexInput): Promise<
  | {
      status: "ok";
      provider: "kiwoom";
      source: "real";
      index_present: true;
      index: Record<string, unknown>;
    }
  | {
      status: "blocked";
      provider: "kiwoom";
      source: "real";
      index_present: false;
      reason_code: string;
      reason: string;
    }
  | {
      status: "error";
      provider: "kiwoom";
      source: "real";
      index_present: false;
      error: {
        code: string;
        message: string;
        provider: "kiwoom";
        source_tr: string;
        endpoint?: string;
        public_index_code: string;
        kiwoom_market_type: string;
        kiwoom_sector_code: string;
        reason_code: string;
        provider_message?: string;
      };
    }
> {
  const indexCode = normalizeKiwoomMarketIndexCode(input.indexCode);

  if (indexCode === undefined) {
    return blocked("UNSUPPORTED_MARKET_INDEX", "Supported Kiwoom market indices are KOSPI, KOSDAQ, and KOSPI200.");
  }

  try {
    const env = process.env;
    const mapping = getEffectiveKiwoomMarketIndexEndpointMapping(env);

    if (!mapping.enabled || !mapping.readOnly || !mapping.manualOnly) {
      return blocked("MARKET_INDEX_ENDPOINT_DISABLED", "Kiwoom market index endpoint mapping is not enabled for local verification.");
    }

    const config = loadKiwoomAuthConfig(env);

    if (!config.enableRealApiCalls) {
      return blocked("REAL_API_CALLS_DISABLED", "KIWOOM_ENABLE_REAL_API_CALLS must be true.");
    }

    if (config.appKey === undefined || config.appSecret === undefined) {
      return blocked("CREDENTIALS_MISSING", "Kiwoom credentials are missing or invalid.");
    }

    const token = await createKiwoomAuthClient(config).getAccessToken();

    if (token.accessToken.trim() === "") {
      return blocked("TOKEN_REQUEST_BLOCKED", "A Kiwoom access token must be present before market index lookup.");
    }

    const index = await createKiwoomIndexClient({
      baseUrl: config.env === "mock" ? config.mockApiBaseUrl : config.apiBaseUrl,
      indexEndpointPath: mapping.path,
      accessToken: token.accessToken,
      apiId: mapping.apiId
    }).getMarketIndex({ indexCode });

    return {
      status: "ok",
      provider: "kiwoom",
      source: "real",
      index_present: true,
      index: index as unknown as Record<string, unknown>
    };
  } catch (error) {
    const toolError = toToolErrorResponse(error, "kiwoom").error;
    const mapping = getEffectiveKiwoomMarketIndexEndpointMapping(process.env);
    const indexMapping = kiwoomMarketIndexMappings[indexCode];
    return {
      status: "error",
      provider: "kiwoom",
      source: "real",
      index_present: false,
      error: {
        code: toolError.code,
        message: toolError.message,
        provider: "kiwoom",
        source_tr: mapping.apiId,
        endpoint: mapping.path.startsWith("TODO_") ? undefined : mapping.path,
        public_index_code: indexMapping.publicIndexCode,
        kiwoom_market_type: indexMapping.kiwoomMarketType,
        kiwoom_sector_code: indexMapping.kiwoomSectorCode,
        reason_code: toolError.return_code ?? toolError.code,
        provider_message: toolError.return_msg ?? toolError.message
      }
    };
  }
}

function blocked(reasonCode: string, reason: string) {
  return {
    status: "blocked" as const,
    provider: "kiwoom" as const,
    source: "real" as const,
    index_present: false as const,
    reason_code: reasonCode,
    reason
  };
}
