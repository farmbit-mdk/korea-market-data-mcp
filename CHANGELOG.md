# Changelog

All notable alpha release documentation and safety-scope changes are tracked here.

## v0.43.0-alpha - AI Agents Landing and Package Polish

Landing page, examples index, and npm package metadata polish for AI-agent users.

- Repositioned the README around Claude, Codex, ChatGPT, Cursor, and other MCP-compatible AI agents.
- Updated the project description from a client-specific presentation to an AI agents data-provider position.
- Added use cases and supported clients / integration targets sections.
- Clarified the distinct roles and current integration status of Claude Desktop, Codex, Cursor, and ChatGPT.
- Added `docs/examples/README.md` as an index for the quant research examples.
- Updated npm package description and keywords.
- Added the v0.43.0-alpha release checklist.

This release changes landing documentation and package metadata only. It preserves the read-only data supply engine boundary and adds no account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, or user-facing mock market data fallback.

## v0.42.0-alpha - Quant Research Examples and Prompt Pack

Documentation and prompt examples for data-only quant research workflows.

- Updated package metadata to `0.42.0-alpha`.
- Added a quant research prompt pack for stock, ETF, related index, volume, recent 20/60 day flow, `research_metrics`, unavailable comparison, multi-asset table, and research note workflows.
- Added Claude Desktop examples for data-centered Korean market research prompts.
- Added Codex/Cursor workflow examples for converting MCP data bundles into Markdown notes, tables, and CSV-like candle views.
- Added data-only analysis boundary documentation.
- Updated README example prompts and links to the examples.

This release adds documentation and examples only. It does not add buy/sell judgments, recommendations, target prices, return forecasts, account access, orders, balance lookup, holdings lookup, trading, auto-trading, or user-facing mock market data fallback.

## v0.41.0-alpha - Quant Research Metrics Hardening

Research metric edge-case hardening for context payloads.

- Updated package metadata and server defaults to `0.41.0-alpha`.
- Hardened `research_metrics` null semantics for empty candles, one-candle periods, invalid close values, zero start prices, missing volume, and invalid numeric strings.
- Added comparison metadata for related index metrics, including `comparison_unavailable`, `missing_comparable_index_period`, `insufficient_index_candles`, and `period_mismatch`.
- Documented period return, volume ratio, candle count, average volume, high/low, and related index comparison rules.
- Added Claude Desktop data-summary prompts that avoid recommendation wording.

This release stabilizes data-only calculated metrics. It does not add buy/sell judgments, recommendations, target prices, return forecasts, account access, orders, balance lookup, holdings lookup, trading, or auto-trading.

## v0.40.0-alpha - Quant Research Data Bundle UX

Data-only research metric payloads for real market data context.

- Updated package metadata and server defaults to `0.40.0-alpha`.
- Added `research_metrics` to `get_korean_market_data_context` responses when daily chart candles are available.
- Added pure research metric helpers for period return, high/low dates, latest close, latest volume, average volume, and volume ratio.
- Added related index comparison fields that remain `null` unless comparable index period data is available.
- Added tests for metric calculations, insufficient candle handling, no mock fallback, and no judgment wording in generated metrics.

`research_metrics` are data-based calculations only. This release does not add buy/sell judgments, recommendations, target prices, strategy conclusions, account access, orders, balance lookup, holdings lookup, trading, or auto-trading.

## v0.36.0-alpha - Enable Local Kiwoom Quote Verification

Local Kiwoom quote verification path for explicitly opted-in users.

- Updated package metadata and server defaults to `0.36.0-alpha`.
- Enabled the effective local Kiwoom quote endpoint verification path only when real API calls, public quote path, non-placeholder credentials, and Kiwoom provider/investment environments are all valid.
- Added `get_kiwoom_setup_status` as a read-only public MCP tool that reports setup readiness without requesting a token or quote.
- Unified `KIWOOM_ENV` parsing so `real`, `production`, and `prod` resolve to production across setup, token, quote, and auth flows; `mock` remains mock.
- Improved setup check `next_step` messages, including the token -> quote manual verification sequence when ready.
- Preserved no mock market data behavior for `get_korean_market_data_context`; unavailable quote/chart/index data remains `blocked`, `provider_error`, or `unavailable`.

No account access. No orders. No balance lookup. No holdings lookup. No trading. No auto-trading. No investment recommendations. No centralized data redistribution proxy.

## v0.35.0-alpha - Remove Mock Market Data

Remove mock market data payloads from market data context flow.

- Updated package metadata and server defaults to `0.35.0-alpha`.
- Removed mock stock quote, ETF quote, market index, and daily chart payloads from the mock provider.
- Prevented `get_korean_market_data_context` from returning mock quote/chart/index values as successful context data.
- Updated context behavior so unavailable real provider data returns blocked/provider_error/unavailable status.
- Retained resolver and symbol-search fixtures for known Korean assets such as Samsung Electronics, KODEX 200, KOSPI, KOSDAQ, and KOSPI 200.
- Added a v0.35.0-alpha release checklist and tests proving mock market values are not returned as runtime context payloads.

This release keeps symbol resolution fixtures while removing market-price-like mock payloads. It does not add account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, hosted proxy behavior, or centralized data redistribution.

## v0.34.0-alpha - Claude Desktop Live Usage Result Capture

Claude Desktop live usage result capture documentation.

- Updated package metadata and server defaults to `0.34.0-alpha`.
- Added Claude Desktop live usage result capture documentation.
- Added real usage prompt examples for MCP tool visibility, natural-language query resolution, context payload lookup, setup status, and real quote checks.
- Added a capture template for prompt, tool called, result status, resolved asset, data returned, provider, environment, notes, and follow-up action.
- Added tool selection and context payload UX note sections for live verification findings.
- Added a v0.34.0-alpha release checklist and documentation consistency tests.

This release documents live usage capture only. It does not add account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, hosted proxy behavior, centralized data redistribution, or mock fallback for failed real-provider context payloads.

## v0.33.0-alpha - Claude Desktop Real Data Verification

Claude Desktop verification docs and config examples for the official npm alpha package.

- Updated package metadata and server defaults to `0.33.0-alpha`.
- Added Claude Desktop npm alpha config example using `npx -y korea-market-data-mcp@alpha`.
- Added Claude Desktop local development config example with placeholder-only Kiwoom credentials.
- Expanded Claude Desktop setup docs with natural-language query test prompts, setup check interpretation, and real-provider-oriented context checks.
- Added real data verification capture documentation for Claude Desktop.
- Added tests for npm alpha config examples, safe placeholder-only configs, registry-aligned tool names, setup check documentation, and no mock fallback guidance.

This release documents the verification workflow only. It does not add account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, hosted proxy behavior, centralized data redistribution, or mock fallback for failed real-provider context payloads.

## v0.32.0-alpha - Real Market Data Context UX

Real Kiwoom setup and context UX improvements.

- Updated package metadata and server defaults to `0.32.0-alpha`.
- Added `npm run kiwoom:setup:check` for local Kiwoom readiness diagnostics.
- Added `KIWOOM_INVESTMENT_ENV=real | mock` setup visibility while keeping provider mock and Kiwoom mock investment environment separate.
- Normalized Kiwoom investment environment mismatch token errors as `KIWOOM_INVESTMENT_ENV_MISMATCH`.
- Updated manual quote verification to fall back to Samsung Electronics symbol `005930` when no CLI symbol or `KIWOOM_QUOTE_SYMBOL` is provided.
- Updated `get_korean_market_data_context` so Kiwoom provider context uses guarded real quote flow and does not fall back to mock quote/chart/index data.
- Added explicit `blocked`, `provider_error`, and `unavailable` context payload states.

This release keeps the MCP server as a data provider. It does not add buy/sell judgments, target prices, return forecasts, portfolio decisions, investment recommendations, account access, orders, balance lookup, holdings lookup, trading, auto-trading, hosted proxy, or centralized data redistribution.

## v0.31.0-alpha - Korean Market Data Query Resolution

Natural-language Korean market data target resolution and context payloads.

- Updated package metadata and server defaults to `0.31.0-alpha`.
- Added `resolve_korean_market_query` for resolving Korean stock, ETF, and index targets from natural-language queries.
- Added `get_korean_market_data_context` for returning structured quote, daily chart, and related index payloads.
- Expanded mock provider aliases for Samsung Electronics, KODEX 200, KOSPI, KOSDAQ, and KOSPI 200.
- Added tests for Korean query resolution, context payloads, registry registration, and existing tool preservation.
- Confirmed no investment recommendation, account, order, trading, or hosted proxy scope expansion.

The MCP server remains a data provider, not an answer or recommendation engine. Responses provide structured market data payloads for Claude/GPT analysis and do not include buy/sell judgments, target prices, return forecasts, portfolio decisions, or investment recommendations.

## v0.30.0-alpha - Official npm Alpha Publish

Official npm alpha package publish.

- Updated package metadata and server defaults to `0.30.0-alpha`.
- Published the package with the `alpha` dist-tag when publish verification succeeded.
- Added npm alpha publish result documentation.
- Added v0.30.0-alpha release checklist.
- Updated README, distribution readiness, SECURITY, provider status, and tests for npm alpha distribution.
- Confirmed no runtime scope expansion in this release.

The alpha package uses `npm install korea-market-data-mcp@alpha`. The npm registry currently has `latest` pointing to `0.30.0-alpha` because this was the first published version, but this is not a stable/latest release. The required documented install path remains `npm install korea-market-data-mcp@alpha`. No hosted proxy was added. Real Kiwoom quote lookup remains disabled by default, mock provider remains the recommended first setup path, Kiwoom real local verification remains explicit opt-in only, and `get_kiwoom_stock_quote` public tool scope is unchanged.

Explicitly excluded:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## v0.29.0-alpha - Official npm Publish Decision

Official npm publish decision documentation without publishing to npm.

- Updated package metadata and server defaults to `0.29.0-alpha`.
- Added official npm publish decision record.
- Added npm access policy documentation for ownership, 2FA, publish access, tokens, and handoff.
- Added versioning policy documentation for alpha versions and npm dist-tags.
- Documented package name availability check result and package impersonation risk.
- Updated README, distribution readiness, SECURITY, provider status, and release checklist guidance.
- Added tests for publish decision documentation, access policy, versioning policy, and package impersonation warnings.
- Confirmed no runtime scope expansion in this release.

`npm publish` was not performed. No hosted proxy was added. Real Kiwoom quote lookup remains disabled by default, mock provider remains the recommended first setup path, Kiwoom real local verification remains explicit opt-in only, and `get_kiwoom_stock_quote` public tool scope is unchanged.

Explicitly excluded:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## v0.28.0-alpha - Clean Install Smoke Test

Clean install smoke test readiness review for the package tarball.

- Updated package metadata and server defaults to `0.28.0-alpha`.
- Added clean install smoke test documentation.
- Added package-based Claude Desktop and Cursor MCP config examples for local tarball or future npm package validation.
- Added v0.28.0-alpha release checklist.
- Updated README, distribution readiness, SECURITY, and examples guidance for clean install smoke testing.
- Added tests for package-based MCP examples and clean install smoke test documentation.
- Confirmed no runtime scope expansion in this release.

`npm publish` was not performed. No hosted proxy was added. Real Kiwoom quote lookup remains disabled by default, mock provider remains the recommended first setup path, Kiwoom real local verification remains explicit opt-in only, and `get_kiwoom_stock_quote` public tool scope is unchanged.

Explicitly excluded:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## v0.27.0-alpha - npm Pack Dry Run and Publish Readiness

npm package publish-readiness review without publishing to npm.

- Updated package metadata for `0.27.0-alpha`, including repository, homepage, bugs URL, and keywords.
- Added npm pack dry run and publish readiness documentation.
- Added v0.27.0-alpha release checklist.
- Updated README npm status and unofficial package warning.
- Updated distribution readiness docs with npm pack dry run status, package contents policy, publish blockers, and official distribution channels.
- Updated SECURITY package distribution warning.
- Added tests for package metadata, package contents policy, and npm publish status documentation.
- Confirmed no runtime scope expansion in this release.

`npm publish` was not performed. No hosted proxy was added. Real Kiwoom quote lookup remains disabled by default, mock provider remains the recommended first setup path, Kiwoom real local verification remains explicit opt-in only, and `get_kiwoom_stock_quote` public tool scope is unchanged.

Explicitly excluded:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## v0.26.0-alpha - Alpha Release Final Review

Final alpha release review before the first public alpha release.

- Completed README final review for alpha positioning, mock-first setup, local install/build/start, client setup links, public tool scope, safety, and unsupported scope.
- Completed SECURITY final review for local credentials, issue/PR/log safety, mock-first setup, no hosted proxy, and no account/order/trading scope.
- Completed examples final review for mock-first setup, placeholder-only Kiwoom local examples, Windows path guidance, and `node dist/index.js` command alignment.
- Completed package metadata final review for `0.26.0-alpha`.
- Added alpha launch announcement draft.
- Added alpha final review document.
- Added v0.26.0-alpha final release checklist.
- Confirmed no runtime scope expansion in this release.

`npm publish` was not performed. No hosted proxy was added. Real Kiwoom quote lookup remains disabled by default, mock provider remains the recommended first setup path, Kiwoom real local verification remains explicit opt-in only, and `get_kiwoom_stock_quote` public tool scope is unchanged.

Explicitly excluded:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## v0.25.0-alpha - Package and Distribution Readiness

Package and distribution readiness pass for local install, build, and MCP client setup.

- Reviewed and aligned package metadata, scripts, `main`, `bin`, and package file inclusion.
- Updated README install/run documentation with GitHub clone, future npm-ready, and MCP client local command paths.
- Added distribution readiness documentation.
- Added alpha install smoke test documentation.
- Reviewed examples command/args alignment with `dist/index.js`.
- Added v0.25.0-alpha release checklist.
- Confirmed no runtime scope expansion in this release.

`npm publish` was not performed. No hosted proxy was added. Real Kiwoom quote lookup remains disabled by default, mock provider remains the recommended first setup path, Kiwoom real local verification remains explicit opt-in only, and `get_kiwoom_stock_quote` public tool scope is unchanged.

Explicitly excluded:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## v0.24.0-alpha - Read-only Kiwoom Quote MCP Alpha Launch Candidate

Launch candidate documentation pass for the current read-only MCP scope.

- Cleaned up launch candidate positioning for README and provider status docs.
- Added known limitations documentation for alpha users.
- Added examples review guidance for Claude Desktop, Cursor, and environment examples.
- Added a v0.24.0-alpha release checklist.
- Confirmed no runtime scope expansion in this release.

Real Kiwoom quote lookup remains disabled by default. Mock provider setup remains the recommended first path. Kiwoom real local verification remains explicit opt-in only, and `get_kiwoom_stock_quote` remains the only Kiwoom public quote tool.

Explicitly excluded:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
```

## Previous Alpha Flow

- v0.23.0-alpha: MCP client setup and user onboarding docs.
- v0.22.0-alpha: Kiwoom real quote local activation final hardening.
- v0.21.0-alpha: Kiwoom real quote local opt-in activation clarification.
- v0.20.0-alpha: Kiwoom real quote endpoint activation review docs.
- v0.19.0-alpha: Sanitized smoke test result capture guidance.
- v0.18.0-alpha: Local-only real path smoke test documentation.
- v0.15.0-alpha to v0.17.0-alpha: Guarded `get_kiwoom_stock_quote` skeleton and local verification docs.
- v0.11.0-alpha to v0.14.0-alpha: Compliance review and public quote tool guard hardening.
- v0.5.0-alpha to v0.10.0-alpha: Manual token and quote verification workflows.
- v0.1.0-alpha to v0.4.0-alpha: Mock provider skeleton, Kiwoom auth skeleton, and token client opt-in foundation.
