import type { KiwoomPublicQuoteActivationDecisionRecord } from "../../src/tools/get-kiwoom-stock-quote.js";

export const approvedLocalOnlyActivationDecision: KiwoomPublicQuoteActivationDecisionRecord = {
  provider: "kiwoom",
  feature: "public_quote_real_path",
  scope: "local_only",
  decision: "approved_for_local_only",
  reviewed_at: "2026-06-05",
  reviewer: "test-reviewer",
  linked_smoke_test_result: "sanitized-smoke-test-result",
  notes: "Test-only local opt-in activation decision fixture."
};

export const pendingActivationDecision: KiwoomPublicQuoteActivationDecisionRecord = {
  ...approvedLocalOnlyActivationDecision,
  decision: "pending"
};

export const rejectedActivationDecision: KiwoomPublicQuoteActivationDecisionRecord = {
  ...approvedLocalOnlyActivationDecision,
  decision: "rejected"
};

export const approvedActivationDecisionWithWrongScope: KiwoomPublicQuoteActivationDecisionRecord = {
  ...approvedLocalOnlyActivationDecision,
  scope: "public_default" as "local_only"
};

export const approvedActivationDecisionWithWrongFeature: KiwoomPublicQuoteActivationDecisionRecord = {
  ...approvedLocalOnlyActivationDecision,
  feature: "account_access" as "public_quote_real_path"
};

export const approvedActivationDecisionWithoutLinkedSmokeTest: KiwoomPublicQuoteActivationDecisionRecord = {
  ...approvedLocalOnlyActivationDecision,
  linked_smoke_test_result: ""
};
