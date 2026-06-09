# korea-market-data-mcp

Open-source Model Context Protocol server for reliable Korean financial market data access from AI agents.

`korea-market-data-mcp` helps AI tools such as Codex, Claude, ChatGPT, Cursor, and other MCP-compatible clients query Korean stocks, ETFs, indices, charts, and market data through structured provider adapters.

The first target provider is **Kiwoom Securities REST API**.

This project is intentionally **read-only**.
It does **not** provide trading, order execution, automated trading, or personal account access.

---

## 한국어 Quick Start

`korea-market-data-mcp`는 Claude Desktop, GPT, Codex, Cursor 같은 AI 클라이언트가 국내 주식/ETF 데이터를 조회할 수 있도록 돕는 **Kiwoom REST API 기반 read-only MCP 서버**입니다.

이 MCP는 답변 엔진이나 투자 추천 도구가 아닙니다. MCP는 종목 resolve, 실제 현재가 quote, 다종목 quote bundle 같은 데이터 payload를 제공하고, 평가액/비중 계산이나 해석은 Claude/GPT/Codex 같은 AI 클라이언트가 담당합니다.

주의: 이 프로젝트는 Open API+ OCX 프로그램이 아닙니다. 아래 Kiwoom Open API+ / KOA Studio 링크는 국내 사용자가 키움 API 사용 신청, 개발 환경 확인, TR 정보 확인에 참고하기 위한 공식 링크입니다.

Kiwoom 공식 참고:

```text
https://www.kiwoom.com/h/customer/download/VOpenApiInfoView
```

### 설치

```powershell
npm install -g korea-market-data-mcp@alpha
```

또는 로컬 저장소에서:

```powershell
npm install
npm run build
```

### PowerShell 환경변수

실제 Kiwoom REST API 호출은 명시적으로 opt-in한 로컬 환경에서만 동작합니다. 실제 app key, secret key, token은 Git, 문서, PR, 스크린샷, 로그에 남기지 마세요.

```powershell
$env:MARKET_DATA_PROVIDER = "kiwoom"
$env:KIWOOM_ENABLE_REAL_API_CALLS = "true"
$env:KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH = "true"
$env:KIWOOM_ENV = "production"
$env:KIWOOM_INVESTMENT_ENV = "real"
$env:KIWOOM_APP_KEY = "YOUR_KIWOOM_APP_KEY"
$env:KIWOOM_SECRET_KEY = "YOUR_KIWOOM_SECRET_KEY"
```

### 로컬 검증

```powershell
npm run build
npm run kiwoom:setup:check
npm run kiwoom:token:manual
npm run kiwoom:quote:manual
```

성공 시에도 token 원문은 출력하지 않습니다. quote 응답은 read-only market data로만 사용합니다.

### Claude Desktop 질문 예시

```text
삼성전자우 현재가를 키움 데이터로 조회해줘.
TIGER 미국S&P500 100주 평가액을 계산해줘.
삼성전자우 50주, TIGER 미국S&P500 100주, TIGER 코리아AI전력기기TOP3플러스 100주를 키움 데이터로 조회해줘.
TIGER AI전력 ETF를 조회해줘. 애매하면 후보를 보여줘.
```

다종목 보유분 예시는 `get_korean_market_data_context`가 여러 종목/ETF를 resolve하고 실제 Kiwoom quote bundle을 반환하는 흐름입니다. 수량이 포함되면 `quantity`와 `position_value`를 payload에 포함할 수 있습니다. MCP는 데이터만 공급하고, 평가액 합계, 비중 계산, 리밸런싱 관점의 해석은 AI 클라이언트가 수행합니다.

### 지원하지 않는 기능

이 MCP는 아래 기능을 제공하지 않습니다.

```text
계좌 조회 없음
잔고 조회 없음
보유종목 자동 조회 없음
주문 없음
매매 없음
자동매매 없음
투자 추천 로직 없음
중앙 데이터 재배포 프록시 없음
user-facing mock market data 없음
```

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

## Alpha launch candidate status

`v0.36.0-alpha` enables a local Kiwoom quote verification path for explicitly opted-in users while keeping real API calls disabled by default.

This project is:

```text
a read-only MCP server
mock-provider first for setup and testing
local credential only for Kiwoom verification
guarded by safe defaults
```

This project is not:

```text
a brokerage client
a trading bot
an account access tool
a centralized market data redistribution proxy
an investment recommendation system
```

Current alpha scope:

```text
mock provider tools for local MCP testing
natural-language Korean market query resolution
guarded get_kiwoom_stock_quote public tool skeleton
get_kiwoom_setup_status readiness tool
manual Kiwoom token and quote verification commands
documentation for Claude Desktop and Cursor setup
known limitations and release checklists
package metadata and local install/run documentation
alpha launch announcement and final review documentation
npm pack dry run and publish readiness documentation
clean install smoke test documentation
official npm publish decision documentation
official npm alpha publish result documentation
Korean market data query resolution tools
Claude Desktop npm alpha package verification docs
Claude Desktop real-provider-oriented context verification docs
Claude Desktop live usage result capture docs
```

Real Kiwoom quote lookup remains disabled by default:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

Kiwoom real local verification is explicit opt-in only. Static endpoint `enabled` and `exposesPublicTool` defaults remain false; v0.36 only enables an effective local quote mapping when all local opt-in guards and environment checks are valid.

Supported Kiwoom environment parsing:

```text
KIWOOM_ENV=real | production | prod -> production
KIWOOM_ENV=mock -> mock
KIWOOM_INVESTMENT_ENV=real | mock must match the issued credentials
```

Local verification order:

```powershell
npm run kiwoom:setup:check
npm run kiwoom:token:manual
npm run kiwoom:quote:manual
```

Claude Desktop can call `get_kiwoom_setup_status` to inspect readiness without requesting a token or quote. `get_korean_market_data_context` may use real Kiwoom quote data only after setup is ready and quote verification succeeds; chart and related index data remain unavailable rather than mocked.

Start with mock provider setup:

```text
docs/getting-started/quickstart.md
docs/getting-started/mcp-client-setup.md
docs/getting-started/claude-desktop-setup.md
docs/getting-started/cursor-setup.md
docs/getting-started/troubleshooting.md
examples/README.md
```

Package and distribution readiness docs:

```text
docs/release/distribution-readiness.md
docs/release/alpha-install-smoke-test.md
docs/release/v0.25.0-alpha-checklist.md
docs/release/alpha-launch-announcement.md
docs/release/alpha-final-review.md
docs/release/v0.26.0-alpha-checklist.md
docs/release/npm-pack-dry-run.md
docs/release/v0.27.0-alpha-checklist.md
docs/release/clean-install-smoke-test.md
docs/release/v0.28.0-alpha-checklist.md
docs/release/npm-publish-decision.md
docs/release/npm-access-policy.md
docs/release/versioning-policy.md
docs/release/v0.29.0-alpha-checklist.md
docs/release/npm-alpha-publish-result.md
docs/release/v0.30.0-alpha-checklist.md
docs/verification/claude-desktop-real-data-verification.md
docs/release/v0.33.0-alpha-checklist.md
docs/verification/claude-desktop-live-usage-result.md
docs/release/v0.34.0-alpha-checklist.md
docs/release/v0.35.0-alpha-checklist.md
docs/release/v0.36.0-alpha-checklist.md
```

Review safety and limitations:

```text
SECURITY.md
docs/providers/provider-status.md
docs/release/alpha-known-limitations.md
```

Unsupported features remain explicitly out of scope:

```text
No account access.
No orders.
No balance lookup.
No holdings lookup.
No trading.
No auto-trading.
No investment recommendations.
No centralized data redistribution proxy.
```

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

### Option A: GitHub clone local setup

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

The default development provider is `mock`, so Kiwoom credentials are not required for the initial server skeleton.

Run the development server:

```bash
npm run dev
```

Run the built MCP server locally:

```bash
npm start
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

The current implementation registers these read-only tools:

```text
resolve_korean_market_query
get_korean_market_data_context
get_kiwoom_setup_status
search_korean_symbol
get_stock_quote
get_kiwoom_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

`get_kiwoom_stock_quote` is a guarded Kiwoom-only skeleton. It is registered, but real Kiwoom quote lookup remains blocked by default.

Public MCP tool list:

```text
resolve_korean_market_query
get_korean_market_data_context
get_kiwoom_setup_status
search_korean_symbol
get_stock_quote
get_kiwoom_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

`get_kiwoom_stock_quote` is the only Kiwoom public quote tool. The tool is guarded, mock path is recommended first, real Kiwoom path remains local opt-in only, no account/order/trading tools exist, and future tools require separate review.

get_kiwoom_stock_quote is the only Kiwoom public quote tool.

### Option B: Packaged or npm-ready setup

The package metadata is prepared for future npm distribution, but `npm publish` has not been performed for this release.

GitHub clone/local setup remains the primary distribution path. The npm package is not published yet, and npm publish readiness is still under review.

Do not install from unofficial npm packages claiming this project name. Use GitHub releases/source until an official npm package is published from this repository.

Tarball-based clean install smoke testing has been reviewed for the alpha package. Package-based setup remains alpha/testing only unless an official npm package is published.

Current package command shape:

```text
package name: korea-market-data-mcp
package version: 0.31.0-alpha
main: dist/index.js
bin: korea-market-data-mcp -> dist/index.js
start: node dist/index.js
```

Until a package is actually published, use the GitHub clone path above.

`v0.29.0-alpha` records the official npm publish decision:

```text
current decision: defer publish
recommended decision: defer actual npm publish until a separate final publish release
official npm package is not published yet
npm publish decision is being tracked
GitHub clone/local setup remains primary
package-based setup remains alpha/testing-only until official npm release
do not trust unofficial packages or hosted MCP proxies
```

Before any future npm publish, the maintainer must confirm package ownership, npm account access, 2FA, provenance, dist-tag, and versioning policy. If an alpha package is published in a future release, the recommended command is `npm publish --tag alpha`; alpha releases must not use the `latest` dist-tag.

`v0.30.0-alpha` publishes the official npm alpha package when the publish step succeeds:

```powershell
npm install korea-market-data-mcp@alpha
```

Use the `alpha` tag during the alpha phase. The npm registry currently has `latest` pointing to `0.30.0-alpha` because this was the first published version, but this is not a stable/latest release. The required documented install path remains:

```powershell
npm install korea-market-data-mcp@alpha
```

GitHub clone/local setup remains supported and is the safe fallback. Mock provider remains the recommended first setup path. Real Kiwoom quote lookup remains disabled by default, and Kiwoom local verification remains explicit opt-in only.

Claude Desktop can use the npm alpha package directly:

```json
{
  "command": "npx",
  "args": [
    "-y",
    "korea-market-data-mcp@alpha"
  ],
  "env": {
    "MARKET_DATA_PROVIDER": "mock",
    "KIWOOM_ENABLE_REAL_API_CALLS": "false",
    "KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH": "false"
  }
}
```

See:

```text
docs/release/npm-publish-decision.md
docs/release/npm-access-policy.md
docs/release/versioning-policy.md
docs/release/npm-alpha-publish-result.md
docs/release/clean-install-smoke-test.md
docs/release/npm-pack-dry-run.md
docs/release/distribution-readiness.md
```

### Option C: MCP client local node command

For Claude Desktop, Cursor, and other MCP clients, build first and point the client at the built output:

```json
{
  "command": "node",
  "args": [
    "/absolute/path/to/korea-market-data-mcp/dist/index.js"
  ],
  "env": {
    "MARKET_DATA_PROVIDER": "mock",
    "KIWOOM_ENABLE_REAL_API_CALLS": "false",
    "KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH": "false"
  }
}
```

Windows paths in JSON need escaped backslashes:

```json
"C:\\absolute\\path\\to\\korea-market-data-mcp\\dist\\index.js"
```

See `examples/README.md` before editing client configuration.

### Quick start and MCP client setup

`v0.23.0-alpha` adds user onboarding docs and MCP client setup examples.

Start here:

```text
docs/getting-started/quickstart.md
docs/getting-started/mcp-client-setup.md
docs/getting-started/claude-desktop-setup.md
docs/getting-started/cursor-setup.md
docs/getting-started/troubleshooting.md
```

Use mock provider first:

```text
examples/claude-desktop.mock.json
examples/cursor.mock.json
examples/env.mock.example
```

Kiwoom local verification examples are advanced and explicit opt-in only:

```text
examples/claude-desktop.kiwoom-local.example.json
examples/cursor.kiwoom-local.example.json
examples/env.kiwoom-local.example
```

Real Kiwoom quote lookup remains disabled by default. `KIWOOM_ENABLE_REAL_API_CALLS=false` and `KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false` remain the safe defaults.

This project remains read-only:

```text
no account access
no orders
no balance lookup
no holdings lookup
no trading
no auto-trading
no investment recommendations
no centralized data redistribution proxy
```

### Korean market data query resolution

`v0.31.0-alpha` adds two read-only data-resolution tools:

```text
resolve_korean_market_query
get_korean_market_data_context
```

These tools help Claude, GPT, and other MCP clients find Korean stock, ETF, and index data targets from natural-language queries when the user does not know the code.

Examples:

```text
삼성전자 요즘 어때? -> 005930 / stock / KOSPI
삼전 흐름 알려줘 -> 005930 / stock / KOSPI
코덱스200 조회해줘 -> 069500 / etf / KOSPI
코스피 흐름 알려줘 -> KOSPI / index
```

`get_korean_market_data_context` returns structured quote, daily chart, and related index payloads for analysis by the client model. It does not return buy/sell judgments, target prices, return forecasts, portfolio decisions, or investment recommendations.

`v0.32.0-alpha` improves real Kiwoom context UX. For Kiwoom provider context, failed or blocked real quote lookups are returned as explicit `blocked` or `provider_error` payloads and are not replaced with mock data. Real chart and index context return `unavailable` until those real endpoints are implemented.

Check local Kiwoom readiness:

```bash
npm run kiwoom:setup:check
```

`v0.33.0-alpha` adds Claude Desktop verification docs and examples for this flow. Claude Desktop can connect with the official npm alpha package, use natural-language query resolution, and request real-provider-oriented context payloads. Real data context requires local Kiwoom credentials and explicit opt-in settings. If real data is blocked or unavailable, the MCP server returns structured status instead of mock replacement data.

`v0.34.0-alpha` adds Claude Desktop live usage result capture docs. The live verification flow records actual prompts, selected MCP tools, result status, resolved assets, provider/environment, UX notes, and follow-up actions. Natural-language query examples are tested through `resolve_korean_market_query` and `get_korean_market_data_context`. Context payloads continue to return blocked/provider_error/unavailable status instead of mock fallback when real data is unavailable.

`v0.35.0-alpha` removes mock market data payloads from the market data context flow. Market data context no longer returns mock quote, chart, or index values. If Kiwoom real provider data is not configured, context requests return blocked/provider_error/unavailable status. Resolver examples may still use known Korean asset names and symbols, but quote/chart/index values require real provider data.

`v0.36.0-alpha` adds the local Kiwoom quote verification path. `get_kiwoom_setup_status` returns the same readiness payload as `npm run kiwoom:setup:check` without requesting a token or quote. `KIWOOM_ENV=real`, `KIWOOM_ENV=production`, and `KIWOOM_ENV=prod` all select production; `KIWOOM_ENV=mock` selects mock. When setup is ready, run `npm run kiwoom:token:manual`, then `npm run kiwoom:quote:manual`, then use Claude/GPT market data context prompts. No mock market values are returned when real data is unavailable.

Claude Desktop example prompts:

```text
korea-market-data MCP로 삼성전자 실제 데이터를 가져와줘
삼전 현재 시세 데이터를 가져와줘
KODEX 200 ETF 데이터를 가져와줘
```

The MCP server returns data payloads only. Claude/GPT performs any analysis from that data.

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

### Kiwoom quote adapter skeleton

`v0.7.0-alpha` adds a Kiwoom read-only quote adapter skeleton for provider-side development.

This is not live quote support yet:

```text
real quote API endpoint is not finalized
tests use mocked quote transport
no new public MCP tool is registered
real API calls remain opt-in only
```

The skeleton intentionally excludes account access, orders, balance lookup, holdings lookup, trading, auto-trading, and investment recommendations.

### Kiwoom quote endpoint mapping

`v0.8.0-alpha` adds documentation and disabled endpoint mapping constants for future Kiwoom read-only quote work.

This is still preparation only:

```text
real quote lookup is not enabled
public MCP quote tool is not added
endpoint mapping remains disabled until official verification
tests use quote fixtures and mocked transport
```

No account, order, balance, holdings, trading, auto-trading, or recommendation features are added.

### Kiwoom manual quote verification

`v0.10.0-alpha` hardens the guarded manual-only quote verification workflow:

```bash
npm run kiwoom:quote:manual
```

The command is blocked by default. It requires explicit real API opt-in, local credentials, a symbol, and an enabled read-only/manual-only endpoint mapping. The endpoint mapping remains disabled by default, so this release does not enable live quote lookup.

The workflow now documents and tests endpoint enabled/disabled policy, safe quote error normalization, malformed response handling, and redaction of app keys, secret keys, and access tokens.

No public MCP quote tool is added. Public real Kiwoom quote lookup is still not enabled. No account, order, balance, holdings, trading, auto-trading, or recommendation features are added.

### Provider compliance and security review

`v0.11.0-alpha` adds provider compliance and security review documentation before any public provider-backed quote tool is exposed.

This is not a feature enablement release:

```text
public MCP quote tool is still not added
public real Kiwoom quote lookup is still not enabled
credentials must remain local and must not be committed
centralized credential storage is out of scope
centralized market data redistribution proxy is out of scope
account, order, balance, holdings, trading, auto-trading, and recommendation features remain excluded
```

See:

```text
docs/providers/provider-compliance.md
docs/providers/kiwoom-compliance-notes.md
docs/security/credential-handling.md
docs/release/public-quote-tool-readiness-checklist.md
```

### Kiwoom public quote guarded skeleton

`v0.15.0-alpha` adds an explicit opt-in guard for the guarded public MCP tool skeleton:

```text
get_kiwoom_stock_quote
```

The tool is registered so clients can validate the future public Kiwoom quote shape, but real Kiwoom quote lookup remains disabled by default. The guard returns `blocked` unless public exposure, endpoint mapping, real API opt-in, public quote real-path opt-in, credentials, token, and read-only checks are all explicitly satisfied.

Example input:

```json
{
  "symbol": "005930",
  "market": "KOSPI",
  "provider": "kiwoom"
}
```

Default blocked output shape:

```json
{
  "status": "blocked",
  "provider": "kiwoom",
  "symbol": "005930",
  "quote_present": false,
  "reason": "Kiwoom public quote tool is registered as a guarded skeleton but real quote lookup is not enabled."
}
```

Real-provider success output shape, when local Kiwoom setup is explicitly enabled and succeeds:

```json
{
  "status": "ok",
  "provider": "kiwoom",
  "symbol": "005930",
  "quote_present": true,
  "quote": {
    "provider": "kiwoom",
    "symbol": "005930",
    "name": "Samsung Electronics",
    "market": "KOSPI",
    "currency": "KRW",
    "price": null,
    "change": null,
    "change_rate": null,
    "volume": null,
    "as_of": "..."
  }
}
```

The symbol must be a 6-digit Korean stock code such as `005930`. The input schema only allows `symbol`, `market`, and optional `provider`.

The guard order is intentionally conservative:

```text
input object validation
forbidden field validation
symbol validation
provider validation
endpoint readOnly check
public exposure check
endpoint enabled check
real API opt-in check
public quote real-path opt-in check
credential and token checks
quote client call
```

Validation and blocked/error responses do not echo forbidden payload values, raw provider payloads, app keys, secret keys, or access tokens.

This release does not enable live Kiwoom quote support:

```text
public real Kiwoom quote lookup is not enabled by default
KIWOOM_ENABLE_REAL_API_CALLS=false remains the default
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false remains the default
provider credentials must remain local
centralized data redistribution proxy is not included
account, order, balance, holdings, trading, auto-trading, and recommendation features remain excluded
```

Real public Kiwoom quote lookup would require all of the following, and remains unavailable by default:

```env
KIWOOM_ENABLE_REAL_API_CALLS=true
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true
```

The endpoint mapping must also be enabled, marked read-only, and explicitly exposed as a public tool, with valid local credentials available. Account, order, balance, holdings, and trading behavior remain out of scope.

Local verification is documented in:

```text
docs/providers/kiwoom-public-quote-local-verification.md
```

MCP request example:

```json
{
  "symbol": "005930",
  "market": "KOSPI",
  "provider": "kiwoom"
}
```

See also:

```text
examples/get-kiwoom-stock-quote.request.json
examples/get-kiwoom-stock-quote.blocked-response.json
examples/get-kiwoom-stock-quote.ok-response.example.json
examples/get-kiwoom-stock-quote.error-response.example.json
```

The local verification flow is not a public default. It does not add account, order, balance, holdings, trading, auto-trading, investment recommendation, centralized credential storage, or centralized data redistribution behavior.

Before sharing logs, screenshots, issues, or pull requests, verify that app keys, secret keys, access tokens, authorization headers, raw token responses, and raw quote responses are not included.

Mock/test integration is used only to validate the response format. It must not be treated as provider fallback or live quote availability.

`v0.18.0-alpha` adds local-only real path smoke test documentation for `get_kiwoom_stock_quote`.

This smoke test remains explicitly opt-in and local-only:

```text
real quote lookup is disabled by default
KIWOOM_ENABLE_REAL_API_CALLS=false remains the default
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false remains the default
credentials must remain local
smoke test results must be sanitized before sharing
no centralized data redistribution proxy is added
no account, order, balance, holdings, trading, or recommendation features are added
```

See:

```text
docs/providers/kiwoom-public-quote-real-local-smoke-test.md
docs/providers/templates/kiwoom-public-quote-smoke-test-result.md
docs/release/kiwoom-public-quote-smoke-test-checklist.md
```

`v0.19.0-alpha` adds sanitized smoke test result capture guidance.

Use these templates before sharing any local smoke test result in a GitHub issue or pull request:

```text
docs/providers/kiwoom-public-quote-smoke-test-result-capture.md
docs/providers/templates/kiwoom-public-quote-smoke-test-result.sample.md
docs/providers/templates/kiwoom-public-quote-smoke-test-github-report.md
```

Result captures must include only sanitized fields such as status, environment label, symbol, `token_present`, `quote_present`, normalized field presence, sanitized error code, sanitized `return_code`, and sanitized `return_msg`.

Do not share credentials, access tokens, authorization headers, raw request bodies, raw provider responses, screenshots containing sensitive values, account data, order data, balance data, holdings data, trading data, IP addresses, or personal information.

Public real Kiwoom quote lookup remains disabled by default. This project still does not add account, order, trading, recommendation, or centralized proxy behavior.

`v0.20.0-alpha` adds real quote endpoint activation review documentation.

This is not activation. Public real Kiwoom quote lookup remains disabled by default, endpoint `enabled` remains false by default, and endpoint `exposesPublicTool` remains false by default.

Any future activation requires an explicit decision record:

```text
docs/providers/kiwoom-real-quote-endpoint-activation-review.md
docs/providers/templates/kiwoom-real-quote-activation-decision-record.md
docs/release/kiwoom-real-quote-activation-review-checklist.md
```

The current model remains local-only opt-in with no account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, centralized credential storage, or centralized data redistribution proxy.

`v0.21.0-alpha` clarifies the local opt-in activation path for `get_kiwoom_stock_quote`.

The real path remains blocked unless all local/test gates are satisfied:

```text
KIWOOM_ENABLE_REAL_API_CALLS=true
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true
endpoint mapping is enabled in local/test context
activation decision record decision=approved_for_local_only
credentials are present and not placeholders
```

`KIWOOM_ENABLE_REAL_API_CALLS=true` alone is insufficient. The endpoint `enabled` and `exposesPublicTool` defaults remain false, and public runtime remains blocked by default.

`v0.22.0-alpha` final-hardens the local activation guard:

```text
blocked responses include a safe reason_code
activation decision fixtures cover missing, pending, rejected, wrong scope, wrong feature, and missing linked smoke test result
manual quote verification separates ok, blocked, and error output
endpoint enabled/exposesPublicTool defaults remain false
real Kiwoom quote lookup remains disabled by default
```

Blocked `reason_code` values are safe diagnostics only. They must not include app keys, secret keys, access tokens, raw request bodies, or raw provider responses.

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

Additional MCP client examples:

```text
examples/claude-desktop.mock.json
examples/claude-desktop.kiwoom-local.example.json
examples/cursor.mock.json
examples/cursor.kiwoom-local.example.json
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
* `get_kiwoom_setup_status`
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
Use korea-market-data MCP to search for Samsung Electronics.
```

Expected behavior:

- Claude Desktop detects the `korea-market-data` MCP server.
- Resolver and symbol search tools can map known Korean asset names to symbols.
- Market data context does not return mock quote, chart, or index values.
- If Kiwoom real provider data is not configured, context requests return blocked/provider_error/unavailable status.

The symbol resolver still supports known asset lookup such as `Samsung Electronics` -> `005930` and `KODEX 200` -> `069500`. Quote, chart, and index values require real provider data.


The Kiwoom provider is currently an authentication skeleton only. It validates local credential configuration but does not make real Kiwoom API calls by default.
