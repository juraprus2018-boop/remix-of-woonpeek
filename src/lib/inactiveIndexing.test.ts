import { describe, it, expect } from "vitest";
import { isLongInactive } from "./inactiveIndexing";

const now = new Date("2026-11-01T12:00:00Z");
describe("isLongInactive", () => {
  it("houdt actieve woningen indexeerbaar", () => expect(isLongInactive("actief", "2025-01-01", now)).toBe(false));
  it("houdt recent verlopen woningen (30 dagen) indexeerbaar", () => expect(isLongInactive("inactief", "2026-10-02T12:00:00Z", now)).toBe(false));
  it("zet woningen die langer dan 60 dagen inactief zijn op noindex", () => expect(isLongInactive("inactief", "2026-08-31T12:00:00Z", now)).toBe(true));
});
