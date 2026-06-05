# Quickstart

## What This Project Is

`korea-market-data-mcp` is a read-only Model Context Protocol server for Korean market data workflows.

It is designed for local MCP clients such as Claude Desktop, Cursor, and other MCP-compatible tools.

## Current Scope

Currently supported for normal setup:

```text
mock provider
read-only MCP tools
local development and client integration testing
safe blocked/error/ok response shape checks
```

Not supported:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

Real Kiwoom quote lookup is disabled by default.

## Prerequisites

Install:

```text
Node.js 20 or newer
npm
an MCP client such as Claude Desktop or Cursor
```

## Install

Windows PowerShell:

```powershell
git clone https://github.com/farmbit-mdk/korea-market-data-mcp.git
cd korea-market-data-mcp
npm install
npm run build
npm test
```

## Start With Mock Provider

Use mock provider first. It requires no credentials and does not make real network calls.

PowerShell:

```powershell
$env:MARKET_DATA_PROVIDER = "mock"
$env:KIWOOM_ENABLE_REAL_API_CALLS = "false"
$env:KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH = "false"
npm run build
```

Use the MCP client examples in:

```text
examples/claude-desktop.mock.json
examples/cursor.mock.json
examples/env.mock.example
```

## Verify The Server

After configuring your MCP client, ask for fixed mock data:

```text
Use korea-market-data MCP to get the stock quote for 005930.
```

Expected behavior:

```text
the MCP client discovers the server
the mock provider returns sample Samsung Electronics data
the response is clearly mock data
the response is not live market data
```

## Kiwoom Local Verification

Kiwoom local verification is advanced and explicit opt-in only.

Real Kiwoom quote lookup remains disabled by default:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

See:

```text
docs/providers/kiwoom-public-quote-local-verification.md
docs/providers/kiwoom-real-quote-endpoint-activation-review.md
```

Do not paste real credentials into docs, examples, issues, pull requests, logs, or screenshots.
