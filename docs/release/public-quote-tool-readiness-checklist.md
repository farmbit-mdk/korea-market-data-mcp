# Public Quote Tool Readiness Checklist

Use this checklist before adding or enabling any public provider-backed MCP quote tool.

`v0.12.0-alpha` may register a guarded public quote tool skeleton. That does not mean real provider-backed quote lookup is enabled.

## Documentation

Confirm:

```text
docs/providers/provider-compliance.md exists
docs/providers/kiwoom-compliance-notes.md exists for Kiwoom work
docs/security/credential-handling.md exists
SECURITY.md is current
README disclaimer is current
docs/providers/provider-status.md is current
guarded skeleton status is documented if a public skeleton exists
public tool response format is documented
mock/test integration status is documented
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
exposesPublicTool policy is reviewed
enabled/manualOnly/readOnly policy is reviewed
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
guarded skeleton still returns blocked unless every release gate is satisfied
mock/test success path is clearly labeled as non-live data
```

## v0.13 Mock/Test Validation

Confirm:

```text
get_kiwoom_stock_quote blocked response shape is stable
get_kiwoom_stock_quote error response shape is stable
get_kiwoom_stock_quote mocked ok response shape nests quote under quote
symbol validation requires a 6-digit Korean stock code
forbidden schema fields are absent
real lookup remains disabled by default
redaction tests pass
```

## v0.14 Guard Hardening

Confirm:

```text
guard order is documented and tested
input object validation rejects non-object input
symbol validation rejects blank, malformed, 5-digit, 7-digit, non-numeric, SQL-like, object, and array input
forbidden runtime fields are rejected safely
forbidden runtime field values are not echoed
blocked/error/ok response shapes remain stable
raw request bodies and raw provider payloads are not returned
real lookup remains disabled by default
provider terms review is still required before real public enablement
```
