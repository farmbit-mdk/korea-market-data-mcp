import { z } from "zod";
import { MarketDataProviderError, toToolErrorResponse } from "../providers/errors.js";
import { createKiwoomAuthClient, loadKiwoomAuthConfig } from "../providers/kiwoom/auth.js";
import { createKiwoomQuoteClient, normalizeKiwoomQuoteError } from "../providers/kiwoom/quote-client.js";
import { kiwoomQuoteEndpointMappings } from "../providers/kiwoom/quote-endpoints.js";
import type {
  KiwoomQuoteEndpointMapping,
  KiwoomQuoteMarket,
  NormalizedKiwoomQuote
} from "../providers/kiwoom/types.js";
import { redactSecrets } from "../safety/redact-secret.js";
import type { ToolDefinition } from "./types.js";

interface KiwoomPublicQuoteInput {
  symbol?: string;
  market?: string;
  provider?: string;
}

export interface KiwoomPublicQuoteBlockedResponse {
  provider: "kiwoom";
  status: "blocked";
  symbol?: string;
  quote_present: false;
  reason: string;
}

export interface KiwoomPublicQuoteOkResponse extends NormalizedKiwoomQuote {
  status: "ok";
  quote_present: true;
}

interface KiwoomPublicQuoteDependencies {
  env?: NodeJS.ProcessEnv;
  quoteEndpointMapping?: KiwoomQuoteEndpointMapping;
  tokenClient?: {
    getAccessToken(): Promise<{ accessToken: string }>;
  };
  quoteClient?: {
    getQuote(request: { symbol: string; market?: KiwoomQuoteMarket }): Promise<NormalizedKiwoomQuote>;
  };
}

const forbiddenInputFields = [
  "account",
  "account_no",
  "accountNo",
  "accountNumber",
  "order",
  "order_no",
  "orderNo",
  "balance",
  "holdings",
  "holding",
  "quantity",
  "qty",
  "price_type",
  "side",
  "buy",
  "sell",
  "position",
  "leverage",
  "recommendation"
];

const kiwoomQuoteMarketValues = new Set(["KRX", "KOSPI", "KOSDAQ", "KONEX", "UNKNOWN"]);

export const getKiwoomStockQuoteTool: ToolDefinition = {
  name: "get_kiwoom_stock_quote",
  description: "Guarded read-only Kiwoom stock quote skeleton. Real Kiwoom quote lookup is disabled unless explicit safety guards are enabled.",
  inputSchema: {
    symbol: z.string().trim().min(1),
    market: z.enum(["KRX", "KOSPI", "KOSDAQ", "KONEX", "UNKNOWN"]).optional(),
    provider: z.literal("kiwoom").optional()
  },
  async handler(input) {
    return runGuardedKiwoomPublicQuote(input);
  }
};

export async function runGuardedKiwoomPublicQuote(
  input: Record<string, unknown>,
  dependencies: KiwoomPublicQuoteDependencies = {}
): Promise<KiwoomPublicQuoteBlockedResponse | KiwoomPublicQuoteOkResponse | ReturnType<typeof toToolErrorResponse>> {
  try {
    const normalizedInput = normalizeKiwoomPublicQuoteInput(input);
    const mapping = dependencies.quoteEndpointMapping ?? kiwoomQuoteEndpointMappings.quote;

    if (!mapping.readOnly) {
      return blocked(normalizedInput.symbol, "Kiwoom quote endpoint mapping is not marked read-only.");
    }

    if (!mapping.exposesPublicTool) {
      return blocked(
        normalizedInput.symbol,
        "Kiwoom public quote tool is registered as a guarded skeleton but real quote lookup is not enabled."
      );
    }

    const config = loadKiwoomAuthConfig(dependencies.env);

    if (!config.enableRealApiCalls) {
      return blocked(normalizedInput.symbol, "KIWOOM_ENABLE_REAL_API_CALLS must be set to true for guarded Kiwoom public quote lookup.");
    }

    if (!mapping.enabled) {
      return blocked(normalizedInput.symbol, "Kiwoom quote endpoint mapping is disabled.");
    }

    if (config.appKey === undefined || config.appSecret === undefined) {
      return blocked(normalizedInput.symbol, "Kiwoom credentials are required for guarded Kiwoom public quote lookup.");
    }

    const tokenClient = dependencies.tokenClient ?? createKiwoomAuthClient(config);
    const token = await tokenClient.getAccessToken();

    if (token.accessToken.trim() === "") {
      return blocked(normalizedInput.symbol, "A Kiwoom access token must be present before quote lookup.");
    }

    const quoteClient = dependencies.quoteClient ?? createKiwoomQuoteClient({
      baseUrl: config.env === "mock" ? config.mockApiBaseUrl : config.apiBaseUrl,
      quoteEndpointPath: mapping.path
    });
    const quote = await quoteClient.getQuote({
      symbol: normalizedInput.symbol,
      market: normalizedInput.market
    });

    return {
      ...redactSecrets(quote),
      status: "ok",
      quote_present: true
    };
  } catch (error) {
    return toToolErrorResponse(normalizeKiwoomQuoteError(error), "kiwoom");
  }
}

function normalizeKiwoomPublicQuoteInput(input: Record<string, unknown>): Required<Pick<KiwoomPublicQuoteInput, "symbol">> & {
  market?: KiwoomQuoteMarket;
  provider?: "kiwoom";
} {
  const forbiddenField = forbiddenInputFields.find((field) => Object.hasOwn(input, field));

  if (forbiddenField !== undefined) {
    throw new MarketDataProviderError(
      "INVALID_INPUT",
      "Kiwoom quote request must remain read-only market data only.",
      "kiwoom",
      false
    );
  }

  const symbol = typeof input.symbol === "string" ? input.symbol.trim() : "";

  if (symbol === "") {
    throw new MarketDataProviderError("INVALID_INPUT", "symbol is required.", "kiwoom", false);
  }

  if (input.provider !== undefined && input.provider !== "kiwoom") {
    throw new MarketDataProviderError("INVALID_INPUT", "provider must be kiwoom for this guarded tool.", "kiwoom", false);
  }

  if (input.market !== undefined && (typeof input.market !== "string" || !kiwoomQuoteMarketValues.has(input.market))) {
    throw new MarketDataProviderError("INVALID_INPUT", "market is invalid.", "kiwoom", false);
  }

  return {
    symbol,
    market: input.market as KiwoomQuoteMarket | undefined,
    provider: "kiwoom"
  };
}

function blocked(symbol: string | undefined, reason: string): KiwoomPublicQuoteBlockedResponse {
  return {
    provider: "kiwoom",
    status: "blocked",
    symbol,
    quote_present: false,
    reason
  };
}
