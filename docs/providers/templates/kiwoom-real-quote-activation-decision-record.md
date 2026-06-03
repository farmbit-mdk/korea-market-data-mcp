# Kiwoom Real Quote Activation Decision Record

Use this template before approving any change that enables a Kiwoom real quote endpoint path.

Do not include tokens, app keys, secret keys, raw request bodies, raw response bodies, full IP addresses, account numbers, order-related values, or personal information.

## Decision Metadata

| Field | Value |
| --- | --- |
| Decision date | YYYY-MM-DD |
| Target version | v0.20.0-alpha |
| Decision status | not approved / approved for local-only opt-in / approved for wider opt-in / rejected |

## Reviewed Endpoint Flags

| Flag | Reviewed value |
| --- | --- |
| readOnly | true / false |
| enabled | true / false |
| exposesPublicTool | true / false |
| manualOnly | true / false |
| requiresToken | true / false |

## Reviewed Environment Flags

| Flag | Reviewed value |
| --- | --- |
| KIWOOM_ENABLE_REAL_API_CALLS | true / false |
| KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH | true / false |

## Smoke Test Summary

```text
Use sanitized smoke test summary only.
Include status, token_present, quote_present, normalized field presence, sanitized error code, sanitized return_code, and sanitized return_msg.
Do not include raw provider payloads.
```

## Compliance Review Summary

```text
Summarize official endpoint verification, provider terms review, and allowed usage review.
Do not include credentials.
```

## Security Review Summary

```text
Summarize credential handling, token handling, redaction, logging, and MCP response safety.
```

## Data Redistribution Risk Review

```text
Summarize whether local use, caching, public display, or redistribution has been reviewed against provider terms.
```

## Redaction Review

```text
Confirm no token, app key, secret key, authorization header, raw request body, raw response body, account number, order information, IP address, or personal information is included.
```

## Final Decision

```text
not approved
```

## Required Follow-Up

```text
List follow-up items before any endpoint flag change.
```

## Reviewer Notes

```text
Sanitized notes only.
```
