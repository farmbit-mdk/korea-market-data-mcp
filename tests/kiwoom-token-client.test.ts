import { describe, expect, it, vi } from "vitest";
import { toToolErrorResponse } from "../src/providers/errors.js";
import {
  createKiwoomTokenClient,
  InMemoryKiwoomTokenCache,
  loadKiwoomAuthConfig,
  normalizeKiwoomTokenResponse
} from "../src/providers/kiwoom/index.js";
import type { KiwoomTokenTransport } from "../src/providers/kiwoom/index.js";

describe("Kiwoom token client interface", () => {
  it("does not call the mocked transport when real API calls are disabled by default", async () => {
    const transport = createMockTransport();
    const tokenClient = createKiwoomTokenClient({
      config: loadKiwoomAuthConfig({
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_APP_SECRET: "dummy_app_secret"
      }),
      transport
    });

    await expect(tokenClient.getAccessToken()).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "kiwoom",
      retryable: false
    });
    expect(transport.requestToken).not.toHaveBeenCalled();
  });

  it("keeps dummy credentials from triggering a token request when disabled", async () => {
    const transport = createMockTransport();
    const tokenClient = createKiwoomTokenClient({
      config: loadKiwoomAuthConfig({
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_APP_SECRET: "dummy_app_secret",
        KIWOOM_ENABLE_REAL_API_CALLS: "false"
      }),
      transport
    });

    await expect(tokenClient.getAccessToken()).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY"
    });
    expect(transport.requestToken).not.toHaveBeenCalled();
  });

  it("normalizes a mocked token response when real API calls are explicitly enabled", async () => {
    const transport = createMockTransport({
      access_token: "dummy_access_token_value",
      token_type: "Bearer",
      expires_in: 3600
    });
    const tokenClient = createKiwoomTokenClient({
      config: loadKiwoomAuthConfig({
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_APP_SECRET: "dummy_app_secret",
        KIWOOM_ENABLE_REAL_API_CALLS: "true"
      }),
      transport,
      cache: new InMemoryKiwoomTokenCache()
    });

    const token = await tokenClient.getAccessToken();

    expect(token).toMatchObject({
      accessToken: "dummy_access_token_value",
      tokenType: "Bearer",
      provider: "kiwoom"
    });
    expect(Date.parse(token.expiresAt)).not.toBeNaN();
    expect(transport.requestToken).toHaveBeenCalledOnce();
    expect(transport.requestToken).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        body: {
          appkey: "dummy_app_key",
          secretkey: "dummy_app_secret",
          grant_type: "client_credentials"
        }
      })
    );
  });

  it("can normalize raw token responses directly", () => {
    const token = normalizeKiwoomTokenResponse({
      access_token: "dummy_access_token_value",
      token_type: "Bearer",
      expires_at: "2026-06-02T00:00:00.000Z"
    });

    expect(token).toEqual({
      accessToken: "dummy_access_token_value",
      tokenType: "Bearer",
      expiresAt: "2026-06-02T00:00:00.000Z",
      provider: "kiwoom"
    });
  });

  it("does not expose secrets from token errors", async () => {
    const transport = createMockTransport();
    vi.mocked(transport.requestToken).mockRejectedValue(
      new Error(
        "failed with KIWOOM_APP_SECRET=dummy_app_secret Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456"
      )
    );
    const tokenClient = createKiwoomTokenClient({
      config: loadKiwoomAuthConfig({
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_APP_SECRET: "dummy_app_secret",
        KIWOOM_ENABLE_REAL_API_CALLS: "true"
      }),
      transport
    });

    const response = await tokenClient.getAccessToken().catch((error: unknown) => toToolErrorResponse(error, "kiwoom"));

    expect(JSON.stringify(response)).not.toContain("dummy_app_secret");
    expect(JSON.stringify(response)).not.toContain("abcdefghijklmnopqrstuvwxyz123456");
    expect(response).toMatchObject({
      error: {
        code: "PROVIDER_UNAVAILABLE",
        provider: "kiwoom",
        retryable: true
      }
    });
  });

  function createMockTransport(response = {}): KiwoomTokenTransport {
    return {
      requestToken: vi.fn().mockResolvedValue(response)
    };
  }
});
