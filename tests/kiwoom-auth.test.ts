import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketDataProviderError } from "../src/providers/errors.js";
import { createProvider } from "../src/providers/provider-registry.js";
import { createKiwoomAuthClient, loadKiwoomAuthConfig } from "../src/providers/kiwoom/index.js";
import { loadRuntimeConfig } from "../src/utils/env.js";

describe("Kiwoom auth skeleton", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetKiwoomEnvironment();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("loads Kiwoom auth config without requiring credentials at construction time", () => {
    const config = loadKiwoomAuthConfig({
      KIWOOM_ENV: "prod",
      KIWOOM_API_BASE_URL: "https://api.kiwoom.com",
      KIWOOM_MOCK_API_BASE_URL: "https://mockapi.kiwoom.com"
    });

    expect(config).toMatchObject({
      env: "prod",
      apiBaseUrl: "https://api.kiwoom.com",
      mockApiBaseUrl: "https://mockapi.kiwoom.com",
      enableRealApiCalls: false
    });
    expect(config.appKey).toBeUndefined();
    expect(config.appSecret).toBeUndefined();
  });

  it("returns a normalized auth error when credentials are missing", async () => {
    process.env.KIWOOM_APP_KEY = "";
    process.env.KIWOOM_APP_SECRET = "";
    const authClient = createKiwoomAuthClient(loadKiwoomAuthConfig());

    await expect(authClient.getAccessToken()).rejects.toMatchObject({
      code: "PROVIDER_AUTH_FAILED",
      provider: "kiwoom",
      retryable: false
    });
  });

  it("does not make real API calls when credentials are present", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    process.env.KIWOOM_APP_KEY = "fake_app_key";
    process.env.KIWOOM_APP_SECRET = "fake_app_secret";
    process.env.KIWOOM_ENABLE_REAL_API_CALLS = "false";
    const authClient = createKiwoomAuthClient(loadKiwoomAuthConfig());

    await expect(authClient.getAccessToken()).rejects.toBeInstanceOf(MarketDataProviderError);
    await expect(authClient.getAccessToken()).rejects.toMatchObject({
      code: "UNSUPPORTED_PROVIDER_CAPABILITY",
      provider: "kiwoom"
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("allows selecting the Kiwoom provider skeleton", () => {
    const runtimeConfig = loadRuntimeConfig({ MARKET_DATA_PROVIDER: "kiwoom" });
    const provider = createProvider(runtimeConfig.provider);

    expect(provider.metadata).toMatchObject({
      id: "kiwoom",
      isReadOnly: true
    });
    expect(provider.capabilities.stockQuote).toBe(false);
  });

  it("keeps Kiwoom data methods as no-network skeletons", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    delete process.env.KIWOOM_APP_KEY;
    delete process.env.KIWOOM_APP_SECRET;
    const provider = createProvider("kiwoom");

    await expect(provider.getStockQuote({ symbol: "005930" })).rejects.toMatchObject({
      code: "PROVIDER_AUTH_FAILED",
      provider: "kiwoom"
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  function resetKiwoomEnvironment(): void {
    delete process.env.MARKET_DATA_PROVIDER;
    delete process.env.KIWOOM_ENV;
    delete process.env.KIWOOM_APP_KEY;
    delete process.env.KIWOOM_APP_SECRET;
    delete process.env.KIWOOM_API_BASE_URL;
    delete process.env.KIWOOM_MOCK_API_BASE_URL;
    delete process.env.KIWOOM_ENABLE_REAL_API_CALLS;
  }
});
