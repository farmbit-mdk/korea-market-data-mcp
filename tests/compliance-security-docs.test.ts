import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { redactSecrets } from "../src/safety/redact-secret.js";
import { getRegisteredToolNames } from "../src/tools/index.js";

const requiredDocs = [
  "SECURITY.md",
  "docs/providers/provider-compliance.md",
  "docs/providers/kiwoom-compliance-notes.md",
  "docs/security/credential-handling.md",
  "docs/release/public-quote-tool-readiness-checklist.md",
  "docs/release/v0.11.0-alpha-checklist.md"
];

describe("provider compliance and security review docs", () => {
  it("keeps required compliance and security documents present", () => {
    for (const path of requiredDocs) {
      expect(existsSync(path), `${path} should exist`).toBe(true);
    }
  });

  it("documents local-only credentials and excluded public/provider scopes", () => {
    const combinedDocs = requiredDocs.map((path) => readFileSync(path, "utf8")).join("\n");

    expect(combinedDocs).toContain("local");
    expect(combinedDocs).toContain("public MCP quote tool");
    expect(combinedDocs).toContain("public real Kiwoom quote lookup");
    expect(combinedDocs).toContain("centralized");
    expect(combinedDocs).toContain("account access");
    expect(combinedDocs).toContain("orders");
    expect(combinedDocs).toContain("trading");
    expect(combinedDocs).toContain("investment recommendations");
  });

  it("keeps .env.example limited to placeholders and safe defaults", () => {
    const envExample = readFileSync(".env.example", "utf8");

    expect(envExample).toContain("KIWOOM_ENABLE_REAL_API_CALLS=false");
    expect(envExample).toContain("KIWOOM_APP_KEY=YOUR_KIWOOM_APP_KEY");
    expect(envExample).toContain("KIWOOM_APP_SECRET=YOUR_KIWOOM_APP_SECRET");
    expect(envExample).toContain("KIWOOM_SECRET_KEY=YOUR_KIWOOM_SECRET_KEY");
    expect(envExample).not.toMatch(/KIWOOM_APP_KEY=(?!YOUR_KIWOOM_APP_KEY\s*$).+/m);
    expect(envExample).not.toMatch(/KIWOOM_APP_SECRET=(?!YOUR_KIWOOM_APP_SECRET\s*$).+/m);
    expect(envExample).not.toMatch(/KIWOOM_SECRET_KEY=(?!YOUR_KIWOOM_SECRET_KEY\s*$).+/m);
    expect(envExample).not.toMatch(/access_token\s*=/i);
    expect(envExample).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
  });

  it("keeps the MCP registry at allowed read-only tools with guarded Kiwoom quote only", () => {
    expect(getRegisteredToolNames()).toEqual([
      "search_korean_symbol",
      "get_stock_quote",
      "get_kiwoom_stock_quote",
      "get_etf_quote",
      "get_market_index",
      "get_daily_chart"
    ]);
    expect(getRegisteredToolNames()).not.toContain("get_kiwoom_quote");
    expect(getRegisteredToolNames()).not.toContain("get_real_quote");
  });

  it("keeps fetch isolated to the Kiwoom transport boundary", () => {
    const sourcePaths = [
      "src/providers/kiwoom/quote-client.ts",
      "src/providers/kiwoom/token-client.ts",
      "src/tools/get-kiwoom-stock-quote.ts",
      "scripts/kiwoom-manual-token-test.ts",
      "scripts/kiwoom-manual-quote-test.ts"
    ];

    for (const path of sourcePaths) {
      expect(readFileSync(path, "utf8"), `${path} should not call fetch directly`).not.toContain("fetch(");
    }

    expect(readFileSync("src/providers/kiwoom/transport.ts", "utf8")).toContain("fetch(");
  });

  it("redacts assignment-style app keys, secrets, and tokens", () => {
    const redacted = redactSecrets(
      "KIWOOM_APP_KEY=fixture_app_key secretkey=fixture_secret access_token=fixture_access_token Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456"
    );

    expect(redacted).not.toContain("fixture_app_key");
    expect(redacted).not.toContain("fixture_secret");
    expect(redacted).not.toContain("fixture_access_token");
    expect(redacted).not.toContain("abcdefghijklmnopqrstuvwxyz123456");
    expect(redacted).toContain("[REDACTED]");
  });
});
