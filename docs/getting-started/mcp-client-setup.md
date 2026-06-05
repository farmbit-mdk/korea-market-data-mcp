# MCP Client Setup

## Concept

MCP clients start a local server command and communicate with it over the Model Context Protocol.

A typical configuration has:

```text
command
args
env
```

For this project, the command usually runs the built `dist/index.js` file with Node.js.

## Build First

Windows PowerShell:

```powershell
npm install
npm run build
npm test
npm start
```

`npm start` runs `node dist/index.js`. MCP clients should use the same built output path with `command: "node"` and `args` pointing to an absolute `dist/index.js` path.

## Recommended Mock Provider Configuration

Use mock provider for first setup:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/korea-market-data-mcp/dist/index.js"],
  "env": {
    "MARKET_DATA_PROVIDER": "mock",
    "KIWOOM_ENABLE_REAL_API_CALLS": "false",
    "KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH": "false"
  }
}
```

## Kiwoom Local Verification Configuration

Kiwoom local verification is advanced and local-only.

It still requires all guards and does not enable public real lookup by default.

```json
{
  "command": "node",
  "args": ["/absolute/path/to/korea-market-data-mcp/dist/index.js"],
  "env": {
    "MARKET_DATA_PROVIDER": "kiwoom",
    "KIWOOM_ENV": "mock",
    "KIWOOM_APP_KEY": "YOUR_KIWOOM_APP_KEY",
    "KIWOOM_SECRET_KEY": "YOUR_KIWOOM_SECRET_KEY",
    "KIWOOM_ENABLE_REAL_API_CALLS": "false",
    "KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH": "false"
  }
}
```

Do not set real Kiwoom credentials in committed config files.

## Config File Locations

Client-specific paths vary.

See:

```text
docs/getting-started/claude-desktop-setup.md
docs/getting-started/cursor-setup.md
```

## Common Mistakes

Avoid:

```text
using a path to src/index.ts instead of dist/index.js without a dev runner
forgetting npm run build
using real credentials in an example file
setting KIWOOM_ENABLE_REAL_API_CALLS=true and assuming public real lookup is enabled
setting KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true and assuming public real lookup is enabled
adding account/order/trading environment variables
```

`KIWOOM_ENABLE_REAL_API_CALLS=true` alone is insufficient. `KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true` alone is also insufficient.
