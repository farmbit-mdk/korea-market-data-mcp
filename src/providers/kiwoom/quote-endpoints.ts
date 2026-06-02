import type { KiwoomQuoteEndpointMapping } from "./types.js";

export const kiwoomQuoteEndpointMappings = {
  quote: {
    enabled: false,
    manualOnly: true,
    readOnly: true,
    method: "POST",
    path: "TODO_VERIFY_OFFICIAL_KIWOOM_QUOTE_ENDPOINT",
    apiId: "ka10001",
    description: "Stock basic information request. Disabled until endpoint path/header/body are verified against official Kiwoom documentation.",
    verified: false
  }
} as const satisfies Record<string, KiwoomQuoteEndpointMapping>;

export type KiwoomQuoteEndpointKey = keyof typeof kiwoomQuoteEndpointMappings;
