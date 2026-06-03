# Kiwoom Public Quote Local Verification

## Purpose

This document describes how to locally verify the guarded `get_kiwoom_stock_quote` MCP tool real path.

This is local-only verification. It does not enable public real Kiwoom quote lookup by default, and it does not add a centralized data redistribution proxy.

## Scope

Included:

```text
local MCP client verification
explicit public quote real-path opt-in
read-only stock quote request shape
safe blocked/error/ok response checks
secret redaction checks
```

Excluded:

```text
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

## Prerequisites

Before local verification:

```text
Kiwoom REST API access is approved
App Key and Secret Key are issued
mock or production environment is understood
IP registration is complete if required by Kiwoom
Node.js dependencies are installed
MCP client is configured to run this local server
```

## Required Environment Variables

Real public quote path verification requires all of these local environment variables:

```env
KIWOOM_ENABLE_REAL_API_CALLS=true
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true
KIWOOM_APP_KEY=<local-app-key>
KIWOOM_SECRET_KEY=<local-secret-key>
KIWOOM_ENV=mock
```

The default remains:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

## Endpoint Mapping Conditions

The Kiwoom quote endpoint mapping must be reviewed separately before real public quote verification:

```text
readOnly=true
exposesPublicTool=true
enabled=true
```

If any condition is false, `get_kiwoom_stock_quote` returns `blocked` before token acquisition or quote transport.

## Verification Flow

Recommended order:

```text
1. Run npm run kiwoom:token:manual
2. Run npm run kiwoom:quote:manual
3. Configure the local MCP client
4. Call get_kiwoom_stock_quote with a 6-digit symbol
5. Confirm token, app key, secret key, and raw payloads are not printed
```

Example tool input:

```json
{
  "symbol": "005930",
  "market": "KOSPI",
  "provider": "kiwoom"
}
```

## Response Shapes

Successful local verification shape:

```json
{
  "status": "ok",
  "provider": "kiwoom",
  "symbol": "005930",
  "quote_present": true,
  "quote": {
    "provider": "kiwoom",
    "symbol": "005930",
    "name": "Samsung Electronics",
    "market": "KOSPI",
    "currency": "KRW",
    "price": 70000,
    "change": 500,
    "change_rate": 0.72,
    "volume": 12000000,
    "as_of": "..."
  }
}
```

Blocked shape:

```json
{
  "status": "blocked",
  "provider": "kiwoom",
  "symbol": "005930",
  "quote_present": false,
  "reason": "KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH must be true."
}
```

Error shape:

```json
{
  "status": "error",
  "provider": "kiwoom",
  "symbol": "005930",
  "quote_present": false,
  "error": {
    "code": "KIWOOM_QUOTE_REQUEST_FAILED",
    "provider": "kiwoom",
    "retryable": true
  }
}
```

## Troubleshooting

Common blocked cases:

```text
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
endpoint enabled=false
exposesPublicTool=false
readOnly=false
missing credentials
placeholder credentials
invalid symbol
```

Common error cases:

```text
token request failure
quote request failure
malformed quote response
IP not registered
mock/production environment mismatch
wrong App Key or Secret Key for selected Kiwoom environment
```

`token_present=false` means a token was not available or token verification was blocked.

`quote_present=false` means a quote was not returned, usually because a guard blocked the request or provider response normalization failed.

## Security Notes

Do not store, print, commit, screenshot, or share:

```text
App Key
Secret Key
access token
Authorization header
raw token response
raw quote response
raw request body
```

Do not include real credentials in GitHub issues, pull requests, logs, screenshots, or test snapshots.

This tool does not support account, order, balance, holdings, trading, auto-trading, or investment recommendation behavior.
