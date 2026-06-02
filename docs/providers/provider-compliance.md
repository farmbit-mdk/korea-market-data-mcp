# Provider Compliance Policy

## Purpose

This document defines the project operating policy for provider compliance before public provider-backed MCP tools are enabled.

It is not legal advice. It is a security, product, and maintainer checklist for this repository.

## Read-only Market Data Scope

`korea-market-data-mcp` is scoped to read-only market data access.

Allowed provider capabilities:

```text
symbol search
stock quote lookup
ETF quote lookup
market index lookup
chart data lookup
provider status checks
```

Forbidden provider capabilities:

```text
account access
orders
balance lookup
holdings lookup
trading
auto-trading
portfolio automation
investment recommendations
```

## Credential Handling Principle

Provider credentials belong to the user and must stay local by default.

The project must not collect, store, or proxy user credentials through a centralized service in the initial scope.

Credentials must not appear in:

```text
Git commits
logs
errors
test snapshots
fixtures
GitHub issues
pull requests
screenshots
documentation examples
```

## Data Redistribution Risk

Public quote tools must not be enabled until provider API usage rights and data redistribution restrictions are reviewed against official provider documentation.

Maintainers must consider:

```text
whether live quote data can be displayed to end users
whether quote data can be cached
whether quote data can be redistributed through MCP clients
whether realtime data has a separate license
whether provider terms restrict automated access
```

## Public MCP Tool Release Gate

Before a public provider-backed quote tool is exposed, verify:

```text
provider compliance docs exist
credential handling docs exist
SECURITY.md is current
endpoint mapping is verified against official documentation
real API calls are explicitly opt-in or otherwise documented
redaction tests pass
fetch boundary remains inside provider transport
MCP tool registry review is complete
account/order/trading scope is absent
data redistribution risk is reviewed
README disclaimer is current
provider-status is current
```

## Recommendation Boundary

This project provides data access, not financial advice.

Provider responses, tool descriptions, examples, and documentation must not imply investment advice, trading advice, guaranteed returns, or buy/sell recommendations.

## Centralized Proxy Exclusion

A centralized server that stores provider credentials, proxies provider data, or redistributes licensed data is outside the initial project scope.

Any future proxy design requires separate review for:

```text
credential custody
data licensing
data retention
access control
audit logging
rate limiting
incident response
user consent
```
