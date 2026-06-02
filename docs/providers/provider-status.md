# Provider Status

## 1. Purpose

This document tracks the implementation status of market data providers in `korea-market-data-mcp`.

The goal is to make provider capabilities, limitations, and safety constraints explicit for users, maintainers, and contributors.

This document is especially important because different providers may have different authentication requirements, data licenses, rate limits, and supported market data endpoints.

---

## 2. Current provider summary

| Provider | Status        | Real API calls |     Credentials required | Default | Notes                                                   |
| -------- | ------------- | -------------: | -----------------------: | ------: | ------------------------------------------------------- |
| `mock`   | Implemented   |             No |                       No |     Yes | Fixed sample data for local MCP testing                 |
| `kiwoom` | Quote endpoint mapping |  No by default | Yes, for manual token verification |      No | Disabled read-only quote endpoint mapping; no live quote lookup enabled yet |

---

## 3. Provider selection

Provider selection is controlled by:

```env
MARKET_DATA_PROVIDER=mock
```

Supported values:

```text
mock
kiwoom
```

Default provider:

```text
mock
```

The mock provider should remain the safest default because it does not require credentials and does not make network calls.

---

## 4. Mock provider

## 4.1 Status

```text
implemented
```

The mock provider is fully available for local MCP client testing.

It returns fixed sample data and does not call external services.

---

## 4.2 Supported tools

The mock provider currently supports:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

---

## 4.3 Supported sample data

Current mock data includes:

```text
005930 Samsung Electronics
069500 KODEX 200
KOSPI
KOSDAQ
KOSPI200
```

Korean alias search is also supported.

Examples:

```text
삼성전자 -> 005930
코덱스200 -> 069500
```

English alias search is supported.

Examples:

```text
Samsung Electronics -> 005930
Samsung -> 005930
KODEX 200 -> 069500
```

---

## 4.4 Network behavior

The mock provider must not call:

```text
fetch
axios
http.request
https.request
external APIs
```

The mock provider is intended for:

```text
local MCP testing
tool schema validation
Claude Desktop integration testing
read-only safety testing
documentation examples
```

---

## 4.5 Data limitation

Mock provider data is fixed sample data.

It is not live market data.

It must not be used for investment decisions.

---

## 5. Kiwoom provider

## 5.1 Status

```text
quote endpoint mapping
```

The Kiwoom provider currently exists as an authentication, provider-selection, token-request opt-in, manual token verification workflow, read-only quote adapter skeleton, and disabled quote endpoint mapping.

It does not provide live Kiwoom market data yet.

It does not make real Kiwoom API calls by default.

---

## 5.2 Current implementation

Current implemented behavior:

```text
provider selection
credential config loading
missing credential validation
dummy credential handling
token request and response types
in-memory token cache type
transport abstraction for token requests
mocked token response normalization
mocked token error normalization
Kiwoom token failure response normalization
in-memory token cache storage and expiry checks
manual token verification command
manual token verification documentation
read-only quote request/response types
read-only quote adapter skeleton
mocked quote response normalization
quote endpoint intentionally not configured by default
disabled quote endpoint mapping constant
quote endpoint mapping documentation
quote response fixtures
normalized auth errors
no-network safety tests
read-only provider skeleton
```

Current not implemented behavior:

```text
real stock quote request
real ETF quote request
real market index request
real daily chart request
realtime data
WebSocket streaming
```

---

## 5.3 Environment variables

Expected Kiwoom-related environment variables:

```env
MARKET_DATA_PROVIDER=kiwoom

KIWOOM_ENV=mock
KIWOOM_APP_KEY=
KIWOOM_APP_SECRET=
KIWOOM_SECRET_KEY=
KIWOOM_API_BASE_URL=https://api.kiwoom.com
KIWOOM_MOCK_API_BASE_URL=https://mockapi.kiwoom.com
KIWOOM_ENABLE_REAL_API_CALLS=false
```

Security default:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
```

Real Kiwoom API calls must remain disabled by default.

---

## 5.4 Current behavior matrix

| Condition                             | Expected behavior                 |
| ------------------------------------- | --------------------------------- |
| Missing Kiwoom credentials            | `PROVIDER_AUTH_FAILED`            |
| Dummy credentials + real API disabled | `UNSUPPORTED_PROVIDER_CAPABILITY` |
| Real API enabled + mocked transport   | Token response can be normalized  |
| Real API enabled + real transport     | Not implemented for default use   |
| Token request with default safety     | No transport call                 |
| Kiwoom error token response           | `KIWOOM_TOKEN_REQUEST_FAILED`     |
| Malformed token response              | `PROVIDER_BAD_RESPONSE`           |
| Manual command + opt-in false         | No real request                   |
| Manual command + missing credentials  | No real request                   |
| Manual command + explicit opt-in      | Token request allowed only by command |
| Quote adapter skeleton without endpoint config | `KIWOOM_QUOTE_NOT_IMPLEMENTED` |
| Quote endpoint mapping                 | Documented and disabled         |
| Mocked quote response                 | Can be normalized safely          |
| Malformed quote response              | `KIWOOM_QUOTE_BAD_RESPONSE`       |
| Market data request                   | Not implemented yet               |
| Trading/account request               | Forbidden                         |

---

## 5.5 Network behavior

The current Kiwoom provider skeleton must not call:

```text
fetch
axios
http.request
https.request
external Kiwoom endpoints
```

Tests must confirm that no network call happens.

---

## 5.6 Future allowed capabilities

Future Kiwoom provider implementation may support read-only market data endpoints such as:

```text
stock quote lookup
ETF quote lookup
market index lookup
daily chart lookup
symbol search or symbol mapping
provider status check
```

These capabilities must be implemented through normalized provider adapters.

---

## 5.7 Explicitly forbidden capabilities

The Kiwoom provider must not expose:

```text
trading
order execution
order cancellation
order modification
account balance lookup
deposit lookup
holdings lookup
trade history lookup
order history lookup
profit/loss lookup
portfolio rebalancing
automated trading
investment recommendations
```

Even if a provider API supports these endpoints, this MCP server must not expose them.

---

## 6. Read-only policy

All providers must follow the read-only project scope.

Allowed tool category:

```text
market data lookup
```

Forbidden tool categories:

```text
trading
orders
account
portfolio
recommendation
automation for execution
```

Current allowed MCP tools:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

The tool registry safety tests must fail if forbidden tools are added.

---

## 7. Credential handling policy

Provider credentials must be handled locally.

Credentials must not be:

```text
logged
returned in MCP responses
committed to Git
included in tests
included in examples as real values
written to persistent cache by default
```

Sensitive values include:

```text
KIWOOM_APP_KEY
KIWOOM_APP_SECRET
KIWOOM_SECRET_KEY
access_token
Authorization
Bearer tokens
provider secrets
.env content
```

Secret redaction tests must continue to verify that sensitive values are removed from logs and errors.

---

## 8. Error normalization policy

Provider-specific errors must be mapped to normalized project error codes.

Current normalized error codes include:

```text
PROVIDER_AUTH_FAILED
PROVIDER_RATE_LIMITED
PROVIDER_TIMEOUT
PROVIDER_UNAVAILABLE
PROVIDER_BAD_RESPONSE
KIWOOM_TOKEN_REQUEST_FAILED
KIWOOM_QUOTE_NOT_IMPLEMENTED
KIWOOM_QUOTE_BAD_RESPONSE
KIWOOM_QUOTE_REQUEST_FAILED
SYMBOL_NOT_FOUND
INVALID_INPUT
UNSUPPORTED_PROVIDER_CAPABILITY
INTERNAL_ERROR
```

Provider errors must not expose raw provider credentials, tokens, request headers, or `.env` values.

---

## 9. Test requirements by provider

## 9.1 Mock provider tests

The mock provider should verify:

```text
stock quote response
ETF quote response
market index response
daily chart response
Korean alias search
English alias search
normalized response fields
no real network dependency
```

---

## 9.2 Kiwoom provider tests

The Kiwoom provider should verify:

```text
provider selection works
credentials can be loaded
missing credentials return PROVIDER_AUTH_FAILED
dummy credentials with real API disabled return UNSUPPORTED_PROVIDER_CAPABILITY
fetch/network calls do not happen by default
dummy credentials do not trigger token transport when real API calls are disabled
mocked token response can be normalized
failed token responses can be normalized
Kiwoom token error responses include return_code and return_msg only
secrets are redacted from token errors
token values are not logged
in-memory token cache stores valid tokens and skips expired tokens
manual command blocks when real API opt-in is false
manual command blocks when credentials are missing
manual command returns token_present without printing token values
quote adapter normalizes mocked quote responses
quote endpoint mapping remains disabled
quote adapter rejects account/order/balance/holdings fields
MCP tool registry remains unchanged
tests are isolated from caller shell environment
```

Kiwoom tests must not require real credentials.

---

## 10. Release mapping

## v0.1.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom provider not implemented
```

Release description:

```text
Mock Provider MCP Skeleton
```

---

## v0.2.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom auth skeleton implemented
real Kiwoom API calls disabled by default
```

Recommended release description:

```text
Kiwoom Provider Auth Skeleton
```

This release must not be described as live Kiwoom market data support.

---

## v0.3.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom token client interface implemented
real Kiwoom API calls disabled by default
token tests use mocked transport only
```

Recommended release description:

```text
Kiwoom Token Client Interface
```

This release must not be described as live Kiwoom market data support or as support for Kiwoom stock, ETF, index, chart, account, order, or trading endpoints.

---

## v0.4.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom token request opt-in flow implemented
real Kiwoom API calls disabled by default
token tests use mocked transport only
in-memory token cache behavior tested
```

Recommended release description:

```text
Kiwoom Token Request Opt-In Flow
```

This release must not be described as live Kiwoom market data support. Stock, ETF, index, chart, realtime, account, order, trading, and recommendation endpoints remain unimplemented or forbidden.

---

## v0.5.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom manual token verification workflow implemented
real Kiwoom API calls disabled by default
manual token command requires explicit opt-in
market data endpoints remain unimplemented
```

Recommended release description:

```text
Kiwoom Manual Token Verification
```

This release must not be described as live Kiwoom market data support. Quote, ETF, index, chart, realtime, account, order, balance, holdings, trading, auto-trading, and recommendation features remain unimplemented or forbidden.

---

## v0.6.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom manual token verification workflow hardened
real Kiwoom API calls disabled by default
manual command remains the only token verification path
market data endpoints remain unimplemented
```

Recommended release description:

```text
Kiwoom Manual Token Verification Hardening
```

This release must not be described as live Kiwoom market data support. Quote, ETF, index, chart, realtime, account, order, balance, holdings, trading, auto-trading, and recommendation features remain unimplemented or forbidden.

---

## v0.7.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom manual token verification workflow hardened
Kiwoom read-only quote adapter skeleton implemented
real quote lookup not implemented or enabled
MCP tool registry unchanged
```

Recommended release description:

```text
Kiwoom Read-only Quote Adapter Skeleton
```

This release must not be described as live Kiwoom quote support. Quote, ETF, index, chart, realtime, account, order, balance, holdings, trading, auto-trading, and recommendation features remain unimplemented or forbidden.

---

## v0.8.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom token verification hardened
Kiwoom read-only quote adapter skeleton implemented
Kiwoom quote endpoint mapping documented
real quote lookup not enabled
public MCP quote tool not added
```

Recommended release description:

```text
Kiwoom Quote Endpoint Mapping
```

This release must not be described as live Kiwoom quote support. Public MCP quote tools, real quote lookup, ETF, index, chart, realtime, account, order, balance, holdings, trading, auto-trading, and recommendation features remain unimplemented or forbidden.

---

## 11. Future provider candidates

Potential future providers may include:

```text
KRX public data
Bank of Korea ECOS
FRED
Yahoo Finance
other public macro or market data sources
```

Each provider must be added behind the same provider adapter interface.

Each provider must have:

```text
status documentation
capability documentation
credential policy if applicable
rate limit notes if applicable
tests
normalized response mapping
```

---

## 12. Maintainer checklist before enabling a provider

Before a provider is marked as implemented, verify:

```text
provider status documented
environment variables documented
credentials redacted
tests added
build passes
all tests pass
no forbidden tools added
no account/order/trading endpoints exposed
normalized responses implemented
provider errors normalized
README updated
```

For providers that make real API calls, also verify:

```text
real API calls are opt-in where appropriate
rate limit behavior is understood
terms of service are reviewed
data redistribution risk is reviewed
manual verification steps are documented
```

---

## 13. Current recommended default

The recommended default remains:

```env
MARKET_DATA_PROVIDER=mock
```

Use `mock` for local MCP setup, Claude Desktop testing, documentation validation, and contributor onboarding.

Use `kiwoom` only for provider skeleton validation until real Kiwoom market data integration is explicitly implemented and documented.
