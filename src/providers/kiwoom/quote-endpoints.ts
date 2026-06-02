import type { KiwoomQuoteEndpointMapping } from "./types.js";

export const kiwoomQuoteEndpointMappings = {
  quote: {
    enabled: false,
    method: "POST",
    path: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_ENDPOINT",
    apiId: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_API_ID",
    description: "Read-only stock quote endpoint mapping placeholder. Disabled until official Kiwoom documentation is verified.",
    verified: false
  }
} as const satisfies Record<string, KiwoomQuoteEndpointMapping>;

export type KiwoomQuoteEndpointKey = keyof typeof kiwoomQuoteEndpointMappings;
