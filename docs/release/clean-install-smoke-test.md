# Clean Install Smoke Test

## Purpose

This document records the v0.28.0-alpha clean install smoke test for the package tarball.

The goal is to verify that a package produced from this repository can be installed in a clean temporary directory, that the package bin/start entry points are usable, and that the default safety posture remains blocked without real Kiwoom credentials.

`npm publish` was not performed.

No hosted proxy was added.

## Test Environment

Environment:

```text
Windows PowerShell
Node.js and npm from the local development machine
temporary directory outside the repository
package tarball produced by npm pack
real Kiwoom credentials not used
```

## Test Steps

Recommended steps:

```powershell
npm run build
npm pack
$smokeRoot = Join-Path $env:TEMP "korea-market-data-mcp-clean-install-smoke"
Remove-Item -Recurse -Force $smokeRoot -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $smokeRoot
Set-Location $smokeRoot
npm init -y
npm install "<path-to-korea-market-data-mcp-0.28.0-alpha.tgz>"
npx korea-market-data-mcp
```

For non-interactive verification, start the package command briefly, confirm it stays alive without immediate startup failure, then stop it.

## v0.28.0-alpha Result

Status:

```text
clean temp directory install performed
tarball install passed
package bin startup check passed
package start entry point check passed
mock provider startup check passed
manual token default blocked verified in source repo
manual quote default blocked verified in source repo
package-based MCP client config reviewed
npm publish was not performed
```

## Tarball Install Result

The package tarball installed in a temporary npm project without requiring real credentials.

The installed package contained:

```text
dist/index.js
package.json
README.md
SECURITY.md
CHANGELOG.md
LICENSE
docs
examples
.env.example
```

## Bin And Start Execution Result

Verified:

```text
npx korea-market-data-mcp resolves the package bin
package bin points to dist/index.js
dist/index.js starts with a node shebang
node node_modules/korea-market-data-mcp/dist/index.js can start
server startup does not require real credentials with mock provider defaults
```

The MCP server is stdio-based and normally remains running while waiting for MCP client input. For smoke testing, this is treated as successful startup when the process starts without immediate failure and is then stopped by the test harness.

## Mock Provider Startup Result

Mock provider remains the default startup path:

```text
MARKET_DATA_PROVIDER=mock
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

Real Kiwoom quote lookup remains disabled by default.

## Manual Command Blocked Result

Source repo manual commands remain blocked by default:

```text
npm run kiwoom:token:manual -> status=blocked
npm run kiwoom:quote:manual -> status=blocked
```

The published package tarball is intended to run the MCP server. Manual verification scripts remain source-repo validation commands unless a future release explicitly packages additional CLI commands.

## Package-Based MCP Client Config Review

Package-based examples were added for local tarball or future official npm package validation:

```text
examples/claude-desktop.package.example.json
examples/cursor.package.example.json
```

Important:

```text
official npm package is not published yet
package-based examples are for local tarball or future npm package validation
use GitHub clone setup for the current alpha unless testing package installation
```

## Troubleshooting

If clean install fails:

```text
run npm run build before npm pack
confirm dist/index.js exists
confirm package bin maps to dist/index.js
confirm the tarball path is absolute or correct relative to the smoke directory
confirm Node.js 20 or newer is installed
confirm no real credentials are required for mock provider startup
```

## npm Publish Decision

For v0.28.0-alpha:

```text
npm publish was not performed
GitHub clone/local setup remains primary
package-based setup remains alpha/testing only
hosted proxy was not added
```

## Explicitly Unsupported

```text
No account access.
No orders.
No balance lookup.
No holdings lookup.
No trading.
No auto-trading.
No investment recommendations.
No centralized data redistribution proxy.
```
