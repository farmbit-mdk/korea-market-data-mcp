import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createProvider } from "../providers/provider-registry.js";
import { registerTools } from "./register-tools.js";

export interface CreateServerOptions {
  providerId?: string;
  name?: string;
  version?: string;
}

export function createServer(options: CreateServerOptions = {}): McpServer {
  const server = new McpServer({
    name: options.name ?? "korea-market-data-mcp",
    version: options.version ?? "0.36.0-alpha"
  });
  const provider = createProvider(options.providerId ?? "mock");

  registerTools(server, provider);

  return server;
}
