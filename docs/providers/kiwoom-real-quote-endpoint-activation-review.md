# Kiwoom Real Quote Endpoint Activation Review

## Purpose

This document defines the review process required before changing the Kiwoom quote endpoint mapping toward real quote endpoint activation.

This is a review document only. It does not enable public real Kiwoom quote lookup by default.

## What Activation Review Means

Activation review is the final documented check before maintainers consider changing endpoint flags such as:

```text
enabled
exposesPublicTool
readOnly
```

Activation review is not activation itself.

No endpoint flag should be changed to enable real public quote lookup unless a separate activation decision record explicitly approves the change.

## Current Default Disabled State

The current safe defaults remain:

```text
kiwoomQuoteEndpointMappings.quote.enabled=false
kiwoomQuoteEndpointMappings.quote.exposesPublicTool=false
kiwoomQuoteEndpointMappings.quote.readOnly=true
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

With these defaults, `get_kiwoom_stock_quote` remains registered as a guarded read-only tool, but the real Kiwoom quote path remains blocked.

## Review Targets

Activation review must cover:

```text
endpoint enabled flag
endpoint exposesPublicTool flag
endpoint readOnly flag
KIWOOM_ENABLE_REAL_API_CALLS behavior
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH behavior
credential handling
token handling
quote response normalization
provider compliance
provider terms review
data redistribution risk
redaction behavior
rollback criteria
user notice requirements
```

## Required Conditions Before Activation

All of these must be true before any activation can be approved:

```text
official Kiwoom endpoint path is verified
official API ID is verified
HTTP method is verified
headers are verified
request body is verified
response body is verified
error response shape is verified
endpoint mapping remains read-only
credential handling remains local-only
token values are never logged or returned
quote response normalization is tested
sanitized smoke test results are reviewed
provider terms and data redistribution risk are reviewed
redaction tests pass
rollback plan is documented
decision record is completed
```

## Forbidden Activation Conditions

Activation must be rejected if any of these are true:

```text
readOnly=false
endpoint includes account behavior
endpoint includes order behavior
endpoint includes balance behavior
endpoint includes holdings behavior
endpoint includes trading behavior
endpoint includes recommendation behavior
provider terms are not reviewed
data redistribution risk is unresolved
credentials would be stored on a centralized server
raw request or response payloads would be logged
tokens would be returned to MCP clients
smoke test results include secrets or raw provider payloads
rollback criteria are missing
decision record is missing
```

## Smoke Test Result Input

Activation review may use sanitized smoke test results only.

Allowed summary fields:

```text
tested version
environment label
symbol tested
command or tool tested
status
token_present
quote_present
normalized field presence
sanitized error code
sanitized return_code
sanitized return_msg
redaction checklist status
```

Do not submit:

```text
token
app key
secret key
authorization header
raw request body
raw token response
raw quote response
full IP address
account number
order information
personal information
```

## Decision Record

Use:

```text
docs/providers/templates/kiwoom-real-quote-activation-decision-record.md
```

The decision record must state one of:

```text
not approved
approved for local-only opt-in
approved for wider opt-in
rejected
```

The default decision status is `not approved`.

## Rollback Criteria

Rollback or reject activation if:

```text
redaction fails
provider terms are unclear
data redistribution risk is unresolved
endpoint response shape changes unexpectedly
token handling exposes sensitive values
quote normalization returns raw provider payloads
account/order/balance/holdings/trading fields appear
manual commands no longer block by default
public real quote lookup becomes enabled by default
```

## User Notice Requirements

If any future release allows a wider opt-in path, documentation must clearly state:

```text
real quote lookup is still opt-in
credentials remain local by default
provider terms apply
market data may be licensed or restricted
results are not investment advice
no account/order/trading features are included
no centralized data redistribution proxy is included
```

## Explicit Exclusions

Activation review does not add:

```text
public real Kiwoom quote lookup by default
endpoint enabled default true
exposesPublicTool default true
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
centralized credential storage
```
