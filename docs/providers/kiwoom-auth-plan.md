# Kiwoom Provider Auth Plan

## 1. Purpose

This document defines the authentication plan for the Kiwoom provider in `korea-market-data-mcp`.

The Kiwoom provider is currently implemented as an authentication skeleton only.

It validates local credential configuration and provider selection behavior, but it does not make real Kiwoom API calls by default.

---

## 2. Current status

Current implementation status:

```text
Kiwoom provider folder: implemented
Kiwoom provider selection: implemented
Kiwoom credential config loading: implemented
Missing credential handling: implemented
Dummy credential handling: implemented
Token client interface: implemented
Token request/response types: implemented
In-memory token cache type: implemented
Transport boundary: implemented
Real token request: not implemented
Real market data request: not implemented
Trading/account endpoints: not implemented and forbidden
```

Current test status:

```text
npm run build: passed
npm test: passed
Test files: 7 passed
Tests: 30 passed
```

---

## 3. Provider scope

The Kiwoom provider must remain within the read-only market data scope.

Allowed future capabilities:

```text
stock quote lookup
ETF quote lookup
market index lookup
daily chart lookup
symbol search or symbol mapping
provider status check
```

Forbidden capabilities:

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
portfolio rebalancing
automated trading
investment recommendation generation
```

Even if Kiwoom Securities REST API provides account or order endpoints, this project must not expose them as MCP tools.

---

## 4. Environment variables

The Kiwoom provider uses local environment variables.

Expected variables:

```env
MARKET_DATA_PROVIDER=kiwoom

KIWOOM_ENV=prod
KIWOOM_APP_KEY=
KIWOOM_APP_SECRET=
KIWOOM_API_BASE_URL=https://api.kiwoom.com
KIWOOM_MOCK_API_BASE_URL=https://mockapi.kiwoom.com
KIWOOM_ENABLE_REAL_API_CALLS=false
```

Security rule:

```text
KIWOOM_ENABLE_REAL_API_CALLS must remain false by default.
```

Real API calls must require explicit opt-in in a later implementation stage.

---

## 5. Current behavior

## 5.1 Missing credentials

When `MARKET_DATA_PROVIDER=kiwoom` and credentials are missing:

```text
KIWOOM_APP_KEY=
KIWOOM_APP_SECRET=
```

Expected behavior:

```text
PROVIDER_AUTH_FAILED
```

The error must be normalized and must not expose environment values.

---

## 5.2 Dummy credentials with real API disabled

When dummy credentials are present but real API calls are disabled:

```env
KIWOOM_APP_KEY=dummy_app_key
KIWOOM_APP_SECRET=dummy_app_secret
KIWOOM_ENABLE_REAL_API_CALLS=false
```

Expected behavior:

```text
UNSUPPORTED_PROVIDER_CAPABILITY
```

This indicates that credentials are present, but real token request behavior is not implemented or not enabled.

---

## 5.3 No network calls

Current Kiwoom auth skeleton must not call:

```text
fetch
axios
http.request
https.request
external Kiwoom endpoints
```

Tests must verify that no network call happens during Kiwoom auth skeleton behavior.

---

## 6. Authentication design target

The future Kiwoom auth flow should be implemented in stages.

Target flow:

```text
load environment config
  ↓
validate required credentials
  ↓
check KIWOOM_ENABLE_REAL_API_CALLS
  ↓
request access token only when explicitly enabled
  ↓
cache token locally in memory
  ↓
refresh or re-request token when expired
  ↓
use token for read-only market data endpoints
```

No token request should happen unless real API calls are explicitly enabled.

---

## 7. Token cache policy

Initial token cache should be in-memory only.

Recommended policy:

```text
no token written to repository
no token written to logs
no token returned in MCP responses
no token stored in persistent files by default
```

Possible future cache fields:

```text
accessToken
expiresAt
issuedAt
provider
environment
```

The token cache must never expose `KIWOOM_APP_SECRET`.

---

## 8. Error normalization

Provider-specific auth errors must be mapped to normalized project errors.

Recommended error codes:

```text
PROVIDER_AUTH_FAILED
PROVIDER_RATE_LIMITED
PROVIDER_TIMEOUT
PROVIDER_UNAVAILABLE
PROVIDER_BAD_RESPONSE
UNSUPPORTED_PROVIDER_CAPABILITY
INTERNAL_ERROR
```

Auth errors must not expose:

```text
app key
secret key
access token
authorization header
raw request headers
raw .env content
provider secret values
```

---

## 9. Real API opt-in requirements

Before real Kiwoom token requests are implemented, the following must be true:

```text
documentation updated
tests updated
secret redaction tests expanded
network calls isolated behind auth client
real API calls disabled by default
explicit opt-in variable required
no trading/account endpoints exposed
manual verification steps documented
```

The opt-in variable is:

```env
KIWOOM_ENABLE_REAL_API_CALLS=true
```

This should be required before any real request is attempted.

---

## 10. Test requirements

The Kiwoom auth tests must not depend on the caller shell environment.

Required test behavior:

```text
beforeEach saves and resets process.env
afterEach restores process.env
missing credentials => PROVIDER_AUTH_FAILED
dummy credentials + real API disabled => UNSUPPORTED_PROVIDER_CAPABILITY
fetch/network call is not made
provider selection works
read-only scope remains enforced
```

Tests must pass without real Kiwoom credentials.

---

## 11. Implementation stages

## Stage 1 — Auth skeleton

Status: implemented.

Scope:

```text
provider selection
config loading
credential validation
normalized missing credential error
no-network behavior
tests
```

## Stage 2 — Token client interface

Status: implemented for `v0.3.0-alpha`.

Scope:

```text
token request interface
network client boundary
request/response types
in-memory token cache
auth error mapper
no default real call
expanded tests
```

The token client accepts a transport abstraction so tests can use mocked transport only. The default safety setting remains:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
```

When this flag is false, token requests return `UNSUPPORTED_PROVIDER_CAPABILITY` before calling any transport.

## Stage 3 — Real token request opt-in

Status: planned.

Scope:

```text
KIWOOM_ENABLE_REAL_API_CALLS=true required
manual test only
real token request implementation
token response mapping
redacted logging
no market data calls yet
```

## Stage 4 — Read-only market data endpoints

Status: planned.

Scope:

```text
stock quote
ETF quote
market index
daily chart
normalized response mapping
provider attribution
no account/order endpoints
```

---

## 12. Explicitly forbidden endpoints

Do not implement Kiwoom endpoints related to:

```text
account balance
deposit
holdings
orders
order placement
order cancellation
order modification
trade history
profit/loss
automated trading
```

These are outside the project scope.

---

## 13. Release implication

This document supports the `v0.3.0-alpha` development line.

The `v0.3.0-alpha` release should be described as:

```text
Kiwoom token client interface with no real API calls by default.
```

It must not be described as live Kiwoom market data support.
