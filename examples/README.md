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

These files contain placeholders only. Do not use `YOUR_KIWOOM_APP_KEY`, `YOUR_KIWOOM_SECRET_KEY`, `CHANGE_ME`, `REPLACE_ME`, or empty strings for a real request.

Copy an example into your local MCP client configuration path, adjust paths for your machine, and restart the MCP client after changing configuration.

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
