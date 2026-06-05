# Kiwoom Public Quote Smoke Test Result Capture

## Purpose

This document defines how to record, review, and share sanitized results from a local-only smoke test for the guarded `get_kiwoom_stock_quote` MCP tool.

This is a result capture policy. It does not enable public real Kiwoom quote lookup by default.

## Definition

A smoke test result capture is a short, sanitized note that records what was tested and whether the result was `ok`, `blocked`, or `error`.

The capture must include only safe summary fields. It must not include credentials, tokens, request bodies, provider response bodies, account identifiers, order information, IP addresses, or personal information.

## Capture Principle

Record only sanitized results.

Allowed information should answer:

```text
which local workflow was tested
which version was tested
which environment label was used
which public quote tool or manual command was tested
which symbol was used
whether the result was ok, blocked, or error
whether token_present and quote_present were true or false
which normalized quote fields were present
which sanitized error code, return_code, or return_msg appeared
which redaction checks passed
```

Do not record:

```text
token
access token
app key
secret key
authorization header
raw request body
raw token response
raw quote response
full IP address
account number
order number
balance data
holdings data
trading data
personal information
```

## Successful Result Capture

For an `ok` result, record only:

```text
status=ok
provider=kiwoom
environment=mock or production
symbol=005930
tool=get_kiwoom_stock_quote
token_present=true or false
quote_present=true
normalized quote fields present
sanitized return_code if available
sanitized return_msg if available
redaction checklist passed
```

Do not paste the raw provider response. Do not paste a token value. Do not include request headers.

## Blocked Result Capture

For a `blocked` result, record only:

```text
status=blocked
provider=kiwoom
environment=mock or production
symbol=005930 if supplied
tool or command tested
token_present=false
quote_present=false
blocked reason
redaction checklist passed
```

Common safe blocked reasons:

```text
KIWOOM_ENABLE_REAL_API_CALLS is not true
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH is not true
credentials are missing or invalid
endpoint mapping is not enabled
endpoint mapping is not exposed as a public tool
endpoint mapping is not read-only
symbol is missing or invalid
```

## Error Result Capture

For an `error` result, record only:

```text
status=error
provider=kiwoom
environment=mock or production
symbol=005930 if supplied
tool or command tested
token_present=true or false
quote_present=false
sanitized error code
sanitized return_code if available
sanitized return_msg if available
redaction checklist passed
```

Never paste the provider response body to explain an error.

## Recordable Fields

Safe fields:

```text
test date
tested version
environment label
symbol tested
command or tool tested
result category
provider
market
currency
token_present
quote_present
normalized field presence
sanitized error code
sanitized return_code
sanitized return_msg
sanitized notes
maintainer review notes
safe-to-share confirmation
```

## Forbidden Fields

Forbidden fields:

```text
token
access token
app key
secret key
authorization header
raw request body
raw response body
raw provider payload
full IP address
account number
order number
order side
order quantity
order amount
balance amount
holdings details
execution details
personal information
```

## GitHub Issue Or PR Sharing Format

Use this shape when sharing in a GitHub issue or pull request:

```text
Summary:
Tested version:
Environment: mock or production
Command/tool tested:
Symbol tested:
Status: ok / blocked / error
token_present: true / false
quote_present: true / false
Sanitized error code:
Sanitized return_code:
Sanitized return_msg:
Normalized fields present:
Redaction checklist: passed
```

Use the dedicated report template:

```text
docs/providers/templates/kiwoom-public-quote-smoke-test-github-report.md
```

## Sharing Redaction Checklist

Before sharing, confirm:

```text
no token value
no access token value
no app key value
no secret key value
no authorization header
no raw request body
no raw token response
no raw quote response
no full IP address
no account number
no order information
no balance information
no holdings information
no personal information
```

## Failed Result Sharing Notes

Failed smoke test results can be useful, but only if they are sanitized.

When sharing a failure:

```text
share the normalized error code only
share sanitized return_code and return_msg only
describe reproduction steps without credentials
avoid screenshots unless every sensitive value is hidden
do not paste terminal history that includes environment variable assignments
```

## Limits

A local smoke test result is not provider certification.

It does not prove:

```text
provider terms allow public redistribution
all Kiwoom environments behave the same way
the endpoint is ready for default public real lookup
account/order/trading behavior exists
centralized proxy behavior exists
```

Public real quote lookup remains disabled by default.

## Activation Review Submission

A sanitized smoke test result may be submitted to activation review only as a summary.

Use this format:

```text
tested version
environment label
symbol tested
command or tool tested
status
token_present
quote_present
normalized fields present
sanitized error code
sanitized return_code
sanitized return_msg
redaction checklist status
safe-to-share confirmation
```

Connect the summary to:

```text
docs/providers/templates/kiwoom-real-quote-activation-decision-record.md
```

Do not submit raw results, raw provider payloads, request bodies, response bodies, credentials, tokens, full IP addresses, account identifiers, order information, or personal information.

Failed smoke test results may inform an activation decision when sanitized. A failure should usually keep the decision status as `not approved` or `rejected` until the cause is understood and safely resolved.

For `v0.21.0-alpha`, decision statuses are:

```text
approved_for_local_only
pending
rejected
```

Only `approved_for_local_only` may be used for local/test verification. A sanitized smoke test result is not evidence for public default enablement.

For v0.22 final hardening, the linked smoke test result field is required for an approved local-only decision record. The value must be a sanitized reference only, not the raw output.

Safe activation review summary fields:

```text
status
reason_code
token_present
quote_present
sanitized error code
sanitized return_code
sanitized return_msg
redaction checklist status
```
