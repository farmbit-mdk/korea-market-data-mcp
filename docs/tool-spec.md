# Tool Specification

## 1. Purpose

This document defines the initial MCP tool contracts for `korea-market-data-mcp`.

The project exposes read-only market data tools for AI agents.

This document defines:

* allowed tools
* forbidden tools
* tool input schemas
* tool output schemas
* error behavior
* provider attribution requirements
* safety boundaries

Implementation must follow this document.

---

## 2. Tool design principles

## 2.1 Read-only tools only

All tools must be read-only.

Allowed tool categories:

```text id="g5tb92"
symbol search
stock quote lookup
ETF quote lookup
market index lookup
daily chart lookup
provider status lookup
```

Forbidden tool categories:

```text id="pc8qiz"
trading
order execution
order cancellation
order modification
account balance lookup
holdings lookup
deposit lookup
trade history lookup
portfolio rebalancing
automated trading
investment recommendation generation
```

---

## 2.2 Stable tool names

Tool names should be descriptive, lowercase, and action-oriented.

Initial tool names:

```text id="2dv2f6"
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

Do not rename these tools without updating:

```text id="ca5v2u"
README.md
AGENTS.md
ROADMAP.md
docs/architecture.md
docs/provider-adapter-spec.md
docs/tool-spec.md
examples/
tests/
```

---

## 2.3 Normalized JSON output

Tools should return normalized JSON responses.

Do not return raw provider responses directly.

Every successful response should include:

```text id="01dakc"
provider
requestTimestamp
```

Where practical, also include:

```text id="9fnn4c"
providerTimestamp
sourceSymbol
isDelayed
```

---

## 2.4 Provider attribution

AI agents should know where the data came from.

Each response should include provider attribution.

Example:

```json id="j81xgm"
{
  "provider": "kiwoom",
  "requestTimestamp": "2026-01-01T00:00:00.000Z",
  "isDelayed": false
}
```

---

## 2.5 Safe error shape

Tools should return normalized errors.

Example:

```json id="xct3la"
{
  "error": {
    "code": "SYMBOL_NOT_FOUND",
    "message": "Symbol was not found.",
    "provider": "kiwoom",
    "retryable": false
  }
}
```

Errors must not expose:

* API keys
* secret keys
* access tokens
* authorization headers
* raw `.env` values
* sensitive provider payloads

---

## 3. Forbidden tools

The following tool names are explicitly forbidden:

```text id="govdur"
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
recommend_stock
recommend_etf
```

If these tools appear in the tool registry, tests should fail.

---

## 4. Common types

## 4.1 Market enum

```ts id="04fal8"
export type KoreanMarket =
  | "KRX"
  | "KOSPI"
  | "KOSDAQ"
  | "ETF"
  | "UNKNOWN";
```

## 4.2 Asset type enum

```ts id="l32ryk"
export type AssetType =
  | "stock"
  | "etf"
  | "index"
  | "unknown";
```

## 4.3 Error response

```ts id="4t63oz"
export interface ToolErrorResponse {
  error: {
    code:
      | "PROVIDER_AUTH_FAILED"
      | "PROVIDER_RATE_LIMITED"
      | "PROVIDER_TIMEOUT"
      | "PROVIDER_UNAVAILABLE"
      | "PROVIDER_BAD_RESPONSE"
      | "SYMBOL_NOT_FOUND"
      | "INVALID_INPUT"
      | "UNSUPPORTED_PROVIDER_CAPABILITY"
      | "INTERNAL_ERROR";
    message: string;
    provider?: string;
    retryable: boolean;
  };
}
```

---

# 5. Tool: `search_korean_symbol`

## 5.1 Purpose

Search for a Korean stock, ETF, or index symbol by keyword.

Example user requests:

```text id="sm2x3l"
Find the Korean ticker for Samsung Electronics.
Search for KODEX 200.
Find Korean ETFs related to S&P 500.
```

---

## 5.2 Input schema

```ts id="1drfnp"
export interface SearchKoreanSymbolInput {
  query: string;
  market?: "KRX" | "KOSPI" | "KOSDAQ" | "ETF" | "UNKNOWN";
  assetType?: "stock" | "etf" | "index" | "unknown";
  limit?: number;
}
```

Validation rules:

```text id="e6mff8"
query is required
query must not be empty
limit defaults to 10
limit must be between 1 and 50
```

---

## 5.3 Output schema

```ts id="h3j3od"
export interface SearchKoreanSymbolOutput {
  query: string;
  results: Array<{
    symbol: string;
    name: string;
    market: string;
    assetType: "stock" | "etf" | "index" | "unknown";
    currency: "KRW" | "USD" | string;
    provider: string;
    sourceSymbol?: string;
  }>;
  provider: string;
  requestTimestamp: string;
}
```

---

## 5.4 Example response

```json id="nlf3qc"
{
  "query": "Samsung Electronics",
  "results": [
    {
      "symbol": "005930",
      "name": "Samsung Electronics",
      "market": "KOSPI",
      "assetType": "stock",
      "currency": "KRW",
      "provider": "kiwoom",
      "sourceSymbol": "005930"
    }
  ],
  "provider": "kiwoom",
  "requestTimestamp": "2026-01-01T00:00:00.000Z"
}
```

---

# 6. Tool: `get_stock_quote`

## 6.1 Purpose

Get a read-only quote for a Korean listed stock.

Example user requests:

```text id="wfyzfb"
Get the current quote for Samsung Electronics.
Check the latest price of 005930.
```

---

## 6.2 Input schema

```ts id="pl3xcg"
export interface GetStockQuoteInput {
  symbol: string;
  market?: "KRX" | "KOSPI" | "KOSDAQ" | "UNKNOWN";
}
```

Validation rules:

```text id="oj6umq"
symbol is required
symbol must not be empty
tool must not accept order side, quantity, price, or account parameters
```

---

## 6.3 Output schema

```ts id="huaqjk"
export interface GetStockQuoteOutput {
  symbol: string;
  name?: string;
  market: string;
  assetType: "stock";
  currency: "KRW" | "USD" | string;

  price: number | null;
  previousClose?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;

  change?: number | null;
  changeRate?: number | null;
  volume?: number | null;
  value?: number | null;

  provider: string;
  sourceSymbol?: string;
  providerTimestamp?: string | null;
  requestTimestamp: string;
  isDelayed?: boolean;
}
```

---

## 6.4 Example response

```json id="1dag4a"
{
  "symbol": "005930",
  "name": "Samsung Electronics",
  "market": "KOSPI",
  "assetType": "stock",
  "currency": "KRW",
  "price": 0,
  "previousClose": 0,
  "open": 0,
  "high": 0,
  "low": 0,
  "change": 0,
  "changeRate": 0,
  "volume": 0,
  "value": 0,
  "provider": "kiwoom",
  "sourceSymbol": "005930",
  "providerTimestamp": null,
  "requestTimestamp": "2026-01-01T00:00:00.000Z",
  "isDelayed": false
}
```

---

# 7. Tool: `get_etf_quote`

## 7.1 Purpose

Get a read-only quote for a Korean listed ETF.

Example user requests:

```text id="d9qtkt"
Get the current quote for KODEX 200.
Check the price of TIGER 미국S&P500.
```

---

## 7.2 Input schema

```ts id="8sbuvs"
export interface GetEtfQuoteInput {
  symbol: string;
  market?: "ETF" | "KRX" | "UNKNOWN";
}
```

Validation rules:

```text id="cod0xs"
symbol is required
symbol must not be empty
tool must not accept order side, quantity, price, or account parameters
```

---

## 7.3 Output schema

```ts id="q4ceyn"
export interface GetEtfQuoteOutput {
  symbol: string;
  name?: string;
  market: string;
  assetType: "etf";
  currency: "KRW" | "USD" | string;

  price: number | null;
  previousClose?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;

  change?: number | null;
  changeRate?: number | null;
  volume?: number | null;
  value?: number | null;

  provider: string;
  sourceSymbol?: string;
  providerTimestamp?: string | null;
  requestTimestamp: string;
  isDelayed?: boolean;
}
```

---

## 7.4 Example response

```json id="93uo7l"
{
  "symbol": "069500",
  "name": "KODEX 200",
  "market": "ETF",
  "assetType": "etf",
  "currency": "KRW",
  "price": 0,
  "change": 0,
  "changeRate": 0,
  "volume": 0,
  "provider": "kiwoom",
  "sourceSymbol": "069500",
  "providerTimestamp": null,
  "requestTimestamp": "2026-01-01T00:00:00.000Z",
  "isDelayed": false
}
```

---

# 8. Tool: `get_market_index`

## 8.1 Purpose

Get a read-only quote for a Korean market index.

Example user requests:

```text id="bw2dco"
Get the latest KOSPI index.
Check KOSDAQ market index.
```

---

## 8.2 Input schema

```ts id="2rowj7"
export interface GetMarketIndexInput {
  indexCode: string;
}
```

Recommended initial index codes:

```text id="53ddif"
KOSPI
KOSDAQ
KOSPI200
```

---

## 8.3 Output schema

```ts id="f6so8y"
export interface GetMarketIndexOutput {
  indexCode: string;
  name?: string;
  market: string;
  currency: "KRW" | "USD" | string;

  value: number | null;
  change?: number | null;
  changeRate?: number | null;

  provider: string;
  providerTimestamp?: string | null;
  requestTimestamp: string;
  isDelayed?: boolean;
}
```

---

## 8.4 Example response

```json id="xth8pd"
{
  "indexCode": "KOSPI",
  "name": "KOSPI",
  "market": "KRX",
  "currency": "KRW",
  "value": 0,
  "change": 0,
  "changeRate": 0,
  "provider": "kiwoom",
  "providerTimestamp": null,
  "requestTimestamp": "2026-01-01T00:00:00.000Z",
  "isDelayed": false
}
```

---

# 9. Tool: `get_daily_chart`

## 9.1 Purpose

Get read-only daily OHLCV chart data for a Korean stock, ETF, or index.

Example user requests:

```text id="soaxdo"
Get the last 20 daily candles for Samsung Electronics.
Fetch daily chart data for KODEX 200.
```

---

## 9.2 Input schema

```ts id="hbc3aa"
export interface GetDailyChartInput {
  symbol: string;
  market?: "KRX" | "KOSPI" | "KOSDAQ" | "ETF" | "UNKNOWN";
  assetType?: "stock" | "etf" | "index" | "unknown";
  from?: string;
  to?: string;
  adjusted?: boolean;
  limit?: number;
}
```

Validation rules:

```text id="xqawhx"
symbol is required
limit defaults to 30
limit must be between 1 and 300
from and to should use YYYY-MM-DD format when provided
tool must not accept order side, quantity, price, or account parameters
```

---

## 9.3 Output schema

```ts id="dk9uxz"
export interface GetDailyChartOutput {
  symbol: string;
  name?: string;
  market: string;
  assetType: "stock" | "etf" | "index" | "unknown";
  currency: "KRW" | "USD" | string;

  candles: Array<{
    date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume?: number | null;
    value?: number | null;
  }>;

  provider: string;
  sourceSymbol?: string;
  requestTimestamp: string;
  isDelayed?: boolean;
}
```

---

## 9.4 Example response

```json id="0g85ae"
{
  "symbol": "005930",
  "name": "Samsung Electronics",
  "market": "KOSPI",
  "assetType": "stock",
  "currency": "KRW",
  "candles": [
    {
      "date": "2026-01-01",
      "open": 0,
      "high": 0,
      "low": 0,
      "close": 0,
      "volume": 0,
      "value": 0
    }
  ],
  "provider": "kiwoom",
  "sourceSymbol": "005930",
  "requestTimestamp": "2026-01-01T00:00:00.000Z",
  "isDelayed": false
}
```

---

## 10. Tool registry safety test

The implementation should include a test that checks the registered tool names.

Allowed tools:

```text id="uo5ol8"
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

Forbidden tools:

```text id="5ll31s"
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
recommend_stock
recommend_etf
```

The test should fail if any forbidden tool is registered.

---

## 11. Cache policy by tool

Initial cache policy:

| Tool                   | Recommended TTL |
| ---------------------- | --------------: |
| `search_korean_symbol` |     300 seconds |
| `get_stock_quote`      |       3 seconds |
| `get_etf_quote`        |       3 seconds |
| `get_market_index`     |       3 seconds |
| `get_daily_chart`      |     300 seconds |

Cache behavior must be documented and configurable.

---

## 12. Provider capability behavior

If the active provider does not support a tool, return:

```json id="tcsjo3"
{
  "error": {
    "code": "UNSUPPORTED_PROVIDER_CAPABILITY",
    "message": "The active provider does not support this tool.",
    "provider": "mock",
    "retryable": false
  }
}
```

Do not silently return empty data for unsupported capabilities.

---

## 13. Missing credential behavior

If a provider requires credentials and they are missing, return:

```json id="vmu59e"
{
  "error": {
    "code": "PROVIDER_AUTH_FAILED",
    "message": "Provider credentials are missing or invalid.",
    "provider": "kiwoom",
    "retryable": false
  }
}
```

Do not include environment variable values in the error.

---

## 14. Implementation order

Implementation should follow this order:

```text id="wzuxfk"
1. Define schemas
2. Register tool names
3. Implement mock provider
4. Add tool registry safety test
5. Add normalized response tests
6. Implement Kiwoom provider authentication
7. Connect tools to Kiwoom provider
8. Add MCP client examples
```

---

## 15. Summary

Initial MCP tools must remain:

```text id="jsxn8s"
small
read-only
documented
normalized
provider-attributed
safe for AI clients
```

Do not expand beyond the initial tool set until schemas, tests, and documentation are stable.
