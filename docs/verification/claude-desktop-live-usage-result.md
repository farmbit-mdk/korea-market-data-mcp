# Claude Desktop Live Usage Result

This document captures v0.34.0-alpha live Claude Desktop usage results for the korea-market-data MCP server.

## Purpose

Verify that Claude Desktop can call korea-market-data MCP tools and receive structured Korean market data payloads from natural-language prompts.

The MCP server is a data supply engine, not an answer engine. Claude/GPT performs analysis from returned data payloads. If real Kiwoom data is unavailable, the MCP server must return status and reason fields instead of replacing the result with mock data.

## Test Metadata

```text
test date:
tester:
Claude Desktop version:
OS:
Node.js version:
package version: 0.34.0-alpha
```

## MCP Connection Method

Record the actual method used:

```text
npm alpha package:
local dev:
config file path:
MARKET_DATA_PROVIDER:
KIWOOM_ENV:
KIWOOM_INVESTMENT_ENV:
KIWOOM_ENABLE_REAL_API_CALLS:
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH:
```

Use only placeholders in shared notes. Do not record app keys, secret keys, access tokens, authorization headers, raw token responses, raw quote responses, request bodies, account data, or personal data.

## Exposed Tool List

Expected public tools:

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
MCP server recognized: yes/no
tool list visible: yes/no
unexpected tools:
missing tools:
```

Unexpected tools must not include account, order, balance, holdings, trading, auto-trading, or recommendation tools.

## Live Test Cases

### A. MCP Server Recognition

Prompt:

```text
사용 가능한 MCP 도구 목록을 확인해줘.
```

Expected:

```text
korea-market-data MCP tools are visible.
```

Capture:

```text
Tool called:
Result status:
Notes:
Follow-up action:
```

### B. Natural-Language Resolve: Samsung Electronics

Prompt:

```text
korea-market-data MCP로 삼성전자를 resolve해줘.
```

Expected:

```text
resolve_korean_market_query returns Samsung Electronics or 005930.
```

Capture:

```text
Tool called: resolve_korean_market_query
Result status:
Resolved asset:
Provider:
Environment:
Notes:
Follow-up action:
```

### C. Natural-Language Resolve: Samsung Short Name

Prompt:

```text
korea-market-data MCP로 삼전을 resolve해줘.
```

Expected:

```text
resolve_korean_market_query returns 005930.
```

Capture:

```text
Tool called: resolve_korean_market_query
Result status:
Resolved asset:
Provider:
Environment:
Notes:
Follow-up action:
```

### D. Natural-Language Resolve: KODEX 200

Prompt:

```text
korea-market-data MCP로 코덱스200을 resolve해줘.
```

Expected:

```text
resolve_korean_market_query returns 069500.
```

Capture:

```text
Tool called: resolve_korean_market_query
Result status:
Resolved asset:
Provider:
Environment:
Notes:
Follow-up action:
```

### E. Index Resolve

Prompt:

```text
korea-market-data MCP로 코스피와 코스닥을 resolve해줘.
```

Expected:

```text
resolve_korean_market_query returns KOSPI and KOSDAQ.
```

Capture:

```text
Tool called: resolve_korean_market_query
Result status:
Resolved assets:
Provider:
Environment:
Notes:
Follow-up action:
```

### F. Market Data Context: Samsung Electronics

Prompt:

```text
korea-market-data MCP로 삼성전자 데이터 context를 가져와줘.
```

Expected:

```text
get_korean_market_data_context is called.
Mock provider may return mock quote/chart/index payloads.
Kiwoom provider without valid setup returns blocked or provider_error.
Real-provider context must not fall back to mock data.
```

Capture:

```text
Tool called: get_korean_market_data_context
Result status:
Resolved asset:
Data returned:
Provider:
Environment:
Notes:
Follow-up action:
```

### G. Kiwoom Setup Status

Prompt:

```text
korea-market-data MCP의 Kiwoom setup 상태를 확인해줘.
```

Expected:

```text
Claude references setup status docs or a safe setup-check output shape.
No credentials or tokens are printed.
```

Capture:

```text
Tool called:
Result status:
Provider:
Environment:
Notes:
Follow-up action:
```

### H. Real Quote: Samsung Electronics 005930

Prompt:

```text
삼성전자 005930의 실제 Kiwoom quote 데이터를 가져와줘.
```

Expected:

```text
If credentials and opt-in are valid, a normalized real quote payload may be returned.
If credentials or opt-in are missing, blocked or provider_error with a reason is returned.
No mock fallback is used for real-provider context payloads.
```

Capture:

```text
Tool called: get_kiwoom_stock_quote or get_korean_market_data_context
Result status:
Resolved asset:
Data returned:
Provider:
Environment:
Notes:
Follow-up action:
```

## Capture Template

Use this template for each live call:

```text
Prompt:
Tool called:
Result status:
Resolved asset:
Data returned:
Provider:
Environment:
Notes:
Follow-up action:
```

Allowed result status values:

```text
ok
blocked
provider_error
unavailable
unresolved
partial
```

## Observed Payload Summary

Record only normalized and safe payload fields:

```text
query:
resolved_assets:
data_status:
quotes status:
daily_charts status:
related_indices status:
provider:
environment:
fetched_at:
```

Do not paste raw provider responses.

## UX Notes From Live Usage

Use this section when Claude Desktop has trouble selecting or explaining tools:

```text
tool description ambiguity:
get_korean_market_data_context mock/real distinction issue:
resolve_korean_market_query description issue:
provider_error interpretation issue:
setup check documentation discovery issue:
```

Potential documentation-only improvements:

```text
tool description wording
schema description wording
README prompt examples
troubleshooting wording
Claude Desktop setup docs
```

## Follow-up Improvements

```text
query resolution gaps:
context payload clarity gaps:
blocked/provider_error wording gaps:
setup check guidance gaps:
tool selection guidance gaps:
```

## Safety Confirmation

```text
real credentials committed: no
tokens captured: no
raw provider responses captured: no
mock fallback introduced for real context payload: no
account/order/balance/holdings/trading tools observed: no
investment recommendation behavior observed: no
centralized data redistribution proxy behavior observed: no
```
