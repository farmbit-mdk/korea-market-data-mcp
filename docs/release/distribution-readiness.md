# Distribution Readiness

## Current Distribution Status

`korea-market-data-mcp` is prepared for package and distribution readiness review, but this release does not publish the package to npm.

Current supported setup path:

```text
GitHub clone
npm install
npm run build
npm test
local MCP client command using node dist/index.js
```

Package metadata is aligned for a future npm package:

```text
name: korea-market-data-mcp
version: 0.27.0-alpha
type: module
main: dist/index.js
bin: korea-market-data-mcp -> dist/index.js
files: dist, docs, examples, .env.example, CHANGELOG.md, README.md, SECURITY.md, LICENSE
```

## GitHub Clone Setup

Use this path for alpha users:

```powershell
git clone https://github.com/farmbit-mdk/korea-market-data-mcp.git
cd korea-market-data-mcp
npm install
npm run build
npm test
npm start
```

For MCP clients, use `node` plus the absolute path to `dist/index.js`.

## MCP Client Local Command Setup

Recommended command shape:

```json
{
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
```

Use mock provider first. It requires no credentials and does not make Kiwoom provider calls.

## npm Package Readiness Status

This project is npm-ready in package metadata only. `npm publish` has not been performed for this release.

When npm publishing is considered, verify:

```text
package version matches the release tag
package-lock root version matches package.json
npm pack contents include dist, docs, examples, README, SECURITY, CHANGELOG, LICENSE, and .env.example
bin resolves to dist/index.js
README install and MCP client commands still match package.json
manual verification commands remain local-only and blocked by default
```

## Release Artifact Policy

Release artifacts should not contain:

```text
real credentials
local .env files
raw provider responses
access tokens
screenshots containing secrets
account/order/balance/holdings/trading data
```

## Version And Tag Consistency

For v0.27.0-alpha readiness:

```text
package.json version: 0.27.0-alpha
package-lock.json root version: 0.27.0-alpha
recommended release tag: v0.27.0-alpha
```

## npm Publish Decision

For v0.27.0-alpha, npm publish was not performed.

GitHub clone/local setup remains the primary distribution path.

Official distribution channels for this alpha:

```text
GitHub source repository
GitHub release artifacts if explicitly published by the maintainer
```

Do not trust unofficial npm packages or hosted MCP proxies claiming to be this project.

## npm Pack Dry Run Status

`npm pack --dry-run` is the required publish-readiness check for this release.

The dry run must verify:

```text
dist files are included
README is included
LICENSE is included
package.json is included
docs are included
examples are included
tests are not required in the package
.env.local is not included
real credentials are not included
private scratch or log files are not included
```

## Package Contents Policy

Allowed package contents:

```text
dist
docs
examples
.env.example
CHANGELOG.md
README.md
SECURITY.md
LICENSE
package.json
```

Forbidden package contents:

```text
.env.local
real credentials
access tokens
authorization headers
private scratch files
local logs
account numbers
order identifiers
balance data
holdings data
trading data
centralized proxy config
```

npm publish requires a separate readiness review after:

```text
package bin entry final verification
clean package contents via npm pack dry run
license/readme/files field verification
versioning policy review
install smoke test on a clean machine
security review
confirmation that no real credentials are packaged
confirmation that users will not confuse the package with a hosted proxy
```

## Install Smoke Test Checklist

Before distributing a release candidate, run:

```powershell
npm install
npm run build
npm test
npm run kiwoom:token:manual
npm run kiwoom:quote:manual
git diff --check
```

Expected manual command behavior with default environment:

```text
token manual command: blocked
quote manual command: blocked
real credentials: not required
real Kiwoom quote lookup: disabled by default
```

## Unsupported Distribution Modes

This release does not provide:

```text
npm-published package
hosted MCP server
centralized credential proxy
centralized market data redistribution proxy
Docker image
binary installer
managed cloud deployment
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
```
