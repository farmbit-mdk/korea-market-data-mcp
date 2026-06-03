# Kiwoom Public Quote Smoke Test GitHub Report

Use this template for a sanitized GitHub issue or pull request note.

Do not include credentials, tokens, raw request bodies, raw provider responses, screenshots containing secrets, account data, order data, trading data, IP addresses, or personal information.

## Summary

```text
Short sanitized summary of the smoke test result.
```

## Tested Version

```text
v0.19.0-alpha
```

## Environment

```text
mock / production
```

## Symbol Tested

```text
005930
```

## Status

```text
ok / blocked / error
```

## Sanitized Output Summary

```text
provider=kiwoom
command_or_tool=get_kiwoom_stock_quote
token_present=true or false
quote_present=true or false
sanitized_error_code=N/A
sanitized_return_code=N/A
sanitized_return_msg=N/A
```

## Blocked Or Error Reason

```text
Use a sanitized blocked reason or normalized error code only.
```

## Reproduction Steps Without Credentials

```text
1. Confirm npm run build passes.
2. Confirm npm test passes.
3. Confirm default manual commands are blocked without opt-in.
4. Configure local-only opt-in values without sharing them.
5. Call get_kiwoom_stock_quote with a 6-digit symbol.
6. Record only sanitized output fields.
```

## Redaction Checklist

Confirm before sharing:

```text
No token value
No access token value
No app key value
No secret key value
No authorization header
No raw request body
No raw token response
No raw quote response
No screenshot containing credentials
No account information
No order information
No balance information
No holdings information
No trading information
No full IP address
No personal information
```

## Do-Not-Include Checklist

Do not include:

```text
app key
secret key
access token
authorization header
raw request body
raw response body
screenshots containing credentials
account number
order number
balance data
holdings data
trading information
personal information
```
