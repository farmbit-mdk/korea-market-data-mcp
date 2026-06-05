# Claude Desktop Setup

## Recommended Path

Start with mock provider. It requires no credentials and does not call Kiwoom.

## Windows Config Path

Claude Desktop config is commonly located at:

```text
%APPDATA%\Claude\claude_desktop_config.json
```

PowerShell helper:

```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

## Mock Provider Example

Use:

```text
examples/claude-desktop.mock.json
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

Replace `/absolute/path/to/korea-market-data-mcp` with your local path.

## Restart Claude Desktop

After editing config:

```text
quit Claude Desktop
start Claude Desktop again
confirm the korea-market-data MCP tools are visible
```

## Tool Check

Ask:

```text
Use korea-market-data MCP to search for Samsung Electronics.
```

Expected:

```text
search_korean_symbol can run
mock provider returns fixed sample data
responses are read-only market data
```

## Kiwoom Local Verification

Use:

```text
examples/claude-desktop.kiwoom-local.example.json
```

This example is for advanced local verification only. It uses placeholders and keeps real quote lookup disabled by default.

Do not paste real app keys, secret keys, access tokens, raw request bodies, or raw provider responses into Claude config examples, GitHub issues, pull requests, screenshots, or logs.
