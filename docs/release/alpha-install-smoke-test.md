# Alpha Install Smoke Test

## Purpose

Use this smoke test to verify that a fresh local clone can install, build, test, and run the read-only MCP server without real credentials.

## Fresh Clone

Windows PowerShell:

```powershell
git clone https://github.com/farmbit-mdk/korea-market-data-mcp.git
cd korea-market-data-mcp
npm install
npm run build
npm test
```

## Mock Provider MCP Config Check

Use mock provider first:

```json
{
  "mcpServers": {
    "korea-market-data": {
      "command": "node",
      "args": [
        "C:\\absolute\\path\\to\\korea-market-data-mcp\\dist\\index.js"
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

The command and args must match the built output:

```text
package script: npm run build
build output: dist/index.js
MCP command: node
MCP args: absolute path to dist/index.js
```

## Claude Desktop Check

Use:

```text
examples/claude-desktop.mock.json
docs/getting-started/claude-desktop-setup.md
```

Confirm:

```text
the path to dist/index.js is absolute
mock provider is selected
real API calls are disabled
public quote real path is disabled
Claude Desktop is restarted after config changes
```

## Cursor Check

Use:

```text
examples/cursor.mock.json
docs/getting-started/cursor-setup.md
```

Confirm:

```text
the path to dist/index.js is absolute
mock provider is selected
real API calls are disabled
public quote real path is disabled
Cursor is restarted after config changes
```

## Manual Commands Must Be Blocked By Default

Run:

```powershell
npm run kiwoom:token:manual
npm run kiwoom:quote:manual
```

Expected:

```text
token manual command returns status=blocked
quote manual command returns status=blocked
no real credentials are required
no real network request is needed for the default smoke test
```

## Expected Blocked Cases

These are expected during alpha setup:

```text
KIWOOM_ENABLE_REAL_API_CALLS=false blocks manual token verification
KIWOOM_ENABLE_REAL_API_CALLS=false blocks manual quote verification
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false keeps public real quote lookup disabled
placeholder credentials are not usable for real requests
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
```

## Troubleshooting Links

See:

```text
docs/getting-started/troubleshooting.md
docs/release/distribution-readiness.md
docs/release/alpha-known-limitations.md
docs/providers/provider-status.md
SECURITY.md
examples/README.md
```

## Explicitly Unsupported

This smoke test does not verify or enable:

```text
real Kiwoom quote lookup by default
hosted proxy behavior
centralized data redistribution
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
```
