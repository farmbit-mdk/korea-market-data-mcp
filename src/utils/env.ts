export type MarketDataProviderId = "mock";

export interface RuntimeConfig {
  provider: MarketDataProviderId;
  serverName: string;
  serverVersion: string;
  logLevel: string;
}

export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const provider = env.MARKET_DATA_PROVIDER ?? "mock";

  if (provider !== "mock") {
    throw new Error(`Unsupported MARKET_DATA_PROVIDER: ${provider}. Only mock is implemented.`);
  }

  return {
    provider,
    serverName: env.MCP_SERVER_NAME ?? "korea-market-data-mcp",
    serverVersion: env.MCP_SERVER_VERSION ?? "0.1.0",
    logLevel: env.LOG_LEVEL ?? "info"
  };
}
