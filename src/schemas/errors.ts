export const providerErrorCodes = [
  "PROVIDER_AUTH_FAILED",
  "PROVIDER_RATE_LIMITED",
  "PROVIDER_TIMEOUT",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_BAD_RESPONSE",
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
  };
}
