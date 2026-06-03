# Kiwoom Real Quote Activation Review Checklist

Use this checklist before any change that enables a Kiwoom real quote endpoint path.

This checklist does not enable public real Kiwoom quote lookup by default.

## Endpoint Mapping Checklist

Confirm:

```text
official endpoint path is verified
official API ID is verified
HTTP method is verified
request headers are verified
request body is verified
response body is verified
error response shape is verified
readOnly=true
enabled remains false unless decision record approves otherwise
exposesPublicTool remains false unless decision record approves otherwise
manualOnly value is intentionally reviewed
requiresToken value is intentionally reviewed
forbiddenScopes excludes account, order, balance, holdings, and trading behavior
```

## Environment Opt-In Checklist

Confirm:

```text
KIWOOM_ENABLE_REAL_API_CALLS=false remains the default
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false remains the default
real API calls require explicit local opt-in
public quote real path requires explicit local opt-in
.env.example contains placeholders only
```

## Credential Handling Checklist

Confirm:

```text
credentials remain local by default
no credentials are committed
no credentials are logged
no credentials are returned in MCP responses
no centralized credential storage is introduced
placeholder credentials are blocked
```

## Token Handling Checklist

Confirm:

```text
tokens are not logged
tokens are not returned in MCP responses
tokens are not persisted to disk by default
token errors are normalized
manual token command is blocked by default
```

## Smoke Test Result Checklist

Confirm:

```text
sanitized smoke test summary is available
result status is ok, blocked, or error
token_present is recorded as a boolean only
quote_present is recorded as a boolean only
normalized field presence is recorded without raw payloads
sanitized error code is recorded if applicable
sanitized return_code and return_msg are recorded if applicable
```

## Redaction Checklist

Confirm docs, templates, examples, logs, and PR text contain no:

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

## Compliance Checklist

Confirm:

```text
provider compliance document is current
Kiwoom compliance notes are current
SECURITY.md is current
README disclaimer is current
provider terms review is documented
recommendation boundary is documented
account/order/trading exclusions are documented
```

## Provider Terms Review Checklist

Confirm:

```text
market data usage terms are reviewed
redistribution restrictions are reviewed
caching restrictions are reviewed
mock and production environment differences are reviewed
rate limits are reviewed
public display restrictions are reviewed
```

## Data Redistribution Risk Checklist

Confirm:

```text
no centralized data redistribution proxy is introduced
no server-side credential custody is introduced
no raw provider payload storage is introduced
local-only result sharing is sanitized
wider opt-in requires separate documented approval
```

## Rollback Checklist

Rollback or reject if:

```text
redaction fails
provider terms review is incomplete
data redistribution risk is unresolved
endpoint response mapping is unstable
readOnly is false
account/order/balance/holdings/trading fields appear
manual commands are not blocked by default
public real quote lookup becomes enabled by default
decision record is missing
```

## Explicit Excluded Scope Checklist

Confirm the change does not add:

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
