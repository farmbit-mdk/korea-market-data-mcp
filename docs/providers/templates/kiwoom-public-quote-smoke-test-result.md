# Kiwoom Public Quote Smoke Test Result

Use this template only for sanitized local smoke test notes.

Do not paste tokens, app keys, secret keys, raw request bodies, raw token responses, raw quote responses, account numbers, order details, IP addresses, or personal information.

## Test Metadata

| Field | Value |
| --- | --- |
| Test date | YYYY-MM-DD |
| Tested version | v0.18.0-alpha |
| Environment | mock / production |
| Symbol tested | 005930 |
| Command or tool tested | get_kiwoom_stock_quote |
| Tested command category | manual token / manual quote / MCP get_kiwoom_stock_quote |
| Result category | ok / blocked / error |

## Endpoint Flags

| Field | Value |
| --- | --- |
| readOnly | true / false / N/A |
| exposesPublicTool | true / false / N/A |
| enabled | true / false / N/A |

## Opt-In Flags

Record boolean flag state only. Do not record credential values.

| Field | Value |
| --- | --- |
| KIWOOM_ENABLE_REAL_API_CALLS | true / false |
| KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH | true / false / N/A |

## Result Summary

| Field | Value |
| --- | --- |
| token_present | true / false |
| quote_present | true / false |
| sanitized error code | N/A |
| sanitized return_code | N/A |
| sanitized return_msg | N/A |

## Normalized Fields Present

Mark yes, no, or N/A.

| Field | Present |
| --- | --- |
| provider | N/A |
| symbol | N/A |
| name | N/A |
| market | N/A |
| currency | N/A |
| price | N/A |
| change | N/A |
| change_rate | N/A |
| volume | N/A |
| as_of | N/A |

## Notes

```text
Write sanitized notes only.
Do not include provider raw responses.
Do not include request headers.
Do not include credential values.
```

## Maintainer Review Notes

```text
Optional sanitized maintainer notes.
Do not include environment dumps, terminal history, or screenshots containing sensitive values.
```

## Redaction Confirmation Checklist

Confirm before saving or sharing:

```text
No token value included
No access token included
No app key included
No secret key included
No authorization header included
No raw request body included
No raw token response included
No raw quote response included
No account number included
No order details included
No IP address included
No personal information included
```

## Safe-To-Share Confirmation

```text
Safe to share in GitHub issue or pull request: yes / no
Reviewed by maintainer: yes / no
```
