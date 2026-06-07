import { z } from "zod";
import { checkKiwoomSetup } from "../providers/kiwoom/setup-check.js";
import type { ToolDefinition } from "./types.js";

export const getKiwoomSetupStatusTool: ToolDefinition = {
  name: "get_kiwoom_setup_status",
  description: "Return local Kiwoom quote verification setup status without requesting a token or quote.",
  inputSchema: {
    provider: z.literal("kiwoom").optional()
  },
  async handler() {
    return checkKiwoomSetup();
  }
};
