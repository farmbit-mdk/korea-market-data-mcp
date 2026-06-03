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
local verification docs exist
MCP client request example exists
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
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH policy is explicit
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

## v0.15 Explicit Opt-in Verification

Confirm:

```text
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false by default
real quote path requires KIWOOM_ENABLE_REAL_API_CALLS=true
real quote path requires KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true
real quote path requires endpoint enabled=true
real quote path requires exposesPublicTool=true
real quote path requires readOnly=true
blocked guards do not call token or quote transport
provider terms review is still required before wider enablement
```

## v0.16 Local Verification Docs

Confirm:

```text
docs/providers/kiwoom-public-quote-local-verification.md exists
examples/get-kiwoom-stock-quote.request.json exists
explicit opt-in variables are documented
environment variable checklist is documented
troubleshooting is documented
default disabled behavior is documented
provider terms review is still required before wider enablement
no account/order/trading schema is introduced
no centralized proxy is introduced
```

## v0.17 Local Verification Hardening

Confirm:

```text
local verification docs include environment matrix
local verification docs include blocked reason matrix
blocked response example exists
ok response example exists and is labeled example data
error response example exists
examples contain no credentials or tokens
examples contain no account/order/balance/holdings fields
real path remains disabled by default
provider terms review is still required before wider enablement
```

## v0.18 Real Local Smoke Test Docs

Confirm:

```text
real local smoke test docs are added
sanitized result template is added
smoke test checklist is added
result sharing redaction checklist is added
default real quote lookup remains disabled
KIWOOM_ENABLE_REAL_API_CALLS=false remains the default
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false remains the default
provider terms review is still required before wider enablement
no account/order/trading schema is introduced
no account/order/balance/holdings fields are introduced
no centralized data redistribution proxy is introduced
smoke test results do not store credentials, tokens, or raw provider payloads
```

## v0.19 Smoke Test Result Capture

Confirm:

```text
smoke test result capture docs are added
sanitized result sample is added
GitHub report template is added
result sharing redaction checklist is confirmed
README result capture section is added
default real quote lookup remains disabled
KIWOOM_ENABLE_REAL_API_CALLS=false remains the default
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false remains the default
provider terms review is still required before wider enablement
no account/order/trading schema is introduced
no account/order/balance/holdings fields are introduced
no centralized data redistribution proxy is introduced
result captures do not store credentials, tokens, raw request bodies, or raw provider payloads
```

## v0.20 Real Quote Endpoint Activation Review

Confirm:

```text
activation review docs are added
activation decision record template is added
activation checklist is added
endpoint enabled remains false unless decision record approves otherwise
endpoint exposesPublicTool remains false unless decision record approves otherwise
default real quote lookup remains disabled
KIWOOM_ENABLE_REAL_API_CALLS=false remains the default
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false remains the default
provider terms review is required before wider enablement
data redistribution risk review is required before wider enablement
no account/order/trading schema is introduced
no account/order/balance/holdings fields are introduced
no centralized data redistribution proxy is introduced
```

## v0.21 Real Quote Local Opt-in Activation

Confirm:

```text
local opt-in activation path is clarified
KIWOOM_ENABLE_REAL_API_CALLS=true alone remains insufficient
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true is separately required
activation decision record decision=approved_for_local_only is required for local/test verification
missing decision record remains blocked
pending decision record remains blocked
rejected decision record remains blocked
endpoint enabled remains false by default
endpoint exposesPublicTool remains false by default
default real quote lookup remains disabled
tests pass without real credentials
no account/order/trading schema is introduced
no account/order/balance/holdings fields are introduced
no centralized data redistribution proxy is introduced
```
