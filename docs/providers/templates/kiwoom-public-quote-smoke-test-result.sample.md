# Kiwoom Public Quote Smoke Test Result Sample

This sample uses invented normalized data only.

Do not replace these values with credentials, tokens, raw provider payloads, account data, order data, IP addresses, or personal information.

## Test Metadata

| Field | Value |
| --- | --- |
| Test date | 2026-06-03 |
| Tested version | v0.19.0-alpha |
| Environment | mock |
| Symbol tested | 005930 |
| Market | KOSPI |
| Command or tool tested | get_kiwoom_stock_quote |
| Result category | ok |

## Endpoint And Opt-In Summary

| Field | Value |
| --- | --- |
| readOnly | true |
| exposesPublicTool | true |
| enabled | true |
| KIWOOM_ENABLE_REAL_API_CALLS | true |
| KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH | true |

## Result Summary

| Field | Value |
| --- | --- |
| provider | kiwoom |
| currency | KRW |
| token_present | true |
| quote_present | true |
| sanitized error code | N/A |
| sanitized return_code | 0 |
| sanitized return_msg | OK |

## Normalized Fields Present

| Field | Present |
| --- | --- |
| provider | yes |
| symbol | yes |
| name | yes |
| market | yes |
| currency | yes |
| price | yes |
| change | yes |
| change_rate | yes |
| volume | yes |
| as_of | yes |

## Notes

```text
Sanitized sample only. No provider raw response was recorded.
```

## Redaction Confirmation

```text
No token value included
No app key included
No secret key included
No authorization header included
No raw request body included
No raw provider response included
No account number included
No order information included
No balance information included
No holdings information included
No IP address included
No personal information included
Safe to share: yes
```
