import type { KiwoomQuoteEndpointMapping } from "./types.js";
import { parseKiwoomEnvironment, parseKiwoomInvestmentEnvironment } from "./env.js";

export const kiwoomQuoteEndpointMappings = {
  quote: {
    enabled: false,
    manualOnly: true,
    readOnly: true,
    requiresToken: true,
    exposesPublicTool: false,
    forbiddenScopes: ["account", "order", "balance", "holdings", "trading"],
    method: "POST",
    path: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_ENDPOINT",
    apiId: "ka10001",
    description: "Stock basic information request. Disabled until endpoint path/header/body are verified against official Kiwoom documentation.",
    verified: false
  },
  dailyChart: {
    enabled: false,
    manualOnly: true,
    readOnly: true,
    requiresToken: true,
    exposesPublicTool: false,
    forbiddenScopes: ["account", "order", "balance", "holdings", "trading"],
    method: "POST",
    path: "TODO_VERIFY_OFFICIAL_KIWOOM_DAILY_CHART_ENDPOINT",
    apiId: "ka10081",
    description: "Stock daily chart request. Enabled only for explicit local Kiwoom market data context verification.",
    verified: false
  }
} as const satisfies Record<string, KiwoomQuoteEndpointMapping>;

export type KiwoomQuoteEndpointKey = keyof typeof kiwoomQuoteEndpointMappings;

export const localKiwoomQuoteEndpointPath = "/api/dostk/stkinfo";
export const localKiwoomDailyChartEndpointPath = "/api/dostk/chart";

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

export function getEffectiveKiwoomQuoteEndpointMapping(
  env: NodeJS.ProcessEnv = process.env,
  mapping: KiwoomQuoteEndpointMapping = kiwoomQuoteEndpointMappings.quote
): KiwoomQuoteEndpointMapping {
  if (!isLocalKiwoomQuoteVerificationEnabled(env)) {
    return mapping;
  }

  return {
    ...mapping,
    enabled: true,
    exposesPublicTool: true,
    manualOnly: true,
    readOnly: true,
    path: localKiwoomQuoteEndpointPath,
    description: "Stock basic information request enabled only for explicit local Kiwoom quote verification.",
    verified: true
  };
}

export function getEffectiveKiwoomDailyChartEndpointMapping(
  env: NodeJS.ProcessEnv = process.env,
  mapping: KiwoomQuoteEndpointMapping = kiwoomQuoteEndpointMappings.dailyChart
): KiwoomQuoteEndpointMapping {
  if (!isLocalKiwoomQuoteVerificationEnabled(env)) {
    return mapping;
  }

  return {
    ...mapping,
    enabled: true,
    exposesPublicTool: true,
    manualOnly: true,
    readOnly: true,
    path: localKiwoomDailyChartEndpointPath,
    description: "Stock daily chart request enabled only for explicit local Kiwoom market data context verification.",
    verified: true
  };
}

export function isLocalKiwoomQuoteVerificationEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const appKey = normalizeEnvValue(env.KIWOOM_APP_KEY);
  const secretKey = normalizeEnvValue(env.KIWOOM_SECRET_KEY) ?? normalizeEnvValue(env.KIWOOM_APP_SECRET);

  return (
    env.KIWOOM_ENABLE_REAL_API_CALLS === "true" &&
    env.KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH === "true" &&
    appKey !== undefined &&
    secretKey !== undefined &&
    !isPlaceholderCredential(env.KIWOOM_APP_KEY) &&
    !isPlaceholderCredential(env.KIWOOM_SECRET_KEY ?? env.KIWOOM_APP_SECRET) &&
    isKiwoomEnvironmentPairAllowed(env)
  );
}

export function isKiwoomEnvironmentPairAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  let providerEnvironment: ReturnType<typeof parseKiwoomEnvironment>;
  try {
    providerEnvironment = parseKiwoomEnvironment(env.KIWOOM_ENV);
  } catch {
    return false;
  }

  const investmentEnvironment = parseKiwoomInvestmentEnvironment(env.KIWOOM_INVESTMENT_ENV);

  return (
    (providerEnvironment === "prod" && investmentEnvironment === "real") ||
    (providerEnvironment === "mock" && investmentEnvironment === "mock")
  );
}

function normalizeEnvValue(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value;
}

function isPlaceholderCredential(value: string | undefined): boolean {
  return value !== undefined && placeholderCredentialValues.has(value.trim().toUpperCase());
}
