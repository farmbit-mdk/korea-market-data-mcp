#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server/create-server.js";
import { loadRuntimeConfig } from "./utils/env.js";
import { createLogger } from "./utils/logger.js";

async function main(): Promise<void> {
  const config = loadRuntimeConfig();
  const logger = createLogger(config.logLevel);
  const server = createServer({
    providerId: config.provider,
    name: config.serverName,
    version: config.serverVersion
  });

  logger.info("Starting MCP server.", {
    provider: config.provider,
    serverName: config.serverName,
    serverVersion: config.serverVersion
  });

  await server.connect(new StdioServerTransport());
}

main().catch((error: unknown) => {
  const logger = createLogger(process.env.LOG_LEVEL);
  logger.error("MCP server failed to start.", {
    message: error instanceof Error ? error.message : "Unknown error"
  });
  process.exitCode = 1;
});
