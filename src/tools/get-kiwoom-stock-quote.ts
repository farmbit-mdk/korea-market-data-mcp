import { z } from "zod";
import { MarketDataProviderError, toToolErrorResponse } from "../providers/errors.js";
import { createKiwoomAuthClient, loadKiwoomAuthConfig } from "../providers/kiwoom/auth.js";
import { createKiwoomQuoteClient } from "../providers/kiwoom/quote-client.js";
import {
  getEffectiveKiwoomQuoteEndpointMapping,
  isLocalKiwoomQuoteVerificationEnabled,
  kiwoomQuoteEndpointMappings
} from "../providers/kiwoom/quote-endpoints.js";
import type {
  KiwoomQuoteEndpointMapping,
  KiwoomQuoteMarket,
  NormalizedKiwoomQuote
} from "../providers/kiwoom/types.js";
import type { NormalizedQuote } from "../schemas/index.js";
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
  reason_code: KiwoomPublicQuoteBlockedReasonCode;
  reason: string;
}

export interface KiwoomPublicQuoteOkResponse {
  status: "ok";
  provider: "kiwoom";
  symbol: string;
  quote_present: true;
  quote: NormalizedKiwoomQuote;
}

export interface KiwoomPublicQuoteErrorResponse {
  status: "error";
  provider: "kiwoom";
  symbol?: string;
  quote_present: false;
  error: ReturnType<typeof toToolErrorResponse>["error"];
}

export type KiwoomPublicQuoteActivationDecision = "approved_for_local_only" | "pending" | "rejected";

export interface KiwoomPublicQuoteActivationDecisionRecord {
  provider: "kiwoom";
  feature: "public_quote_real_path";
  scope: "local_only";
  decision: KiwoomPublicQuoteActivationDecision;
  reviewed_at?: string;
  reviewer?: string;
  linked_smoke_test_result?: string;
  notes?: string;
}

export type KiwoomPublicQuoteBlockedReasonCode =
  | "REAL_API_CALLS_DISABLED"
  | "PUBLIC_QUOTE_REAL_PATH_DISABLED"
  | "ACTIVATION_DECISION_RECORD_MISSING"
  | "ACTIVATION_DECISION_NOT_APPROVED_FOR_LOCAL_ONLY"
  | "ENDPOINT_DISABLED"
  | "PUBLIC_TOOL_EXPOSURE_DISABLED"
  | "CREDENTIALS_MISSING"
  | "CREDENTIALS_PLACEHOLDER"
  | "TOKEN_REQUEST_BLOCKED"
  | "TOKEN_REQUEST_FAILED"
  | "INVALID_SYMBOL"
  | "QUOTE_ENDPOINT_NOT_READ_ONLY"
  | "QUOTE_RESPONSE_INVALID";

interface KiwoomPublicQuoteDependencies {
  env?: NodeJS.ProcessEnv;
  quoteEndpointMapping?: KiwoomQuoteEndpointMapping;
  activationDecisionRecord?: KiwoomPublicQuoteActivationDecisionRecord;
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
  "price",
  "price_type",
  "order_type",
  "side",
  "buy",
  "sell",
  "position",
  "leverage",
  "execution",
  "fill",
  "trading",
  "recommendation"
];

const kiwoomQuoteMarketValues = new Set(["KRX", "KOSPI", "KOSDAQ", "KONEX", "UNKNOWN"]);
const placeholderCredentialValues = new Set([
  "YOUR_APP_KEY",
  "YOUR_SECRET_KEY",
  "YOUR_KIWOOM_APP_KEY",
  "YOUR_KIWOOM_APP_SECRET",
  "YOUR_KIWOOM_SECRET_KEY",
  "CHANGE_ME",
  "REPLACE_ME",
  ""
]);

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
  input: unknown,
  dependencies: KiwoomPublicQuoteDependencies = {}
): Promise<KiwoomPublicQuoteBlockedResponse | KiwoomPublicQuoteOkResponse | KiwoomPublicQuoteErrorResponse> {
  const symbolForError = getSafeErrorSymbol(input);

  try {
    const normalizedInput = normalizeKiwoomPublicQuoteInput(input);
    const env = dependencies.env ?? process.env;
    const mapping = dependencies.quoteEndpointMapping ?? getEffectiveKiwoomQuoteEndpointMapping(env);

    if (!mapping.readOnly) {
      return blocked(normalizedInput.symbol, "QUOTE_ENDPOINT_NOT_READ_ONLY", "Kiwoom quote endpoint mapping is not marked read-only.");
    }

    if (!mapping.exposesPublicTool) {
      return blocked(normalizedInput.symbol, "PUBLIC_TOOL_EXPOSURE_DISABLED", "Kiwoom quote endpoint is not exposed as a public tool.");
    }

    if (!mapping.enabled) {
      return blocked(normalizedInput.symbol, "ENDPOINT_DISABLED", "Kiwoom quote endpoint is not enabled.");
    }

    const config = loadKiwoomAuthConfig(env);

    if (!config.enableRealApiCalls) {
      return blocked(normalizedInput.symbol, "REAL_API_CALLS_DISABLED", "KIWOOM_ENABLE_REAL_API_CALLS must be true.");
    }

    if (!isPublicQuoteRealPathEnabled(env)) {
      return blocked(normalizedInput.symbol, "PUBLIC_QUOTE_REAL_PATH_DISABLED", "KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH must be true.");
    }

    if (config.appKey === undefined || config.appSecret === undefined) {
      return blocked(normalizedInput.symbol, "CREDENTIALS_MISSING", "Kiwoom credentials are missing or invalid.");
    }

    if (isPlaceholderCredential(config.appKey) || isPlaceholderCredential(config.appSecret)) {
      return blocked(normalizedInput.symbol, "CREDENTIALS_PLACEHOLDER", "Kiwoom credentials are missing or invalid.");
    }

    if (dependencies.quoteEndpointMapping !== undefined || !isLocalKiwoomQuoteVerificationEnabled(env)) {
      const activationBlock = getActivationDecisionBlockReason(dependencies.activationDecisionRecord);
      if (activationBlock !== undefined) {
        return blocked(normalizedInput.symbol, activationBlock.reasonCode, activationBlock.reason);
      }
    }

    const tokenClient = dependencies.tokenClient ?? createKiwoomAuthClient(config);
    const token = await tokenClient.getAccessToken();

    if (token.accessToken.trim() === "") {
      return blocked(normalizedInput.symbol, "TOKEN_REQUEST_BLOCKED", "A Kiwoom access token must be present before quote lookup.");
    }

    const quoteClient = dependencies.quoteClient ?? createKiwoomQuoteClient({
      baseUrl: config.env === "mock" ? config.mockApiBaseUrl : config.apiBaseUrl,
      quoteEndpointPath: mapping.path,
      accessToken: token.accessToken,
      apiId: mapping.apiId
    });
    const quote = await quoteClient.getQuote({
      symbol: normalizedInput.symbol,
      market: normalizedInput.market
    });

    return {
      status: "ok",
      provider: "kiwoom",
      symbol: normalizedInput.symbol,
      quote_present: true,
      quote: redactSecrets(quote)
    };
  } catch (error) {
    const blockedInput = getInputBlockedReason(error);
    if (blockedInput !== undefined) {
      return blocked(symbolForError, blockedInput.reasonCode, blockedInput.reason);
    }

    return {
      status: "error",
      provider: "kiwoom",
      symbol: symbolForError,
      quote_present: false,
      error: redactSecrets(toToolErrorResponse(normalizePublicQuoteError(error), "kiwoom").error)
    };
  }
}

export function normalizeMockQuoteForKiwoomPublicTool(quote: NormalizedQuote): NormalizedKiwoomQuote {
  return {
    provider: "kiwoom",
    symbol: quote.symbol,
    name: quote.name,
    market: quote.market,
    currency: "KRW",
    price: quote.price ?? undefined,
    change: quote.change ?? undefined,
    change_rate: quote.changeRate ?? undefined,
    volume: quote.volume ?? undefined,
    as_of: quote.providerTimestamp ?? quote.requestTimestamp,
    raw_available: false
  };
}

function normalizeKiwoomPublicQuoteInput(input: unknown): Required<Pick<KiwoomPublicQuoteInput, "symbol">> & {
  market?: KiwoomQuoteMarket;
  provider?: "kiwoom";
} {
  if (!isPlainInputRecord(input)) {
    throw new MarketDataProviderError("INVALID_INPUT", "input must be an object.", "kiwoom", false);
  }

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

  if (!/^[0-9]{6}$/.test(symbol)) {
    throw new MarketDataProviderError("INVALID_INPUT", "symbol must be a 6-digit Korean stock code.", "kiwoom", false);
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

function normalizePublicQuoteError(error: unknown): MarketDataProviderError {
  if (error instanceof MarketDataProviderError) {
    return error;
  }

  return new MarketDataProviderError(
    "KIWOOM_QUOTE_REQUEST_FAILED",
    "Kiwoom quote request failed.",
    "kiwoom",
    true
  );
}

function getSafeErrorSymbol(input: unknown): string | undefined {
  if (!isPlainInputRecord(input) || typeof input.symbol !== "string") {
    return undefined;
  }

  const symbol = input.symbol.trim();
  return /^[0-9]{6}$/.test(symbol) ? symbol : undefined;
}

function isPlainInputRecord(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === "object" && !Array.isArray(input);
}

function isPublicQuoteRealPathEnabled(env: NodeJS.ProcessEnv | undefined): boolean {
  return env?.KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH === "true";
}

function isPlaceholderCredential(value: string): boolean {
  return placeholderCredentialValues.has(value.trim().toUpperCase());
}

function getActivationDecisionBlockReason(record: KiwoomPublicQuoteActivationDecisionRecord | undefined): {
  reasonCode: KiwoomPublicQuoteBlockedReasonCode;
  reason: string;
} | undefined {
  if (record === undefined) {
    return {
      reasonCode: "ACTIVATION_DECISION_RECORD_MISSING",
      reason: "Kiwoom real quote local verification requires an approved local-only activation decision record."
    };
  }

  if (
    record.provider !== "kiwoom" ||
    record.feature !== "public_quote_real_path" ||
    record.scope !== "local_only" ||
    record.decision !== "approved_for_local_only" ||
    record.linked_smoke_test_result === undefined ||
    record.linked_smoke_test_result.trim() === ""
  ) {
    return {
      reasonCode: "ACTIVATION_DECISION_NOT_APPROVED_FOR_LOCAL_ONLY",
      reason: "Kiwoom real quote local verification requires an approved local-only activation decision record."
    };
  }

  return undefined;
}

function getInputBlockedReason(error: unknown): {
  reasonCode: KiwoomPublicQuoteBlockedReasonCode;
  reason: string;
} | undefined {
  if (!(error instanceof MarketDataProviderError)) {
    return undefined;
  }

  if (
    error.code === "INVALID_INPUT" &&
    (error.message.includes("symbol is required") || error.message.includes("symbol must be"))
  ) {
    return {
      reasonCode: "INVALID_SYMBOL",
      reason: error.message
    };
  }

  return undefined;
}

function blocked(
  symbol: string | undefined,
  reasonCode: KiwoomPublicQuoteBlockedReasonCode,
  reason: string
): KiwoomPublicQuoteBlockedResponse {
  return {
    provider: "kiwoom",
    status: "blocked",
    symbol,
    quote_present: false,
    reason_code: reasonCode,
    reason
  };
}
