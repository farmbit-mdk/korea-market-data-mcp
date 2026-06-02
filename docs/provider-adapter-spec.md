# Provider Adapter Specification

## 1. Purpose

This document defines the provider adapter architecture for `korea-market-data-mcp`.

The project is designed to support multiple market data providers through a common interface.

The first target provider is:

```text id="s3pddc"
Kiwoom Securities REST API
```

Future providers may include:

```text id="f5bpfs"
KRX
ECOS
FRED
Yahoo Finance
Other Korean market data providers
```

The purpose of this document is to prevent provider-specific implementation details from leaking into MCP tools.

---

## 2. Core principle

Provider adapters must isolate provider-specific behavior.

MCP tools should not directly depend on:

* provider endpoint URLs
* provider authentication details
* provider-specific request headers
* provider-specific response shapes
* provider-specific error codes
* provider-specific rate limit formats

Instead, MCP tools should call a provider-neutral interface and receive normalized data.

---

## 3. Adapter responsibility

A provider adapter is responsible for:

```text id="rwip20"
authentication
token handling
request construction
response parsing
error mapping
rate limit handling
provider capability declaration
raw-to-normalized data mapping
```

A provider adapter is not responsible for:

```text id="h1vxf0"
MCP tool registration
MCP client configuration
investment recommendations
trading decisions
order execution
account management
centralized credential storage
```

---

## 4. Required adapter properties

Every provider adapter should expose the following metadata:

```ts id="eh1v7l"
export interface ProviderMetadata {
  id: string;
  name: string;
  version?: string;
  website?: string;
  supportsRealtime?: boolean;
  supportsHistoricalChart?: boolean;
  supportsEtfData?: boolean;
  supportsIndexData?: boolean;
  supportsSymbolSearch?: boolean;
  isReadOnly: true;
}
```

Example:

```ts id="pevyik"
export const kiwoomProviderMetadata: ProviderMetadata = {
  id: "kiwoom",
  name: "Kiwoom Securities REST API",
  supportsRealtime: false,
  supportsHistoricalChart: true,
  supportsEtfData: true,
  supportsIndexData: true,
  supportsSymbolSearch: true,
  isReadOnly: true
};
```

---

## 5. Required provider interface

Initial provider interface:

```ts id="vx7ryf"
export interface MarketDataProvider {
  readonly metadata: ProviderMetadata;

  searchSymbol(input: SymbolSearchInput): Promise<SymbolSearchResult[]>;
  getStockQuote(input: QuoteInput): Promise<NormalizedQuote>;
  getEtfQuote(input: QuoteInput): Promise<NormalizedQuote>;
  getMarketIndex(input: MarketIndexInput): Promise<NormalizedIndex>;
  getDailyChart(input: DailyChartInput): Promise<NormalizedDailyChart>;
}
```

The interface may expand later, but all additions must remain read-only.

---

## 6. Forbidden provider methods

Provider adapters must not expose methods such as:

```ts id="ma4r57"
placeOrder()
buyStock()
sellStock()
cancelOrder()
modifyOrder()
getAccountBalance()
getDeposit()
getHoldings()
getTradeHistory()
getOrderHistory()
rebalancePortfolio()
runAutoTradingStrategy()
```

Even if a provider supports these endpoints, they must not be surfaced in this project.

---

## 7. Input types

## 7.1 Symbol search input

```ts id="rubqb9"
export interface SymbolSearchInput {
  query: string;
  market?: "KRX" | "KOSPI" | "KOSDAQ" | "ETF" | "UNKNOWN";
  limit?: number;
}
```

## 7.2 Quote input

```ts id="sxjc3j"
export interface QuoteInput {
  symbol: string;
  market?: "KRX" | "KOSPI" | "KOSDAQ" | "ETF" | "UNKNOWN";
}
```

## 7.3 Market index input

```ts id="ntx08r"
export interface MarketIndexInput {
  indexCode: string;
}
```

## 7.4 Daily chart input

```ts id="ws1442"
export interface DailyChartInput {
  symbol: string;
  market?: "KRX" | "KOSPI" | "KOSDAQ" | "ETF" | "UNKNOWN";
  from?: string;
  to?: string;
  adjusted?: boolean;
  limit?: number;
}
```

---

## 8. Normalized output types

## 8.1 Symbol search result

```ts id="vkzz01"
export interface SymbolSearchResult {
  symbol: string;
  name: string;
  market: string;
  assetType: "stock" | "etf" | "index" | "unknown";
  currency: "KRW" | "USD" | string;
  provider: string;
  sourceSymbol?: string;
}
```

## 8.2 Normalized quote

```ts id="2mk2c4"
export interface NormalizedQuote {
  symbol: string;
  name?: string;
  market: string;
  assetType: "stock" | "etf" | "index" | "unknown";
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

## 8.3 Normalized index

```ts id="wk1d1v"
export interface NormalizedIndex {
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

## 8.4 Normalized daily chart

```ts id="o9ug08"
export interface NormalizedDailyChart {
  symbol: string;
  name?: string;
  market: string;
  assetType: "stock" | "etf" | "index" | "unknown";
  currency: "KRW" | "USD" | string;

  candles: DailyCandle[];

  provider: string;
  sourceSymbol?: string;
  requestTimestamp: string;
  isDelayed?: boolean;
}
```

## 8.5 Daily candle

```ts id="rd9cqp"
export interface DailyCandle {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume?: number | null;
  value?: number | null;
}
```

---

## 9. Provider capability model

Each provider must declare supported capabilities.

```ts id="tijqef"
export interface ProviderCapabilities {
  symbolSearch: boolean;
  stockQuote: boolean;
  etfQuote: boolean;
  marketIndex: boolean;
  dailyChart: boolean;
  minuteChart: boolean;
  realtimeQuote: boolean;
}
```

Example:

```ts id="loz8i7"
export const kiwoomCapabilities: ProviderCapabilities = {
  symbolSearch: true,
  stockQuote: true,
  etfQuote: true,
  marketIndex: true,
  dailyChart: true,
  minuteChart: false,
  realtimeQuote: false
};
```

If a provider does not support a capability, the adapter must return a normalized unsupported capability error.

---

## 10. Provider error model

Provider-specific errors must be mapped to normalized errors.

```ts id="qm0yv9"
export interface ProviderError {
  code: ProviderErrorCode;
  message: string;
  provider: string;
  retryable: boolean;
  statusCode?: number;
}
```

Initial error codes:

```ts id="yo38py"
export type ProviderErrorCode =
  | "PROVIDER_AUTH_FAILED"
  | "PROVIDER_RATE_LIMITED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_BAD_RESPONSE"
  | "SYMBOL_NOT_FOUND"
  | "INVALID_INPUT"
  | "UNSUPPORTED_PROVIDER_CAPABILITY"
  | "INTERNAL_ERROR";
```

Provider errors must not expose:

* access tokens
* secret keys
* authorization headers
* raw request headers
* raw `.env` values
* sensitive provider payloads

---

## 11. Authentication requirements

Provider adapters must read credentials from environment variables or a safe runtime configuration.

For Kiwoom:

```env id="cpemk6"
KIWOOM_APP_KEY=
KIWOOM_APP_SECRET=
KIWOOM_ENV=prod
KIWOOM_API_BASE_URL=https://api.kiwoom.com
KIWOOM_MOCK_API_BASE_URL=https://mockapi.kiwoom.com
```

Rules:

1. Do not hardcode credentials.
2. Do not commit credentials.
3. Do not log credentials.
4. Do not return credentials.
5. Do not use real credentials in tests.
6. Do not require centralized credential submission.

---

## 12. Rate limit handling

Provider adapters should handle rate limits internally.

Recommended behavior:

* detect provider rate limit errors
* map them to `PROVIDER_RATE_LIMITED`
* include `retryable: true`
* avoid infinite retries
* document provider-specific rate limits where known
* allow future backoff logic

Do not hide rate limit errors as generic internal errors.

---

## 13. Request timestamp policy

Every normalized response should include:

```text id="vr8kuo"
requestTimestamp
provider
```

Where possible, also include:

```text id="6p0saj"
providerTimestamp
isDelayed
sourceSymbol
```

This helps AI clients reason about data freshness and provenance.

---

## 14. Mock provider requirements

A mock provider must be implemented before relying on real provider calls.

Mock provider responsibilities:

* return stable quote fixtures
* return stable ETF fixtures
* return stable index fixtures
* return stable daily chart fixtures
* simulate provider errors
* simulate unsupported capability errors
* support tests without external API calls

The mock provider should implement the same provider interface as real providers.

---

## 15. Kiwoom adapter structure

Expected Kiwoom adapter structure:

```text id="g42czi"
src/providers/kiwoom/
├─ auth.ts
├─ client.ts
├─ types.ts
├─ errors.ts
├─ mapper.ts
├─ rate-limit.ts
└─ index.ts
```

Responsibilities:

### `auth.ts`

* access token request
* token expiration handling
* token cache
* auth error mapping

### `client.ts`

* base HTTP client
* endpoint calls
* request headers
* timeout handling

### `types.ts`

* provider-specific request and response types

### `errors.ts`

* provider-specific error mapping

### `mapper.ts`

* raw provider response to normalized response conversion

### `rate-limit.ts`

* rate limit detection
* retry/backoff placeholder

### `index.ts`

* adapter export

---

## 16. Adapter test requirements

Each provider adapter should have tests for:

```text id="xsi1sz"
missing credentials
auth failure
rate limit error
symbol not found
bad provider response
normalized quote mapping
normalized index mapping
normalized daily chart mapping
secret redaction
unsupported capability
```

Tests should use mock responses and must not require real provider credentials by default.

---

## 17. Adding a new provider

To add a new provider:

1. create provider folder under `src/providers/{provider-id}/`
2. implement provider metadata
3. implement provider capabilities
4. implement required provider interface methods
5. add response mappers
6. add error mapping
7. add tests
8. update `docs/provider-adapter-spec.md`
9. update `README.md` if user-facing setup changes
10. update `.env.example` if new credentials are needed

New providers must not add trading or account access functionality.

---

## 18. Provider review checklist

Before merging a provider adapter, verify:

```text id="s147bs"
Provider metadata exists
Provider capabilities documented
No trading endpoints exposed
No account endpoints exposed
Credentials loaded safely
Secrets not logged
Errors normalized
Responses normalized
Provider attribution included
Mock tests added
Documentation updated
```

---

## 19. Summary

The provider adapter model exists to keep the project:

```text id="snyx14"
read-only
provider-neutral
safe
testable
maintainable
extensible
```

The MCP tool layer should remain stable even when provider implementations change.
