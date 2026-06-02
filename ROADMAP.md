# ROADMAP.md

## 1. Project roadmap

`korea-market-data-mcp` is an open-source Model Context Protocol server for reliable Korean financial market data access from AI agents.

The project starts with **Kiwoom Securities REST API** as the first provider adapter and will remain focused on **read-only market data access**.

This roadmap defines the planned development stages from repository foundation to the first stable release.

---

## 2. Roadmap principles

The project follows these principles:

1. Read-only market data access first.
2. No trading, order execution, or personal account access.
3. Tool schema before implementation.
4. Mock provider before real provider integration.
5. Provider-specific logic isolated behind adapters.
6. Local user-owned credentials whenever possible.
7. Normalized JSON responses for AI clients.
8. Clear documentation and security boundaries.

---

## 3. Version overview

```text
v0.1  Project foundation
v0.2  MCP server skeleton
v0.3  Tool schema specification
v0.4  Provider adapter interface
v0.5  Mock provider and tests
v0.6  Kiwoom provider authentication
v0.7  Basic market data tools
v0.8  MCP client examples
v0.9  Pre-release hardening
v1.0  First stable read-only release
```

---

## 4. v0.1 — Project foundation

### Goal

Establish the repository as a clear, safe, and maintainable open-source MCP project.

### Scope

* README
* LICENSE
* AGENTS.md
* ROADMAP.md
* SECURITY.md
* CONTRIBUTING.md
* `.env.example`
* initial documentation structure

### Deliverables

```text
README.md
AGENTS.md
ROADMAP.md
SECURITY.md
CONTRIBUTING.md
.env.example
docs/
examples/
tests/
```

### Completion criteria

* Repository purpose is clear.
* Read-only scope is explicitly documented.
* Trading and account access are clearly out of scope.
* Initial contribution and security rules exist.

---

## 5. v0.2 — MCP server skeleton

### Goal

Create the initial TypeScript MCP server structure.

### Scope

* TypeScript project setup
* MCP SDK installation
* server entry point
* basic server metadata
* development scripts
* build scripts
* test scripts

### Planned files

```text
package.json
tsconfig.json
src/index.ts
src/server/
src/tools/
src/providers/
src/schemas/
src/safety/
src/utils/
```

### Completion criteria

* The MCP server starts locally.
* The project builds without errors.
* No real provider API integration is required yet.
* No trading or account tools exist.

---

## 6. v0.3 — Tool schema specification

### Goal

Define the first set of MCP tool contracts before implementation.

### Initial tools

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

### Scope

For each tool, define:

* purpose
* input schema
* output schema
* error cases
* provider dependency
* caching behavior
* example requests
* example responses

### Planned files

```text
docs/tool-spec.md
src/schemas/
tests/tool-schema.test.ts
```

### Completion criteria

* All initial tools are documented.
* Tool input and output schemas are stable enough for implementation.
* Tests verify tool schema registration.
* Tools remain read-only.

---

## 7. v0.4 — Provider adapter interface

### Goal

Create a provider-neutral adapter architecture.

### Scope

* provider interface
* normalized response types
* provider error model
* provider metadata model
* rate limit abstraction
* provider capability model

### Planned files

```text
docs/provider-adapter-spec.md
src/providers/types.ts
src/providers/base-provider.ts
src/providers/provider-registry.ts
src/providers/errors.ts
```

### Completion criteria

* MCP tools depend on provider interfaces, not provider-specific API responses.
* Provider-specific authentication is isolated.
* New providers can be added without changing tool contracts.

---

## 8. v0.5 — Mock provider and tests

### Goal

Implement a mock provider before connecting to real APIs.

### Scope

* mock quote data
* mock ETF data
* mock index data
* mock daily chart data
* normalized output tests
* error handling tests
* read-only safety tests
* secret redaction tests

### Planned files

```text
src/providers/mock/
tests/mock-provider.test.ts
tests/read-only-safety.test.ts
tests/secret-redaction.test.ts
```

### Completion criteria

* All initial MCP tools work against a mock provider.
* Tests fail if trading or account tools are added.
* Tests verify no secrets appear in logs or responses.
* Normalized response shape is stable.

---

## 9. v0.6 — Kiwoom provider authentication

### Goal

Implement Kiwoom provider authentication and base client.

### Scope

* environment variable loading
* Kiwoom app key / secret handling
* access token request
* token caching
* token expiration handling
* provider-specific error mapping
* safe logging

### Planned files

```text
src/providers/kiwoom/auth.ts
src/providers/kiwoom/client.ts
src/providers/kiwoom/types.ts
src/providers/kiwoom/errors.ts
src/providers/kiwoom/rate-limit.ts
```

### Completion criteria

* Kiwoom credentials are loaded only from environment variables.
* Tokens are not logged.
* Authentication errors are normalized.
* No account or order endpoints are exposed.

---

## 10. v0.7 — Basic market data tools

### Goal

Connect initial read-only MCP tools to the Kiwoom provider.

### Scope

* stock quote
* ETF quote
* market index
* daily chart
* symbol search or symbol mapping support

### Initial tools

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

### Completion criteria

* Tools return normalized JSON.
* Provider attribution is included.
* Error handling is consistent.
* Cache behavior is documented.
* No trading or account access is implemented.

---

## 11. v0.8 — MCP client examples

### Goal

Provide working examples for common MCP clients.

### Scope

* Claude Desktop config
* Cursor MCP config
* Codex local workflow notes
* example prompts
* troubleshooting guide

### Planned files

```text
examples/claude-desktop-config.json
examples/cursor-config.json
docs/client-setup.md
docs/troubleshooting.md
```

### Completion criteria

* A user can connect the MCP server to Claude Desktop.
* A user can understand how to run the server locally.
* Common setup errors are documented.

---

## 12. v0.9 — Pre-release hardening

### Goal

Prepare the project for the first stable release.

### Scope

* test coverage review
* security checklist review
* documentation cleanup
* provider error handling review
* release notes draft
* issue templates
* PR template

### Planned files

```text
.github/ISSUE_TEMPLATE/
.github/pull_request_template.md
CHANGELOG.md
docs/security-model.md
```

### Completion criteria

* Core documentation is complete.
* Initial tools are tested.
* Security boundaries are documented.
* No high-risk tool exposure exists.

---

## 13. v1.0 — First stable read-only release

### Goal

Publish the first stable read-only MCP server release.

### Release scope

* TypeScript MCP server
* Kiwoom provider adapter
* initial market data tools
* mock provider tests
* security documentation
* MCP client examples
* clear installation guide

### Included tools

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

### Explicitly excluded

```text
buy_stock
sell_stock
place_order
cancel_order
modify_order
get_account_balance
get_deposit
get_holdings
get_trade_history
automated_trading
portfolio_rebalancing
```

### Completion criteria

* Users can install and run the MCP server locally.
* Users can connect the MCP server to at least one MCP client.
* Users can query read-only Korean market data.
* No trading or account tools are present.
* Documentation and security model are complete enough for public use.

---

## 14. Future roadmap after v1.0

Potential future work:

```text
get_minute_chart
get_top_volume_stocks
get_top_value_stocks
get_foreigner_institution_flow
get_etf_basic_info
get_provider_status
KRX provider adapter
ECOS provider adapter
FRED provider adapter
desktop setup helper
public-data fallback mode
```

Future work must continue to respect the read-only project scope unless governance explicitly changes.

---

## 15. Out-of-scope backlog

The following items are intentionally not planned:

```text
trading tools
order tools
account balance tools
holdings tools
automated trading strategies
investment recommendation engine
centralized credential storage
licensed data redistribution service
unsafe scraping pipeline
```

These features should not be implemented in this repository.

---

## 16. Current priority

The current priority is:

```text
v0.1 Project foundation
```

Immediate next tasks:

1. Add `SECURITY.md`
2. Add `CONTRIBUTING.md`
3. Add `.env.example`
4. Add `docs/architecture.md`
5. Add `docs/provider-adapter-spec.md`
6. Add `docs/tool-spec.md`
7. Create the initial TypeScript MCP server skeleton
