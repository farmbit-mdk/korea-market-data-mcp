# npm Pack Dry Run And Publish Readiness

## Current npm Status

`korea-market-data-mcp` is not published to npm for v0.29.0-alpha.

GitHub clone/local setup remains the primary distribution path.

This document covers package publish readiness only:

```text
npm pack --dry-run review
package metadata review
package contents policy
clean install smoke test plan
publish blockers
publish decision
```

## Dry Run Command

Run:

```powershell
npm run build
npm pack --dry-run
```

The dry run must not publish anything.

## v0.28.0-alpha Dry Run Result

Status:

```text
npm pack --dry-run completed
package: korea-market-data-mcp@0.28.0-alpha
filename: korea-market-data-mcp-0.28.0-alpha.tgz
total files: 114
npm publish: not performed
```

## v0.29.0-alpha Dry Run Result

Status:

```text
npm pack --dry-run completed
package: korea-market-data-mcp@0.29.0-alpha
filename: korea-market-data-mcp-0.29.0-alpha.tgz
total files: 122
npm publish: not performed
```

The dry run includes the v0.29 publish decision, npm access policy, versioning policy, and release checklist documentation.

Observed included content:

```text
.env.example
CHANGELOG.md
LICENSE
README.md
SECURITY.md
dist/**
docs/**
examples/**
package.json
```

Observed excluded content:

```text
tests/**
.env.local
real credentials
private scratch files
local logs
```

## Expected Package Contents

Expected package contents:

```text
package.json
README.md
LICENSE
SECURITY.md
CHANGELOG.md
.env.example
dist/**
docs/**
examples/**
```

`dist/index.js` must be included because the package `bin` entry points to it:

```text
korea-market-data-mcp -> dist/index.js
```

## Files That Must Never Be Included

The package must not include:

```text
.env
.env.local
.env.production
.env.development
real credentials
access tokens
authorization headers
private scratch files
local logs
test output logs
account numbers
order identifiers
balance data
holdings data
trading data
centralized proxy config
```

## Clean Install Smoke Test Plan

Planned clean install verification:

```powershell
npm pack
New-Item -ItemType Directory -Path ..\korea-market-data-mcp-pack-smoke
Set-Location ..\korea-market-data-mcp-pack-smoke
npm init -y
npm install ..\korea-market-data-mcp\korea-market-data-mcp-0.29.0-alpha.tgz
npx korea-market-data-mcp
```

Expected:

```text
package installs
bin entry resolves to dist/index.js
server can start with mock provider environment
no real credentials are required
manual token and quote commands remain blocked by default in the source repo smoke test
```

The full clean install smoke test may be performed separately on a clean machine before npm publish. If not performed, record it as planned / not performed.

## Bin Execution Check Plan

Check:

```text
package.json bin maps korea-market-data-mcp to dist/index.js
dist/index.js exists after npm run build
dist/index.js starts with a node shebang
MCP client examples use node plus absolute path to dist/index.js
```

## MCP Client Config Impact

Package-based MCP client examples were added for local tarball or future official npm package validation in v0.28.0-alpha.

Mock provider remains the recommended first setup path.

Kiwoom real local verification remains explicit opt-in only.

## Publish Blockers

Do not publish until these are complete:

```text
npm pack dry run reviewed
npm pack contents verified
clean install smoke test completed on a clean machine
package name ownership confirmed
release tag and package version policy confirmed
security review completed
no real credentials in package contents
no hosted proxy confusion in docs
```

## Publish Decision

For v0.29.0-alpha:

```text
npm publish was not performed
no hosted proxy was added
GitHub clone/local setup remains primary
npm package remains publish-decision only
official publish is deferred until a separate final publish release
```

## Safety

Real Kiwoom quote lookup remains disabled by default.

Mock provider is the recommended first setup path.

Kiwoom real local verification is explicit opt-in only.

`get_kiwoom_stock_quote` public tool scope is unchanged.
