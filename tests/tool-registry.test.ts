import { describe, expect, it } from "vitest";
import { allowedToolNames, forbiddenToolNames, validateRegisteredTools } from "../src/safety/read-only-tools.js";
import { getRegisteredToolNames } from "../src/tools/index.js";

describe("tool registry", () => {
  it("registers exactly the allowed read-only tools including the guarded Kiwoom quote skeleton", () => {
    const registeredToolNames = getRegisteredToolNames();

    expect(registeredToolNames).toEqual([...allowedToolNames]);
    expect(() => validateRegisteredTools(registeredToolNames)).not.toThrow();
  });

  it("does not register forbidden trading, account, or recommendation tools", () => {
    const registeredToolNames = getRegisteredToolNames();

    for (const forbiddenToolName of forbiddenToolNames) {
      expect(registeredToolNames).not.toContain(forbiddenToolName);
    }
  });

  it("fails validation if a forbidden tool is added later", () => {
    expect(() => validateRegisteredTools([...allowedToolNames, "place_order"])).toThrow(/Forbidden tools registered/);
  });
});
