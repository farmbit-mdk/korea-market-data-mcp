import { kiwoomQuoteEndpointMappings } from "./quote-endpoints.js";

export interface KiwoomSetupCheckResult {
  status: "ready" | "blocked" | "error";
  provider: "kiwoom";
  real_api_enabled: boolean;
  public_quote_real_path_enabled: boolean;
  credentials_present: boolean;
  placeholder_credentials: boolean;
  provider_environment: "kiwoom";
  kiwoom_investment_environment: "real" | "mock" | "unknown";
  investment_environment: "real" | "mock" | "unknown";
  quote_real_path_ready: boolean;
  blocked_reasons: string[];
  next_step: string;
}

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

export function checkKiwoomSetup(env: NodeJS.ProcessEnv = process.env): KiwoomSetupCheckResult {
  const realApiEnabled = env.KIWOOM_ENABLE_REAL_API_CALLS === "true";
  const publicQuoteRealPathEnabled = env.KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH === "true";
  const rawAppKey = env.KIWOOM_APP_KEY;
  const rawSecretKey = env.KIWOOM_SECRET_KEY ?? env.KIWOOM_APP_SECRET;
  const appKey = normalizeEnvValue(rawAppKey);
  const secretKey = normalizeEnvValue(rawSecretKey);
  const credentialsPresent = appKey !== undefined && secretKey !== undefined;
  const placeholderCredentials = isPlaceholderCredential(rawAppKey) || isPlaceholderCredential(rawSecretKey);
  const investmentEnvironment = parseInvestmentEnvironment(env.KIWOOM_INVESTMENT_ENV ?? env.KIWOOM_ENV);
  const mapping = kiwoomQuoteEndpointMappings.quote;
  const blockedReasons: string[] = [];

  if (!realApiEnabled) {
    blockedReasons.push("KIWOOM_ENABLE_REAL_API_CALLS must be true.");
  }

  if (!publicQuoteRealPathEnabled) {
    blockedReasons.push("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH must be true.");
  }

  if (!credentialsPresent) {
    blockedReasons.push("KIWOOM_APP_KEY and KIWOOM_SECRET_KEY must be present.");
  }

  if (placeholderCredentials) {
    blockedReasons.push("Placeholder credentials cannot be used.");
  }

  if (investmentEnvironment === "unknown") {
    blockedReasons.push("KIWOOM_INVESTMENT_ENV should be real or mock.");
  }

  if (!mapping.enabled || !mapping.readOnly || !mapping.manualOnly) {
    blockedReasons.push("Kiwoom quote endpoint mapping is not enabled for local/manual verification.");
  }

  const quoteRealPathReady = blockedReasons.length === 0;

  return {
    status: quoteRealPathReady ? "ready" : "blocked",
    provider: "kiwoom",
    real_api_enabled: realApiEnabled,
    public_quote_real_path_enabled: publicQuoteRealPathEnabled,
    credentials_present: credentialsPresent,
    placeholder_credentials: placeholderCredentials,
    provider_environment: "kiwoom",
    kiwoom_investment_environment: investmentEnvironment,
    investment_environment: investmentEnvironment,
    quote_real_path_ready: quoteRealPathReady,
    blocked_reasons: blockedReasons,
    next_step: quoteRealPathReady ? "Run npm run kiwoom:token:manual" : "Set required Kiwoom environment variables, then run npm run kiwoom:setup:check again."
  };
}

function parseInvestmentEnvironment(value: string | undefined): "real" | "mock" | "unknown" {
  if (value === "real" || value === "production" || value === "prod") {
    return "real";
  }

  if (value === "mock") {
    return "mock";
  }

  return "unknown";
}

function normalizeEnvValue(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value;
}

function isPlaceholderCredential(value: string | undefined): boolean {
  return value !== undefined && placeholderCredentialValues.has(value.trim().toUpperCase());
}
