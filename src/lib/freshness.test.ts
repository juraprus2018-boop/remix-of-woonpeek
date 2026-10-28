import { describe, it, expect } from "vitest";
import { freshnessLabel } from "./freshness";

const now = new Date("2026-10-28T21:00:00Z");

describe("freshnessLabel", () => {
  it("today is urgent", () => {
    const r = freshnessLabel("2026-10-28T08:00:00Z", now);
    expect(r.urgent).toBe(true);
    expect(r.label).toContain("Vandaag");
  });
  it("yesterday", () => expect(freshnessLabel("2026-10-27T10:00:00Z", now).label).toBe("Gisteren online gekomen"));
  it("day before yesterday", () => expect(freshnessLabel("2026-10-26T10:00:00Z", now).label).toBe("Eergisteren gepubliceerd"));
  it("5 days", () => expect(freshnessLabel("2026-10-23T10:00:00Z", now).label).toBe("5 dagen geleden"));
});
