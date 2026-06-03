# Kiwoom Real Quote Activation Decision Record

Use this template before approving any change that enables a Kiwoom real quote endpoint path.

Do not include tokens, app keys, secret keys, raw request bodies, raw response bodies, full IP addresses, account numbers, order-related values, or personal information.

## Decision Metadata

| Field | Value |
| --- | --- |
| Decision date | YYYY-MM-DD |
| Target version | v0.21.0-alpha |
| Provider | kiwoom |
| Feature | public_quote_real_path |
| Scope | local_only |
| Decision status | approved_for_local_only / pending / rejected |
| Reviewed at | YYYY-MM-DD |
| Reviewer | sanitized reviewer id |
| Linked smoke test result | sanitized result reference |

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

## Decision Scope

```text
This decision record is only a local/test verification gate.
It is not approval for public default real quote lookup.
It is not approval for centralized data redistribution.
It is not approval for account, order, balance, holdings, trading, auto-trading, or recommendation features.
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
pending
```

## Required Follow-Up

```text
List follow-up items before any endpoint flag change.
```

## Reviewer Notes

```text
Sanitized notes only.
```
