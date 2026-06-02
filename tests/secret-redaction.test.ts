import { describe, expect, it } from "vitest";
import { MarketDataProviderError, toToolErrorResponse } from "../src/providers/errors.js";
import { redactSecrets } from "../src/safety/redact-secret.js";

describe("secret redaction", () => {
  it("redacts obvious secret fields from objects", () => {
    const redacted = redactSecrets({
      KIWOOM_APP_KEY: "test_app_key_value",
      KIWOOM_APP_SECRET: "test_app_secret_value",
      access_token: "test_access_token_value",
      Authorization: "Bearer abcdefghijklmnopqrstuvwxyz123456"
    });

    expect(redacted).toEqual({
      KIWOOM_APP_KEY: "[REDACTED]",
      KIWOOM_APP_SECRET: "[REDACTED]",
      access_token: "[REDACTED]",
      Authorization: "[REDACTED]"
    });
  });

  it("redacts bearer token-like strings", () => {
    const redacted = redactSecrets(
      "Authorization: Bearer abcdefghijklmnopqrstuvwxyz1234567890 and access_token=secret_access_token_value"
    );

    expect(redacted).not.toContain("abcdefghijklmnopqrstuvwxyz1234567890");
    expect(redacted).not.toContain("secret_access_token_value");
    expect(redacted).toContain("[REDACTED]");
  });

  it("redacts secrets from provider error messages", () => {
    const error = new MarketDataProviderError(
      "PROVIDER_AUTH_FAILED",
      "KIWOOM_APP_SECRET=secret_app_value Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456",
      "kiwoom",
      false
    );
    const response = toToolErrorResponse(error, "kiwoom");

    expect(response.error.message).not.toContain("secret_app_value");
    expect(response.error.message).not.toContain("abcdefghijklmnopqrstuvwxyz123456");
    expect(response.error.message).toContain("[REDACTED]");
  });
});
