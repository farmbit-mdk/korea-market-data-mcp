# Alpha Launch Announcement Draft

## Project

`korea-market-data-mcp` is a read-only Model Context Protocol server for Korean market data workflows.

The alpha is intended for local MCP client setup, mock provider validation, and guarded Kiwoom provider verification work.

## Alpha Scope

The current alpha includes:

```text
mock provider for first setup
read-only MCP tools
Claude Desktop setup docs
Cursor setup docs
local install/build/start docs
guarded get_kiwoom_stock_quote public tool skeleton
manual Kiwoom token and quote verification commands
security, distribution, and known limitations docs
```

## Supported Scope

Use the alpha for:

```text
local MCP integration testing
mock Korean symbol search and quote responses
read-only response shape validation
local-only Kiwoom verification with explicit opt-in
documentation and client setup feedback
```

## Start With Mock Provider

Mock provider is the recommended first setup path.

```text
docs/getting-started/quickstart.md
docs/getting-started/mcp-client-setup.md
examples/README.md
examples/claude-desktop.mock.json
examples/cursor.mock.json
```

Mock provider requires no credentials and must not be treated as live market data.

## Kiwoom Local Verification

Kiwoom real local verification is explicit opt-in only.

Real Kiwoom quote lookup remains disabled by default.

```env
KIWOOM_ENABLE_REAL_API_CALLS=false
KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false
```

`get_kiwoom_stock_quote` is guarded. Its real provider path remains local opt-in only and disabled by default.

## Install And Run

Use GitHub clone/local setup for this alpha:

```powershell
git clone https://github.com/farmbit-mdk/korea-market-data-mcp.git
cd korea-market-data-mcp
npm install
npm run build
npm test
npm start
```

`npm publish` was not performed for this release.

## Known Limitations

See:

```text
docs/release/alpha-known-limitations.md
docs/release/alpha-final-review.md
docs/release/distribution-readiness.md
```

## Safety And Unsupported Scope

This project is read-only market data MCP software.

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

Do not share real app keys, secret keys, access tokens, raw provider responses, `.env.local` contents, or screenshots containing credentials.

## Feedback

Use GitHub issues or pull requests for documentation, setup, and read-only tool feedback. Do not paste credentials, tokens, account identifiers, raw provider responses, or private environment files.

## Next Roadmap

Potential next work should remain separate and explicitly reviewed:

```text
more setup validation
mock provider improvements
provider response normalization hardening
provider compliance review updates
future read-only market data provider adapters
```

Any future real provider activation requires a separate review and must not change default safety settings silently.
