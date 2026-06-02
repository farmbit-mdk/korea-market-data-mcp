const secretKeyPattern = /(KIWOOM_APP_KEY|KIWOOM_APP_SECRET|access_token|refresh_token|Authorization|authorization|Bearer)\s*[:=]\s*["']?([^"',\s}]+)/gi;
const bearerPattern = /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/gi;
const longTokenPattern = /\b[A-Za-z0-9_-]{32,}\b/g;
const secretFieldNames = new Set([
  "kiwoom_app_key",
  "kiwoom_app_secret",
  "appkey",
  "appsecret",
  "app_key",
  "app_secret",
  "access_token",
  "refresh_token",
  "authorization",
  "authorizationheader",
  "token",
  "secret"
]);

export function redactSecrets<T>(value: T): T {
  if (typeof value === "string") {
    return redactString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item)) as T;
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (isSecretField(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactSecrets(nestedValue);
      }
    }

    return result as T;
  }

  return value;
}

function redactString(value: string): string {
  return value
    .replace(secretKeyPattern, "$1=[REDACTED]")
    .replace(bearerPattern, "Bearer [REDACTED]")
    .replace(longTokenPattern, "[REDACTED]");
}

function isSecretField(key: string): boolean {
  return secretFieldNames.has(key.replace(/[-_\s]/g, "").toLowerCase()) || secretFieldNames.has(key.toLowerCase());
}
