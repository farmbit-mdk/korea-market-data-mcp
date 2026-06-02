# Troubleshooting

## 1. Purpose

This document lists common setup and runtime issues for `korea-market-data-mcp`.

The project is currently in early development and uses the mock provider by default.

The real Kiwoom provider is not implemented yet.

---

## 2. Quick health check

Run these commands from the repository root:

```bash
npm install
npm run build
npm test
```

Expected result:

```text
npm run build succeeds
npm test succeeds
all tests pass
```

If these commands fail, fix local project setup before connecting an MCP client.

---

## 3. Node.js is not installed

### Symptom

```text
node is not recognized
npm is not recognized
```

### Cause

Node.js is not installed or not available in PATH.

### Fix

Install Node.js and restart the terminal.

Check:

```bash
node --version
npm --version
```

Recommended:

```text
Node.js 20 or later
npm 10 or later
```

---

## 4. Dependencies are not installed

### Symptom

```text
Cannot find module
node_modules not found
```

### Cause

Dependencies have not been installed.

### Fix

```bash
npm install
```

Then run:

```bash
npm run build
npm test
```

---

## 5. Build fails

### Symptom

```text
npm run build
```

fails with TypeScript errors.

### Fix

Run:

```bash
npm test
```

Then inspect the first TypeScript or test failure.

Common causes:

```text
missing dependency
invalid TypeScript import
incorrect file path
schema/type mismatch
```

Do not connect an MCP client until the build passes.

---

## 6. Tests fail

### Symptom

```text
npm test
```

fails.

### Fix

Check which test failed.

Important test categories:

```text
tool registry
read-only safety
mock provider
normalized response
secret redaction
```

If a read-only safety test fails, check that no forbidden tool was added.

Forbidden tools include:

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

---

## 7. MCP client cannot find the server

### Symptom

The MCP client does not show `korea-market-data`.

### Common causes

```text
wrong path to dist/index.js
project was not built
node command not available
invalid JSON config
MCP client was not restarted
```

### Fix

First build:

```bash
npm run build
```

Then confirm the entry point exists.

### Windows PowerShell

```powershell
Test-Path .\dist\index.js
```

### macOS / Linux

```bash
ls dist/index.js
```

Then verify your MCP client config points to the correct absolute path.

---

## 8. Windows path issue

### Symptom

Claude Desktop or another MCP client cannot start the server on Windows.

### Cause

Windows path was written with single backslashes in JSON.

Incorrect:

```json
{
  "args": [
    "D:\korea-market-data-mcp\korea-market-data-mcp\dist\index.js"
  ]
}
```

Correct:

```json
{
  "args": [
    "D:\\korea-market-data-mcp\\korea-market-data-mcp\\dist\\index.js"
  ]
}
```

JSON requires escaped backslashes.

---

## 9. MCP client starts but tools do not appear

### Possible causes

```text
server failed during startup
invalid MCP config
wrong command path
wrong dist path
tool registration failed
client needs restart
```

### Fix

Run locally first:

```bash
node dist/index.js
```

Then check MCP client logs.

If available, restart the MCP client completely.

---

## 10. Mock provider returns fixed values

### Symptom

The quote data does not change.

### Cause

The mock provider uses stable sample data.

This is expected.

The mock provider is not live market data.

It is used for:

```text
local MCP testing
tool schema testing
client connection testing
read-only safety testing
```

---

## 11. Kiwoom provider does not work

### Symptom

Kiwoom-related provider access does not work.

### Cause

The real Kiwoom provider is not implemented yet.

Current supported provider:

```text
mock
```

Expected environment setting:

```env
MARKET_DATA_PROVIDER=mock
```

Do not expect live Kiwoom data until the Kiwoom provider adapter is implemented and documented.

---

## 12. Missing Kiwoom credentials

### Symptom

Provider authentication error when trying to use Kiwoom.

### Cause

Kiwoom provider is not yet implemented. If implemented later, credentials will be required.

Expected future variables:

```env
KIWOOM_APP_KEY=
KIWOOM_APP_SECRET=
KIWOOM_ENV=prod
KIWOOM_API_BASE_URL=https://api.kiwoom.com
KIWOOM_MOCK_API_BASE_URL=https://mockapi.kiwoom.com
```

Do not commit real credentials.

---

## 13. Secret appears in logs

### Symptom

A provider key, secret, or token appears in logs.

### Severity

High.

### Fix

1. stop using the exposed credential
2. rotate the credential
3. remove the secret from logs
4. add or update redaction tests
5. verify `npm test` passes

Secrets must not appear in logs, errors, tests, GitHub issues, or MCP responses.

---

## 14. A forbidden tool appears

### Symptom

A tool such as `buy_stock` or `get_account_balance` appears.

### Severity

High.

### Fix

Remove the tool immediately.

Then run:

```bash
npm test
```

The read-only safety test should prevent forbidden tools from being registered.

---

## 15. Git line ending warnings

### Symptom

On Windows, Git prints:

```text
LF will be replaced by CRLF
```

### Cause

Git line ending normalization.

### Fix

This repository includes `.gitattributes` to normalize line endings.

If warnings continue, run:

```bash
git status
```

Then avoid unnecessary line ending-only commits.

---

## 16. npm audit issue

### Symptom

```bash
npm audit
```

reports vulnerabilities.

### Fix

Run:

```bash
npm audit
```

Inspect the affected dependency.

Do not blindly run `npm audit fix --force` if it upgrades major versions or breaks the MCP server.

Prefer small dependency updates with tests.

---

## 17. Invalid JSON in MCP config

### Symptom

MCP client fails to load the server configuration.

### Cause

Invalid JSON syntax.

Common mistakes:

```text
trailing comma
single quotes
unescaped Windows backslash
missing bracket
wrong nesting under mcpServers
```

### Fix

Validate the JSON before restarting the client.

---

## 18. Useful diagnostic commands

From the project root:

```bash
git status
npm install
npm run build
npm test
node dist/index.js
```

For environment checking:

```bash
node --version
npm --version
```

---

## 19. When opening an issue

Include:

```text
OS
Node.js version
npm version
MCP client name
command used
error message
steps to reproduce
```

Do not include:

```text
API keys
secret keys
access tokens
authorization headers
.env content
```

---

## 20. Current known limitation

Current limitations:

```text
mock provider only
no live Kiwoom API integration yet
no realtime data
no websocket stream
no account tools
no trading tools
no dashboard UI
```

These limitations are intentional for the initial development stage.
