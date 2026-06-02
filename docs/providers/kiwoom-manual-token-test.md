# Kiwoom Manual Token Verification

## 1. Purpose

This document describes the manual workflow for verifying Kiwoom REST API access token issuance.

This is a `v0.5.0-alpha` manual verification workflow only. It is not an MCP tool and is not a product feature.

---

## 2. Included Scope

This workflow only verifies:

```text
Kiwoom REST API token request
manual token response normalization
secret redaction
explicit real API opt-in guard
```

---

## 3. Excluded Scope

This workflow does not implement:

```text
stock quote lookup
ETF quote lookup
market index lookup
chart lookup
realtime data
account lookup
order placement
order cancellation
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
```

---

## 4. Prerequisites

Before running the manual token check:

```text
Apply for Kiwoom REST API access
Issue an App Key and Secret Key
Confirm whether you are using mock or production environment
Register the required IP address with Kiwoom if required
Confirm the endpoint access policy in Kiwoom's developer portal
```

Do not paste real credentials into GitHub issues, pull requests, commits, screenshots, test snapshots, or logs.

---

## 5. Environment Variables

Use PowerShell session environment variables or a local ignored file such as `.env.local`.

Required variables:

```env
KIWOOM_ENABLE_REAL_API_CALLS=true
KIWOOM_APP_KEY=your-app-key
KIWOOM_SECRET_KEY=your-secret-key
KIWOOM_ENV=mock
```

Supported `KIWOOM_ENV` values:

```text
mock
production
```

Base URLs:

```env
KIWOOM_MOCK_API_BASE_URL=https://mockapi.kiwoom.com
KIWOOM_API_BASE_URL=https://api.kiwoom.com
```

Default safety setting:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
```

If the opt-in flag is missing or false, the manual command exits without making a token request.

Placeholder values are also blocked before any request is made:

```text
YOUR_APP_KEY
YOUR_SECRET_KEY
CHANGE_ME
REPLACE_ME
empty string
```

Replace placeholders with real local credentials before running the manual command.

---

## 6. PowerShell Example

Mock environment:

```powershell
$env:KIWOOM_ENABLE_REAL_API_CALLS = "true"
$env:KIWOOM_ENV = "mock"
$env:KIWOOM_APP_KEY = "<your-app-key>"
$env:KIWOOM_SECRET_KEY = "<your-secret-key>"
npm run kiwoom:token:manual
```

Production environment:

```powershell
$env:KIWOOM_ENABLE_REAL_API_CALLS = "true"
$env:KIWOOM_ENV = "production"
$env:KIWOOM_APP_KEY = "<your-app-key>"
$env:KIWOOM_SECRET_KEY = "<your-secret-key>"
npm run kiwoom:token:manual
```

Disable real API calls after manual verification:

```powershell
$env:KIWOOM_ENABLE_REAL_API_CALLS = "false"
Remove-Item Env:\KIWOOM_APP_KEY -ErrorAction SilentlyContinue
Remove-Item Env:\KIWOOM_SECRET_KEY -ErrorAction SilentlyContinue
```

---

## 7. Success Criteria

Successful output may include:

```json
{
  "status": "success",
  "provider": "kiwoom",
  "environment": "mock",
  "token_present": true,
  "token_type": "Bearer",
  "expires_dt": "2026-06-02T00:00:00.000Z",
  "return_code": "0",
  "return_msg": "OK"
}
```

The access token value must never be printed.

Success means:

```text
token_type is present
expires_dt is present
token_present is true
token raw value is not displayed
```

---

## 8. Failure Checklist

If token verification fails, check:

```text
KIWOOM_ENABLE_REAL_API_CALLS is set to true
KIWOOM_APP_KEY is present
KIWOOM_SECRET_KEY is present
KIWOOM_APP_KEY and KIWOOM_SECRET_KEY are not placeholder values
KIWOOM_ENV matches the issued credentials
IP address is registered if Kiwoom requires it
mock vs production environment is correct
network connectivity is available
Kiwoom developer portal credentials are active
```

Errors must not include request body, app key, secret key, authorization header, or token values.

---

## 9. Security Notes

Use only:

```text
PowerShell session environment variables
local ignored environment files such as .env.local
```

Do not commit:

```text
.env
.env.local
credential files
API keys
secret keys
tokens
manual verification output containing sensitive values
```

The repository `.gitignore` excludes `.env.*` files except `.env.example`.

Do not include secrets or token values in:

```text
console logs
error messages
test snapshots
GitHub pull request body
screenshots
release notes
```

---

## 10. Maintainer Notes

This workflow is manual verification only.

Do not expose token issuance as an MCP tool. Do not add quote, chart, account, order, balance, holdings, trading, auto-trading, or recommendation features in this release.
