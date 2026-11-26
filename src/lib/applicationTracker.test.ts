import { describe, expect, it } from "vitest";
import { viewingIcs } from "./applicationTracker";

describe("viewing calendar export", () => {
  it("creates a one hour event at the chosen time", () => {
    const ics = viewingIcs({ id: "a1", title: "Leeghwater, Amersfoort", start: new Date("2026-12-01T14:00:00Z") });
    expect(ics).toContain("DTSTART:20261201T140000Z");
    expect(ics).toContain("DTEND:20261201T150000Z");
    expect(ics).toContain("SUMMARY:Bezichtiging: Leeghwater\\, Amersfoort");
  });
});
