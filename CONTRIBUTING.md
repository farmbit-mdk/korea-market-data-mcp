# CONTRIBUTING.md

## 1. Contributing

Thank you for your interest in contributing to `korea-market-data-mcp`.

This project is an open-source Model Context Protocol server for reliable Korean financial market data access from AI agents.

The project is intentionally focused on **read-only market data**.

Before contributing, please read:

```text
README.md
AGENTS.md
ROADMAP.md
SECURITY.md
```

---

## 2. Project scope

This project accepts contributions related to:

* MCP server implementation
* read-only market data tools
* provider adapter architecture
* Kiwoom Securities REST API provider adapter
* mock provider
* normalized response schemas
* tests
* documentation
* examples for MCP clients
* security improvements
* issue templates
* developer workflow improvements

---

## 3. Out-of-scope contributions

The following contribution types are not accepted unless the project governance changes first:

* trading tools
* order execution
* order cancellation
* order modification
* automated trading
* brokerage account access
* account balance lookup
* deposit lookup
* holdings lookup
* trade history lookup
* investment recommendation engines
* centralized credential collection
* unsafe scraping
* licensed market data redistribution

Do not submit pull requests that add trading or account access features.

---

## 4. Development principles

All contributions should follow these principles:

1. Keep the project read-only.
2. Keep provider credentials local to the user.
3. Do not log secrets.
4. Do not expose provider tokens.
5. Keep provider-specific code inside provider adapters.
6. Return normalized JSON responses from MCP tools.
7. Add or update tests for behavior changes.
8. Update documentation for user-facing changes.
9. Prefer small, reviewable pull requests.
10. Preserve the provider-neutral architecture.

---

## 5. Repository structure

Recommended repository structure:

```text
src/
├─ index.ts
├─ server/
├─ tools/
├─ providers/
│  └─ kiwoom/
├─ schemas/
├─ safety/
└─ utils/

docs/
├─ architecture.md
├─ provider-adapter-spec.md
├─ security-model.md
└─ tool-spec.md

examples/
└─ claude-desktop-config.json

tests/
```

Do not introduce a new top-level structure without updating documentation.

---

## 6. Good first contributions

Good first issues may include:

* improve README examples
* add `.env.example`
* improve `AGENTS.md`
* improve `SECURITY.md`
* write `docs/tool-spec.md`
* write `docs/provider-adapter-spec.md`
* create mock provider fixtures
* add tool schema tests
* add secret redaction tests
* add Claude Desktop configuration example
* improve error message normalization
* add provider attribution fields

---

## 7. Tool contribution rules

Before adding or changing an MCP tool, define:

* tool name
* purpose
* input schema
* output schema
* example request
* example response
* provider dependency
* caching behavior
* error cases
* safety boundary

Initial tool scope:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

Do not add trading or account-related tools.

Forbidden examples:

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
run_strategy
auto_trade
rebalance_portfolio
```

---

## 8. Provider adapter contribution rules

Provider-specific logic must stay inside provider adapters.

A provider adapter may include:

```text
auth
client
types
errors
mapper
rate-limit
capabilities
```

Provider adapters should expose normalized methods to the MCP tool layer.

Do not expose raw provider APIs directly as MCP tools.

Do not expose hidden account or order endpoints through provider adapters.

---

## 9. Security requirements

Contributions must follow `SECURITY.md`.

Before opening a pull request, check:

```text
No secrets committed
No secrets logged
No access tokens returned
No trading tools added
No account tools added
No unsafe scraping added
Provider boundaries preserved
Tool schemas documented
Tests updated
```

If you discover a vulnerability, do not open a public issue with sensitive details. Follow the reporting process in `SECURITY.md`.

---

## 10. Local development

Clone the repository:

```bash
git clone https://github.com/farmbit-mdk/korea-market-data-mcp.git
cd korea-market-data-mcp
```

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Run development mode:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```

These commands may change as the initial TypeScript MCP server skeleton is added.

---

## 11. Commit message style

Use clear, descriptive commit messages.

Examples:

```text
Add provider adapter specification
Add mock provider test fixtures
Implement stock quote tool schema
Add secret redaction utility
Update README setup instructions
```

Avoid vague commit messages such as:

```text
fix
update
changes
misc
```

---

## 12. Pull request checklist

Before opening a pull request, confirm:

```md
- [ ] I read README.md, AGENTS.md, ROADMAP.md, and SECURITY.md.
- [ ] This PR keeps the project read-only.
- [ ] This PR does not add trading tools.
- [ ] This PR does not add account access tools.
- [ ] This PR does not log or expose secrets.
- [ ] Tool schemas are documented if changed.
- [ ] Tests are added or updated.
- [ ] Documentation is updated if user-facing behavior changed.
- [ ] Provider adapter boundaries are preserved.
```

---

## 13. Issue guidelines

When opening an issue, include:

* expected behavior
* actual behavior
* reproduction steps
* environment
* relevant logs with secrets removed
* provider involved, if applicable
* MCP client involved, if applicable

Do not include:

* API keys
* secret keys
* access tokens
* authorization headers
* `.env` file content

---

## 14. Documentation contributions

Documentation contributions are welcome.

Useful documentation areas:

* MCP client setup
* Kiwoom provider setup
* provider adapter architecture
* tool specification
* normalized response examples
* troubleshooting
* security model
* local development
* dashboard integration examples

---

## 15. Code review priorities

Pull requests will be reviewed with the following priorities:

1. Safety
2. Scope control
3. Correctness
4. Provider isolation
5. Test coverage
6. Documentation quality
7. Maintainability

A technically working change may still be rejected if it violates read-only scope or weakens credential safety.

---

## 16. License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
