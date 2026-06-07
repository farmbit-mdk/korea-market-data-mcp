import { fileURLToPath } from "node:url";
import { checkKiwoomSetup } from "../src/providers/kiwoom/setup-check.js";

function isCliEntryPoint(): boolean {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isCliEntryPoint()) {
  process.stdout.write(`${JSON.stringify(checkKiwoomSetup(process.env), null, 2)}\n`);
}
