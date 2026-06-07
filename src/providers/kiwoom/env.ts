import { MarketDataProviderError } from "../errors.js";
import type { KiwoomEnvironment } from "./types.js";

export type KiwoomManualEnvironment = "mock" | "production";
export type KiwoomInvestmentEnvironment = "real" | "mock" | "unknown";

export function parseKiwoomEnvironment(value: string | undefined): KiwoomEnvironment {
  const normalized = normalizeEnvToken(value);

  if (normalized === undefined || normalized === "prod" || normalized === "production" || normalized === "real") {
    return "prod";
  }

  if (normalized === "mock") {
    return "mock";
  }

  throw new MarketDataProviderError(
    "INVALID_INPUT",
    "KIWOOM_ENV must be production, prod, real, or mock.",
    "kiwoom",
    false
  );
}

export function parseKiwoomManualEnvironment(value: string | undefined): KiwoomManualEnvironment {
  const normalized = normalizeEnvToken(value);

  if (normalized === "prod" || normalized === "production" || normalized === "real") {
    return "production";
  }

  return "mock";
}

export function parseKiwoomInvestmentEnvironment(value: string | undefined): KiwoomInvestmentEnvironment {
  const normalized = normalizeEnvToken(value);

  if (normalized === "real" || normalized === "production" || normalized === "prod") {
    return "real";
  }

  if (normalized === "mock") {
    return "mock";
  }

  return "unknown";
}

function normalizeEnvToken(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  return value.trim().toLowerCase();
}
