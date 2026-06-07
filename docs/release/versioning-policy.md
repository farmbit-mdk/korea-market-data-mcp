# Versioning Policy

## Purpose

This document records the alpha versioning and npm dist-tag policy for future package publication.

`npm publish` was not performed for v0.29.0-alpha.

## Alpha Version Policy

Alpha releases use pre-release versions:

```text
0.x.0-alpha
```

The current sequence is:

```text
v0.1.0-alpha through v0.29.0-alpha
```

Each alpha release should document whether it changes runtime behavior, packaging, verification, or only release policy.

## npm Pre-release Tag Policy

If an alpha package is published in a future release, it must use:

```powershell
npm publish --tag alpha
```

The `latest` dist-tag must not be used for alpha releases.

Do not use the latest dist-tag for alpha releases.

## Dist-tag Policy

Recommended dist-tag for alpha:

```text
alpha
```

Forbidden for alpha:

```text
latest
```

The `latest` dist-tag should be reserved for a future stable release after explicit release approval.

## Future v1.0.0 Criteria

A future v1.0.0 release should require:

```text
stable read-only tool schemas
provider capability review
security review
credential handling review
package ownership confirmed
npm 2FA and provenance policy approved
documentation and examples reviewed
no account/order/trading scope
```

## Publish Timing

Actual npm publish must happen only in a separate publish release after approval.

v0.29.0-alpha records the decision policy only and does not publish.

## Explicitly Excluded

This policy does not add:

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
centralized data redistribution proxy
```
