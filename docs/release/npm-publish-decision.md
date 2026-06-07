# npm Publish Decision

## Decision Title

Official npm Publish Decision for `korea-market-data-mcp`.

## Decision Date

2026-06-07

## Current Decision

```text
defer publish
```

`npm publish` was not performed for v0.29.0-alpha.

## Recommended Decision

Defer actual npm publish until a separate final publish release.

The project is close to publish-ready from a package metadata and tarball perspective, but the official publish decision still requires final confirmation of package ownership, npm account access, two-factor authentication, provenance policy, dist-tag policy, and maintainer handoff expectations.

## Rationale

GitHub clone/local setup remains the primary distribution path for the current alpha.

Mock provider setup remains the recommended first path because it requires no credentials and performs no Kiwoom provider calls.

Kiwoom real local verification remains explicit opt-in only. Real Kiwoom quote lookup remains disabled by default:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

The `get_kiwoom_stock_quote` public tool scope is unchanged.

Publishing to npm would make the package easier to install, but it also increases supply-chain and package impersonation risk. The project should not publish until the owner, access, 2FA, provenance, and version tagging policies are explicitly accepted by the final decision owner.

## Completed Readiness Checks

Completed before this decision record:

```text
package metadata reviewed
repository, homepage, bugs URL, license, keywords reviewed
npm pack dry run documented
package contents policy documented
clean install smoke test documented
package-based MCP client examples documented for alpha/testing only
manual token command blocked by default
manual quote command blocked by default
mock provider startup remains default
no hosted proxy added
no npm publish performed
```

## Package Name Availability

Package name:

```text
korea-market-data-mcp
```

Registry check performed:

```powershell
npm view korea-market-data-mcp name version --json
```

Observed result on 2026-06-07:

```text
E404 Not Found from https://registry.npmjs.org/korea-market-data-mcp
```

Interpretation:

```text
package name not found in npm registry at the time of the check
```

This is not a package reservation and not approval to publish. Availability must be rechecked immediately before any future publish release.

## Scope Decision

Unscoped package:

```text
korea-market-data-mcp
```

Current recommendation:

```text
continue preparing the unscoped package name, but do not publish in v0.29.0-alpha
```

Scoped package fallback:

```text
not selected for this release
```

If the unscoped name becomes unavailable, a future publish release should consider a maintainer-owned npm scope.

## Package Impersonation Risk

Users must not trust similarly named packages or hosted MCP proxies claiming to be this project.

Official distribution remains:

```text
GitHub source repository
maintainer-provided GitHub release artifacts, if explicitly published
```

The official npm package is not published yet.

## Remaining Blockers

Publish is blocked until the following are completed:

```text
npm package ownership confirmed
npm account owner confirmed
2FA requirement confirmed
publish access control confirmed
token usage policy confirmed
manual versus CI publish path decided
provenance policy decided
dist-tag policy confirmed
final release checklist approved
package name availability rechecked immediately before publish
final decision owner approves actual publish
```

## Required Conditions Before Publish

Before any future npm publish:

```text
package.json version matches the release tag
package-lock root version matches package.json
npm pack --dry-run passes
clean install smoke test passes
no real credentials are included
no .env.local or local credential files are included
manual commands remain blocked by default
real Kiwoom quote lookup remains disabled by default
hosted proxy is not introduced
README and SECURITY say official npm publication has occurred only after publish actually happens
```

## Risk Assessment

Supply-chain risks:

```text
package impersonation
maintainer account compromise
automation token leakage
incorrect dist-tag assignment
users mistaking package install for hosted service availability
users pasting Kiwoom credentials into third-party package or proxy flows
```

Runtime scope risks:

```text
accidental real Kiwoom quote enablement
endpoint enabled default changed to true
endpoint exposesPublicTool default changed to true
public real path default changed to true
account/order/trading scope introduced by mistake
```

Mitigation:

```text
defer publish
keep GitHub clone/local setup primary
require 2FA and minimal publish access
use alpha dist-tag only for alpha publish
continue compliance/security doc tests
keep mock provider first
keep Kiwoom real local verification explicit opt-in only
```

## Rollback And Unpublish Considerations

npm unpublish behavior is time-limited and should not be relied on as the primary rollback mechanism.

Before publish, prepare:

```text
version deprecation plan
security advisory path
next patch/pre-release version path
release notes correction path
maintainer contact and recovery path
```

If a package is published with a serious issue, prefer publishing a corrected version and deprecating the affected version where appropriate.

## Ownership And Access Requirements

Required before publish:

```text
single accountable npm package owner identified
maintainer GitHub account verified
npm account email and recovery configured
2FA enabled for login and publish
minimal publish access
no shared personal credentials
handoff policy documented
```

## 2FA Requirements

Recommended requirement:

```text
npm account 2FA enabled for authorization and publishing
```

Do not publish from an npm account without 2FA enabled.

## Token Usage Policy

Current recommendation:

```text
manual publish only until CI provenance policy is approved
```

Automation tokens must not be added in v0.29.0-alpha.

Any future automation token must be:

```text
least-privilege
stored only in trusted CI secrets
rotated when maintainers change
never committed
never pasted into docs, issues, pull requests, screenshots, or logs
```

## Provenance Requirements

Current recommendation:

```text
evaluate GitHub Actions npm provenance in a separate publish release
```

v0.29.0-alpha records the decision only. It does not implement CI publish and does not publish with provenance.

Manual publish risk:

```text
harder to prove build origin
more dependent on local maintainer environment
higher chance of local credential exposure
```

CI publish risk:

```text
requires secret and workflow hardening
requires branch/tag protection review
requires provenance and maintainer permission review
```

## Final Decision Owner

Final decision owner:

```text
repository maintainer
```

The maintainer must explicitly approve a future publish release before `npm publish` is run.

## Explicitly Excluded

This decision does not add:

```text
npm publish
hosted proxy
public real Kiwoom quote lookup by default
endpoint enabled default true
endpoint exposesPublicTool default true
public real path default true
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized credential storage
centralized data redistribution proxy
```
