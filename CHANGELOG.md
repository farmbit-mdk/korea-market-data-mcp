# Changelog

All notable alpha release documentation and safety-scope changes are tracked here.

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
