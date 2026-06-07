# npm Alpha Publish Result

## Purpose

This document records the official npm alpha publish result for v0.30.0-alpha.

## Publish Date

2026-06-07

## Package

```text
name: korea-market-data-mcp
version: 0.30.0-alpha
dist-tag: alpha
```

## Command Used

```powershell
npm publish --tag alpha
```

The package was published with the `alpha` tag. The npm registry currently also has `latest` pointing to `0.30.0-alpha`; this is not treated as a stable/latest release, and the required documented install path remains `npm install korea-market-data-mcp@alpha`.

## Pre-Publish Verification

Required commands:

```text
npm whoami passed
npm run build passed
npm test passed
npm run kiwoom:token:manual returned blocked by default
npm run kiwoom:quote:manual returned blocked by default
git diff --check passed
npm pack --dry-run passed
npm view korea-market-data-mcp name version --json returned E404 Not Found before publish
```

## Publish Result

Status:

```text
pending until publish command is run
```

Result:

```text
npm publish --tag alpha succeeded
package: korea-market-data-mcp@0.30.0-alpha
```

This is an alpha release. It must not be treated as a stable/latest release.

## Post-Publish Verification

Required commands:

```powershell
npm view korea-market-data-mcp name version dist-tags --json
npm view korea-market-data-mcp@0.30.0-alpha version --json
npm dist-tag ls korea-market-data-mcp
npm install korea-market-data-mcp@alpha
```

Expected:

```text
package name resolves to korea-market-data-mcp
version resolves to 0.30.0-alpha
alpha dist-tag points to 0.30.0-alpha
latest currently points to alpha, but alpha install is still the required documented path
install command succeeds from a clean temporary directory
```

Observed npm view result:

```json
{
  "name": "korea-market-data-mcp",
  "version": "0.30.0-alpha",
  "dist-tags": {
    "alpha": "0.30.0-alpha",
    "latest": "0.30.0-alpha"
  }
}
```

Observed npm dist-tag result:

```text
alpha: 0.30.0-alpha
latest: 0.30.0-alpha
```

`npm dist-tag rm korea-market-data-mcp latest` was attempted after publish, but npm returned `E400 Bad Request`, so the `latest` dist-tag remains present. This does not change the release classification: v0.30.0-alpha is still an alpha release, and the required documented install path remains `npm install korea-market-data-mcp@alpha`.

Observed install result:

```text
npm install korea-market-data-mcp@alpha succeeded
audit: 0 vulnerabilities
```

## Install Command

```powershell
npm install korea-market-data-mcp@alpha
```

## Known Limitations

```text
GitHub clone/local setup remains the safe fallback.
Mock provider remains the recommended first setup path.
latest currently points to alpha, but alpha install is still the required documented path.
v0.30.0-alpha is not a stable/latest release.
Real Kiwoom quote lookup remains disabled by default.
Kiwoom real local verification remains explicit opt-in only.
get_kiwoom_stock_quote public tool scope is unchanged.
No hosted proxy is provided.
```

## Rollback And Unpublish Considerations

npm unpublish should not be treated as the primary rollback strategy.

If a published alpha has a serious issue:

```text
publish a corrected alpha version when practical
deprecate the affected version if needed
update README, SECURITY, CHANGELOG, and release docs
open a security advisory if credentials or supply-chain integrity are affected
do not ask users to share credentials or raw provider responses
```

## Explicitly Excluded

```text
No account access.
No orders.
No balance lookup.
No holdings lookup.
No trading.
No auto-trading.
No investment recommendations.
No centralized data redistribution proxy.
No hosted proxy.
```
