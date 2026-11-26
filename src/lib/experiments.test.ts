import { describe, expect, it } from "vitest";
import { assignVariant } from "./experiments";

const exp = { key: "t", variants: ["control", "b"], active: true };

describe("experimenten", () => {
  it("geeft dezelfde bezoeker altijd dezelfde variant", () => {
    expect(assignVariant(exp, "abc")).toBe(assignVariant(exp, "abc"));
  });
  it("inactief experiment geeft altijd controle", () => {
    expect(assignVariant({ ...exp, active: false }, "abc")).toBe("control");
  });
  it("verdeelt bezoekers over beide varianten", () => {
    const seen = new Set(Array.from({ length: 200 }, (_, i) => assignVariant(exp, `v${i}`)));
    expect(seen).toEqual(new Set(["control", "b"]));
  });
});
