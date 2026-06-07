import { fileURLToPath } from "node:url";
import { toToolErrorResponse } from "../src/providers/errors.js";
import { createKiwoomQuoteClient } from "../src/providers/kiwoom/quote-client.js";
import { kiwoomQuoteEndpointMappings } from "../src/providers/kiwoom/quote-endpoints.js";
import { createKiwoomTokenClient } from "../src/providers/kiwoom/token-client.js";
import type {
  KiwoomAuthConfig,
  KiwoomQuoteEndpointMapping,
  KiwoomQuoteTransport,
  KiwoomTokenTransport,
  NormalizedKiwoomQuote
} from "../src/providers/kiwoom/types.js";
import { redactSecrets } from "../src/safety/redact-secret.js";

export interface ManualKiwoomQuoteSummary {
  status: "blocked" | "ok" | "error";
  provider: "kiwoom";
  feature: "public_quote_real_path";
  environment: "mock" | "production";
  symbol?: string;
  quote_present: boolean;
  quote?: NormalizedKiwoomQuote;
  reason_code?: ManualKiwoomQuoteBlockedReasonCode;
  reason?: string;
  error?: unknown;
}

export type ManualKiwoomQuoteBlockedReasonCode =
  | "REAL_API_CALLS_DISABLED"
  | "ENDPOINT_DISABLED"
  | "CREDENTIALS_MISSING"
  | "CREDENTIALS_PLACEHOLDER"
  | "TOKEN_REQUEST_BLOCKED"
  | "INVALID_SYMBOL";

interface ManualKiwoomQuoteEnv {
  KIWOOM_ENABLE_REAL_API_CALLS?: string;
  KIWOOM_APP_KEY?: string;
  KIWOOM_SECRET_KEY?: string;
  KIWOOM_APP_SECRET?: string;
  KIWOOM_ENV?: string;
  KIWOOM_API_BASE_URL?: string;
  KIWOOM_MOCK_API_BASE_URL?: string;
  KIWOOM_QUOTE_SYMBOL?: string;
}

interface ManualKiwoomQuoteDependencies {
  tokenTransport?: KiwoomTokenTransport;
  quoteTransport?: KiwoomQuoteTransport;
  quoteEndpointMapping?: KiwoomQuoteEndpointMapping;
  argv?: string[];
}

const defaultApiBaseUrl = "https://api.kiwoom.com";
const defaultMockApiBaseUrl = "https://mockapi.kiwoom.com";
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

export async function runManualKiwoomQuoteVerification(
  env: ManualKiwoomQuoteEnv = process.env,
  dependencies: ManualKiwoomQuoteDependencies = {}
): Promise<ManualKiwoomQuoteSummary> {
  const environment = parseManualEnvironment(env.KIWOOM_ENV);
  const symbol = normalizeEnvValue(dependencies.argv?.[0]) ?? normalizeEnvValue(env.KIWOOM_QUOTE_SYMBOL) ?? "005930";
  const rawAppKey = env.KIWOOM_APP_KEY;
  const rawSecretKey = env.KIWOOM_SECRET_KEY ?? env.KIWOOM_APP_SECRET;
  const appKey = normalizeEnvValue(env.KIWOOM_APP_KEY);
  const secretKey = normalizeEnvValue(env.KIWOOM_SECRET_KEY) ?? normalizeEnvValue(env.KIWOOM_APP_SECRET);
  const quoteEndpointMapping = dependencies.quoteEndpointMapping ?? kiwoomQuoteEndpointMappings.quote;

  if (env.KIWOOM_ENABLE_REAL_API_CALLS !== "true") {
    return blocked(
      environment,
      symbol,
      "REAL_API_CALLS_DISABLED",
      "KIWOOM_ENABLE_REAL_API_CALLS must be set to true for manual quote verification."
    );
  }

  if (isPlaceholderCredential(rawAppKey) || isPlaceholderCredential(rawSecretKey)) {
    return blocked(environment, symbol, "CREDENTIALS_PLACEHOLDER", "Placeholder credentials cannot be used for manual quote verification.");
  }

  if (appKey === undefined || secretKey === undefined) {
    return blocked(environment, symbol, "CREDENTIALS_MISSING", "KIWOOM_APP_KEY and KIWOOM_SECRET_KEY are required for manual quote verification.");
  }

  if (!quoteEndpointMapping.enabled || !quoteEndpointMapping.manualOnly || !quoteEndpointMapping.readOnly) {
    return blocked(environment, symbol, "ENDPOINT_DISABLED", "Kiwoom quote endpoint mapping is disabled for manual verification.");
  }

  const config: KiwoomAuthConfig = {
    env: environment === "mock" ? "mock" : "prod",
    appKey,
    appSecret: secretKey,
    apiBaseUrl: env.KIWOOM_API_BASE_URL ?? defaultApiBaseUrl,
    mockApiBaseUrl: env.KIWOOM_MOCK_API_BASE_URL ?? defaultMockApiBaseUrl,
    enableRealApiCalls: true
  };
  const baseUrl = environment === "mock" ? config.mockApiBaseUrl : config.apiBaseUrl;

  try {
    const token = await createKiwoomTokenClient({
      config,
      transport: dependencies.tokenTransport
    }).getAccessToken();

    if (token.accessToken.trim() === "") {
      return blocked(environment, symbol, "TOKEN_REQUEST_BLOCKED", "A token must be present before manual quote verification.");
    }

    const quote = await createKiwoomQuoteClient({
      baseUrl,
      quoteEndpointPath: quoteEndpointMapping.path,
      transport: dependencies.quoteTransport
    }).getQuote({ symbol });

    return {
      status: "ok",
      provider: "kiwoom",
      feature: "public_quote_real_path",
      environment,
      symbol,
      quote_present: true,
      quote
    };
  } catch (error) {
    return {
      status: "error",
      provider: "kiwoom",
      feature: "public_quote_real_path",
      environment,
      symbol,
      quote_present: false,
      error: redactSecrets(toToolErrorResponse(error, "kiwoom").error)
    };
  }
}

function blocked(
  environment: "mock" | "production",
  symbol: string | undefined,
  reasonCode: ManualKiwoomQuoteBlockedReasonCode,
  reason: string
): ManualKiwoomQuoteSummary {
  return {
    status: "blocked",
    provider: "kiwoom",
    feature: "public_quote_real_path",
    environment,
    symbol,
    quote_present: false,
    reason_code: reasonCode,
    reason
  };
}

function parseManualEnvironment(value: string | undefined): "mock" | "production" {
  if (value === undefined || value === "" || value === "mock") {
    return "mock";
  }

  if (value === "production" || value === "prod") {
    return "production";
  }

  return "mock";
}

function normalizeEnvValue(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value;
}

function isPlaceholderCredential(value: string | undefined): boolean {
  return value !== undefined && placeholderCredentialValues.has(value.trim().toUpperCase());
}

function isCliEntryPoint(): boolean {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isCliEntryPoint()) {
  runManualKiwoomQuoteVerification(process.env, { argv: process.argv.slice(2) })
    .then((summary) => {
      process.stdout.write(`${JSON.stringify(redactSecrets(summary), null, 2)}\n`);
      if (summary.status === "error") {
        process.exitCode = 1;
      }
    })
    .catch((error: unknown) => {
      process.stderr.write(`${JSON.stringify(redactSecrets(toToolErrorResponse(error, "kiwoom").error), null, 2)}\n`);
      process.exitCode = 1;
    });
}
