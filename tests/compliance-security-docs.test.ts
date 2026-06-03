import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { kiwoomQuoteEndpointMappings } from "../src/providers/kiwoom/quote-endpoints.js";
import { redactSecrets } from "../src/safety/redact-secret.js";
import { getRegisteredToolNames } from "../src/tools/index.js";

const requiredDocs = [
  "SECURITY.md",
  "docs/providers/provider-compliance.md",
  "docs/providers/kiwoom-compliance-notes.md",
  "docs/providers/kiwoom-public-quote-local-verification.md",
  "docs/providers/kiwoom-public-quote-real-local-smoke-test.md",
  "docs/providers/kiwoom-public-quote-smoke-test-result-capture.md",
  "docs/providers/kiwoom-real-quote-endpoint-activation-review.md",
  "docs/security/credential-handling.md",
  "docs/release/public-quote-tool-readiness-checklist.md",
  "docs/release/kiwoom-public-quote-smoke-test-checklist.md",
  "docs/release/kiwoom-real-quote-activation-review-checklist.md",
  "docs/release/v0.11.0-alpha-checklist.md",
  "docs/release/v0.16.0-alpha-checklist.md",
  "docs/release/v0.17.0-alpha-checklist.md",
  "docs/release/v0.18.0-alpha-checklist.md",
  "docs/release/v0.19.0-alpha-checklist.md",
  "docs/release/v0.20.0-alpha-checklist.md"
];

const kiwoomPublicQuoteExamplePaths = [
  "examples/get-kiwoom-stock-quote.request.json",
  "examples/get-kiwoom-stock-quote.blocked-response.json",
  "examples/get-kiwoom-stock-quote.ok-response.example.json",
  "examples/get-kiwoom-stock-quote.error-response.example.json"
];

const kiwoomPublicQuoteSmokeTestPaths = [
  "docs/providers/kiwoom-public-quote-real-local-smoke-test.md",
  "docs/providers/kiwoom-public-quote-smoke-test-result-capture.md",
  "docs/providers/templates/kiwoom-public-quote-smoke-test-result.md",
  "docs/providers/templates/kiwoom-public-quote-smoke-test-result.sample.md",
  "docs/providers/templates/kiwoom-public-quote-smoke-test-github-report.md",
  "docs/release/kiwoom-public-quote-smoke-test-checklist.md",
  "docs/release/v0.18.0-alpha-checklist.md",
  "docs/release/v0.19.0-alpha-checklist.md"
];

const kiwoomRealQuoteActivationReviewPaths = [
  "docs/providers/kiwoom-real-quote-endpoint-activation-review.md",
  "docs/providers/templates/kiwoom-real-quote-activation-decision-record.md",
  "docs/release/kiwoom-real-quote-activation-review-checklist.md",
  "docs/release/v0.20.0-alpha-checklist.md"
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
    expect(envExample).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false");
    expect(envExample).toContain("KIWOOM_APP_KEY=YOUR_KIWOOM_APP_KEY");
    expect(envExample).toContain("KIWOOM_APP_SECRET=YOUR_KIWOOM_APP_SECRET");
    expect(envExample).toContain("KIWOOM_SECRET_KEY=YOUR_KIWOOM_SECRET_KEY");
    expect(envExample).not.toMatch(/KIWOOM_APP_KEY=(?!YOUR_KIWOOM_APP_KEY\s*$).+/m);
    expect(envExample).not.toMatch(/KIWOOM_APP_SECRET=(?!YOUR_KIWOOM_APP_SECRET\s*$).+/m);
    expect(envExample).not.toMatch(/KIWOOM_SECRET_KEY=(?!YOUR_KIWOOM_SECRET_KEY\s*$).+/m);
    expect(envExample).not.toMatch(/access_token\s*=/i);
    expect(envExample).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
  });

  it("keeps public quote real-path defaults disabled", () => {
    const envExample = readFileSync(".env.example", "utf8");

    expect(envExample).toContain("MARKET_DATA_PROVIDER=mock");
    expect(envExample).toContain("KIWOOM_ENABLE_REAL_API_CALLS=false");
    expect(envExample).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false");
    expect(kiwoomQuoteEndpointMappings.quote.enabled).toBe(false);
    expect(kiwoomQuoteEndpointMappings.quote.readOnly).toBe(true);
    expect(kiwoomQuoteEndpointMappings.quote.exposesPublicTool).toBe(false);
    expect(kiwoomQuoteEndpointMappings.quote.manualOnly).toBe(true);
    expect(kiwoomQuoteEndpointMappings.quote.requiresToken).toBe(true);
  });

  it("keeps the Kiwoom public quote example request read-only", () => {
    const example = JSON.parse(readFileSync("examples/get-kiwoom-stock-quote.request.json", "utf8")) as Record<string, unknown>;

    expect(example).toEqual({
      symbol: "005930",
      market: "KOSPI",
      provider: "kiwoom"
    });
    expect(Object.keys(example)).toEqual(["symbol", "market", "provider"]);
    expect(example).not.toHaveProperty("account");
    expect(example).not.toHaveProperty("account_no");
    expect(example).not.toHaveProperty("order");
    expect(example).not.toHaveProperty("order_no");
    expect(example).not.toHaveProperty("balance");
    expect(example).not.toHaveProperty("holdings");
    expect(example).not.toHaveProperty("trading");
    expect(example).not.toHaveProperty("recommendation");
  });

  it("keeps Kiwoom public quote response examples safe", () => {
    for (const path of kiwoomPublicQuoteExamplePaths) {
      expect(existsSync(path), `${path} should exist`).toBe(true);
      const serialized = readFileSync(path, "utf8");
      const parsed = JSON.parse(serialized) as Record<string, unknown>;

      expect(serialized).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
      expect(serialized).not.toMatch(/access_token/i);
      expect(serialized).not.toMatch(/appkey/i);
      expect(serialized).not.toMatch(/secretkey/i);
      expect(serialized).not.toMatch(/account/i);
      expect(serialized).not.toMatch(/order/i);
      expect(serialized).not.toMatch(/balance/i);
      expect(serialized).not.toMatch(/holdings/i);
      expect(parsed).not.toHaveProperty("raw");
      expect(parsed).not.toHaveProperty("raw_payload");
    }
  });

  it("documents local verification matrices and blocked reasons", () => {
    const localVerificationDoc = readFileSync("docs/providers/kiwoom-public-quote-local-verification.md", "utf8");

    expect(localVerificationDoc).toContain("## Environment Matrix");
    expect(localVerificationDoc).toContain("## Endpoint Mapping Matrix");
    expect(localVerificationDoc).toContain("## Blocked Reason Matrix");
    expect(localVerificationDoc).toContain("KIWOOM_ENABLE_REAL_API_CALLS=false");
    expect(localVerificationDoc).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false");
    expect(localVerificationDoc).toContain("endpoint enabled=false");
    expect(localVerificationDoc).toContain("exposesPublicTool=false");
    expect(localVerificationDoc).toContain("readOnly=false");
    expect(localVerificationDoc).toContain("placeholder credentials");
    expect(localVerificationDoc).toContain("invalid symbol");
  });

  it("documents local verification without real-looking credentials", () => {
    const docsAndExamples = [
      "README.md",
      "docs/providers/kiwoom-public-quote-local-verification.md",
      "docs/providers/kiwoom-public-quote-real-local-smoke-test.md",
      "docs/providers/kiwoom-public-quote-smoke-test-result-capture.md",
      "docs/providers/templates/kiwoom-public-quote-smoke-test-result.md",
      "docs/providers/templates/kiwoom-public-quote-smoke-test-result.sample.md",
      "docs/providers/templates/kiwoom-public-quote-smoke-test-github-report.md",
      "docs/providers/kiwoom-real-quote-endpoint-activation-review.md",
      "docs/providers/templates/kiwoom-real-quote-activation-decision-record.md",
      "docs/release/kiwoom-real-quote-activation-review-checklist.md",
      "docs/release/public-quote-tool-readiness-checklist.md",
      "docs/release/kiwoom-public-quote-smoke-test-checklist.md",
      ...kiwoomPublicQuoteExamplePaths
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(docsAndExamples).toContain("KIWOOM_ENABLE_REAL_API_CALLS=true");
    expect(docsAndExamples).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true");
    expect(docsAndExamples).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false");
    expect(docsAndExamples).toContain("local");
    expect(docsAndExamples).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
    expect(docsAndExamples).not.toMatch(/access_token\s*[:=]\s*[A-Za-z0-9._~+/=-]{8,}/i);
    expect(docsAndExamples).not.toMatch(/KIWOOM_APP_KEY[ \t]*=[ \t]*(?!<local-app-key>|YOUR_KIWOOM_APP_KEY|your-app-key)[A-Za-z0-9._~-]{8,}/);
    expect(docsAndExamples).not.toMatch(/KIWOOM_SECRET_KEY[ \t]*=[ \t]*(?!<local-secret-key>|YOUR_KIWOOM_SECRET_KEY|your-secret-key)[A-Za-z0-9._~-]{8,}/);
  });

  it("documents real local smoke test workflow and sanitized result recording", () => {
    for (const path of kiwoomPublicQuoteSmokeTestPaths) {
      expect(existsSync(path), `${path} should exist`).toBe(true);
    }

    const readme = readFileSync("README.md", "utf8");
    const smokeDoc = readFileSync("docs/providers/kiwoom-public-quote-real-local-smoke-test.md", "utf8");
    const localVerificationDoc = readFileSync("docs/providers/kiwoom-public-quote-local-verification.md", "utf8");
    const template = readFileSync("docs/providers/templates/kiwoom-public-quote-smoke-test-result.md", "utf8");
    const sample = readFileSync("docs/providers/templates/kiwoom-public-quote-smoke-test-result.sample.md", "utf8");
    const checklist = readFileSync("docs/release/kiwoom-public-quote-smoke-test-checklist.md", "utf8");

    expect(readme).toContain("local-only real path smoke test");
    expect(readme).toContain("real quote lookup is disabled by default");
    expect(readme).toContain("no centralized data redistribution proxy");
    expect(localVerificationDoc).toContain("## Real Local Smoke Test");
    expect(smokeDoc).toContain("local-only smoke test");
    expect(smokeDoc).toContain("KIWOOM_ENABLE_REAL_API_CALLS=true");
    expect(smokeDoc).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=true");
    expect(smokeDoc).toContain("readOnly=true");
    expect(smokeDoc).toContain("exposesPublicTool=true");
    expect(smokeDoc).toContain("enabled=true");
    expect(template).toContain("Redaction Confirmation Checklist");
    expect(template).toContain("token_present");
    expect(template).toContain("quote_present");
    expect(template).toContain("Safe-To-Share Confirmation");
    expect(sample).toContain("invented normalized data only");
    expect(sample).toContain("Safe to share: yes");
    expect(checklist).toContain("Result Redaction Checklist");
    expect(checklist).toContain("Rollback And Cleanup Checklist");
  });

  it("documents smoke test result capture and GitHub sharing templates", () => {
    const readme = readFileSync("README.md", "utf8");
    const captureDoc = readFileSync("docs/providers/kiwoom-public-quote-smoke-test-result-capture.md", "utf8");
    const reportTemplate = readFileSync("docs/providers/templates/kiwoom-public-quote-smoke-test-github-report.md", "utf8");
    const readinessChecklist = readFileSync("docs/release/public-quote-tool-readiness-checklist.md", "utf8");

    expect(readme).toContain("sanitized smoke test result capture");
    expect(readme).toContain("kiwoom-public-quote-smoke-test-github-report.md");
    expect(captureDoc).toContain("Record only sanitized results");
    expect(captureDoc).toContain("GitHub Issue Or PR Sharing Format");
    expect(captureDoc).toContain("Public real quote lookup remains disabled by default");
    expect(reportTemplate).toContain("Do-Not-Include Checklist");
    expect(reportTemplate).toContain("Reproduction Steps Without Credentials");
    expect(reportTemplate).toContain("No raw quote response");
    expect(readinessChecklist).toContain("## v0.19 Smoke Test Result Capture");
  });

  it("documents real quote activation review without enabling endpoint defaults", () => {
    for (const path of kiwoomRealQuoteActivationReviewPaths) {
      expect(existsSync(path), `${path} should exist`).toBe(true);
    }

    const readme = readFileSync("README.md", "utf8");
    const activationDoc = readFileSync("docs/providers/kiwoom-real-quote-endpoint-activation-review.md", "utf8");
    const decisionRecord = readFileSync("docs/providers/templates/kiwoom-real-quote-activation-decision-record.md", "utf8");
    const activationChecklist = readFileSync("docs/release/kiwoom-real-quote-activation-review-checklist.md", "utf8");
    const endpointMappingDoc = readFileSync("docs/providers/kiwoom-quote-endpoint-mapping.md", "utf8");
    const providerCompliance = readFileSync("docs/providers/provider-compliance.md", "utf8");

    expect(readme).toContain("real quote endpoint activation review");
    expect(readme).toContain("This is not activation");
    expect(activationDoc).toContain("Activation review is not activation itself");
    expect(activationDoc).toContain("kiwoomQuoteEndpointMappings.quote.enabled=false");
    expect(activationDoc).toContain("kiwoomQuoteEndpointMappings.quote.exposesPublicTool=false");
    expect(decisionRecord).toContain("not approved / approved for local-only opt-in / approved for wider opt-in / rejected");
    expect(decisionRecord).toContain("Final Decision");
    expect(activationChecklist).toContain("enabled remains false unless decision record approves otherwise");
    expect(activationChecklist).toContain("exposesPublicTool remains false unless decision record approves otherwise");
    expect(endpointMappingDoc).toContain("Changing `enabled:true` or `exposesPublicTool:true` is forbidden unless an activation decision record explicitly approves it");
    expect(providerCompliance).toContain("Real Quote Endpoint Activation Gate");
  });

  it("keeps activation review artifacts sanitized and out of forbidden scopes", () => {
    const combinedActivationArtifacts = kiwoomRealQuoteActivationReviewPaths
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(combinedActivationArtifacts).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
    expect(combinedActivationArtifacts).not.toMatch(/access_token\s*[:=]\s*[A-Za-z0-9._~+/=-]{8,}/i);
    expect(combinedActivationArtifacts).not.toMatch(/KIWOOM_APP_KEY[ \t]*=[ \t]*(?!<local-app-key>|YOUR_KIWOOM_APP_KEY|your-app-key)[A-Za-z0-9._~-]{8,}/);
    expect(combinedActivationArtifacts).not.toMatch(/KIWOOM_SECRET_KEY[ \t]*=[ \t]*(?!<local-secret-key>|YOUR_KIWOOM_SECRET_KEY|your-secret-key)[A-Za-z0-9._~-]{8,}/);
    expect(combinedActivationArtifacts).not.toMatch(/"account(_no|No|Number)?"\s*:/i);
    expect(combinedActivationArtifacts).not.toMatch(/"order(_no|No)?"\s*:/i);
    expect(combinedActivationArtifacts).not.toMatch(/"balance"\s*:/i);
    expect(combinedActivationArtifacts).not.toMatch(/"holdings"\s*:/i);
    expect(combinedActivationArtifacts).not.toMatch(/"trading"\s*:/i);
    expect(combinedActivationArtifacts).not.toMatch(/"recommendation"\s*:/i);
    expect(combinedActivationArtifacts).not.toMatch(/"raw(_payload|_response)?"\s*:/i);
  });

  it("keeps smoke test artifacts sanitized and read-only", () => {
    const combinedSmokeArtifacts = kiwoomPublicQuoteSmokeTestPaths
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(combinedSmokeArtifacts).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
    expect(combinedSmokeArtifacts).not.toMatch(/access_token\s*[:=]\s*[A-Za-z0-9._~+/=-]{8,}/i);
    expect(combinedSmokeArtifacts).not.toMatch(/KIWOOM_APP_KEY[ \t]*=[ \t]*(?!<local-app-key>|YOUR_KIWOOM_APP_KEY|your-app-key)[A-Za-z0-9._~-]{8,}/);
    expect(combinedSmokeArtifacts).not.toMatch(/KIWOOM_SECRET_KEY[ \t]*=[ \t]*(?!<local-secret-key>|YOUR_KIWOOM_SECRET_KEY|your-secret-key)[A-Za-z0-9._~-]{8,}/);
    expect(combinedSmokeArtifacts).not.toMatch(/"account(_no|No|Number)?"\s*:/i);
    expect(combinedSmokeArtifacts).not.toMatch(/"order(_no|No)?"\s*:/i);
    expect(combinedSmokeArtifacts).not.toMatch(/"balance"\s*:/i);
    expect(combinedSmokeArtifacts).not.toMatch(/"holdings"\s*:/i);
    expect(combinedSmokeArtifacts).not.toMatch(/"trading"\s*:/i);
    expect(combinedSmokeArtifacts).not.toMatch(/"recommendation"\s*:/i);
    expect(combinedSmokeArtifacts).not.toMatch(/"raw(_payload|_response)?"\s*:/i);
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
    expect(getRegisteredToolNames()).not.toContain("place_order");
    expect(getRegisteredToolNames()).not.toContain("get_account_balance");
    expect(getRegisteredToolNames()).not.toContain("get_holdings");
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
