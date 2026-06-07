# Claude Desktop Setup

## Recommended Path

Start with the npm alpha package and mock provider. It requires no credentials and does not call Kiwoom.

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

For the official alpha package path, use:

```text
examples/claude-desktop.npm-alpha.config.json
```

Example shape:

```json
{
  "mcpServers": {
    "korea-market-data": {
      "command": "npx",
      "args": [
        "-y",
        "korea-market-data-mcp@alpha"
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

Use the alpha tag during the alpha phase even if the npm registry currently has `latest` pointing to an alpha build.

## Local Repo Example

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

Ask Claude Desktop:

```text
List the available MCP tools.
Use korea-market-data MCP to search for Samsung Electronics.
```

Expected:

```text
search_korean_symbol can run
resolver/search fixtures can return known symbols
market data context does not return mock quote/chart/index values
real provider data requires Kiwoom setup and explicit opt-in
```

## Kiwoom Local Verification

Use:

```text
examples/claude-desktop.local-dev.config.json
examples/claude-desktop.kiwoom-local.example.json
```

This example is for advanced local verification only. It uses placeholders and keeps real quote lookup disabled by default.

Real Kiwoom credential environment example:

```json
{
  "MARKET_DATA_PROVIDER": "kiwoom",
  "KIWOOM_ENV": "mock",
  "KIWOOM_INVESTMENT_ENV": "mock",
  "KIWOOM_APP_KEY": "YOUR_KIWOOM_APP_KEY",
  "KIWOOM_SECRET_KEY": "YOUR_KIWOOM_SECRET_KEY",
  "KIWOOM_ENABLE_REAL_API_CALLS": "false",
  "KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH": "false"
}
```

Do not use placeholder values for a real request. Replace placeholders only in your local Claude Desktop config or local shell environment, never in Git.

## Claude Desktop Prompt Checklist

Basic connection:

```text
사용 가능한 MCP 도구 목록을 확인해줘.
korea-market-data MCP로 삼성전자를 검색해줘.
List the available MCP tools.
Use korea-market-data MCP to search for Samsung Electronics.
```

Query resolution:

```text
korea-market-data MCP로 삼전을 resolve해줘.
korea-market-data MCP로 코덱스200을 resolve해줘.
korea-market-data MCP로 코스피와 코스닥 지수를 resolve해줘.
Use korea-market-data MCP to resolve Samsung Electronics.
Use korea-market-data MCP to resolve Samsung.
Use korea-market-data MCP to resolve KODEX 200.
Use korea-market-data MCP to resolve KOSPI and KOSDAQ indices.
```

Data context:

```text
korea-market-data MCP로 삼성전자 데이터 context를 가져와줘.
korea-market-data MCP로 KODEX 200 ETF 데이터 context를 가져와줘.
korea-market-data MCP로 코스피 지수 데이터를 가져와줘.
Use korea-market-data MCP to fetch Samsung Electronics market data context.
Use korea-market-data MCP to fetch KODEX 200 ETF market data context.
Use korea-market-data MCP to fetch KOSPI index data.
```

Real-provider-oriented checks:

```text
korea-market-data MCP의 Kiwoom setup 상태를 확인해줘.
삼성전자 005930의 실제 Kiwoom quote 데이터를 가져와줘.
Check the Kiwoom setup status for korea-market-data MCP.
Fetch real Kiwoom quote data for Samsung Electronics 005930.
```

## Setup Check Interpretation

Run locally before expecting real Kiwoom data:

```powershell
npm run kiwoom:setup:check
```

Expected safe default:

```text
status=blocked
real_api_enabled=false
public_quote_real_path_enabled=false
token or credentials are not printed
```

Common blocked or failed cases:

```text
KIWOOM_ENABLE_REAL_API_CALLS=false: real network calls are disabled.
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false: public quote real path is disabled.
missing credentials: set local-only KIWOOM_APP_KEY and KIWOOM_SECRET_KEY.
placeholder credentials: YOUR_KIWOOM_APP_KEY and YOUR_KIWOOM_SECRET_KEY cannot be used for real requests.
investment environment mismatch: check KIWOOM_INVESTMENT_ENV=real or mock against the issued app key.
provider error: keep the structured error payload; do not replace it with mock data.
```

`get_korean_market_data_context` must not recommend mock fallback for failed real-provider context. It should return `blocked`, `provider_error`, or `unavailable` payload state so Claude can explain what data is missing.

Do not paste real app keys, secret keys, access tokens, raw request bodies, or raw provider responses into Claude config examples, GitHub issues, pull requests, screenshots, or logs.
