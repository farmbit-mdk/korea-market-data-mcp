import { afterEach, describe, expect, it, vi } from "vitest";
import { toToolErrorResponse } from "../src/providers/errors.js";
import {
  createKiwoomTokenClient,
  InMemoryKiwoomTokenCache,
  loadKiwoomAuthConfig,
  normalizeKiwoomTokenError,
  normalizeKiwoomTokenResponse
} from "../src/providers/kiwoom/index.js";
import type { KiwoomTokenTransport } from "../src/providers/kiwoom/index.js";

describe("Kiwoom token client interface", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not call global fetch with default config and real API calls disabled", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const tokenClient = createKiwoomTokenClient({
      config: loadKiwoomAuthConfig({
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_APP_SECRET: "dummy_app_secret"
      })
    });

    await expect(tokenClient.getAccessToken()).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "kiwoom"
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

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

  it("calls only the injected mocked transport when real API calls are explicitly enabled", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
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
    expect(fetchSpy).not.toHaveBeenCalled();
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

  it("normalizes failed token responses", async () => {
    const transport = createMockTransport({
      token_type: "Bearer",
      expires_in: 3600
    });
    const tokenClient = createKiwoomTokenClient({
      config: loadKiwoomAuthConfig({
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_APP_SECRET: "dummy_app_secret",
        KIWOOM_ENABLE_REAL_API_CALLS: "true"
      }),
      transport
    });

    await expect(tokenClient.getAccessToken()).rejects.toMatchObject({
      code: "PROVIDER_BAD_RESPONSE",
      provider: "kiwoom",
      retryable: false
    });
  });

  it("normalizes token transport errors directly", () => {
    const error = normalizeKiwoomTokenError(
      new Error("transport failed with KIWOOM_APP_SECRET=dummy_app_secret")
    );

    expect(error).toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
      provider: "kiwoom",
      retryable: true
    });
    expect(error.message).not.toContain("dummy_app_secret");
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

  it("does not log token values", async () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
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
      transport
    });

    await tokenClient.getAccessToken();

    const loggedText = stderrSpy.mock.calls.flat().join(" ");
    expect(loggedText).not.toContain("dummy_access_token_value");
    expect(loggedText).not.toContain("dummy_app_secret");
  });

  it("stores valid tokens in memory and reuses them until expiry", async () => {
    const transport = createMockTransport({
      access_token: "cached_access_token_value",
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

    const firstToken = await tokenClient.getAccessToken();
    const secondToken = await tokenClient.getAccessToken();

    expect(firstToken.accessToken).toBe("cached_access_token_value");
    expect(secondToken.accessToken).toBe("cached_access_token_value");
    expect(transport.requestToken).toHaveBeenCalledOnce();
  });

  it("does not reuse expired in-memory tokens", async () => {
    const transport = createMockTransport({
      access_token: "fresh_access_token_value",
      token_type: "Bearer",
      expires_in: 3600
    });
    const cache = new InMemoryKiwoomTokenCache();
    cache.set({
      token: {
        accessToken: "expired_access_token_value",
        tokenType: "Bearer",
        expiresAt: "2000-01-01T00:00:00.000Z",
        provider: "kiwoom"
      },
      cachedAt: "2000-01-01T00:00:00.000Z"
    });
    const tokenClient = createKiwoomTokenClient({
      config: loadKiwoomAuthConfig({
        KIWOOM_APP_KEY: "dummy_app_key",
        KIWOOM_APP_SECRET: "dummy_app_secret",
        KIWOOM_ENABLE_REAL_API_CALLS: "true"
      }),
      transport,
      cache
    });

    const token = await tokenClient.getAccessToken();

    expect(token.accessToken).toBe("fresh_access_token_value");
    expect(transport.requestToken).toHaveBeenCalledOnce();
  });

  function createMockTransport(response = {}): KiwoomTokenTransport {
    return {
      requestToken: vi.fn().mockResolvedValue(response)
    };
  }
});
