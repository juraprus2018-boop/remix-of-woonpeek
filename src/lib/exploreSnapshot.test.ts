import { describe, expect, it } from "vitest";
import { decodeExploreSnapshot } from "./exploreSnapshot";

describe("explore snapshot", () => {
  it("preserves public marker coordinates, provider priority and canonical address", () => {
    const [p] = decodeExploreSnapshot([["id", "Woning", 764, "huur", null, "Heiloo", "Vossenakkers", "1", "legacy", "vossenakkers-1852gk", "photo.webp", 52.6, 4.7, 2, 65, "Huurzone", 0, "2026-10-21"]]);
    expect(p.latitude).toBe(52.6);
    expect(p.longitude).toBe(4.7);
    expect(p.provider_priority).toBe(0);
    expect(p.address_slug).toBe("vossenakkers-1852gk");
    expect(p.images).toEqual(["photo.webp"]);
    expect(p.property_type).toBeNull();
  });
  it("rejects malformed snapshots instead of silently hiding results", () => {
    expect(() => decodeExploreSnapshot({})).toThrow();
    expect(() => decodeExploreSnapshot([["id"]])).toThrow();
    expect(decodeExploreSnapshot([])).toEqual([]);
  });
});