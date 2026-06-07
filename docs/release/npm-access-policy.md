# npm Access Policy

## Purpose

This document records npm account and access requirements before any official npm publish.

`npm publish` was not performed for v0.29.0-alpha.

## Account Owner

The npm account owner must be a repository maintainer with authority to publish the official package.

Current status:

```text
owner confirmation required before publish
```

Do not document real npm tokens, recovery codes, private email addresses, or account secrets in this repository.

## 2FA Requirement

Publishing requires:

```text
npm 2FA enabled for login and publish
```

Publishing from an account without 2FA is not approved.

## Publish Access Control

Access must be minimal:

```text
only trusted maintainers may publish
no shared npm account credentials
no broad automation token by default
review access before every publish release
remove access when maintainers rotate off
```

## Token Usage Policy

v0.29.0-alpha recommendation:

```text
no automation token
manual publish decision only
```

If CI publish is introduced later, tokens must be least-privilege and stored only in trusted CI secrets.

Tokens must never appear in:

```text
repository files
examples
docs
test snapshots
console logs
GitHub issues
pull requests
screenshots
```

## Manual Publish Principle

Manual publish may be considered only in a separate final publish release after:

```text
npm account owner confirmed
2FA confirmed
package name availability rechecked
dist-tag selected
package tarball reviewed
clean install smoke test repeated
final decision owner approves publish
```

## Recovery And Handoff

Before publish, maintainers must document:

```text
account recovery owner
handoff path if maintainer changes
emergency deprecation path
security advisory path
token rotation path if automation is later used
```

## Explicitly Not Included

This policy does not add:

```text
real npm token
real Kiwoom credential
hosted proxy
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```
