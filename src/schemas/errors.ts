export const providerErrorCodes = [
  "PROVIDER_AUTH_FAILED",
  "PROVIDER_RATE_LIMITED",
  "PROVIDER_TIMEOUT",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_BAD_RESPONSE",
  "KIWOOM_TOKEN_REQUEST_FAILED",
  "KIWOOM_INVESTMENT_ENV_MISMATCH",
  "KIWOOM_QUOTE_NOT_IMPLEMENTED",
  "KIWOOM_QUOTE_BAD_RESPONSE",
  "KIWOOM_QUOTE_REQUEST_FAILED",
  "KIWOOM_DAILY_CHART_NOT_IMPLEMENTED",
  "KIWOOM_DAILY_CHART_BAD_RESPONSE",
  "KIWOOM_DAILY_CHART_REQUEST_FAILED",
  "KIWOOM_MARKET_INDEX_NOT_IMPLEMENTED",
  "KIWOOM_MARKET_INDEX_BAD_RESPONSE",
  "KIWOOM_MARKET_INDEX_REQUEST_FAILED",
  "SYMBOL_NOT_FOUND",
  "INVALID_INPUT",
  "UNSUPPORTED_PROVIDER_CAPABILITY",
  "INTERNAL_ERROR"
] as const;

export type ProviderErrorCode = (typeof providerErrorCodes)[number];

export interface ToolErrorResponse {
  error: {
    code: ProviderErrorCode;
    message: string;
    provider?: string;
    retryable: boolean;
    return_code?: string;
    return_msg?: string;
    hint?: string;
  };
}
