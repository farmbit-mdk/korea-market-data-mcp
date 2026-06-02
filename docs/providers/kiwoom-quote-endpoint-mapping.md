# Kiwoom Quote Endpoint Mapping

## 1. Purpose

This document tracks the read-only Kiwoom quote endpoint mapping work for `v0.8.0-alpha`.

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
    method: "POST",
    path: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_ENDPOINT",
    apiId: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_API_ID",
    description: "Read-only stock quote endpoint mapping placeholder. Disabled until official Kiwoom documentation is verified.",
    verified: false
  }
}
```

The mapping is intentionally disabled.

Do not enable this mapping until:

```text
official Kiwoom quote endpoint path is verified
official API ID is verified
request fields are confirmed
response fields are confirmed
manual opt-in verification plan is documented
tests are updated
security review is complete
```

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
