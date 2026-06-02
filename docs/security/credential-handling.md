# Credential Handling

## Principle

Provider credentials are user-owned secrets.

The default project design is local-only credential injection through environment variables.

## Allowed Sources

Use:

```text
local shell environment variables
local .env files ignored by Git
local .env.local files ignored by Git
CI secrets only for explicit CI workflows that require them
```

`.env.example` may contain variable names and obvious placeholders only.

## Forbidden Sources

Do not put real credentials in:

```text
Git commits
README examples
provider docs
test fixtures
test snapshots
GitHub issues
pull requests
screenshots
terminal logs shared publicly
centralized project servers
```

## Sensitive Values

Treat these as secrets:

```text
KIWOOM_APP_KEY
KIWOOM_APP_SECRET
KIWOOM_SECRET_KEY
access_token
refresh_token
Authorization
Bearer tokens
provider request headers
raw token responses
raw quote responses that may contain sensitive fields
```

## Redaction

Errors and logs must redact:

```text
assignment-style secrets
object fields with secret names
Bearer tokens
long token-like strings
raw request bodies
raw provider payloads that may contain credentials
```

## Tests and Fixtures

Tests must not require real Kiwoom credentials.

Fixtures may use fake values only when they are clearly non-real and exist to verify redaction. Prefer names such as:

```text
fixture_access_token_value_that_must_not_escape
fixture_secret_key_that_must_not_escape
```

## Rotation

If a credential is exposed:

```text
rotate it immediately
stop using the exposed value
remove it from the codebase
review logs and CI output
add a regression test or guard when practical
```

## Centralized Storage

The project must not store user provider credentials on a centralized server in the current scope.

Any future centralized credential design requires a separate security and compliance review.
