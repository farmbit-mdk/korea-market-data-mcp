# Kiwoom Public Quote Smoke Test Checklist

Use this checklist before and after any local-only real path smoke test for `get_kiwoom_stock_quote`.

## Pre-Test Checklist

Confirm:

```text
repository is on the intended branch or commit
npm install has completed
npm run build passes
npm test passes
provider terms and data usage limits have been reviewed
real credentials are available only in a local shell session or ignored local env file
```

## Environment Checklist

Confirm:

```text
KIWOOM_ENABLE_REAL_API_CALLS=true only for the local smoke test
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true only for the local smoke test
KIWOOM_APP_KEY is set locally
KIWOOM_SECRET_KEY is set locally
KIWOOM_ENV is mock or production
placeholder credentials are not used
.env.example still keeps safe placeholders
```

## Endpoint Mapping Checklist

Confirm:

```text
readOnly=true
exposesPublicTool=true
enabled=true
forbiddenScopes does not include any allowed quote field
request mapping contains no account/order/balance/holdings/trading fields
response mapping returns only normalized market data fields
```

## Command Checklist

Confirm:

```text
npm run kiwoom:token:manual has expected safe behavior
npm run kiwoom:quote:manual has expected safe behavior
default manual commands remain blocked without opt-in
manual command output contains no token
manual command output contains no app key or secret key
manual command output contains no raw provider response
```

## MCP Client Checklist

Confirm:

```text
get_kiwoom_stock_quote is registered
tool input uses only symbol, market, and provider
symbol is a 6-digit Korean stock code
forbidden account/order/balance/holdings/trading fields are not sent
blocked/error/ok response is normalized
quote response is read-only market data only
```

## Result Redaction Checklist

Confirm the saved result contains:

```text
test date
tested version
environment
symbol tested
command or tool tested
result status
token_present true or false
quote_present true or false
normalized field presence only
sanitized error code
sanitized return_code
sanitized return_msg
sanitized notes only
```

Confirm the saved result does not contain:

```text
token
access token
app key
secret key
authorization header
raw request body
raw token response
raw quote response
account number
order number
balance data
holdings data
trading data
IP address
personal information
```

## Rollback And Cleanup Checklist

After the smoke test:

```text
set KIWOOM_ENABLE_REAL_API_CALLS=false
set KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
remove KIWOOM_APP_KEY from the shell session
remove KIWOOM_SECRET_KEY from the shell session
delete any unsanitized local notes
confirm git status does not include credential files
```

## Do-Not-Share Checklist

Do not share:

```text
real credentials
access tokens
authorization headers
raw token responses
raw quote responses
provider request bodies
account/order/balance/holdings data
screenshots containing secrets
logs containing secrets
```
