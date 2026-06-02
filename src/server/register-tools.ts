import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MarketDataProvider } from "../providers/types.js";
import { validateRegisteredTools } from "../safety/read-only-tools.js";
import { validateToolCategory } from "../safety/validate-tool-category.js";
import { toolDefinitions } from "../tools/index.js";

export function registerTools(server: McpServer, provider: MarketDataProvider): void {
  validateRegisteredTools(toolDefinitions.map((tool) => tool.name));

  for (const tool of toolDefinitions) {
    validateToolCategory(tool.name);
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema
      },
      async (input) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(await tool.handler(input, { provider }), null, 2)
          }
        ]
      })
    );
  }
}
