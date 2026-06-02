# Architecture

## 1. Purpose

This document describes the high-level architecture of `korea-market-data-mcp`.

The project is an open-source Model Context Protocol server that provides read-only Korean financial market data access for AI agents.

The architecture is designed around four core goals:

1. Keep all MCP tools read-only.
2. Isolate provider-specific logic behind provider adapters.
3. Normalize market data responses for AI clients.
4. Protect provider credentials and avoid unsafe data redistribution.

---

## 2. System overview

The system has four main layers:

```text id="heykad"
MCP Client
  ↓
MCP Server
  ↓
Tool Layer
  ↓
Provider Adapter Layer
  ↓
External Market Data Provider
```

Example:

```text id="7sjd7r"
Claude Desktop / Cursor / Codex / ChatGPT
  ↓
korea-market-data-mcp
  ↓
get_stock_quote
  ↓
Kiwoom Provider Adapter
  ↓
Kiwoom Securities REST API
```

---

## 3. Design principles

## 3.1 Read-only boundary

The MCP server must provide market data only.

Allowed categories:

* symbol search
* stock quote lookup
* ETF quote lookup
* market index lookup
* chart data lookup
* provider status lookup

Forbidden categories:

* trading
* order execution
* order cancellation
* order modification
* account balance lookup
* holdings lookup
* deposit lookup
* brokerage account automation
* portfolio rebalancing
* investment recommendation generation

The read-only boundary is a core architectural constraint.

---

## 3.2 Provider-neutral design

MCP tools should not depend directly on a specific provider's raw API response.

Instead, tools should depend on a provider interface.

```text id="gg3eny"
Tool Layer
  ↓
Provider Interface
  ↓
Kiwoom Adapter / Mock Adapter / Future Adapters
```

This allows future providers such as KRX, ECOS, FRED, or other data providers to be added without rewriting MCP tools.

---

## 3.3 Normalized responses

External providers may return different response shapes.

This project normalizes provider responses into consistent JSON objects that AI agents can interpret reliably.

A normalized quote response should include fields such as:

```json id="vmg4oa"
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
  "providerTimestamp": null,
  "requestTimestamp": "2026-01-01T00:00:00.000Z",
  "isDelayed": false
}
```

Raw provider responses should not be returned directly unless a documented debug mode is explicitly introduced.

---

## 3.4 Local credentials

Provider credentials should remain local to the user wherever possible.

The project should not require users to send their provider API keys to a centralized server.

Expected credential flow:

```text id="2n9e85"
User local environment
  ↓
.env
  ↓
MCP Server process
  ↓
Provider Adapter
  ↓
Provider API
```

The MCP server must not log or expose provider credentials.

---

## 4. Main components

## 4.1 MCP client

An MCP client is any AI tool or application that can connect to an MCP server.

Examples:

* Claude Desktop
* Cursor
* Codex local workflow
* ChatGPT MCP-compatible environments
* other MCP-compatible clients

The MCP client calls tools exposed by this server.

---

## 4.2 MCP server

The MCP server is the process that exposes tools to MCP clients.

Responsibilities:

* register tools
* validate tool inputs
* call the tool layer
* return structured responses
* handle errors safely
* avoid exposing secrets

The server should not contain provider-specific business logic.

---

## 4.3 Tool layer

The tool layer defines MCP tools such as:

```text id="1cen3c"
search_korean_symbol
get_stock_quote
get_etf_quote
get_market_index
get_daily_chart
```

Responsibilities:

* define tool contracts
* validate input schemas
* call provider interfaces
* normalize responses
* return safe error objects
* enforce read-only behavior

The tool layer must not expose trading or account functionality.

---

## 4.4 Provider adapter layer

The provider adapter layer isolates external data provider behavior.

A provider adapter handles:

* authentication
* token handling
* provider request headers
* endpoint URLs
* rate limits
* provider-specific errors
* provider response mapping
* capability declaration

Initial provider:

```text id="9ahdz9"
Kiwoom Securities REST API
```

Development provider:

```text id="q9l27s"
Mock Provider
```

Potential future providers:

```text id="6236s8"
KRX
ECOS
FRED
Yahoo Finance
Other Korean market data providers
```

---

## 4.5 Safety layer

The safety layer protects the project scope and user credentials.

Responsibilities:

* block unsupported tool categories
* redact secrets from logs
* enforce read-only tool registry
* validate provider capabilities
* normalize unsafe errors
* prevent accidental exposure of account or trading functions

This layer should be tested independently.

---

## 5. Planned source structure

Recommended source structure:

```text id="caa9n6"
src/
├─ index.ts
├─ server/
│  ├─ create-server.ts
│  └─ register-tools.ts
├─ tools/
│  ├─ search-korean-symbol.ts
│  ├─ get-stock-quote.ts
│  ├─ get-etf-quote.ts
│  ├─ get-market-index.ts
│  └─ get-daily-chart.ts
├─ providers/
│  ├─ types.ts
│  ├─ provider-registry.ts
│  ├─ errors.ts
│  ├─ mock/
│  │  ├─ client.ts
│  │  ├─ data.ts
│  │  └─ mapper.ts
│  └─ kiwoom/
│     ├─ auth.ts
│     ├─ client.ts
│     ├─ types.ts
│     ├─ errors.ts
│     ├─ mapper.ts
│     └─ rate-limit.ts
├─ schemas/
│  ├─ quote.ts
│  ├─ chart.ts
│  ├─ index.ts
│  └─ errors.ts
├─ safety/
│  ├─ read-only-tools.ts
│  ├─ redact-secret.ts
│  └─ validate-tool-category.ts
└─ utils/
   ├─ env.ts
   ├─ logger.ts
   └─ time.ts
```

---

## 6. Provider interface concept

The provider interface should expose normalized capabilities.

Example concept:

```ts id="v9tlmk"
export interface MarketDataProvider {
  readonly id: string;
  readonly name: string;

  searchSymbol(query: string): Promise<SymbolSearchResult[]>;
  getStockQuote(symbol: string): Promise<NormalizedQuote>;
  getEtfQuote(symbol: string): Promise<NormalizedQuote>;
  getMarketIndex(indexCode: string): Promise<NormalizedIndex>;
  getDailyChart(symbol: string, options?: DailyChartOptions): Promise<NormalizedDailyChart>;
}
```

Provider adapters may internally call different endpoints, but they should return normalized data to the tool layer.

---

## 7. Tool request flow

Example: `get_stock_quote`

```text id="nvvh7b"
MCP Client calls get_stock_quote
  ↓
MCP server validates input schema
  ↓
Tool layer checks read-only category
  ↓
Tool layer selects active provider
  ↓
Provider adapter fetches data
  ↓
Provider adapter maps raw response to normalized response
  ↓
Tool layer adds provider attribution and timestamps
  ↓
MCP server returns JSON to client
```

---

## 8. Error flow

Provider errors should be normalized before being returned to MCP clients.

Example:

```json id="3n4ura"
{
  "error": {
    "code": "PROVIDER_AUTH_FAILED",
    "message": "Provider authentication failed.",
    "provider": "kiwoom",
    "retryable": false
  }
}
```

Common error categories:

```text id="ce9eg7"
PROVIDER_AUTH_FAILED
PROVIDER_RATE_LIMITED
PROVIDER_TIMEOUT
PROVIDER_UNAVAILABLE
SYMBOL_NOT_FOUND
INVALID_INPUT
UNSUPPORTED_PROVIDER_CAPABILITY
INTERNAL_ERROR
```

Errors must not include secrets, tokens, raw authorization headers, or unsafe provider payloads.

---

## 9. Credential flow

Expected local credential flow:

```text id="kghciu"
.env
  ↓
env loader
  ↓
provider adapter config
  ↓
provider auth module
  ↓
provider client
```

Credential rules:

* read from environment variables
* never commit real credentials
* never log credentials
* never return credentials
* never include credentials in tests
* never store user credentials on a centralized server

---

## 10. Mock provider

The mock provider is required before real provider integration.

Purpose:

* test MCP tools without real credentials
* validate normalized response shape
* test error handling
* test read-only tool registry
* support CI without external API calls
* prevent accidental dependency on a real provider during early development

The mock provider should support the same initial methods as the real provider interface.

---

## 11. Kiwoom provider

The Kiwoom provider is the first real provider adapter.

It should be isolated under:

```text id="v5jo6q"
src/providers/kiwoom/
```

Expected files:

```text id="qtd3xh"
auth.ts
client.ts
types.ts
errors.ts
mapper.ts
rate-limit.ts
```

The Kiwoom provider must not expose account or trading endpoints through MCP tools.

Even if the external provider supports such endpoints, this project must not bind them into the MCP server.

---

## 12. Caching

Short-lived caching may be used to reduce repeated provider calls.

Initial caching approach:

```text id="m47naa"
CACHE_TTL_SECONDS=3
```

Caching rules:

* quote data may use short TTL caching
* chart data may use longer TTL caching in the future
* cache behavior must be documented per tool
* cached responses should still include request timestamp and provider attribution
* cache must not store credentials or tokens in a way that can leak through tool responses

---

## 13. Testing architecture

Minimum test areas:

```text id="kyzmkx"
tool schema validation
mock provider responses
normalized output shape
read-only tool registry
secret redaction
provider error normalization
missing credential behavior
unsupported capability behavior
```

Tests should fail if trading or account tools are accidentally registered.

---

## 14. Future provider expansion

Future provider adapters should follow the same interface.

Provider addition checklist:

```text id="jwgdk7"
Provider documented
Credentials documented
Rate limits documented
Supported tools documented
Unsupported tools documented
Response mapping tested
Errors normalized
Security model reviewed
No trading/account functions exposed
```

---

## 15. Architecture summary

The correct architecture is:

```text id="6jpc3a"
MCP tools
  ↓
Read-only safety layer
  ↓
Provider-neutral interface
  ↓
Provider adapter
  ↓
External market data provider
```

The project must avoid:

```text id="r9bw9n"
direct raw provider exposure
trading tools
account access tools
centralized credential collection
unsafe scraping
unattributed market data
opaque provider errors
```

The architecture should remain simple, read-only, provider-neutral, and safe.
