# Kiwoom Compliance Notes

## Current Status

The Kiwoom provider is in alpha development.

Implemented so far:

```text
auth configuration skeleton
manual token verification workflow
hardened manual token verification output
read-only quote adapter skeleton
disabled quote endpoint mapping
hardened manual quote verification workflow
```

Not implemented:

```text
public MCP quote tool
public real Kiwoom quote lookup
ETF quote lookup
index quote lookup
chart lookup
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## Credential Policy

Kiwoom app keys, secret keys, and tokens must be provided by the user through local environment variables.

They must not be:

```text
committed
logged
returned in MCP responses
stored on a project server
included in fixtures
included in PR bodies
included in screenshots
```

Manual verification commands may use local credentials only when `KIWOOM_ENABLE_REAL_API_CALLS=true` is explicitly set.

## Manual Verification Status

Token manual verification is hardened and blocked by default.

Quote manual verification is hardened and blocked by default. The quote endpoint mapping remains disabled until the official endpoint path, API ID, request shape, response shape, and authorization requirements are verified.

## Official Documentation Requirement

Before enabling public Kiwoom quote access, maintainers must verify the implementation against official Kiwoom REST API documentation.

The review must cover:

```text
endpoint path
API ID
HTTP method
headers
request body
response fields
error fields
rate limits
market data license and redistribution terms
mock vs production environment differences
```

## Public Tool Checklist

Before adding or enabling a public Kiwoom-backed MCP quote tool:

```text
provider compliance document is current
credential handling document is current
SECURITY.md is current
endpoint mapping is verified and reviewed
manual verification evidence excludes raw tokens
redaction tests pass
fetch boundary remains in src/providers/kiwoom/transport.ts
tool registry change is intentional and reviewed
account/order/balance/holdings/trading fields are absent
README and provider-status are updated
data redistribution risk is reviewed
```

Enabling endpoint mapping must not automatically expose a public MCP tool.
