# Examples

Start with the mock provider examples. They require no credentials and do not make Kiwoom provider calls.

```text
examples/claude-desktop.mock.json
examples/cursor.mock.json
examples/env.mock.example
```

Kiwoom local examples are advanced and explicit opt-in only:

```text
examples/claude-desktop.kiwoom-local.example.json
examples/cursor.kiwoom-local.example.json
examples/env.kiwoom-local.example
```

Package-based examples are for official npm alpha package validation or local package validation:

```text
examples/claude-desktop.npm-alpha.config.json
examples/claude-desktop.package.example.json
examples/cursor.package.example.json
```

The official npm alpha package is published. During the alpha phase, use the explicit alpha package path:

```text
npm install korea-market-data-mcp@alpha
npx -y korea-market-data-mcp@alpha
```

The npm registry may currently have `latest` pointing to an alpha build, but this is not a stable/latest release. The required documented install path remains `npm install korea-market-data-mcp@alpha`.

These files contain placeholders only. Do not use `YOUR_KIWOOM_APP_KEY`, `YOUR_KIWOOM_SECRET_KEY`, `CHANGE_ME`, `REPLACE_ME`, or empty strings for a real request.

Copy an example into your local MCP client configuration path, adjust paths for your machine, and restart the MCP client after changing configuration.

The examples use the built server output:

```text
command: node
args: absolute path to dist/index.js
package script: npm run build
local start script: npm start
```

Windows JSON paths need escaped backslashes:

```json
"C:\\absolute\\path\\to\\korea-market-data-mcp\\dist\\index.js"
```

Do not point MCP client examples at `src/index.ts` unless you are intentionally using a development runner. The normal alpha setup path is `npm install`, `npm run build`, then `node dist/index.js`.

Claude Desktop local development verification can use:

```text
examples/claude-desktop.local-dev.config.json
```

The local development config uses Kiwoom placeholders only and keeps real API calls disabled by default.

Never commit real credentials. Never paste real app keys, secret keys, access tokens, authorization headers, raw token responses, or raw quote responses into examples, issues, pull requests, screenshots, or logs.

The examples are read-only and must not include:

```text
account numbers
order identifiers
balance lookup configuration
holdings lookup configuration
trading enablement
auto-trading enablement
investment recommendation behavior
centralized data redistribution proxy configuration
```
