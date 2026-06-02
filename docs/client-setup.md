# Client Setup

## 1. Purpose

This document explains how to connect `korea-market-data-mcp` to MCP-compatible clients.

The project currently supports a mock provider for local development.

The real Kiwoom provider is not implemented yet.

---

## 2. Current status

Current implementation status:

```text
MCP server skeleton: implemented
Mock provider: implemented
Read-only tools: implemented
Kiwoom provider: not implemented yet
Trading tools: not supported
Account tools: not supported
```

Initial supported tools:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

---

## 3. Requirements

Install:

```text
Node.js
npm
Git
```

Recommended:

```text
Node.js 20 or later
npm 10 or later
```

Check versions:

```bash
node --version
npm --version
git --version
```

---

## 4. Clone the repository

```bash
git clone https://github.com/farmbit-mdk/korea-market-data-mcp.git
cd korea-market-data-mcp
```

---

## 5. Install dependencies

```bash
npm install
```

---

## 6. Configure environment

Copy `.env.example` to `.env`.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux

```bash
cp .env.example .env
```

For local mock provider testing, keep:

```env
MARKET_DATA_PROVIDER=mock
ENABLE_TRADING_TOOLS=false
ENABLE_ACCOUNT_TOOLS=false
ENABLE_ORDER_TOOLS=false
```

Do not enter real Kiwoom credentials unless the Kiwoom provider has been implemented and documented.

---

## 7. Build the project

```bash
npm run build
```

After build, confirm that `dist/index.js` exists.

### Windows PowerShell

```powershell
Test-Path .\dist\index.js
```

### macOS / Linux

```bash
ls dist/index.js
```

---

## 8. Run tests

```bash
npm test
```

Expected result:

```text
all tests passed
```

Tests should not require real provider credentials.

---

## 9. Claude Desktop setup

Build the project first:

```bash
npm run build
```

Then add an MCP server entry to your Claude Desktop MCP configuration.

### Windows example

```json
{
  "mcpServers": {
    "korea-market-data": {
      "command": "node",
      "args": [
        "D:\\korea-market-data-mcp\\korea-market-data-mcp\\dist\\index.js"
      ],
      "env": {
        "MARKET_DATA_PROVIDER": "mock",
        "LOG_LEVEL": "info",
        "CACHE_TTL_SECONDS": "3",
        "ENABLE_TRADING_TOOLS": "false",
        "ENABLE_ACCOUNT_TOOLS": "false",
        "ENABLE_ORDER_TOOLS": "false"
      }
    }
  }
}
```

Adjust the path to match your local repository path.

Important:

```text
Use double backslashes in JSON Windows paths.
```

---

## 10. Example prompts

After connecting the MCP server, test with:

```text
Use korea-market-data MCP to search for Samsung Electronics.
```

```text
Use korea-market-data MCP to get the stock quote for 005930.
```

```text
Use korea-market-data MCP to get the ETF quote for 069500.
```

```text
Use korea-market-data MCP to get the KOSPI market index.
```

```text
Use korea-market-data MCP to get the daily chart for 005930.
```

---

## 11. Expected mock data

The mock provider includes stable sample data for:

```text
005930 Samsung Electronics
069500 KODEX 200
KOSPI
KOSDAQ
KOSPI200
```

The mock provider is intended for local MCP client testing and does not represent live market data.

---

## 12. Cursor setup

Cursor MCP configuration support may vary by version.

Use the same command and arguments as Claude Desktop:

```json
{
  "name": "korea-market-data",
  "command": "node",
  "args": [
    "/absolute/path/to/korea-market-data-mcp/dist/index.js"
  ],
  "env": {
    "MARKET_DATA_PROVIDER": "mock",
    "LOG_LEVEL": "info",
    "CACHE_TTL_SECONDS": "3",
    "ENABLE_TRADING_TOOLS": "false",
    "ENABLE_ACCOUNT_TOOLS": "false",
    "ENABLE_ORDER_TOOLS": "false"
  }
}
```

Use the appropriate MCP configuration location for your Cursor version.

---

## 13. Codex local workflow

For Codex-assisted development, start from the repository root.

Recommended workflow:

```bash
npm install
npm run build
npm test
```

Before requesting code changes from Codex, ask it to read:

```text
README.md
AGENTS.md
ROADMAP.md
SECURITY.md
CONTRIBUTING.md
docs/architecture.md
docs/provider-adapter-spec.md
docs/tool-spec.md
```

Codex should not implement real Kiwoom API integration until the mock provider and MCP client setup are confirmed.

---

## 14. Safety expectations

The server must expose only read-only tools.

Allowed tools:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

Forbidden tools:

```text
buy_stock
sell_stock
place_order
cancel_order
modify_order
get_account_balance
get_deposit
get_holdings
get_order_history
get_trade_history
run_strategy
auto_trade
rebalance_portfolio
recommend_stock
recommend_etf
```

If any forbidden tool appears, treat it as a bug.

---

## 15. Troubleshooting

See:

```text
docs/troubleshooting.md
```

If that file does not exist yet, check:

```text
npm install
npm run build
npm test
```

Then verify that the MCP client points to the correct `dist/index.js` path.

---

## 16. Notes

This project is currently in early development.

The mock provider is available for testing.

The Kiwoom provider will be implemented later.

Do not assume that current mock values are live market data.
