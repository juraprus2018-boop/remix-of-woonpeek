import { describe, expect, it } from "vitest";
import { buildSrcSet } from "./imageOptimization";

describe("buildSrcSet", () => {
  it("geeft geen srcset voor afbeeldingen die niet echt verkleind worden", () => {
    expect(buildSrcSet("https://example.com/foto.jpg", [320, 480, 640], 400)).toBe("");
  });
  it("geeft echte breedtes voor opslagafbeeldingen", () => {
    const s = buildSrcSet("https://kppotnzwhxkflceiscto.supabase.co/storage/v1/object/public/property-images/a.jpg", [320, 640], 200);
    expect(s).toContain("width=320");
    expect(s).toContain("640w");
  });
});
