import { describe, expect, it, vi } from "vitest";
import { runManualKiwoomTokenVerification } from "../scripts/kiwoom-manual-token-test.js";
import { redactSecrets } from "../src/safety/redact-secret.js";
import type { KiwoomTokenTransport } from "../src/providers/kiwoom/index.js";

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

  it("uses only mocked transport after explicit opt-in and returns safe token summary", async () => {
    const transport = createMockTransport({
      token_type: "Bearer",
      access_token: "dummy_access_token_value",
      expires_dt: "2026-06-02T00:00:00.000Z",
      return_code: "0",
      return_msg: "OK"
    });

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
      status: "success",
      provider: "kiwoom",
      environment: "mock",
      token_present: true,
      token_type: "Bearer",
      expires_dt: "2026-06-02T00:00:00.000Z",
      return_code: "0",
      return_msg: "OK"
    });
    expect(JSON.stringify(summary)).not.toContain("dummy_access_token_value");
    expect(transport.requestToken).toHaveBeenCalledOnce();
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
