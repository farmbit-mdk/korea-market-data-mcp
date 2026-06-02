# AGENTS.md

## 1. Purpose

This document defines the operating rules for AI coding agents working on `korea-market-data-mcp`.

It is intended for Codex, Claude Code, Cursor agents, and any other AI-assisted development tools that modify this repository.

The goal is to keep the project safe, focused, maintainable, and aligned with its original scope:

**A read-only MCP server for reliable Korean financial market data access from AI agents.**

---

## 2. Project definition

`korea-market-data-mcp` is an open-source Model Context Protocol server that helps AI agents access structured Korean financial market data.

The project starts with **Kiwoom Securities REST API** as the first provider adapter.

The long-term direction is provider-neutral market data access for Korean financial data, with possible future adapters such as:

* KRX
* ECOS
* FRED
* other Korean market data providers

This project is not a trading system.

---

## 3. Non-negotiable scope rules

The following rules must not be violated.

### 3.1 Read-only only

This project must remain read-only.

Do not implement:

* stock order execution
* ETF order execution
* order cancellation
* order modification
* automated trading
* portfolio rebalancing
* personal account balance lookup
* deposit lookup
* holdings lookup
* trade history lookup
* account performance tracking
* brokerage account management

The MCP tools must provide market data only.

---

### 3.2 No trading tools

Do not create tools with names such as:

```text
buy_stock
sell_stock
place_order
cancel_order
modify_order
get_account_balance
get_deposit
get_holdings
get_order_history
get_trade_history
run_strategy
auto_trade
rebalance_portfolio
```

If a future contributor proposes trading or account tools, reject the change unless the project governance and README explicitly change first.

---

### 3.3 No investment advice

The project must not provide investment recommendations.

Do not implement features that say or imply:

* buy this stock
* sell this ETF
* this is a guaranteed opportunity
* expected return is guaranteed
* this is a safe investment
* this strategy will make money

The project may return structured market data, but interpretation and financial decision-making are outside the project scope.

---

### 3.4 No credential sharing

Provider credentials must stay local to the user whenever possible.

Do not design a system that requires users to send their provider API keys to a centralized project server.

Do not log or expose:

* app keys
* secret keys
* access tokens
* refresh tokens
* authorization headers
* raw `.env` content

---

### 3.5 No unsafe scraping

Do not implement scraping-based data collection unless a specific document explicitly approves it.

Avoid:

* scraping pages that prohibit automated access
* bypassing provider access controls
* redistributing licensed data
* storing full third-party data dumps without permission

The preferred architecture is provider API access through documented adapters.

---

## 4. Source of truth order

Before making implementation decisions, read the documents in this order:

1. `README.md`
2. `AGENTS.md`
3. `ROADMAP.md`
4. `SECURITY.md`
5. `docs/architecture.md`
6. `docs/provider-adapter-spec.md`
7. `docs/tool-spec.md`
8. `.env.example`
9. `examples/claude-desktop-config.json`

If a required document does not exist yet, create or update the relevant document before implementing new behavior.

---

## 5. Development principles

## 5.1 Tool contract first

MCP tool design must come before implementation.

For every new tool, define:

* tool name
* purpose
* input schema
* output schema
* provider dependency
* error cases
* caching behavior
* safety boundary

Do not implement provider API calls before the MCP tool contract is clear.

---

## 5.2 Provider adapter isolation

Provider-specific logic must stay inside provider adapters.

A provider adapter may handle:

* authentication
* token requests
* request headers
* endpoint URLs
* rate limits
* provider-specific error codes
* provider-specific response mapping

The MCP tool layer should not directly depend on provider-specific response shapes.

---

## 5.3 Normalized output

MCP tools should return normalized JSON responses.

Good response structure:

```json
{
  "symbol": "005930",
  "name": "Samsung Electronics",
  "market": "KRX",
  "currency": "KRW",
  "price": 0,
  "change": 0,
  "changeRate": 0,
  "volume": 0,
  "provider": "kiwoom",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

Avoid returning raw provider responses directly unless the tool is explicitly documented as a debug tool.

---

## 5.4 Explicit provider attribution

Every market data response should include provider attribution where practical.

Recommended fields:

```text
provider
providerTimestamp
requestTimestamp
isDelayed
sourceSymbol
normalizedSymbol
```

This helps AI clients avoid treating unknown data as authoritative without provenance.

---

## 5.5 Safe defaults

Default behavior must be conservative.

Recommended defaults:

* read-only tools only
* no account endpoints
* no trading endpoints
* no centralized credential storage
* no raw token logging
* short cache TTL for quotes
* explicit provider errors
* clear unsupported-feature errors

---

## 6. Repository structure

Recommended structure:

```text
korea-market-data-mcp/
├─ src/
│  ├─ index.ts
│  ├─ server/
│  ├─ tools/
│  ├─ providers/
│  │  └─ kiwoom/
│  ├─ schemas/
│  ├─ safety/
│  └─ utils/
├─ docs/
│  ├─ architecture.md
│  ├─ provider-adapter-spec.md
│  ├─ security-model.md
│  └─ tool-spec.md
├─ examples/
│  └─ claude-desktop-config.json
├─ tests/
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ README.md
├─ ROADMAP.md
├─ SECURITY.md
├─ CONTRIBUTING.md
├─ AGENTS.md
└─ LICENSE
```

Do not introduce a new top-level structure without updating `README.md` and `docs/architecture.md`.

---

## 7. Initial tool scope

The first implementation should focus on a small set of read-only tools.

Initial tools:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

Do not add more tools until the first set has:

* documented schemas
* mock provider tests
* normalized response structure
* error handling
* README usage examples

---

## 8. Kiwoom provider rules

The Kiwoom provider is the first target adapter.

Kiwoom-specific implementation must remain inside:

```text
src/providers/kiwoom/
```

The Kiwoom adapter may include:

```text
auth.ts
client.ts
types.ts
errors.ts
mapper.ts
rate-limit.ts
```

The Kiwoom provider must not expose trading or account endpoints through MCP tools.

If Kiwoom API documentation includes account or order endpoints, do not bind them into this MCP server.

---

## 9. Environment variable rules

Secrets must be read from environment variables.

Expected environment variables:

```env
KIWOOM_APP_KEY=
KIWOOM_APP_SECRET=
KIWOOM_ENV=prod
KIWOOM_API_BASE_URL=https://api.kiwoom.com
KIWOOM_MOCK_API_BASE_URL=https://mockapi.kiwoom.com
CACHE_TTL_SECONDS=3
LOG_LEVEL=info
```

Rules:

* never commit `.env`
* keep `.env.example` safe and empty
* do not print secret values
* do not include secrets in error messages
* do not include secrets in MCP tool responses
* do not include secrets in tests

---

## 10. Logging rules

Logs must help debugging without exposing secrets.

Allowed logs:

* provider name
* endpoint category
* normalized symbol
* request status
* response time
* error code
* retry count

Forbidden logs:

* app key
* secret key
* access token
* refresh token
* authorization header
* raw `.env`
* full provider response if it contains sensitive information

---

## 11. Error handling rules

Errors should be normalized before returning to MCP clients.

Recommended error shape:

```json
{
  "error": {
    "code": "PROVIDER_AUTH_FAILED",
    "message": "Provider authentication failed.",
    "provider": "kiwoom",
    "retryable": false
  }
}
```

Do not expose raw provider error bodies if they contain secrets or sensitive request details.

---

## 12. Testing rules

Before connecting a real provider, implement mock provider tests.

Minimum test areas:

* tool input validation
* normalized output shape
* missing credential behavior
* provider error mapping
* read-only tool list verification
* secret redaction
* cache behavior
* unsupported tool rejection

A test should fail if a trading or account tool is accidentally added.

---

## 13. Security review checklist

Before merging changes, check:

```text
No order tools added
No account tools added
No secrets committed
No secrets logged
No raw token returned
No hidden trading behavior
No unsafe scraping added
Provider-specific code isolated
Tool schema documented
Mock tests updated
README updated if user-facing behavior changed
```

---

## 14. Documentation rules

Any user-facing behavior change must update documentation.

Update relevant files:

* `README.md`
* `ROADMAP.md`
* `docs/tool-spec.md`
* `docs/provider-adapter-spec.md`
* `docs/security-model.md`
* `examples/claude-desktop-config.json`

Do not leave implementation behavior undocumented.

---

## 15. Pull request rules

A pull request should include:

* summary of changes
* affected tools
* affected provider adapters
* security impact
* tests added or updated
* documentation updated
* confirmation that no trading/account tools were added

Suggested PR checklist:

```md
- [ ] No trading tools added
- [ ] No account access tools added
- [ ] No secrets logged
- [ ] Tool schema updated
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Provider adapter boundaries preserved
```

---

## 16. Good first issues

Good initial tasks:

* improve README
* add `.env.example`
* add `ROADMAP.md`
* add `SECURITY.md`
* define `docs/tool-spec.md`
* define `docs/provider-adapter-spec.md`
* create MCP server skeleton
* create mock provider
* add normalized response schemas
* add secret redaction tests
* add Claude Desktop config example

Avoid starting with real provider calls before the MCP tool contracts are documented.

---

## 17. Agent behavior rules

When working as an AI coding agent:

1. Read this file before making changes.
2. Do not expand scope without updating documentation.
3. Ask for clarification if a requested change conflicts with the read-only scope.
4. Refuse or flag implementation requests for trading, order execution, or account access.
5. Prefer small, reviewable commits.
6. Keep provider-specific code isolated.
7. Keep tool schemas explicit.
8. Preserve safe defaults.
9. Update tests with implementation.
10. Update documentation with behavior changes.

---

## 18. Final principle

This project exists to make Korean financial market data more accessible to AI agents safely.

The correct direction is:

```text
Reliable market data access
Provider-neutral adapter architecture
Read-only MCP tools
Local credentials
Clear documentation
Strong security boundaries
```

The wrong direction is:

```text
Trading bot
Brokerage account automation
Centralized credential collection
Unsafe scraping
Opaque data redistribution
Investment recommendation engine
```

Keep the project focused.
