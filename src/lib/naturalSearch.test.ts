import { describe, expect, it } from "vitest";
import { parseNaturalSearch } from "./naturalSearch";

const cities = ["Utrecht", "Amsterdam", "Den Haag"];

describe("natural language search", () => {
  it("reads type, city, budget and rooms", () => {
    const r = parseNaturalSearch("appartement in Utrecht onder 1.200 met 2 kamers", cities);
    expect(r).toMatchObject({ propertyType: "appartement", city: "Utrecht", maxPrice: 1200, minBedrooms: 2, structured: true });
  });
  it("treats a plain city name as a place only", () => {
    expect(parseNaturalSearch("amsterdam", cities)).toMatchObject({ city: "Amsterdam", structured: false });
  });
  it("does not invent a city", () => {
    expect(parseNaturalSearch("huis te koop tussen 300000 en 400000", cities)).toMatchObject({ listingType: "koop", minPrice: 300000, maxPrice: 400000 });
    expect(parseNaturalSearch("huis te koop tussen 300000 en 400000", cities).city).toBeUndefined();
  });
});
