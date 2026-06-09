import { fileURLToPath } from "node:url";
import { toToolErrorResponse } from "../src/providers/errors.js";
import { parseKiwoomManualEnvironment } from "../src/providers/kiwoom/env.js";
import { createKiwoomIndexClient, kiwoomMarketIndexMappings, normalizeKiwoomMarketIndexCode } from "../src/providers/kiwoom/index-client.js";
import { getEffectiveKiwoomMarketIndexEndpointMapping } from "../src/providers/kiwoom/quote-endpoints.js";
import { createKiwoomTokenClient } from "../src/providers/kiwoom/token-client.js";
import type {
  KiwoomAuthConfig,
  KiwoomMarketIndexCode,
  KiwoomMarketIndexTransport,
  KiwoomQuoteEndpointMapping,
  KiwoomTokenTransport,
  NormalizedKiwoomMarketIndex
} from "../src/providers/kiwoom/types.js";
import { redactSecrets } from "../src/safety/redact-secret.js";

export interface ManualKiwoomIndexSummary {
  status: "blocked" | "ok" | "error";
  provider: "kiwoom";
  feature: "market_index_real_path";
  environment: "mock" | "production";
  indices_present: boolean;
  requests?: ManualKiwoomIndexRequestSummary[];
  indices?: NormalizedKiwoomMarketIndex[];
  reason_code?: ManualKiwoomIndexBlockedReasonCode;
  reason?: string;
  error?: unknown;
}

export interface ManualKiwoomIndexRequestSummary {
  public_index_code: KiwoomMarketIndexCode;
  source_tr: string;
  endpoint: string;
  request_body: {
    mrkt_tp: string;
    inds_cd: string;
  };
}

export type ManualKiwoomIndexBlockedReasonCode =
  | "REAL_API_CALLS_DISABLED"
  | "ENDPOINT_DISABLED"
  | "CREDENTIALS_MISSING"
  | "CREDENTIALS_PLACEHOLDER"
  | "TOKEN_REQUEST_BLOCKED"
  | "UNSUPPORTED_MARKET_INDEX";

interface ManualKiwoomIndexEnv {
  KIWOOM_ENABLE_REAL_API_CALLS?: string;
  KIWOOM_APP_KEY?: string;
  KIWOOM_SECRET_KEY?: string;
  KIWOOM_APP_SECRET?: string;
  KIWOOM_ENV?: string;
  KIWOOM_API_BASE_URL?: string;
  KIWOOM_MOCK_API_BASE_URL?: string;
}

interface ManualKiwoomIndexDependencies {
  tokenTransport?: KiwoomTokenTransport;
  indexTransport?: KiwoomMarketIndexTransport;
  indexEndpointMapping?: KiwoomQuoteEndpointMapping;
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

export async function runManualKiwoomIndexVerification(
  env: ManualKiwoomIndexEnv = process.env,
  dependencies: ManualKiwoomIndexDependencies = {}
): Promise<ManualKiwoomIndexSummary> {
  const environment = parseKiwoomManualEnvironment(env.KIWOOM_ENV);
  const rawIndexInputs = dependencies.argv?.length === 0 || dependencies.argv === undefined ? ["KOSPI", "KOSDAQ", "KOSPI200"] : dependencies.argv;
  const indexCodes = normalizeIndexInputs(rawIndexInputs);
  const rawAppKey = env.KIWOOM_APP_KEY;
  const rawSecretKey = env.KIWOOM_SECRET_KEY ?? env.KIWOOM_APP_SECRET;
  const appKey = normalizeEnvValue(env.KIWOOM_APP_KEY);
  const secretKey = normalizeEnvValue(env.KIWOOM_SECRET_KEY) ?? normalizeEnvValue(env.KIWOOM_APP_SECRET);
  const indexEndpointMapping = dependencies.indexEndpointMapping ?? getEffectiveKiwoomMarketIndexEndpointMapping(env as NodeJS.ProcessEnv);

  if (indexCodes === undefined) {
    return blocked(environment, "UNSUPPORTED_MARKET_INDEX", "Supported Kiwoom market indices are KOSPI, KOSDAQ, and KOSPI200.");
  }

  const requestSummaries = buildRequestSummaries(indexCodes, indexEndpointMapping);

  if (env.KIWOOM_ENABLE_REAL_API_CALLS !== "true") {
    return blocked(environment, "REAL_API_CALLS_DISABLED", "KIWOOM_ENABLE_REAL_API_CALLS must be set to true for manual index verification.", requestSummaries);
  }

  if (isPlaceholderCredential(rawAppKey) || isPlaceholderCredential(rawSecretKey)) {
    return blocked(environment, "CREDENTIALS_PLACEHOLDER", "Placeholder credentials cannot be used for manual index verification.", requestSummaries);
  }

  if (appKey === undefined || secretKey === undefined) {
    return blocked(environment, "CREDENTIALS_MISSING", "KIWOOM_APP_KEY and KIWOOM_SECRET_KEY are required for manual index verification.", requestSummaries);
  }

  if (!indexEndpointMapping.enabled || !indexEndpointMapping.manualOnly || !indexEndpointMapping.readOnly) {
    return blocked(environment, "ENDPOINT_DISABLED", "Kiwoom market index endpoint mapping is disabled for manual verification.", requestSummaries);
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
      return blocked(environment, "TOKEN_REQUEST_BLOCKED", "A token must be present before manual index verification.", requestSummaries);
    }

    const client = createKiwoomIndexClient({
      baseUrl,
      indexEndpointPath: indexEndpointMapping.path,
      accessToken: token.accessToken,
      apiId: indexEndpointMapping.apiId,
      transport: dependencies.indexTransport
    });
    const indices = [];

    for (const indexCode of indexCodes) {
      indices.push(await client.getMarketIndex({ indexCode }));
    }

    return {
      status: "ok",
      provider: "kiwoom",
      feature: "market_index_real_path",
      environment,
      indices_present: indices.length > 0,
      requests: requestSummaries,
      indices
    };
  } catch (error) {
    return {
      status: "error",
      provider: "kiwoom",
      feature: "market_index_real_path",
      environment,
      indices_present: false,
      requests: requestSummaries,
      error: redactSecrets(toToolErrorResponse(error, "kiwoom").error)
    };
  }
}

function buildRequestSummaries(
  indexCodes: KiwoomMarketIndexCode[],
  mapping: KiwoomQuoteEndpointMapping
): ManualKiwoomIndexRequestSummary[] {
  return indexCodes.map((indexCode) => {
    const indexMapping = kiwoomMarketIndexMappings[indexCode];
    return {
      public_index_code: indexMapping.publicIndexCode,
      source_tr: mapping.apiId,
      endpoint: mapping.path,
      request_body: {
        mrkt_tp: indexMapping.kiwoomMarketType,
        inds_cd: indexMapping.kiwoomSectorCode
      }
    };
  });
}

function normalizeIndexInputs(values: string[]): KiwoomMarketIndexCode[] | undefined {
  const normalized = [];

  for (const value of values) {
    const code = normalizeKiwoomMarketIndexCode(value);
    if (code === undefined) {
      return undefined;
    }
    normalized.push(code);
  }

  return [...new Set(normalized)];
}

function blocked(
  environment: "mock" | "production",
  reasonCode: ManualKiwoomIndexBlockedReasonCode,
  reason: string,
  requests?: ManualKiwoomIndexRequestSummary[]
): ManualKiwoomIndexSummary {
  return {
    status: "blocked",
    provider: "kiwoom",
    feature: "market_index_real_path",
    environment,
    indices_present: false,
    requests,
    reason_code: reasonCode,
    reason
  };
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
  runManualKiwoomIndexVerification(process.env, { argv: process.argv.slice(2) })
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
