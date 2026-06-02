import { describe, expect, it, vi } from "vitest";
import { runManualKiwoomTokenVerification } from "../scripts/kiwoom-manual-token-test.js";
import { redactSecrets } from "../src/safety/redact-secret.js";
import type { KiwoomTokenTransport } from "../src/providers/kiwoom/index.js";
import {
  kiwoomErrorTokenResponse,
  successfulKiwoomTokenResponse
} from "./fixtures/kiwoom-token-responses.js";

describe("Kiwoom manual token verification workflow", () => {
  it("blocks manual token requests when real API opt-in is disabled", async () => {
    const transport = createMockTransport();
    const summary = await runManualKiwoomTokenVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "false",
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_SECRET_KEY: "dummy_secret_key",
        KIWOOM_ENV: "mock"
      },
      transport
    );

    expect(summary).toMatchObject({
      status: "blocked",
      provider: "kiwoom",
      token_present: false
    });
    expect(transport.requestToken).not.toHaveBeenCalled();
  });

  it("blocks manual token requests when credentials are missing", async () => {
    const transport = createMockTransport();
    const summary = await runManualKiwoomTokenVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "true",
        KIWOOM_ENV: "production"
      },
      transport
    );

    expect(summary).toMatchObject({
      status: "blocked",
      environment: "production",
      token_present: false
    });
    expect(transport.requestToken).not.toHaveBeenCalled();
  });

  it.each([
    ["YOUR_APP_KEY", "valid_secret_key"],
    ["valid_app_key", "YOUR_SECRET_KEY"],
    ["YOUR_KIWOOM_APP_KEY", "valid_secret_key"],
    ["valid_app_key", "YOUR_KIWOOM_SECRET_KEY"],
    ["valid_app_key", "YOUR_KIWOOM_APP_SECRET"],
    ["CHANGE_ME", "valid_secret_key"],
    ["valid_app_key", "REPLACE_ME"],
    ["", "valid_secret_key"],
    ["valid_app_key", ""]
  ])("blocks placeholder credentials before requesting a token", async (appKey, secretKey) => {
    const transport = createMockTransport();
    const summary = await runManualKiwoomTokenVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "true",
        KIWOOM_APP_KEY: appKey,
        KIWOOM_SECRET_KEY: secretKey,
        KIWOOM_ENV: "mock"
      },
      transport
    );

    expect(summary).toMatchObject({
      status: "blocked",
      provider: "kiwoom",
      environment: "mock",
      token_present: false,
      reason: expect.stringContaining("Placeholder credentials")
    });
    if (appKey !== "") {
      expect(JSON.stringify(summary)).not.toContain(appKey);
    }
    if (secretKey !== "") {
      expect(JSON.stringify(summary)).not.toContain(secretKey);
    }
    expect(transport.requestToken).not.toHaveBeenCalled();
  });

  it("uses only mocked transport after explicit opt-in and returns safe token summary", async () => {
    const transport = createMockTransport(successfulKiwoomTokenResponse);

    const summary = await runManualKiwoomTokenVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "true",
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_SECRET_KEY: "dummy_secret_key",
        KIWOOM_ENV: "mock"
      },
      transport
    );

    expect(summary).toEqual({
      status: "ok",
      provider: "kiwoom",
      environment: "mock",
      token_present: true,
      token_type: "Bearer",
      expires_dt: "2026-06-02T00:00:00.000Z",
      return_code: "0",
      return_msg: "OK"
    });
    expect(JSON.stringify(summary)).not.toContain("fixture_access_token_value");
    expect(transport.requestToken).toHaveBeenCalledOnce();
  });

  it("returns safe error output for Kiwoom token error responses", async () => {
    const transport = createMockTransport(kiwoomErrorTokenResponse);
    const summary = await runManualKiwoomTokenVerification(
      {
        KIWOOM_ENABLE_REAL_API_CALLS: "true",
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_SECRET_KEY: "dummy_secret_key",
        KIWOOM_ENV: "mock"
      },
      transport
    );

    expect(summary).toMatchObject({
      status: "error",
      provider: "kiwoom",
      environment: "mock",
      token_present: false,
      error: {
        code: "KIWOOM_TOKEN_REQUEST_FAILED",
        provider: "kiwoom",
        retryable: false,
        return_code: "10001",
        return_msg: "Invalid app key or secret key."
      }
    });
    expect(JSON.stringify(summary)).not.toContain("dummy_app_key");
    expect(JSON.stringify(summary)).not.toContain("dummy_secret_key");
  });

  it("redacts app key, secret key, and token-like values", () => {
    const redacted = redactSecrets({
      KIWOOM_APP_KEY: "dummy_app_key",
      KIWOOM_SECRET_KEY: "dummy_secret_key",
      secretkey: "dummy_secret_key",
      access_token: "dummy_access_token_value",
      Authorization: "Bearer abcdefghijklmnopqrstuvwxyz123456"
    });

    const serialized = JSON.stringify(redacted);
    expect(serialized).not.toContain("dummy_app_key");
    expect(serialized).not.toContain("dummy_secret_key");
    expect(serialized).not.toContain("dummy_access_token_value");
    expect(serialized).not.toContain("abcdefghijklmnopqrstuvwxyz123456");
  });

  function createMockTransport(response = {}): KiwoomTokenTransport {
    return {
      requestToken: vi.fn().mockResolvedValue(response)
    };
  }
});
