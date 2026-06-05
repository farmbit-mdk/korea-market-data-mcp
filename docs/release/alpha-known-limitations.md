# Alpha Known Limitations

## Status

`korea-market-data-mcp` is an alpha-stage, read-only MCP server. APIs, response shapes, provider adapters, and setup docs may change before a stable release.

Use the mock provider first. It requires no credentials, makes no provider network calls, and is the safest setup path for Claude Desktop, Cursor, and other MCP clients.

## Kiwoom Local Verification

Kiwoom local verification requires user-owned Kiwoom Securities REST API credentials and local opt-in configuration.

Real Kiwoom quote lookup remains disabled by default:

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

Local-only verification requires explicit opt-in, valid local credentials, and the documented activation gates. `KIWOOM_ENABLE_REAL_API_CALLS=true` alone is insufficient.

## Unsupported Features

The alpha does not support:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
investment recommendations
centralized data redistribution proxy
centralized credential storage
```

`get_kiwoom_stock_quote` is the only Kiwoom public quote tool, and its real provider path remains guarded and disabled by default.

## Data And Compliance

Users are responsible for Kiwoom provider terms, data licensing restrictions, redistribution rules, and applicable laws.

This project does not provide investment advice, trading advice, brokerage services, or financial recommendations.

Provider APIs can change. Kiwoom response formats, endpoint behavior, authentication requirements, IP registration requirements, and mock/production environment behavior may differ from local test fixtures.

## Platform Notes

Examples are Windows-first because the current documentation uses PowerShell. macOS and Linux users should translate environment variable setup and path examples to their shell and MCP client configuration format.

Never store or share raw app keys, secret keys, access tokens, authorization headers, raw token responses, raw quote responses, or screenshots containing sensitive values.
