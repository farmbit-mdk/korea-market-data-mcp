# korea-market-data-mcp

Open-source Model Context Protocol server for reliable Korean financial market data access from AI agents.

`korea-market-data-mcp` helps AI tools such as Codex, Claude, ChatGPT, Cursor, and other MCP-compatible clients query Korean stocks, ETFs, indices, charts, and market data through structured provider adapters.

The first target provider is **Kiwoom Securities REST API**.

This project is intentionally **read-only**.
It does **not** provide trading, order execution, automated trading, or personal account access.

---

## Why this project exists

AI agents often fail to retrieve accurate and up-to-date Korean financial market data through generic web search.

Common problems include:

* outdated stock and ETF prices
* incorrect Korean ticker mapping
* unreliable search snippets
* mixed data sources without provenance
* poor access to Korean ETF and index data
* unsafe scraping-based workflows
* no standard MCP interface for Korean market data

This project aims to provide a safer, structured, and maintainable bridge between AI agents and Korean financial market data providers.

---

## Project goals

The goals of this project are:

1. Provide a read-only MCP server for Korean market data.
2. Help AI agents query structured stock, ETF, index, and chart data.
3. Start with Kiwoom Securities REST API as the first provider adapter.
4. Keep provider-specific credentials local to each user whenever possible.
5. Avoid unsafe scraping, credential sharing, and data redistribution risks.
6. Support future provider adapters such as KRX, ECOS, FRED, and other market data sources.
7. Make Korean financial data more accessible to developers, researchers, and AI-powered dashboards.

---

## Non-goals

This project does not aim to provide:

* stock trading
* order execution
* order cancellation
* order modification
* automated trading
* portfolio management
* personal account balance lookup
* deposit or holdings lookup
* investment advice
* financial recommendations
* centralized redistribution of licensed market data

The initial scope is strictly limited to **read-only market data access**.

---

## Planned MCP tools

Initial MCP tools may include:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

Future tools may include:

```text
get_minute_chart
get_top_volume_stocks
get_top_value_stocks
get_foreigner_institution_flow
get_etf_basic_info
get_provider_status
```

All tools should return structured JSON responses that are easy for AI agents to interpret.

---

## Provider adapter model

This project is designed around provider adapters.

```text
MCP Client
  ↓
korea-market-data-mcp
  ↓
Provider Adapter
  ↓
External Market Data Provider
```

The first provider adapter target is:

```text
Kiwoom Securities REST API
```

Potential future providers:

```text
KRX
ECOS
FRED
Yahoo Finance
Other Korean market data providers
```

Provider-specific authentication, rate limits, response formats, and data licensing rules should be isolated inside each provider adapter.

---

## Initial architecture

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
└─ LICENSE
```

---

## Security principles

This project handles financial data provider credentials, so security boundaries are important.

Core security principles:

1. Provider API keys must not be committed to the repository.
2. Secrets must be loaded from local environment variables.
3. The MCP server must not expose order or trading tools.
4. Market data tools must remain read-only.
5. Provider credentials should remain local to the user whenever possible.
6. Logs must not print API keys, access tokens, or secret values.
7. Provider adapters must clearly separate authentication, request signing, rate limits, and response normalization.
8. Tool schemas must not include dangerous hidden actions.
9. Any future account-related or trading-related functionality must be explicitly out of scope unless the project governance changes.

---

## Environment variables

Create a `.env` file based on `.env.example`.

```env
KIWOOM_APP_KEY=
KIWOOM_APP_SECRET=
KIWOOM_ENV=prod
KIWOOM_API_BASE_URL=https://api.kiwoom.com
KIWOOM_MOCK_API_BASE_URL=https://mockapi.kiwoom.com
CACHE_TTL_SECONDS=3
LOG_LEVEL=info
```

Do not commit `.env`.

---

## Example use cases

### Ask an AI agent for a Korean stock quote

```text
Get the latest quote for Samsung Electronics using the Korean market data MCP.
```

### Ask for ETF data

```text
Check the current quote and recent daily chart for KODEX 200.
```

### Ask for index data

```text
Get the latest KOSPI and KOSDAQ index values.
```

### Ask for dashboard data

```text
Fetch current Korean ETF market data for my macro dashboard.
```

---

## Local development

Clone the repository:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/korea-market-data-mcp.git
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

The default development provider is `mock`, so Kiwoom credentials are not required for the initial server skeleton.

Run the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

The current implementation registers only these read-only mock-backed tools:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

The Kiwoom provider is not implemented yet. Do not set `MARKET_DATA_PROVIDER=kiwoom` until the Kiwoom adapter is added in a later milestone.

### Kiwoom auth skeleton

The repository includes a Kiwoom provider auth skeleton for future adapter work. It can load Kiwoom-related environment variables and return normalized credential errors, but it does not request tokens or call the Kiwoom REST API by default.

Keep this flag disabled:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
```

In `v0.4.0-alpha` development, the Kiwoom token client may call only its configured transport interface when `KIWOOM_ENABLE_REAL_API_CALLS=true`. Real API calls remain disabled by default, tests use mocked transport only, and live Kiwoom market data calls are still intentionally not implemented.

### Kiwoom manual token verification

`v0.6.0-alpha` hardens the manual-only Kiwoom token verification workflow:

```bash
npm run kiwoom:token:manual
```

This command can make a real Kiwoom token request only when all of the following are true:

```env
KIWOOM_ENABLE_REAL_API_CALLS=true
KIWOOM_APP_KEY=your-app-key
KIWOOM_SECRET_KEY=your-secret-key
KIWOOM_ENV=mock
```

The default remains `KIWOOM_ENABLE_REAL_API_CALLS=false`. Token values are never printed; the manual command only reports fields such as `token_present`, `token_type`, `expires_dt`, `return_code`, and `return_msg`.

This workflow does not add quote lookup, account access, order execution, balance lookup, holdings lookup, trading, auto-trading, or investment recommendation features. See `docs/providers/kiwoom-manual-token-test.md`.

Placeholder credential values such as `YOUR_APP_KEY`, `YOUR_SECRET_KEY`, `CHANGE_ME`, and `REPLACE_ME` are blocked before any manual token request is sent.

Kiwoom token error responses are normalized without printing raw request bodies, credentials, or token values.

---

## Claude Desktop example

Example MCP configuration:

```json
{
  "mcpServers": {
    "korea-market-data": {
      "command": "node",
      "args": [
        "/absolute/path/to/korea-market-data-mcp/dist/index.js"
      ],
      "env": {
        "KIWOOM_APP_KEY": "your-app-key",
        "KIWOOM_APP_SECRET": "your-secret-key",
        "KIWOOM_ENV": "prod"
      }
    }
  }
}
```

A complete example will be maintained in:

```text
examples/claude-desktop-config.json
```

---

## Roadmap

### v0.1 — Project foundation

* README
* LICENSE
* SECURITY.md
* CONTRIBUTING.md
* ROADMAP.md
* MCP server skeleton
* Provider adapter interface draft
* Tool schema draft

### v0.2 — Kiwoom provider interface

* Kiwoom auth wrapper
* Token handling
* Basic request client
* Error normalization
* Rate limit handling draft

### v0.3 — Basic market data tools

* `search_korean_symbol`
* `get_stock_quote`
* `get_etf_quote`
* `get_market_index`
* `get_daily_chart`

### v0.4 — MCP client examples

* Claude Desktop config
* Cursor config
* Codex local development workflow
* Example prompts

### v1.0 — First read-only release

* Stable read-only market data tools
* Documentation
* Tests
* Security review
* Release notes

---

## Contributing

Contributions are welcome.

Good first contribution areas:

* provider adapter documentation
* tool schema improvements
* tests
* response normalization
* Korean ticker metadata
* examples for MCP clients
* security review
* documentation improvements

Please read `CONTRIBUTING.md` before opening a pull request.

---

## License

This project is licensed under the MIT License.

See `LICENSE` for details.

---

## Disclaimer

This project is for software development, research, and data access tooling.

It does not provide investment advice, trading advice, brokerage services, financial recommendations, or automated trading functionality.

Users are responsible for complying with provider terms of service, data licensing restrictions, and applicable laws.

---

## Verified mock provider test

The MCP server has been verified with Claude Desktop using the mock provider.

Test prompt:

```text
Use korea-market-data MCP to get the stock quote for 005930.
```

Expected behavior:

- Claude Desktop detects the `korea-market-data` MCP server.
- The `get_stock_quote` tool is called.
- The mock provider returns Samsung Electronics sample data.
- The response includes `provider: "mock"`.
- The response must not be treated as live market data.

Example mock data:

| Field | Value |
|---|---|
| Symbol | 005930 |
| Name | Samsung Electronics |
| Market | KOSPI |
| Price | 70,000 KRW |
| Previous close | 69,500 KRW |
| Change | +500 KRW |
| Change rate | +0.72% |
| Provider | mock |

Note: mock provider data is fixed sample data for local MCP testing only. It is not live market data and must not be used for investment decisions.

The mock provider also supports Korean alias search such as `삼성전자` → `005930` and `코덱스200` → `069500`.

The Kiwoom provider is currently an authentication skeleton only. It validates local credential configuration but does not make real Kiwoom API calls by default.
