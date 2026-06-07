import { fileURLToPath } from "node:url";
import { createKiwoomTokenClient } from "../src/providers/kiwoom/token-client.js";
import { parseKiwoomManualEnvironment } from "../src/providers/kiwoom/env.js";
import type { KiwoomAuthConfig, KiwoomTokenTransport } from "../src/providers/kiwoom/types.js";
import { toToolErrorResponse } from "../src/providers/errors.js";
import { redactSecrets } from "../src/safety/redact-secret.js";

export interface ManualKiwoomTokenSummary {
  status: "blocked" | "ok" | "error";
  provider: "kiwoom";
  environment: "mock" | "production";
  token_present: boolean;
  token_type?: string;
  expires_dt?: string;
  return_code?: string;
  return_msg?: string;
  reason?: string;
  error?: unknown;
}

interface ManualKiwoomEnv {
  KIWOOM_ENABLE_REAL_API_CALLS?: string;
  KIWOOM_APP_KEY?: string;
  KIWOOM_SECRET_KEY?: string;
  KIWOOM_APP_SECRET?: string;
  KIWOOM_ENV?: string;
  KIWOOM_API_BASE_URL?: string;
  KIWOOM_MOCK_API_BASE_URL?: string;
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

export async function runManualKiwoomTokenVerification(
  env: ManualKiwoomEnv = process.env,
  transport?: KiwoomTokenTransport
): Promise<ManualKiwoomTokenSummary> {
  const environment = parseKiwoomManualEnvironment(env.KIWOOM_ENV);
  const rawAppKey = env.KIWOOM_APP_KEY;
  const rawSecretKey = env.KIWOOM_SECRET_KEY ?? env.KIWOOM_APP_SECRET;
  const appKey = normalizeEnvValue(env.KIWOOM_APP_KEY);
  const secretKey = normalizeEnvValue(env.KIWOOM_SECRET_KEY) ?? normalizeEnvValue(env.KIWOOM_APP_SECRET);

  if (env.KIWOOM_ENABLE_REAL_API_CALLS !== "true") {
    return {
      status: "blocked",
      provider: "kiwoom",
      environment,
      token_present: false,
      reason: "KIWOOM_ENABLE_REAL_API_CALLS must be set to true for manual token verification."
    };
  }

  if (isPlaceholderCredential(rawAppKey) || isPlaceholderCredential(rawSecretKey)) {
    return {
      status: "blocked",
      provider: "kiwoom",
      environment,
      token_present: false,
      reason: "Placeholder credentials cannot be used for manual token verification."
    };
  }

  if (appKey === undefined || secretKey === undefined) {
    return {
      status: "blocked",
      provider: "kiwoom",
      environment,
      token_present: false,
      reason: "KIWOOM_APP_KEY and KIWOOM_SECRET_KEY are required for manual token verification."
    };
  }

  const config: KiwoomAuthConfig = {
    env: environment === "mock" ? "mock" : "prod",
    appKey,
    appSecret: secretKey,
    apiBaseUrl: env.KIWOOM_API_BASE_URL ?? defaultApiBaseUrl,
    mockApiBaseUrl: env.KIWOOM_MOCK_API_BASE_URL ?? defaultMockApiBaseUrl,
    enableRealApiCalls: true
  };

  try {
    const token = await createKiwoomTokenClient({ config, transport }).getAccessToken();

    return {
      status: "ok",
      provider: "kiwoom",
      environment,
      token_present: token.accessToken.length > 0,
      token_type: token.tokenType,
      expires_dt: token.expiresAt,
      return_code: token.returnCode,
      return_msg: token.returnMessage
    };
  } catch (error) {
    const toolError = toToolErrorResponse(error, "kiwoom").error;

    return {
      status: "error",
      provider: "kiwoom",
      environment,
      token_present: false,
      error: redactSecrets(toolError)
    };
  }
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
  runManualKiwoomTokenVerification()
    .then((summary) => {
      process.stdout.write(`${JSON.stringify(redactSecrets(summary), null, 2)}\n`);
      if (summary.status === "error") {
        process.exitCode = 1;
      }
    })
    .catch((error: unknown) => {
      process.stderr.write(`${JSON.stringify(redactSecrets(toToolErrorResponse(error, "kiwoom")), null, 2)}\n`);
      process.exitCode = 1;
    });
}
