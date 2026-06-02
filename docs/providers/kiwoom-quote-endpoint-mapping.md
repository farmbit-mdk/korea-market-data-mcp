# Kiwoom Quote Endpoint Mapping

## 1. Purpose

This document tracks the read-only Kiwoom quote endpoint mapping work for `v0.10.0-alpha`.

The goal is to prepare the provider-side quote adapter for a future verified Kiwoom quote endpoint without enabling live quote lookup yet.

---

## 2. Scope

Included:

```text
read-only quote endpoint mapping placeholder
request field mapping
response field mapping
normalized field mapping
mocked transport tests
fixture-based quote normalization tests
```

Excluded:

```text
public MCP quote tool
real Kiwoom quote lookup activation
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
```

---

## 3. Endpoint Mapping Status

Current mapping:

```ts
{
  quote: {
    enabled: false,
    manualOnly: true,
    readOnly: true,
    requiresToken: true,
    exposesPublicTool: false,
    forbiddenScopes: ["account", "order", "balance", "holdings", "trading"],
    method: "POST",
    path: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_ENDPOINT",
    apiId: "ka10001",
    description: "Stock basic information request. Disabled until endpoint path/header/body are verified against official Kiwoom documentation.",
    verified: false
  }
}
```

The mapping is intentionally disabled.

Field meanings:

```text
enabled:false means the mapping cannot be used for a real quote request yet.
manualOnly:true means the mapping may only be exercised through the manual verification command.
readOnly:true means the mapping cannot contain account, order, balance, holdings, or trading behavior.
requiresToken:true means a token must be acquired before a quote request in manual verification.
exposesPublicTool:false means enabling the mapping does not register any public MCP quote tool.
forbiddenScopes records scopes that must not appear in request mapping, response mapping, docs, or tests.
```

Do not enable this mapping until:

```text
official Kiwoom quote endpoint path is verified
official API ID `ka10001` request/response behavior is verified
request fields are confirmed
response fields are confirmed
manual opt-in verification plan is documented
tests are updated
security review is complete
```

The manual quote command also checks `enabled`, `manualOnly`, and `readOnly` before any token or quote request is made.

Changing `enabled:true` must be reviewed in a separate PR. That PR must verify the official endpoint path, API ID, auth header, request body, response body, normalized output, redaction behavior, and test coverage. It must not add a public MCP quote tool by implication.

---

## 4. Request Field Mapping

Allowed request fields:

| Normalized field | Kiwoom-like field | Notes |
| --- | --- | --- |
| `symbol` | `symbol` / `stock_code` | Korean stock code such as `005930` |
| `market` | `market` | Optional market hint |

Forbidden request fields:

```text
account_no
account
order_no
order
balance
holdings
available_quantity
buying_power
orderable_amount
position
execution
fill
side
quantity
amount
```

---

## 5. Response Field Mapping

Allowed Kiwoom-like response fields:

| Kiwoom-like field | Normalized field |
| --- | --- |
| `symbol` | `symbol` |
| `stock_code` | `symbol` |
| `name` | `name` |
| `market` | `market` |
| `price` | `price` |
| `current_price` | `price` |
| `change` | `change` |
| `change_rate` | `change_rate` |
| `volume` | `volume` |
| `as_of` | `as_of` |
| `timestamp` | `as_of` |
| `return_code` | `returnCode` |
| `return_msg` | `returnMessage` |

Numeric string fields may include commas and are normalized to numbers.

---

## 6. Normalized Quote Shape

The provider-side normalized quote shape is:

```json
{
  "provider": "kiwoom",
  "symbol": "005930",
  "name": "Samsung Electronics",
  "market": "KOSPI",
  "currency": "KRW",
  "price": 70000,
  "change": -500,
  "change_rate": -0.71,
  "volume": 12345678,
  "as_of": "2026-06-02T09:00:00.000Z",
  "raw_available": false,
  "returnCode": "0",
  "returnMessage": "OK"
}
```

The raw response object is not returned.

---

## 7. Safety Notes

This version does not enable live quote lookup.

The public MCP tool registry remains unchanged:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

No public MCP quote tool is added in this release.

An enabled endpoint mapping is only a provider-internal manual verification setting. It does not activate public real Kiwoom quote lookup.

The quote adapter must not log or return:

```text
app key
secret key
access token
authorization header
raw request body
raw provider response object
account or order fields
```

---

## 8. Future Enablement Checklist

Before live quote lookup is enabled:

```text
verify official Kiwoom endpoint path
verify API ID
verify auth header format
verify request body
verify response body
document manual quote verification workflow
keep real API calls opt-in
add mocked and manual tests
confirm no account/order/trading fields are introduced
```
