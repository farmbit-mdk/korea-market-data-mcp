# SECURITY.md

## 1. Security policy

`korea-market-data-mcp` is a read-only MCP server for Korean financial market data access.

This project may interact with financial data provider credentials such as API keys, secret keys, access tokens, and provider-specific authentication flows.

Security is a core project requirement.

---

## 2. Project security scope

This project is designed to support:

* read-only market data access
* provider adapter authentication
* local user-owned credentials
* normalized market data responses
* MCP tool access from local AI clients

This project is not designed to support:

* trading
* order execution
* order cancellation
* order modification
* account balance lookup
* holdings lookup
* deposit lookup
* brokerage account automation
* centralized user credential collection

---

## 3. Supported versions

The project is currently in early development.

| Version          | Supported        |
| ---------------- | ---------------- |
| v0.x             | Development only |
| v1.x             | Planned          |
| earlier versions | Not supported    |

Until the first stable release, all APIs, tool schemas, and provider adapters may change.

---

## 4. Credential handling

Provider credentials must be treated as secrets.

Examples of sensitive values:

```text id="w8w8id"
KIWOOM_APP_KEY
KIWOOM_APP_SECRET
access_token
refresh_token
authorization header
provider secret key
.env file content
```

Rules:

1. Do not commit secrets to the repository.
2. Do not print secrets in logs.
3. Do not return secrets in MCP tool responses.
4. Do not include secrets in test fixtures.
5. Do not include secrets in GitHub issues or pull requests.
6. Do not paste real provider credentials into examples.
7. Use `.env.example` for variable names and obvious placeholders only.
8. Use local `.env`, `.env.local`, or shell session environment variables for real credentials.
9. Keep provider credentials local to the user's machine unless a future design is explicitly reviewed.
10. Do not build a centralized credential collection or proxy service without a separate security review.

For first-time MCP client setup, use mock provider examples before using any local Kiwoom credential flow:

```text
docs/getting-started/quickstart.md
docs/getting-started/mcp-client-setup.md
examples/claude-desktop.mock.json
examples/cursor.mock.json
```

Never paste real app keys, secret keys, access tokens, `.env.local` contents, screenshots containing credentials, or raw provider responses into GitHub issues or pull requests.

---

## 5. Environment files

The repository may include:

```text id="5rvbog"
.env.example
```

The repository must not include:

```text id="1cq5nf"
.env
.env.local
.env.production
.env.development
*.secret
*.key
```

If a secret is accidentally committed, rotate the credential immediately and remove it from Git history where practical.

---

## 6. Logging policy

Logs must be useful for debugging without exposing secrets.

Allowed log fields:

```text id="wqtmz4"
provider
toolName
symbol
market
requestId
responseTimeMs
statusCode
errorCode
retryCount
cacheHit
```

Forbidden log fields:

```text id="nrbmog"
appKey
appSecret
accessToken
refreshToken
authorizationHeader
rawEnv
rawCredential
fullProviderRequestHeaders
```

If provider responses may contain sensitive fields, do not log full raw responses.

---

## 7. MCP tool safety

All MCP tools must remain read-only.

Allowed tool categories:

* symbol search
* stock quote lookup
* ETF quote lookup
* market index lookup
* chart data lookup
* market ranking lookup
* provider status lookup

Forbidden tool categories:

* trading
* order placement
* order cancellation
* order modification
* automated trading
* account balance lookup
* holdings lookup
* deposit lookup
* portfolio rebalancing
* investment recommendation generation

A security review is required before adding any new tool category.

---

## 8. Provider adapter boundaries

Provider-specific authentication and API calls must be isolated inside provider adapters.

Provider adapter code may include:

```text id="phjzgd"
auth
client
types
errors
mapper
rate-limit
capabilities
```

MCP tools should call provider interfaces, not provider-specific raw API responses.

Provider adapters must not expose hidden trading or account functions through market data tools.

---

## 9. Error handling policy

Errors returned to MCP clients should be normalized.

Recommended shape:

```json id="jh3l0v"
{
  "error": {
    "code": "PROVIDER_AUTH_FAILED",
    "message": "Provider authentication failed.",
    "provider": "kiwoom",
    "retryable": false
  }
}
```

Do not expose:

* raw access tokens
* raw request headers
* raw secret values
* full provider error payloads that include sensitive information
* internal stack traces in production responses

---

## 10. Dependency security

Dependencies should be reviewed before adoption.

Rules:

1. Prefer official MCP SDKs and widely used libraries.
2. Avoid abandoned packages.
3. Avoid packages that require unnecessary network access.
4. Avoid packages that collect telemetry without clear disclosure.
5. Keep lockfiles committed.
6. Review dependency updates before merging.

---

## 11. Reporting a vulnerability

If you discover a security issue, please do not open a public issue with sensitive details.

Instead, report it privately to the maintainer. Use the repository's private vulnerability reporting feature if enabled.

Maintainer:

```text id="91juhp"
GitHub: @farmbit-mdk
Repository: https://github.com/farmbit-mdk/korea-market-data-mcp
Contact: SECURITY_CONTACT_PLACEHOLDER
```

If GitHub Security Advisories are enabled for this repository, use GitHub's private vulnerability reporting feature.

When reporting, include:

* affected version or commit
* description of the issue
* reproduction steps
* potential impact
* suggested fix if available

Do not include real API keys or secrets in the report.

---

## 12. Vulnerability response process

The maintainer will attempt to:

1. acknowledge the report
2. reproduce the issue
3. assess severity
4. prepare a fix
5. publish a security update if needed
6. credit the reporter when appropriate

Response times may vary because this is an early-stage open-source project.

---

## 13. Secret exposure response

If a credential is exposed:

1. stop using the exposed credential
2. rotate the provider key or token
3. remove the secret from the codebase
4. check logs and CI output
5. review whether the value was exposed in releases, issues, or pull requests
6. add a regression test or guard if practical

---

## 14. Read-only enforcement checklist

Before merging changes, verify:

```text id="x8ayll"
No trading tools added
No account tools added
No order endpoints exposed
No credentials committed
No secrets logged
No raw tokens returned
No hidden provider account access
No unsafe scraping added
No public MCP quote tool without readiness review
No centralized data redistribution proxy
Provider adapter boundaries preserved
Tool schemas documented
Tests updated
```

---

## 15. Security roadmap

Planned security improvements:

```text id="1t0div"
secret redaction utility
read-only tool registry test
provider capability allowlist
mock provider security tests
GitHub issue templates
pull request security checklist
dependency audit workflow
security model documentation
```

---

## 16. Disclaimer

This project is provided as open-source software for development and research workflows.

Users are responsible for:

* protecting their own provider credentials
* complying with provider terms of service
* complying with data licensing restrictions
* complying with applicable laws and regulations

This project does not provide brokerage services, financial advice, trading automation, or investment recommendations.
