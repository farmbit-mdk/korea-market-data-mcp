# Kiwoom Public Quote Real Local Smoke Test

## Purpose

This document describes a local-only smoke test workflow for the guarded `get_kiwoom_stock_quote` MCP tool real path.

The workflow is intended for a user who has local Kiwoom REST API credentials and wants to verify that the MCP tool guard, token flow, quote path, and normalized response shape can work together in their own local environment.

This document does not enable public real Kiwoom quote lookup by default.

## Scope

Included:

```text
local-only MCP smoke test procedure
explicit real API opt-in requirements
explicit public quote real-path opt-in requirements
endpoint mapping checks
sanitized result recording
safe ok, blocked, and error interpretation
```

Excluded:

```text
public real Kiwoom quote lookup by default
centralized server proxy
centralized market data redistribution
centralized credential storage
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
```

## Important Safety Notes

The smoke test is local-only.

It is not:

```text
a product feature
a default live quote lookup path
a centralized data redistribution proxy
a hosted credential storage workflow
proof that public redistribution is allowed
```

The test must run only in the user's local environment with credentials that remain local to that user.

## Prerequisites

Before running a real local smoke test, confirm:

```text
Kiwoom REST API access is approved
App Key and Secret Key are issued
mock or production environment is understood
IP registration is complete if Kiwoom requires it
Node.js dependencies are installed
MCP client is configured to run this local server
endpoint mapping has been reviewed
provider terms and data usage limits are understood
```

## Required Environment Variables

The real local smoke test requires all of these local environment variables:

```env
KIWOOM_ENABLE_REAL_API_CALLS=true
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true
KIWOOM_APP_KEY=<local-app-key>
KIWOOM_SECRET_KEY=<local-secret-key>
KIWOOM_ENV=mock
```

Supported `KIWOOM_ENV` values:

```text
mock
production
```

Default safe values remain:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

Do not put real credentials in committed files, examples, screenshots, issues, or pull requests.

## Endpoint Mapping Conditions

The Kiwoom quote endpoint mapping must satisfy all of these conditions before the real path can proceed:

```text
readOnly=true
exposesPublicTool=true
enabled=true
```

If any condition is false, `get_kiwoom_stock_quote` must return `blocked` before a real quote request is sent.

## Smoke Test Procedure

Recommended order:

```text
1. Sync the repository to the intended release branch or commit.
2. Run npm run build.
3. Run npm test.
4. Run npm run kiwoom:token:manual and confirm it behaves as expected.
5. Run npm run kiwoom:quote:manual and confirm it behaves as expected.
6. Start the MCP server through the local MCP client.
7. Call get_kiwoom_stock_quote with a 6-digit Korean stock code.
8. Record only sanitized results in the smoke test result template.
9. Remove local credentials from the shell session after testing.
```

Example MCP tool input:

```json
{
  "symbol": "005930",
  "market": "KOSPI",
  "provider": "kiwoom"
}
```

## Success Criteria

A successful smoke test may record:

```text
status=ok
provider=kiwoom
symbol matches the requested 6-digit code
quote_present=true
normalized quote fields are present
token value is not printed
raw quote response is not printed
no credential values appear in logs or screenshots
```

Allowed normalized quote fields:

```text
provider
symbol
name
market
currency
price
change
change_rate
volume
as_of
```

## Blocked Criteria

A blocked result is expected when a guard stops the request before real quote lookup.

Common blocked reasons:

```text
KIWOOM_ENABLE_REAL_API_CALLS is not true
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH is not true
KIWOOM_APP_KEY or KIWOOM_SECRET_KEY is missing
placeholder credentials are used
endpoint mapping enabled is false
endpoint mapping exposesPublicTool is false
endpoint mapping readOnly is false
symbol is missing or invalid
```

Blocked is a safe result when the smoke test is not fully opted in.

## Error Criteria

An error result means the workflow passed the guards but provider communication or response normalization failed safely.

Common error checks:

```text
Kiwoom environment mismatch
IP not registered
App Key or Secret Key typed incorrectly
provider response is malformed
quote response is missing required fields
network connectivity failed
provider returned a normalized return_code or return_msg
```

Errors must not include credentials, access tokens, raw request bodies, or raw provider responses.

## Failure Triage Order

Check in this order:

```text
1. Confirm default commands are blocked before adding opt-in variables.
2. Confirm KIWOOM_ENABLE_REAL_API_CALLS=true only in the local test session.
3. Confirm KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true only in the local test session.
4. Confirm placeholder credentials are not being used.
5. Confirm KIWOOM_ENV matches the issued credentials.
6. Confirm endpoint mapping is read-only, exposed as a public tool, and enabled.
7. Confirm IP registration if Kiwoom requires it.
8. Confirm manual token verification before MCP quote verification.
9. Confirm manual quote verification before MCP client verification.
10. Confirm the result template contains only sanitized fields.
```

## Result Recording

Use:

```text
docs/providers/templates/kiwoom-public-quote-smoke-test-result.md
```

Record only:

```text
test date
tested version
environment
symbol tested
command or tool tested
result status
token_present true or false
quote_present true or false
normalized fields present
sanitized error code
sanitized return_code
sanitized return_msg
notes
redaction confirmation
```

## Do Not Share

Do not store, print, commit, screenshot, or share:

```text
token
access token
App Key
Secret Key
Authorization header
raw request body
raw token response
raw quote response
account number
order number
IP address
personal information
```

Do not upload these values to GitHub issues, pull requests, release notes, screenshots, logs, or test snapshots.

## Cleanup

After smoke testing:

```powershell
$env:KIWOOM_ENABLE_REAL_API_CALLS = "false"
$env:KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH = "false"
Remove-Item Env:\KIWOOM_APP_KEY -ErrorAction SilentlyContinue
Remove-Item Env:\KIWOOM_SECRET_KEY -ErrorAction SilentlyContinue
Remove-Item Env:\KIWOOM_APP_SECRET -ErrorAction SilentlyContinue
```

Do not commit local environment files or smoke test output that contains secrets.
