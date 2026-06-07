import type { ProviderErrorCode, ToolErrorResponse } from "../schemas/errors.js";
import { redactSecrets } from "../safety/redact-secret.js";

export class MarketDataProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
    public readonly provider: string,
    public readonly retryable: boolean = false,
    public readonly returnCode?: string,
    public readonly returnMessage?: string,
    public readonly hint?: string
  ) {
    super(redactSecrets(message));
    this.name = "MarketDataProviderError";
  }
}

export function toToolErrorResponse(error: unknown, provider?: string): ToolErrorResponse {
  if (error instanceof MarketDataProviderError) {
    return {
      error: {
        code: error.code,
        message: redactSecrets(error.message),
        provider: error.provider,
        retryable: error.retryable,
        return_code: error.returnCode,
        return_msg: error.returnMessage,
        hint: error.hint
      }
    };
  }

  return {
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal error.",
      provider,
      retryable: false
    }
  };
}
