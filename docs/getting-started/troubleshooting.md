# Troubleshooting

## Blocked vs Error

`blocked` means a local configuration or guard stopped the workflow before provider quote lookup.

`error` means token, provider, transport, or response normalization failed after the workflow was allowed to proceed.

## Common Blocked Reason Codes

| Code | Meaning | Safe next step |
| --- | --- | --- |
| `REAL_API_CALLS_DISABLED` | Real API calls are disabled. | Keep disabled unless doing explicit local verification. |
| `PUBLIC_QUOTE_REAL_PATH_DISABLED` | Public quote real path opt-in is disabled. | Keep disabled unless doing explicit local verification. |
| `ACTIVATION_DECISION_RECORD_MISSING` | Local-only activation decision record is missing. | Use mock provider first. |
| `CREDENTIALS_MISSING` | Required local credentials are missing. | Set only in local shell or ignored env file. |
| `CREDENTIALS_PLACEHOLDER` | Placeholder credentials were used. | Replace only in local untracked config. |
| `INVALID_SYMBOL` | Symbol is missing or not a 6-digit Korean stock code. | Use a code such as `005930`. |
| `TOKEN_REQUEST_BLOCKED` | Token was not available. | Verify token workflow without printing token values. |
| `TOKEN_REQUEST_FAILED` | Token request failed safely. | Check sanitized error only. |
| `ENDPOINT_DISABLED` | Endpoint mapping is disabled. | Expected by default. |
| `PUBLIC_TOOL_EXPOSURE_DISABLED` | Public tool exposure is disabled. | Expected by default. |
| `QUOTE_RESPONSE_INVALID` | Quote response normalization failed. | Do not share raw provider payload. |

## Mock Provider First

Most setup issues should be debugged with:

```env
MARKET_DATA_PROVIDER=mock
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

## Fetch Boundary

Provider network calls must stay isolated to:

```text
src/providers/kiwoom/transport.ts
```

Scripts and MCP tools should not call `fetch` directly.

## Credential Redaction

Never share:

```text
app key
secret key
access token
authorization header
raw request body
raw token response
raw quote response
.env or .env.local contents
```

Do not paste real credentials into GitHub issues, pull requests, screenshots, examples, or logs.
