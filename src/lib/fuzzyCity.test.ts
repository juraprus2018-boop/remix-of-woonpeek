import { describe, it, expect } from "vitest";
import { matchCity, suggestCities } from "./fuzzyCity";
const cities = ["Zoeterwoude", "Zoetermeer", "Leiden", "Amsterdam", "'s-Gravenhage"];
describe("fuzzyCity", () => {
  it("corrigeert typfout zouterwoude", () => expect(matchCity("zouterwoude", cities)).toBe("Zoeterwoude"));
  it("exacte naam", () => expect(matchCity("leiden", cities)).toBe("Leiden"));
  it("onzin geeft null", () => expect(matchCity("xyzxyzxyz", cities)).toBeNull());
  it("suggereert bij typfout", () => expect(suggestCities("zouter", cities)).toContain("Zoeterwoude"));
});
