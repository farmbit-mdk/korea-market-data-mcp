# Public Quote Tool Readiness Checklist

Use this checklist before adding or enabling any public provider-backed MCP quote tool.

## Documentation

Confirm:

```text
docs/providers/provider-compliance.md exists
docs/providers/kiwoom-compliance-notes.md exists for Kiwoom work
docs/security/credential-handling.md exists
SECURITY.md is current
README disclaimer is current
docs/providers/provider-status.md is current
```

## Provider Review

Confirm:

```text
official provider endpoint documentation has been reviewed
endpoint path is verified
API ID is verified
HTTP method is verified
headers are verified
request body is verified
response body is verified
error shape is verified
rate limit behavior is understood
mock and production environment differences are documented
```

## Security

Confirm:

```text
real quote lookup policy is explicit
endpoint enabled policy is reviewed
redaction tests pass
fetch boundary remains inside provider transport
credentials are local-only by default
no app key, secret key, or token appears in logs/errors
tests do not require real credentials
```

## Scope

Confirm the change does not add:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## Data Rights

Confirm:

```text
data redistribution risk has been reviewed
realtime data license risk has been reviewed
caching policy has been reviewed
provider terms are compatible with the intended use
public MCP behavior is documented
```
