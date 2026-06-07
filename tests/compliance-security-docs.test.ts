import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { kiwoomQuoteEndpointMappings } from "../src/providers/kiwoom/quote-endpoints.js";
import { redactSecrets } from "../src/safety/redact-secret.js";
import { getRegisteredToolNames } from "../src/tools/index.js";

const requiredDocs = [
  "CHANGELOG.md",
  "SECURITY.md",
  "docs/providers/provider-compliance.md",
  "docs/providers/kiwoom-compliance-notes.md",
  "docs/providers/kiwoom-public-quote-local-verification.md",
  "docs/providers/kiwoom-public-quote-real-local-smoke-test.md",
  "docs/providers/kiwoom-public-quote-smoke-test-result-capture.md",
  "docs/providers/kiwoom-real-quote-endpoint-activation-review.md",
  "docs/getting-started/quickstart.md",
  "docs/getting-started/mcp-client-setup.md",
  "docs/getting-started/claude-desktop-setup.md",
  "docs/getting-started/cursor-setup.md",
  "docs/getting-started/troubleshooting.md",
  "docs/security/credential-handling.md",
  "docs/release/public-quote-tool-readiness-checklist.md",
  "docs/release/kiwoom-public-quote-smoke-test-checklist.md",
  "docs/release/kiwoom-real-quote-activation-review-checklist.md",
  "docs/release/v0.11.0-alpha-checklist.md",
  "docs/release/v0.16.0-alpha-checklist.md",
  "docs/release/v0.17.0-alpha-checklist.md",
  "docs/release/v0.18.0-alpha-checklist.md",
  "docs/release/v0.19.0-alpha-checklist.md",
  "docs/release/v0.20.0-alpha-checklist.md",
  "docs/release/v0.21.0-alpha-checklist.md",
  "docs/release/v0.22.0-alpha-checklist.md",
  "docs/release/v0.23.0-alpha-checklist.md",
  "docs/release/v0.24.0-alpha-checklist.md",
  "docs/release/v0.25.0-alpha-checklist.md",
  "docs/release/v0.26.0-alpha-checklist.md",
  "docs/release/v0.27.0-alpha-checklist.md",
  "docs/release/v0.28.0-alpha-checklist.md",
  "docs/release/v0.29.0-alpha-checklist.md",
  "docs/release/v0.30.0-alpha-checklist.md",
  "docs/release/v0.32.0-alpha-checklist.md",
  "docs/release/v0.33.0-alpha-checklist.md",
  "docs/verification/claude-desktop-real-data-verification.md",
  "docs/release/alpha-known-limitations.md",
  "docs/release/distribution-readiness.md",
  "docs/release/alpha-install-smoke-test.md",
  "docs/release/npm-pack-dry-run.md",
  "docs/release/clean-install-smoke-test.md",
  "docs/release/npm-publish-decision.md",
  "docs/release/npm-access-policy.md",
  "docs/release/versioning-policy.md",
  "docs/release/npm-alpha-publish-result.md",
  "docs/release/alpha-launch-announcement.md",
  "docs/release/alpha-final-review.md",
  "examples/README.md"
];

const kiwoomPublicQuoteExamplePaths = [
  "examples/get-kiwoom-stock-quote.request.json",
  "examples/get-kiwoom-stock-quote.blocked-response.json",
  "examples/get-kiwoom-stock-quote.ok-response.example.json",
  "examples/get-kiwoom-stock-quote.error-response.example.json"
];

const mcpClientSetupExamplePaths = [
  "examples/README.md",
  "examples/claude-desktop.mock.json",
  "examples/claude-desktop.kiwoom-local.example.json",
  "examples/cursor.mock.json",
  "examples/cursor.kiwoom-local.example.json",
  "examples/claude-desktop.package.example.json",
  "examples/claude-desktop.npm-alpha.config.json",
  "examples/claude-desktop.local-dev.config.json",
  "examples/cursor.package.example.json",
  "examples/env.mock.example",
  "examples/env.kiwoom-local.example"
];

const gettingStartedDocPaths = [
  "docs/getting-started/quickstart.md",
  "docs/getting-started/mcp-client-setup.md",
  "docs/getting-started/claude-desktop-setup.md",
  "docs/getting-started/cursor-setup.md",
  "docs/getting-started/troubleshooting.md"
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
  "docs/release/v0.20.0-alpha-checklist.md",
  "docs/release/v0.21.0-alpha-checklist.md",
  "docs/release/v0.22.0-alpha-checklist.md"
];

const standardBlockedReasonCodes = [
  "REAL_API_CALLS_DISABLED",
  "PUBLIC_QUOTE_REAL_PATH_DISABLED",
  "ACTIVATION_DECISION_RECORD_MISSING",
  "ACTIVATION_DECISION_NOT_APPROVED_FOR_LOCAL_ONLY",
  "ENDPOINT_DISABLED",
  "PUBLIC_TOOL_EXPOSURE_DISABLED",
  "CREDENTIALS_MISSING",
  "CREDENTIALS_PLACEHOLDER",
  "TOKEN_REQUEST_BLOCKED",
  "TOKEN_REQUEST_FAILED",
  "INVALID_SYMBOL",
  "QUOTE_ENDPOINT_NOT_READ_ONLY",
  "QUOTE_RESPONSE_INVALID"
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
    expect(envExample).toContain("KIWOOM_ENABLE_REAL_API_CALLS=false");
    expect(envExample).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false");
    expect(envExample).toContain("Do not add KIWOOM_ACCOUNT_NO");
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

  it("adds safe MCP client setup docs and examples", () => {
    for (const path of [...gettingStartedDocPaths, ...mcpClientSetupExamplePaths]) {
      expect(existsSync(path), `${path} should exist`).toBe(true);
    }

    const combinedDocs = [
      "README.md",
      "SECURITY.md",
      "docs/providers/provider-status.md",
      "docs/release/v0.23.0-alpha-checklist.md",
      ...gettingStartedDocPaths
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(combinedDocs).toContain("mock provider");
    expect(combinedDocs).toContain("Claude Desktop");
    expect(combinedDocs).toContain("Cursor");
    expect(combinedDocs).toContain("KIWOOM_ENABLE_REAL_API_CALLS=false");
    expect(combinedDocs).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false");
    expect(combinedDocs).toContain("real Kiwoom quote lookup remains disabled by default");
    expect(combinedDocs).toContain("no account access");
    expect(combinedDocs).toContain("no orders");
    expect(combinedDocs).toContain("no trading");
    expect(combinedDocs).toContain("no centralized data redistribution proxy");
  });

  it("keeps MCP client setup examples placeholder-only and read-only", () => {
    for (const path of mcpClientSetupExamplePaths) {
      const serialized = readFileSync(path, "utf8");

      expect(serialized).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
      expect(serialized).not.toMatch(/access_token/i);
      expect(serialized).not.toMatch(/KIWOOM_APP_KEY[ \t]*[:=][ \t]*["']?(?!YOUR_KIWOOM_APP_KEY)[A-Za-z0-9._~-]{8,}/);
      expect(serialized).not.toMatch(/KIWOOM_SECRET_KEY[ \t]*[:=][ \t]*["']?(?!YOUR_KIWOOM_SECRET_KEY)[A-Za-z0-9._~-]{8,}/);
      expect(serialized).not.toMatch(/ACCOUNT_NO/i);
      expect(serialized).not.toMatch(/ORDER_NO/i);
      expect(serialized).not.toMatch(/ENABLE_TRADING_TOOLS["']?\s*[:=]\s*["']?true/i);

      if (path.endsWith(".json")) {
        const parsed = JSON.parse(serialized) as Record<string, unknown>;
        expect(parsed).toHaveProperty("mcpServers");
      }
    }
  });

  it("documents the v0.24 alpha launch candidate scope without runtime expansion", () => {
    const launchCandidateDocs = [
      "README.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "docs/providers/provider-status.md",
      "docs/release/alpha-known-limitations.md",
      "docs/release/v0.24.0-alpha-checklist.md",
      "examples/README.md"
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(launchCandidateDocs).toContain("v0.24.0-alpha");
    expect(launchCandidateDocs).toContain("Read-only Kiwoom Quote MCP Alpha Launch Candidate");
    expect(launchCandidateDocs).toContain("mock provider");
    expect(launchCandidateDocs).toContain("real Kiwoom quote lookup remains disabled by default");
    expect(launchCandidateDocs).toContain("Kiwoom real local verification is explicit opt-in only");
    expect(launchCandidateDocs).toContain("get_kiwoom_stock_quote is the only Kiwoom public quote tool");
    expect(launchCandidateDocs).toContain("KIWOOM_ENABLE_REAL_API_CALLS=false");
    expect(launchCandidateDocs).toContain("KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH=false");
    expect(launchCandidateDocs).toContain("endpoint enabled default remains false");
    expect(launchCandidateDocs).toContain("endpoint exposesPublicTool default remains false");
    expect(launchCandidateDocs).toContain("known limitations");
    expect(launchCandidateDocs).toContain("no runtime scope expansion");
    expect(launchCandidateDocs).toContain("no account access");
    expect(launchCandidateDocs).toContain("no orders");
    expect(launchCandidateDocs).toContain("no balance lookup");
    expect(launchCandidateDocs).toContain("no holdings lookup");
    expect(launchCandidateDocs).toContain("no trading");
    expect(launchCandidateDocs).toContain("no auto-trading");
    expect(launchCandidateDocs).toContain("no investment recommendations");
    expect(launchCandidateDocs).toContain("no centralized data redistribution proxy");
  });

  it("documents v0.25 package and distribution readiness without publishing or hosted proxy scope", () => {
    const distributionDocs = [
      "README.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "docs/providers/provider-status.md",
      "docs/getting-started/quickstart.md",
      "docs/getting-started/mcp-client-setup.md",
      "docs/release/distribution-readiness.md",
      "docs/release/alpha-install-smoke-test.md",
      "docs/release/v0.25.0-alpha-checklist.md",
      "examples/README.md"
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(distributionDocs).toContain("v0.25.0-alpha");
    expect(distributionDocs).toContain("Package and Distribution Readiness");
    expect(distributionDocs).toContain("npm publish");
    expect(distributionDocs).toContain("not performed");
    expect(distributionDocs).toContain("hosted proxy");
    expect(distributionDocs).toContain("not added");
    expect(distributionDocs).toContain("mock provider");
    expect(distributionDocs).toContain("recommended first");
    expect(distributionDocs).toContain("Kiwoom real local verification remains explicit opt-in only");
    expect(distributionDocs).toContain("real Kiwoom quote lookup remains disabled by default");
    expect(distributionDocs).toContain("get_kiwoom_stock_quote public tool scope");
    expect(distributionDocs).toContain("command: node");
    expect(distributionDocs).toContain("dist/index.js");
    expect(distributionDocs).toContain("npm run build");
    expect(distributionDocs).toContain("npm start");
    expect(distributionDocs).toContain("no account access");
    expect(distributionDocs).toContain("no orders");
    expect(distributionDocs).toContain("no balance lookup");
    expect(distributionDocs).toContain("no holdings lookup");
    expect(distributionDocs).toContain("no trading");
    expect(distributionDocs).toContain("no auto-trading");
    expect(distributionDocs).toContain("no investment recommendations");
    expect(distributionDocs).toContain("no centralized data redistribution proxy");
  });

  it("keeps package metadata aligned with documented local distribution commands", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      name: string;
      version: string;
      description: string;
      type: string;
      main?: string;
      bin?: Record<string, string>;
      bugs?: { url: string };
      files?: string[];
      homepage?: string;
      keywords?: string[];
      repository?: { type: string; url: string };
      scripts?: Record<string, string>;
      license: string;
    };
    const packageLock = JSON.parse(readFileSync("package-lock.json", "utf8")) as {
      name: string;
      version: string;
      packages: Record<string, { version?: string }>;
    };

    expect(packageJson.name).toBe("korea-market-data-mcp");
    expect(packageJson.version).toBe("0.33.0-alpha");
    expect(packageLock.version).toBe(packageJson.version);
    expect(packageLock.packages[""].version).toBe(packageJson.version);
    expect(packageJson.description).toContain("Read-only MCP server");
    expect(packageJson.repository?.url).toBe("git+https://github.com/farmbit-mdk/korea-market-data-mcp.git");
    expect(packageJson.homepage).toBe("https://github.com/farmbit-mdk/korea-market-data-mcp#readme");
    expect(packageJson.bugs?.url).toBe("https://github.com/farmbit-mdk/korea-market-data-mcp/issues");
    expect(packageJson.keywords).toEqual(expect.arrayContaining([
      "mcp",
      "model-context-protocol",
      "korean-market-data",
      "kiwoom",
      "finance",
      "read-only"
    ]));
    expect(packageJson.license).toBe("MIT");
    expect(packageJson.type).toBe("module");
    expect(packageJson.main).toBe("dist/index.js");
    expect(packageJson.bin?.["korea-market-data-mcp"]).toBe("dist/index.js");
    expect(packageJson.files).toEqual(expect.arrayContaining([
      "dist",
      "docs",
      "examples",
      ".env.example",
      "CHANGELOG.md",
      "README.md",
      "SECURITY.md",
      "LICENSE"
    ]));
    expect(packageJson.scripts?.build).toBe("tsc -p tsconfig.json");
    expect(packageJson.scripts?.start).toBe("node dist/index.js");
    expect(packageJson.scripts?.test).toBe("vitest run");
    expect(packageJson.scripts?.["kiwoom:setup:check"]).toContain("scripts/kiwoom-setup-check.ts");
    expect(packageJson.scripts?.["kiwoom:token:manual"]).toContain("scripts/kiwoom-manual-token-test.ts");
    expect(packageJson.scripts?.["kiwoom:quote:manual"]).toContain("scripts/kiwoom-manual-quote-test.ts");
    expect(readFileSync(".env.example", "utf8")).toContain("MCP_SERVER_VERSION=0.33.0-alpha");
    expect(readFileSync("src/utils/env.ts", "utf8")).toContain("0.33.0-alpha");
    expect(readFileSync("src/server/create-server.ts", "utf8")).toContain("0.33.0-alpha");
  });

  it("documents v0.30 official npm alpha publish without runtime scope expansion", () => {
    const alphaPublishDocs = [
      "README.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "docs/providers/provider-status.md",
      "docs/release/distribution-readiness.md",
      "docs/release/npm-alpha-publish-result.md",
      "docs/release/v0.30.0-alpha-checklist.md",
      "examples/README.md"
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(alphaPublishDocs).toContain("v0.30.0-alpha");
    expect(alphaPublishDocs).toContain("Official npm Alpha Publish");
    expect(alphaPublishDocs).toContain("npm install korea-market-data-mcp@alpha");
    expect(alphaPublishDocs).toContain("npm publish --tag alpha");
    expect(alphaPublishDocs).toContain("npm package was published with alpha dist-tag");
    expect(alphaPublishDocs).toContain("latest currently points to alpha, but alpha install is still the required documented path");
    expect(alphaPublishDocs).toContain("v0.30.0-alpha is not a stable/latest release");
    expect(alphaPublishDocs).toContain("npm dist-tag rm korea-market-data-mcp latest attempted and failed with E400 Bad Request");
    expect(alphaPublishDocs).toContain("audit: 0 vulnerabilities");
    expect(alphaPublishDocs).toContain("Do not run plain `npm publish`");
    expect(alphaPublishDocs).toContain("GitHub clone/local setup remains supported");
    expect(alphaPublishDocs).toContain("No hosted proxy was added");
    expect(alphaPublishDocs).toContain("Real Kiwoom quote lookup remains disabled by default");
    expect(alphaPublishDocs).toContain("Mock provider is the recommended first setup path");
    expect(alphaPublishDocs).toContain("Kiwoom real local verification is explicit opt-in only");
    expect(alphaPublishDocs).toContain("get_kiwoom_stock_quote public tool scope is unchanged");
    expect(alphaPublishDocs).toContain("No account access.");
    expect(alphaPublishDocs).toContain("No orders.");
    expect(alphaPublishDocs).toContain("No balance lookup.");
    expect(alphaPublishDocs).toContain("No holdings lookup.");
    expect(alphaPublishDocs).toContain("No trading.");
    expect(alphaPublishDocs).toContain("No auto-trading.");
    expect(alphaPublishDocs).toContain("No investment recommendations.");
    expect(alphaPublishDocs).toContain("No centralized data redistribution proxy.");
  });

  it("documents v0.29 official npm publish decision without publishing", () => {
    const publishDecisionDocs = [
      "README.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "docs/providers/provider-status.md",
      "docs/release/distribution-readiness.md",
      "docs/release/npm-publish-decision.md",
      "docs/release/npm-access-policy.md",
      "docs/release/versioning-policy.md",
      "docs/release/v0.29.0-alpha-checklist.md",
      "examples/README.md"
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(publishDecisionDocs).toContain("v0.29.0-alpha");
    expect(publishDecisionDocs).toContain("Official npm Publish Decision");
    expect(publishDecisionDocs).toContain("defer publish");
    expect(publishDecisionDocs).toContain("defer actual npm publish until a separate final publish release");
    expect(publishDecisionDocs).toContain("npm publish was not performed");
    expect(publishDecisionDocs).toContain("official npm package is not published yet");
    expect(publishDecisionDocs).toContain("GitHub clone/local setup remains primary");
    expect(publishDecisionDocs).toContain("package name availability");
    expect(publishDecisionDocs).toContain("E404 Not Found");
    expect(publishDecisionDocs).toContain("not reserved");
    expect(publishDecisionDocs).toContain("2FA");
    expect(publishDecisionDocs).toContain("provenance");
    expect(publishDecisionDocs).toContain("npm publish --tag alpha");
    expect(publishDecisionDocs).toContain("latest dist-tag");
    expect(publishDecisionDocs).toContain("package impersonation");
    expect(publishDecisionDocs).toContain("do not install similarly named unofficial packages");
    expect(publishDecisionDocs).toContain("No hosted proxy was added");
    expect(publishDecisionDocs).toContain("Real Kiwoom quote lookup remains disabled by default");
    expect(publishDecisionDocs).toContain("Mock provider is the recommended first setup path");
    expect(publishDecisionDocs).toContain("Kiwoom real local verification is explicit opt-in only");
    expect(publishDecisionDocs).toContain("get_kiwoom_stock_quote public tool scope is unchanged");
    expect(publishDecisionDocs).toContain("No account access.");
    expect(publishDecisionDocs).toContain("No orders.");
    expect(publishDecisionDocs).toContain("No balance lookup.");
    expect(publishDecisionDocs).toContain("No holdings lookup.");
    expect(publishDecisionDocs).toContain("No trading.");
    expect(publishDecisionDocs).toContain("No auto-trading.");
    expect(publishDecisionDocs).toContain("No investment recommendations.");
    expect(publishDecisionDocs).toContain("No centralized data redistribution proxy.");
  });

  it("documents v0.28 clean install smoke test readiness without npm publishing", () => {
    const cleanInstallDocs = [
      "README.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "docs/providers/provider-status.md",
      "docs/release/distribution-readiness.md",
      "docs/release/npm-pack-dry-run.md",
      "docs/release/clean-install-smoke-test.md",
      "docs/release/v0.28.0-alpha-checklist.md",
      "examples/README.md"
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(cleanInstallDocs).toContain("v0.28.0-alpha");
    expect(cleanInstallDocs).toContain("Clean Install Smoke Test");
    expect(cleanInstallDocs).toContain("clean temp directory install");
    expect(cleanInstallDocs).toContain("tarball install passed");
    expect(cleanInstallDocs).toContain("package bin startup check passed");
    expect(cleanInstallDocs).toContain("mock provider startup check passed");
    expect(cleanInstallDocs).toContain("manual token default blocked");
    expect(cleanInstallDocs).toContain("manual quote default blocked");
    expect(cleanInstallDocs).toContain("package-based MCP client config");
    expect(cleanInstallDocs).toContain("official npm package is not published yet");
    expect(cleanInstallDocs).toContain("package-based setup remains alpha/testing only");
    expect(cleanInstallDocs).toContain("npm publish was not performed");
    expect(cleanInstallDocs).toContain("hosted proxy was not added");
    expect(cleanInstallDocs).toContain("Real Kiwoom quote lookup remains disabled by default");
    expect(cleanInstallDocs).toContain("Mock provider is the recommended first setup path");
    expect(cleanInstallDocs).toContain("Kiwoom real local verification is explicit opt-in only");
    expect(cleanInstallDocs).toContain("get_kiwoom_stock_quote public tool scope is unchanged");
    expect(cleanInstallDocs).toContain("No account access.");
    expect(cleanInstallDocs).toContain("No orders.");
    expect(cleanInstallDocs).toContain("No balance lookup.");
    expect(cleanInstallDocs).toContain("No holdings lookup.");
    expect(cleanInstallDocs).toContain("No trading.");
    expect(cleanInstallDocs).toContain("No auto-trading.");
    expect(cleanInstallDocs).toContain("No investment recommendations.");
    expect(cleanInstallDocs).toContain("No centralized data redistribution proxy.");
  });

  it("documents v0.27 npm pack dry run readiness without npm publishing", () => {
    const npmReadinessDocs = [
      "README.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "docs/providers/provider-status.md",
      "docs/release/distribution-readiness.md",
      "docs/release/npm-pack-dry-run.md",
      "docs/release/v0.27.0-alpha-checklist.md"
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(npmReadinessDocs).toContain("v0.27.0-alpha");
    expect(npmReadinessDocs).toContain("npm Pack Dry Run and Publish Readiness");
    expect(npmReadinessDocs).toContain("npm pack --dry-run");
    expect(npmReadinessDocs).toContain("package contents");
    expect(npmReadinessDocs).toContain("clean install smoke test");
    expect(npmReadinessDocs).toContain("npm publish was not performed");
    expect(npmReadinessDocs).toContain("No hosted proxy was added");
    expect(npmReadinessDocs).toContain("do not install unofficial npm packages");
    expect(npmReadinessDocs).toContain("GitHub clone/local setup remains the primary distribution path");
    expect(npmReadinessDocs).toContain(".env.local is not included");
    expect(npmReadinessDocs).toContain("real credentials are not included");
    expect(npmReadinessDocs).toContain("Real Kiwoom quote lookup remains disabled by default");
    expect(npmReadinessDocs).toContain("Mock provider is the recommended first setup path");
    expect(npmReadinessDocs).toContain("Kiwoom real local verification is explicit opt-in only");
    expect(npmReadinessDocs).toContain("get_kiwoom_stock_quote public tool scope is unchanged");
    expect(npmReadinessDocs).toContain("No account access.");
    expect(npmReadinessDocs).toContain("No orders.");
    expect(npmReadinessDocs).toContain("No balance lookup.");
    expect(npmReadinessDocs).toContain("No holdings lookup.");
    expect(npmReadinessDocs).toContain("No trading.");
    expect(npmReadinessDocs).toContain("No auto-trading.");
    expect(npmReadinessDocs).toContain("No investment recommendations.");
    expect(npmReadinessDocs).toContain("No centralized data redistribution proxy.");
  });

  it("documents v0.26 alpha final review and launch announcement without runtime expansion", () => {
    const finalReviewDocs = [
      "README.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "docs/providers/provider-status.md",
      "docs/release/alpha-launch-announcement.md",
      "docs/release/alpha-final-review.md",
      "docs/release/v0.26.0-alpha-checklist.md",
      "docs/release/distribution-readiness.md",
      "examples/README.md"
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(finalReviewDocs).toContain("v0.26.0-alpha");
    expect(finalReviewDocs).toContain("Alpha Release Final Review");
    expect(finalReviewDocs).toContain("alpha-ready-with-limitations");
    expect(finalReviewDocs).toContain("alpha launch announcement");
    expect(finalReviewDocs).toContain("README final review");
    expect(finalReviewDocs).toContain("SECURITY final review");
    expect(finalReviewDocs).toContain("examples final review");
    expect(finalReviewDocs).toContain("package metadata final review");
    expect(finalReviewDocs).toContain("npm publish was not performed");
    expect(finalReviewDocs).toContain("No hosted proxy was added");
    expect(finalReviewDocs).toContain("Real Kiwoom quote lookup remains disabled by default.");
    expect(finalReviewDocs).toContain("Mock provider is the recommended first setup path.");
    expect(finalReviewDocs).toContain("Kiwoom real local verification is explicit opt-in only.");
    expect(finalReviewDocs).toContain("get_kiwoom_stock_quote public tool scope unchanged");
    expect(finalReviewDocs).toContain("get_kiwoom_stock_quote is the only Kiwoom public quote tool");
    expect(finalReviewDocs).toContain("No account access.");
    expect(finalReviewDocs).toContain("No orders.");
    expect(finalReviewDocs).toContain("No balance lookup.");
    expect(finalReviewDocs).toContain("No holdings lookup.");
    expect(finalReviewDocs).toContain("No trading.");
    expect(finalReviewDocs).toContain("No auto-trading.");
    expect(finalReviewDocs).toContain("No investment recommendations.");
    expect(finalReviewDocs).toContain("No centralized data redistribution proxy.");
  });

  it("keeps MCP client examples aligned with the built package entrypoint", () => {
    const mcpJsonExamplePaths = [
      "examples/claude-desktop.mock.json",
      "examples/claude-desktop.kiwoom-local.example.json",
      "examples/cursor.mock.json",
      "examples/cursor.kiwoom-local.example.json"
    ];

    for (const path of mcpJsonExamplePaths) {
      const parsed = JSON.parse(readFileSync(path, "utf8")) as {
        mcpServers: Record<string, { command: string; args: string[]; env: Record<string, string> }>;
      };
      const server = parsed.mcpServers["korea-market-data"];

      expect(server.command).toBe("node");
      expect(server.args).toHaveLength(1);
      expect(server.args[0]).toContain("dist/index.js");
      expect(server.env.KIWOOM_ENABLE_REAL_API_CALLS).toBe("false");
      expect(server.env.KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH).toBe("false");
      expect(server.env).not.toHaveProperty("KIWOOM_ACCOUNT_NO");
      expect(server.env).not.toHaveProperty("ENABLE_TRADING_TOOLS");
      expect(server.env).not.toHaveProperty("ENABLE_ACCOUNT_TOOLS");
      expect(server.env).not.toHaveProperty("ENABLE_ORDER_TOOLS");
    }
  });

  it("keeps package-based MCP examples scoped to local tarball or future npm validation", () => {
    const packageExamplePaths = [
      "examples/claude-desktop.package.example.json",
      "examples/cursor.package.example.json"
    ];

    for (const path of packageExamplePaths) {
      const serialized = readFileSync(path, "utf8");
      const parsed = JSON.parse(serialized) as {
        mcpServers: Record<string, { command: string; args: string[]; env: Record<string, string> }>;
      };
      const server = parsed.mcpServers["korea-market-data"];

      expect(server.command).toBe("npx");
      expect(server.args).toEqual(["korea-market-data-mcp"]);
      expect(server.env.MARKET_DATA_PROVIDER).toBe("mock");
      expect(server.env.KIWOOM_ENABLE_REAL_API_CALLS).toBe("false");
      expect(server.env.KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH).toBe("false");
      expect(serialized).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
      expect(serialized).not.toMatch(/access_token/i);
      expect(server.env).not.toHaveProperty("KIWOOM_ACCOUNT_NO");
      expect(server.env).not.toHaveProperty("ENABLE_TRADING_TOOLS");
      expect(server.env).not.toHaveProperty("ENABLE_ACCOUNT_TOOLS");
      expect(server.env).not.toHaveProperty("ENABLE_ORDER_TOOLS");
    }

    const examplesReadme = readFileSync("examples/README.md", "utf8");
    expect(examplesReadme).toContain("official npm alpha package validation");
    expect(examplesReadme).toContain("npm install korea-market-data-mcp@alpha");
    expect(examplesReadme).toContain("npx -y korea-market-data-mcp@alpha");
  });

  it("documents v0.33 Claude Desktop real data verification without runtime expansion", () => {
    const docs = [
      "README.md",
      "CHANGELOG.md",
      "docs/getting-started/claude-desktop-setup.md",
      "docs/providers/provider-status.md",
      "docs/verification/claude-desktop-real-data-verification.md",
      "docs/release/v0.33.0-alpha-checklist.md",
      "examples/README.md"
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    const npmAlphaConfig = JSON.parse(readFileSync("examples/claude-desktop.npm-alpha.config.json", "utf8")) as {
      mcpServers: Record<string, { command: string; args: string[]; env: Record<string, string> }>;
    };
    const localDevConfig = JSON.parse(readFileSync("examples/claude-desktop.local-dev.config.json", "utf8")) as {
      mcpServers: Record<string, { command: string; args: string[]; env: Record<string, string> }>;
    };
    const npmServer = npmAlphaConfig.mcpServers["korea-market-data"];
    const localServer = localDevConfig.mcpServers["korea-market-data"];

    expect(docs).toContain("v0.33.0-alpha");
    expect(docs).toContain("Claude Desktop Real Data Verification");
    expect(docs).toContain("korea-market-data-mcp@alpha");
    expect(docs).toContain("resolve_korean_market_query");
    expect(docs).toContain("get_korean_market_data_context");
    expect(docs).toContain("search_korean_symbol");
    expect(docs).toContain("get_stock_quote");
    expect(docs).toContain("get_etf_quote");
    expect(docs).toContain("get_market_index");
    expect(docs).toContain("get_daily_chart");
    expect(docs).toContain("get_kiwoom_stock_quote");
    expect(docs).toContain("npm run kiwoom:setup:check");
    expect(docs).toContain("failed or blocked Kiwoom context lookup does not fall back to mock data");
    expect(docs).toContain("failed real-provider context does not fall back to mock data");
    expect(docs).toContain("blocked/provider_error");
    expect(docs).toContain("No account access.");
    expect(docs).toContain("No orders.");
    expect(docs).toContain("No balance lookup.");
    expect(docs).toContain("No holdings lookup.");
    expect(docs).toContain("No trading.");
    expect(docs).toContain("No auto-trading.");
    expect(docs).toContain("No investment recommendations.");
    expect(docs).toContain("No centralized data redistribution proxy.");

    expect(npmServer.command).toBe("npx");
    expect(npmServer.args).toEqual(["-y", "korea-market-data-mcp@alpha"]);
    expect(npmServer.env.KIWOOM_ENABLE_REAL_API_CALLS).toBe("false");
    expect(npmServer.env.KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH).toBe("false");

    expect(localServer.env.KIWOOM_APP_KEY).toBe("YOUR_KIWOOM_APP_KEY");
    expect(localServer.env.KIWOOM_SECRET_KEY).toBe("YOUR_KIWOOM_SECRET_KEY");
    expect(localServer.env.KIWOOM_ENABLE_REAL_API_CALLS).toBe("false");
    expect(localServer.env.KIWOOM_ENABLE_PUBLIC_QUOTE_REAL_PATH).toBe("false");
    expect(JSON.stringify(localDevConfig)).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/);
    expect(JSON.stringify(localDevConfig)).not.toMatch(/access_token/i);
    expect(localServer.env).not.toHaveProperty("KIWOOM_ACCOUNT_NO");
    expect(localServer.env).not.toHaveProperty("ENABLE_TRADING_TOOLS");
    expect(localServer.env).not.toHaveProperty("ENABLE_ACCOUNT_TOOLS");
    expect(localServer.env).not.toHaveProperty("ENABLE_ORDER_TOOLS");
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
    expect(decisionRecord).toContain("approved_for_local_only / pending / rejected");
    expect(decisionRecord).toContain("Final Decision");
    expect(activationChecklist).toContain("enabled remains false unless decision record approves otherwise");
    expect(activationChecklist).toContain("exposesPublicTool remains false unless decision record approves otherwise");
    expect(endpointMappingDoc).toContain("Changing `enabled:true` or `exposesPublicTool:true` is forbidden unless an activation decision record explicitly approves it");
    expect(providerCompliance).toContain("Real Quote Endpoint Activation Gate");
  });

  it("documents local opt-in activation path without changing endpoint defaults", () => {
    const readme = readFileSync("README.md", "utf8");
    const providerStatus = readFileSync("docs/providers/provider-status.md", "utf8");
    const localVerification = readFileSync("docs/providers/kiwoom-public-quote-local-verification.md", "utf8");
    const decisionRecord = readFileSync("docs/providers/templates/kiwoom-real-quote-activation-decision-record.md", "utf8");
    const releaseChecklist = readFileSync("docs/release/v0.21.0-alpha-checklist.md", "utf8");
    const readinessChecklist = readFileSync("docs/release/public-quote-tool-readiness-checklist.md", "utf8");

    expect(readme).toContain("v0.21.0-alpha");
    expect(readme).toContain("`KIWOOM_ENABLE_REAL_API_CALLS=true` alone is insufficient");
    expect(readme).toContain("endpoint `enabled` and `exposesPublicTool` defaults remain false");
    expect(providerStatus).toContain("Kiwoom Real Quote Local Opt-in Activation");
    expect(providerStatus).toContain("approved_for_local_only");
    expect(localVerification).toContain("## Local Opt-In Activation Gate");
    expect(localVerification).toContain("activation decision record decision=approved_for_local_only");
    expect(decisionRecord).toContain("approved_for_local_only / pending / rejected");
    expect(decisionRecord).toContain("This decision record is only a local/test verification gate.");
    expect(releaseChecklist).toContain("KIWOOM_ENABLE_REAL_API_CALLS=true alone remains blocked");
    expect(releaseChecklist).toContain("approved_for_local_only decision record allows only local/test simulation path");
    expect(readinessChecklist).toContain("## v0.21 Real Quote Local Opt-in Activation");
  });

  it("documents final hardening blocked reason codes and manual output shape", () => {
    const readme = readFileSync("README.md", "utf8");
    const localVerification = readFileSync("docs/providers/kiwoom-public-quote-local-verification.md", "utf8");
    const manualQuoteDoc = readFileSync("docs/providers/kiwoom-manual-quote-test.md", "utf8");
    const providerStatus = readFileSync("docs/providers/provider-status.md", "utf8");
    const releaseChecklist = readFileSync("docs/release/v0.22.0-alpha-checklist.md", "utf8");
    const blockedExample = readFileSync("examples/get-kiwoom-stock-quote.blocked-response.json", "utf8");

    expect(readme).toContain("v0.22.0-alpha");
    expect(readme).toContain("blocked responses include a safe reason_code");
    expect(providerStatus).toContain("Kiwoom Real Quote Local Activation Final Hardening");
    expect(localVerification).toContain("## v0.22 Final Hardening");
    expect(manualQuoteDoc).toContain("Common blocked reason codes");
    expect(manualQuoteDoc).toContain("\"feature\": \"public_quote_real_path\"");
    expect(blockedExample).toContain("\"reason_code\"");

    for (const code of standardBlockedReasonCodes) {
      expect(releaseChecklist).toContain(code);
    }
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
      "resolve_korean_market_query",
      "get_korean_market_data_context",
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
