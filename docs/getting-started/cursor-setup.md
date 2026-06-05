# Cursor Setup

## Recommended Path

Start with mock provider.

Mock provider:

```text
requires no credentials
does not call Kiwoom
is safest for first MCP setup
```

## Cursor MCP Configuration

Cursor MCP configuration can be workspace-specific or global depending on your Cursor version and settings.

Use the Cursor MCP settings UI or an MCP JSON configuration file when available.

## Mock Provider Example

Use:

```text
examples/cursor.mock.json
```

Example shape:

```json
{
  "mcpServers": {
    "korea-market-data": {
      "command": "node",
      "args": [
        "/absolute/path/to/korea-market-data-mcp/dist/index.js"
      ],
      "env": {
        "MARKET_DATA_PROVIDER": "mock",
        "KIWOOM_ENABLE_REAL_API_CALLS": "false",
        "KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH": "false"
      }
    }
  }
}
```

## Local Command

Before connecting Cursor:

```powershell
npm install
npm run build
npm test
```

## Kiwoom Local Verification

Use:

```text
examples/cursor.kiwoom-local.example.json
```

This file is advanced/local verification only. It does not enable public real quote lookup by default.

## Troubleshooting

If Cursor does not show the server:

```text
confirm the dist/index.js path is absolute
confirm npm run build succeeded
restart Cursor
use mock provider first
check JSON commas and braces
do not use real credentials in committed config files
```
