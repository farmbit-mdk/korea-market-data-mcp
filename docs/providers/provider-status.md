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
| `kiwoom` | Official npm alpha publish prepared |  No by default | Yes, for manual token/quote verification and local-only smoke tests |      No | Guarded public quote tool; real lookup disabled by default |

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
resolve_korean_market_query
get_korean_market_data_context
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
manual quote verification
```

The Kiwoom provider currently exists as an authentication, provider-selection, token-request opt-in, manual token verification workflow, read-only quote adapter skeleton, disabled quote endpoint mapping, and hardened guarded manual quote verification workflow.

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
manual quote verification command
manual quote verification documentation
manual quote verification hardening tests
provider compliance documentation
Kiwoom compliance notes
credential handling documentation
public quote tool readiness checklist
guarded Kiwoom public quote MCP tool skeleton
mock/test integration for guarded public quote response shape
guard hardening for Kiwoom public quote tool
explicit opt-in guard for Kiwoom public quote real path
local verification documentation for Kiwoom public quote tool
local verification hardening docs and examples
real local smoke test documentation
sanitized public quote smoke test result template
public quote smoke test checklist
smoke test result capture documentation
sanitized smoke test result sample
GitHub smoke test report template
real quote endpoint activation review documentation
real quote activation decision record template
real quote activation review checklist
local opt-in activation guard requiring approved_for_local_only decision record
standardized public quote blocked reason codes
activation decision record fixtures for local/test verification
manual quote blocked output reason_code
MCP client setup docs
Claude Desktop setup docs
Cursor setup docs
user onboarding docs
alpha launch candidate README cleanup
known limitations documentation
examples README and final example review
v0.24.0-alpha release checklist
package and distribution readiness documentation
alpha install smoke test documentation
package metadata review for local install/run commands
alpha launch announcement draft
alpha final review documentation
v0.26.0-alpha final release checklist
npm pack dry run and publish readiness documentation
v0.27.0-alpha release checklist
package metadata review for npm readiness
clean install smoke test documentation
package-based MCP config examples for local tarball validation
v0.28.0-alpha release checklist
official npm publish decision documentation
npm access policy documentation
versioning policy documentation
v0.29.0-alpha release checklist
official npm alpha publish result documentation
v0.30.0-alpha release checklist
Korean market data query resolution tools
structured market data context payloads
real market data context UX improvements
Kiwoom setup check script
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
| Quote endpoint mapping                 | Documented, guarded, and disabled |
| Manual quote command + opt-in false    | No real request                 |
| Manual quote command + disabled endpoint mapping | No token or quote request |
| Manual quote command + provider quote error | Safe normalized error only |
| Manual quote command + malformed quote response | Safe bad-response error only |
| Provider compliance review        | Added documentation and tests |
| Kiwoom public quote tool          | Guarded skeleton registered |
| Kiwoom public quote tool guards   | Hardened validation and redaction |
| Kiwoom public quote real path      | Explicit opt-in only, not default |
| Kiwoom public quote local verification | Documented for local MCP clients |
| Kiwoom public quote local verification hardening | Env matrix, blocked reasons, and examples added |
| Kiwoom public quote real local smoke test docs | Added; local-only and sanitized result recording only |
| Kiwoom public quote smoke test result capture | Added; sanitized capture and sharing templates only |
| Kiwoom real quote endpoint activation review | Added; decision record required before endpoint flag activation |
| Kiwoom real quote local opt-in activation | Clarified; `approved_for_local_only` decision required for local/test simulation |
| Kiwoom real quote local activation final hardening | Added blocked `reason_code` values and stricter activation decision checks |
| MCP client setup and user onboarding docs | Added quickstart, Claude Desktop, Cursor, troubleshooting, and safe examples |
| Read-only Kiwoom quote MCP alpha launch candidate | Added README cleanup, CHANGELOG, examples review, known limitations, and v0.24 checklist |
| Package and distribution readiness | Added package metadata review, distribution readiness docs, install smoke test docs, and v0.25 checklist |
| Alpha release final review | Prepared final review docs, launch announcement draft, and v0.26 checklist |
| npm pack dry run and publish readiness | Prepared dry-run docs, package contents policy, and v0.27 checklist; npm publish not performed |
| Clean install smoke test | Prepared tarball install smoke docs, package-based MCP examples, and v0.28 checklist; npm publish not performed |
| Official npm publish decision | Documented defer-publish decision, package name availability check, access policy, versioning policy, and v0.29 checklist; npm publish not performed |
| Official npm alpha publish | Publishes v0.30.0-alpha with alpha dist-tag; latest currently points to alpha, documented install remains @alpha, no hosted proxy, and no runtime scope expansion |
| Korean market data query resolution | Adds resolve_korean_market_query and get_korean_market_data_context for natural-language stock, ETF, and index data lookup |
| Real market data context UX | Adds Kiwoom setup check, investment environment diagnostics, guarded real quote context, unavailable chart/index states, and no mock fallback for failed real context |
| Public real Kiwoom quote lookup   | Not enabled by default |
| Mock/test quote response          | Available for response validation only |
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
resolve_korean_market_query
get_korean_market_data_context
search_korean_symbol
get_stock_quote
get_kiwoom_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

`get_kiwoom_stock_quote` is the only Kiwoom public quote tool. Its real provider path remains guarded and disabled by default. Future tools require a separate review.

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
manual quote command remains blocked by default
quote adapter rejects account/order/balance/holdings fields
MCP tool registry remains unchanged
tests are isolated from caller shell environment
manual quote command output does not expose app key, secret, or access token
manual quote command output does not expose raw malformed quote responses
endpoint mapping metadata documents manual-only/read-only/no-public-tool policy
provider compliance docs exist
credential handling docs exist
public quote tool readiness checklist exists
guarded Kiwoom public quote tool is registered
public real Kiwoom quote lookup remains blocked by default
mock/test public quote success path returns stable nested quote shape
public quote guard rejects malformed symbols and forbidden fields safely
public quote real path requires KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true
local verification docs and MCP request example exist
local verification env matrix and blocked reason matrix exist
real local smoke test docs, checklist, and sanitized result template exist
smoke test result capture docs, sample, and GitHub report template exist
activation review docs, decision record template, and activation checklist exist
local opt-in activation requires approved_for_local_only decision record
blocked reason codes are standardized between docs and tests
MCP client setup docs and examples use mock provider first
alpha launch candidate docs cover known limitations and examples review
package/distribution docs keep mock provider as recommended first path
alpha final review confirms public tool scope and unsupported scope
npm publish readiness docs confirm no hosted proxy and no npm publish performed
clean install smoke docs confirm package setup remains alpha/testing only
official npm publish decision docs confirm defer-publish status and access/versioning policy
npm alpha publish docs confirm latest currently points to alpha, but alpha install is still the required documented path
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

## v0.9.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom token verification hardened
Kiwoom quote endpoint mapping documented
Kiwoom read-only quote manual verification workflow added
public MCP quote tool not added
real quote lookup remains guarded and disabled by default
```

Recommended release description:

```text
Kiwoom Read-only Quote Manual Verification
```

This release must not be described as public Kiwoom quote support. Public MCP quote tools, account access, orders, balance lookup, holdings lookup, trading, auto-trading, and investment recommendations remain unimplemented or forbidden.

---

## v0.10.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom token verification hardened
Kiwoom quote endpoint mapping documented and guarded
Kiwoom read-only quote manual verification workflow added and hardened
public MCP quote tool not added
public real quote lookup not enabled
account/order/trading explicitly out of scope
```

Recommended release description:

```text
Kiwoom Quote Manual Verification Hardening
```

This release must not be described as public Kiwoom quote support. Public MCP quote tools, public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, and investment recommendations remain unimplemented or forbidden.

---

## v0.11.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom token verification hardened
Kiwoom quote endpoint mapping documented and guarded
Kiwoom read-only quote manual verification workflow hardened
provider compliance review added
credential handling policy documented
public quote tool readiness checklist added
public MCP quote tool not added
public real quote lookup not enabled
account/order/trading explicitly out of scope
```

Recommended release description:

```text
Provider Compliance and Security Review
```

This release must not be described as public Kiwoom quote support. Public MCP quote tools, public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain unimplemented or forbidden.

---

## v0.12.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom token verification hardened
Kiwoom quote manual verification hardened
provider compliance review added
Kiwoom public quote tool guarded skeleton registered
public real Kiwoom quote lookup not enabled by default
account/order/trading explicitly out of scope
```

Recommended release description:

```text
Kiwoom Public Quote Tool Guarded Skeleton
```

This release registers a guarded read-only MCP tool skeleton for future Kiwoom stock quotes. It must not be described as live Kiwoom quote support. Public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain unimplemented or forbidden.

---

## v0.13.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote tool guarded skeleton registered
Kiwoom public quote tool response shape stabilized
mock/test provider flow available for response validation only
symbol validation requires 6-digit Korean stock code
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
```

Recommended release description:

```text
Kiwoom Public Quote Tool Mock Provider Integration
```

This release validates `get_kiwoom_stock_quote` with mock/test-only flows and stabilizes blocked/error/ok response shapes. It must not be described as live Kiwoom quote support. Public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain unimplemented or forbidden.

---

## v0.14.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote tool guarded skeleton registered
Kiwoom public quote tool guard hardened
symbol validation edge cases covered
forbidden runtime fields rejected safely
blocked/error/ok response shapes remain stable
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
```

Recommended release description:

```text
Kiwoom Public Quote Tool Guard Hardening
```

This release hardens `get_kiwoom_stock_quote` guard order, validation edge cases, forbidden-field handling, and redaction tests. It must not be described as live Kiwoom quote support. Public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain unimplemented or forbidden.

---

## v0.15.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote tool guarded skeleton registered
Kiwoom public quote real path split behind explicit opt-in guard
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false by default
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
```

Recommended release description:

```text
Kiwoom Public Quote Tool Explicit Opt-in Verification
```

This release separates public quote real-path activation behind `KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true` in addition to the existing real API opt-in and endpoint guards. It must not be described as live Kiwoom quote support. Public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.16.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote tool guarded skeleton registered
Kiwoom public quote local verification docs added
MCP request example added
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Kiwoom Public Quote Tool Local Verification Docs
```

This release documents local-only verification for `get_kiwoom_stock_quote`. It must not be described as live Kiwoom quote support. Public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.17.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote local verification docs hardened
environment matrix documented
blocked reason matrix documented
MCP request and response examples added
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Kiwoom Public Quote Tool Local Verification Hardening
```

This release hardens local-only verification documentation and examples for `get_kiwoom_stock_quote`. It must not be described as live Kiwoom quote support. Public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.18.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote real local smoke test docs added
sanitized smoke test result template added
smoke test checklist added
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Kiwoom Public Quote Tool Real Local Smoke Test
```

This release documents a local-only real path smoke test for `get_kiwoom_stock_quote` and adds a sanitized result recording template. It must not be described as public live Kiwoom quote support. Public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.19.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote smoke test result capture docs added
sanitized smoke test result sample added
GitHub report template added
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Kiwoom Public Quote Tool Smoke Test Result Capture
```

This release documents how to capture and share sanitized local smoke test results for `get_kiwoom_stock_quote`. It must not be described as public live Kiwoom quote support. Public real Kiwoom quote lookup, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.20.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom real quote endpoint activation review docs added
activation decision record template added
activation review checklist added
public real Kiwoom quote lookup disabled by default
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Kiwoom Real Quote Endpoint Activation Review
```

This release documents the review and decision record required before any real Kiwoom quote endpoint activation. It must not be described as public live Kiwoom quote support. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.21.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote tool remains guarded
Kiwoom real quote local opt-in activation path clarified
KIWOOM_ENABLE_REAL_API_CALLS=true alone is insufficient
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true is separately required
activation decision record decision=approved_for_local_only is required for local/test verification
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Kiwoom Real Quote Local Opt-in Activation
```

This release clarifies the local/test-only activation path for the guarded `get_kiwoom_stock_quote` real path. It must not be described as public live Kiwoom quote support. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.22.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom public quote tool remains guarded
Kiwoom real quote local activation guard final hardening added
blocked reason codes standardized
manual quote blocked output includes reason_code
activation decision fixtures cover missing, pending, rejected, wrong scope, wrong feature, and missing linked smoke test result
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Kiwoom Real Quote Local Activation Final Hardening
```

This release final-hardens local/test-only activation guards and blocked diagnostics for `get_kiwoom_stock_quote`. It must not be described as public live Kiwoom quote support. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.23.0-alpha

Provider status:

```text
mock provider implemented
MCP client setup docs added
Claude Desktop setup docs added
Cursor setup docs added
user onboarding docs added
mock provider recommended for first setup
Kiwoom real local verification remains explicit opt-in only
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
MCP Client Setup and User Onboarding Docs
```

This release adds user-facing setup docs and MCP client examples. It must not be described as public live Kiwoom quote support. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.24.0-alpha

Provider status:

```text
mock provider implemented
README launch candidate cleanup added
CHANGELOG.md added
known limitations documentation added
examples README and final example review added
provider-status public tool list clarified
get_kiwoom_stock_quote remains the only Kiwoom public quote tool
Kiwoom manual token and quote verification remain explicit opt-in only
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Read-only Kiwoom Quote MCP Alpha Launch Candidate
```

This release prepares alpha launch candidate documentation and examples. It must not be described as public live Kiwoom quote support. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.25.0-alpha

Provider status:

```text
mock provider implemented
package metadata reviewed for local install/run readiness
README install/run commands aligned with package.json
distribution readiness documentation added
alpha install smoke test documentation added
examples command and args reviewed for dist/index.js
npm publishing not performed
hosted proxy not provided
mock provider remains recommended first path
Kiwoom real local verification remains advanced explicit opt-in only
get_kiwoom_stock_quote public tool scope unchanged
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Package and Distribution Readiness
```

This release prepares package and distribution documentation for local alpha users. It must not be described as an npm-published package or hosted MCP service unless those actions are performed separately. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.26.0-alpha

Provider status:

```text
mock provider implemented
alpha release final review prepared
README final review completed
SECURITY final review completed
examples final review completed
package metadata final review completed
alpha launch announcement draft added
alpha final review document added
final release checklist added
distribution remains GitHub clone/local setup
npm publishing not performed
hosted proxy not provided
public tool list reviewed
get_kiwoom_stock_quote public tool scope unchanged
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
Kiwoom real local verification remains explicit opt-in only
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Alpha Release Final Review
```

This release prepares final alpha release review documentation. It must not be described as live Kiwoom quote support, an npm-published package, or a hosted MCP service. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.27.0-alpha

Provider status:

```text
mock provider implemented
npm pack dry run and publish readiness prepared
package metadata reviewed for npm readiness
npm pack dry run documentation added
package contents policy documented
clean install smoke test plan documented
distribution security warning added
npm publishing not performed
hosted proxy not provided
public tool list unchanged
get_kiwoom_stock_quote public tool scope unchanged
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
Kiwoom real local verification remains explicit opt-in only
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
npm Pack Dry Run and Publish Readiness
```

This release prepares npm pack dry-run and publish-readiness documentation. It must not be described as an npm-published package or hosted MCP service. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.28.0-alpha

Provider status:

```text
mock provider implemented
clean install smoke test readiness prepared
tarball install smoke documentation added
package bin/start smoke documentation added
package-based MCP config examples added for local tarball or future npm validation
npm publishing not performed
hosted proxy not provided
public tool list unchanged
get_kiwoom_stock_quote public tool scope unchanged
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
Kiwoom real local verification remains explicit opt-in only
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Clean Install Smoke Test
```

This release prepares and documents clean install smoke test readiness for the package tarball. It must not be described as an npm-published package or hosted MCP service. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.29.0-alpha

Provider status:

```text
mock provider implemented
official npm publish decision documented
publish decision is defer publish
package name availability checked with npm view and returned E404 Not Found on 2026-06-07
npm access policy documented
versioning policy documented
npm publishing not performed
hosted proxy not provided
public tool list unchanged
get_kiwoom_stock_quote public tool scope unchanged
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
Kiwoom real local verification remains explicit opt-in only
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Official npm Publish Decision
```

This release records the decision to defer actual npm publish until a separate final publish release. It must not be described as an npm-published package or hosted MCP service. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.30.0-alpha

Provider status:

```text
mock provider implemented
official npm alpha package published when publish succeeds
distribution channels are GitHub source repository and npm alpha package
npm alpha dist-tag used
latest currently points to alpha, but alpha install is still the required documented path
v0.30.0-alpha is not a stable/latest release
hosted proxy not provided
public tool list unchanged
get_kiwoom_stock_quote public tool scope unchanged
endpoint enabled default remains false
endpoint exposesPublicTool default remains false
public real Kiwoom quote lookup disabled by default
Kiwoom real local verification remains explicit opt-in only
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Official npm Alpha Publish
```

This release publishes the official npm alpha package using the `alpha` dist-tag. The npm registry currently also has `latest` pointing to `0.30.0-alpha`, but this is not a stable/latest release and the required documented install path remains `npm install korea-market-data-mcp@alpha`. It must not be described as a hosted MCP service or as live Kiwoom quote support. Public real Kiwoom quote lookup, endpoint enabled defaults, public exposure defaults, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, and centralized data redistribution proxy behavior remain disabled by default or forbidden.

---

## v0.31.0-alpha

Provider status:

```text
mock provider implemented
natural-language Korean market query resolution implemented
resolve_korean_market_query registered
get_korean_market_data_context registered
Samsung Electronics, KODEX 200, KOSPI, KOSDAQ, and KOSPI 200 aliases supported
structured quote, daily chart, and related index context returned for mock provider
public tool list expanded with read-only data resolution tools
get_kiwoom_stock_quote public tool scope unchanged
real Kiwoom quote lookup disabled by default
Kiwoom real local verification remains explicit opt-in only
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Korean Market Data Query Resolution
```

This release adds natural-language target resolution and structured market data context payloads for Korean stocks, ETFs, and indices. It must not be described as an answer engine, recommendation engine, hosted MCP service, or live Kiwoom quote support. Responses provide data payloads only and do not include buy/sell judgments, target prices, return forecasts, portfolio decisions, or investment recommendations.

---

## v0.32.0-alpha

Provider status:

```text
mock provider implemented
Kiwoom setup check script added
KIWOOM_INVESTMENT_ENV documented in env example
manual quote symbol fallback uses 005930 when CLI and env symbols are absent
get_korean_market_data_context resolves natural-language queries for Kiwoom provider
Kiwoom context quote path uses existing guarded real quote flow
failed or blocked real context lookup does not fall back to mock data
real daily chart context returns unavailable
real index context returns unavailable
get_kiwoom_stock_quote public tool scope unchanged
real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Real Market Data Context UX
```

This release improves real Kiwoom readiness diagnostics and context payload behavior. It must not be described as enabling real quote lookup by default, adding real chart/index support, or adding recommendation/account/order/trading behavior. Failed real context lookups must return explicit blocked/provider_error/unavailable states instead of mock fallback data.

---

## v0.33.0-alpha

Provider status:

```text
official npm alpha package remains the documented package path
Claude Desktop npm alpha config example added
Claude Desktop local development config example added
Claude Desktop natural-language query verification prompts documented
Claude Desktop real-provider-oriented context verification documented
Kiwoom setup check interpretation documented
verification result capture document added
get_korean_market_data_context no mock fallback behavior documented
get_kiwoom_stock_quote public tool scope unchanged
real Kiwoom quote lookup disabled by default
account/order/trading explicitly out of scope
centralized data redistribution proxy out of scope
```

Recommended release description:

```text
Claude Desktop Real Data Verification
```

This release documents how to verify the npm alpha package in Claude Desktop and how to capture real-provider-oriented context payload results safely. It must not be described as enabling real quote lookup by default, adding live chart/index support, adding hosted proxy behavior, or adding recommendation/account/order/trading behavior. Failed real context lookups must remain explicit blocked/provider_error/unavailable payloads and must not be replaced with mock data.

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
