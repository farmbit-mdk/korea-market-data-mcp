# Kiwoom Manual Quote Verification

## 1. Purpose

This document describes the `v0.10.0-alpha` hardened manual workflow for verifying a Kiwoom read-only quote request.

This is manual verification only. It is not a public MCP tool and is not live quote support for normal users.

---

## 2. Scope

Included:

```text
manual read-only quote verification command
token request before quote request
quote endpoint mapping guard
safe quote output
mocked transport tests
troubleshooting and redaction checks
```

Excluded:

```text
public MCP quote tool
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
public real Kiwoom quote lookup
```

---

## 3. Prerequisites

Before manual quote verification:

```text
understand the manual token verification workflow
prepare Kiwoom app key and secret key locally
set KIWOOM_ENABLE_REAL_API_CALLS=true only for the manual command
choose KIWOOM_ENV=mock or KIWOOM_ENV=production
provide a symbol such as 005930
```

Symbol can be supplied by `KIWOOM_QUOTE_SYMBOL` or as a CLI argument.

---

## 4. Endpoint Mapping Guard

The Kiwoom quote endpoint mapping is currently disabled:

```text
enabled: false
manualOnly: true
readOnly: true
apiId: ka10001
```

If the mapping is disabled, the manual command returns `blocked` and does not request a token or quote.

---

## 5. Command

Default safe behavior:

```powershell
npm run kiwoom:quote:manual
```

Expected default output:

```json
{
  "status": "blocked",
  "provider": "kiwoom",
  "environment": "mock",
  "quote_present": false,
  "reason": "KIWOOM_ENABLE_REAL_API_CALLS must be set to true for manual quote verification."
}
```

Manual opt-in shape:

```powershell
$env:KIWOOM_ENABLE_REAL_API_CALLS = "true"
$env:KIWOOM_ENV = "mock"
$env:KIWOOM_APP_KEY = "<your-app-key>"
$env:KIWOOM_SECRET_KEY = "<your-secret-key>"
$env:KIWOOM_QUOTE_SYMBOL = "005930"
npm run kiwoom:quote:manual
```

The command still returns `blocked` while endpoint mapping is disabled.

---

## 6. Output Shapes

The manual command has three statuses:

```text
ok: token and quote verification completed through the manual command
blocked: a safety/configuration guard stopped the workflow before a quote request
error: the provider/token/quote request or response normalization failed safely
```

Successful output shape:

```json
{
  "status": "ok",
  "provider": "kiwoom",
  "environment": "mock",
  "symbol": "005930",
  "quote_present": true,
  "quote": {
    "provider": "kiwoom",
    "symbol": "005930",
    "currency": "KRW",
    "price": 70000,
    "as_of": "2026-06-02T09:00:00.000Z"
  }
}
```

Blocked output shape:

```json
{
  "status": "blocked",
  "provider": "kiwoom",
  "environment": "mock",
  "symbol": "005930",
  "quote_present": false,
  "reason": "..."
}
```

Error output shape:

```json
{
  "status": "error",
  "provider": "kiwoom",
  "environment": "mock",
  "symbol": "005930",
  "quote_present": false,
  "error": {
    "code": "KIWOOM_QUOTE_REQUEST_FAILED",
    "provider": "kiwoom",
    "retryable": false,
    "return_code": "Q1001",
    "return_msg": "Quote endpoint unavailable."
  }
}
```

Access token values are never printed.

---

## 7. Troubleshooting

Blocked cases:

```text
KIWOOM_ENABLE_REAL_API_CALLS is not true: no network request is made
missing credentials: set local KIWOOM_APP_KEY and KIWOOM_SECRET_KEY
placeholder credentials: replace YOUR_APP_KEY, YOUR_SECRET_KEY, CHANGE_ME, or REPLACE_ME
missing symbol: set KIWOOM_QUOTE_SYMBOL or pass a CLI symbol argument
disabled endpoint mapping: expected until quote endpoint is verified
token request blocked or failed: verify token manual workflow first
```

Error cases:

```text
quote request failure: check return_code and return_msg only
provider error response: inspect normalized return_code and return_msg only
malformed quote response: verify Kiwoom response field mapping
missing price: quote response is not usable
missing symbol in response: verify response mapping or request symbol fallback
mock/production mismatch: confirm KIWOOM_ENV matches the issued credentials
IP not registered: confirm Kiwoom REST API access setup
incorrect app key or secret: update local shell environment only
```

Endpoint mapping transition guidance:

```text
Keep enabled:false until endpoint path, API ID, request fields, response fields, and headers are verified.
Changing enabled:true must be reviewed in a separate PR.
Changing enabled:true still must not add or expose a public MCP quote tool.
```

Before attempting any real API exposure, confirm:

```text
manual command remains explicit opt-in
public MCP tool registry remains unchanged
access token is not printed
app key and secret are not printed
raw request body is not printed
raw quote response is not printed
account/order/balance/holdings/trading/recommendation fields remain excluded
```

---

## 8. Security Notes

Do not print, store, commit, or share:

```text
app key
secret key
access token
authorization header
raw token response
raw quote response containing sensitive values
```

Do not expose this workflow as an MCP tool.

Do not add account, order, balance, holdings, trading, auto-trading, or recommendation behavior.

Manual quote verification is not public real quote support.
