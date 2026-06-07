# Claude Desktop Real Data Verification

This document captures the v0.33.0-alpha Claude Desktop verification workflow for the official npm alpha package and local development configuration.

## Scope

The MCP server supplies Korean market data payloads. Claude Desktop or another client model performs analysis from that payload.

This workflow verifies:

```text
Claude Desktop can recognize the korea-market-data MCP server
public tool names are visible
natural-language query resolution works
real-provider-oriented context payloads return structured status
blocked/provider_error results are not replaced with mock data
Kiwoom setup check can be interpreted without exposing credentials
```

This workflow does not add quote lookup scope beyond existing guarded paths, account access, orders, balance lookup, holdings lookup, trading, auto-trading, investment recommendations, hosted proxy behavior, or centralized data redistribution.

## Environment

Record locally:

```text
Claude Desktop version:
OS:
Node.js version:
package install method: npm alpha / local repo
package version: 0.33.0-alpha
config file path:
```

Do not record app keys, secret keys, access tokens, authorization headers, raw token responses, or raw Kiwoom quote responses.

## Package Install Mode

Recommended alpha config:

```text
examples/claude-desktop.npm-alpha.config.json
```

Expected command:

```text
npx -y korea-market-data-mcp@alpha
```

The required documented install path remains `npm install korea-market-data-mcp@alpha` during the alpha phase.

## Local Development Mode

Build first:

```powershell
npm run build
```

Then use:

```text
examples/claude-desktop.local-dev.config.json
```

The local development config uses placeholders only. Real credentials must stay local and must never be committed.

## MCP Server Recognition

Claude Desktop prompt:

```text
List the available MCP tools.
```

Expected tools:

```text
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
get_kiwoom_stock_quote
resolve_korean_market_query
get_korean_market_data_context
```

Capture:

```text
server visible: yes/no
tool list visible: yes/no
unexpected tools:
```

Unexpected tools must not include account, order, balance, holdings, trading, auto-trading, or recommendation tools.

## Query Resolution Checks

Claude Desktop prompts:

```text
Use korea-market-data MCP to resolve Samsung Electronics.
Use korea-market-data MCP to resolve Samsung.
Use korea-market-data MCP to resolve KODEX 200.
Use korea-market-data MCP to resolve KOSPI and KOSDAQ indices.
```

Expected normalized targets:

```text
Samsung Electronics -> 005930 / stock / KOSPI
Samsung -> 005930 / stock / KOSPI
KODEX 200 -> 069500 / etf / KOSPI
KOSPI -> KOSPI / index
KOSDAQ -> KOSDAQ / index
```

Capture:

```text
resolve_korean_market_query status:
resolved assets:
unresolved terms:
provider:
environment:
```

## Real Data Context Checks

Claude Desktop prompts:

```text
Use korea-market-data MCP to fetch Samsung Electronics market data context.
Use korea-market-data MCP to fetch KODEX 200 ETF market data context.
Use korea-market-data MCP to fetch KOSPI index data.
```

Expected behavior:

```text
market data context no longer returns mock quote/chart/index payloads
Kiwoom provider attempts only guarded real quote context for resolved stock/ETF targets
Kiwoom chart context is unavailable until implemented
Kiwoom index context is unavailable until implemented
failed or blocked Kiwoom context lookup does not fall back to mock data
```

Capture:

```text
get_korean_market_data_context status:
data_status:
quotes status:
daily_charts status:
related_indices status:
mock fallback observed: no
```

## Kiwoom Setup Check

Local command:

```powershell
npm run kiwoom:setup:check
```

Capture only safe fields:

```text
status:
real_api_enabled:
public_quote_real_path_enabled:
credentials_present:
placeholder_credentials:
provider_environment:
kiwoom_investment_environment:
blocked_reasons:
next_step:
```

Default expected result:

```text
status=blocked
real_api_enabled=false
public_quote_real_path_enabled=false
```

## Real Quote Verification Result

Local command:

```powershell
npm run kiwoom:quote:manual
```

Safe default expected result:

```text
status=blocked
symbol=005930
token_present=false
quote_present=false
```

If real local verification is intentionally enabled, capture only normalized safe fields:

```text
status:
symbol:
market:
quote_present:
return_code:
return_msg:
error.code:
error.provider:
error.retryable:
```

Never capture raw app key, secret key, token, authorization header, request body, or raw provider response.

## Follow-up Items

Record any follow-up without expanding runtime scope:

```text
Claude Desktop config issue:
tool registry visibility issue:
query resolution gap:
context payload clarity issue:
Kiwoom setup diagnostic gap:
documentation update needed:
```
