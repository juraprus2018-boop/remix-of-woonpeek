import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, parseSearchFilters, serializeSearchFilters, validateSearchFilters } from "./searchFilters";
describe("zoekfilters", () => {
  it("behoudt alle filters bij serialisatie", () => {
    const filters = { ...EMPTY_FILTERS, city: "Amsterdam", listingType: "huur" as const, propertyType: "studio" as const, minPrice: 500, maxPrice: 1000, minBedrooms: 2, minSurface: 25, grossIncome: 3500, includeInactive: true };
    expect(parseSearchFilters(serializeSearchFilters(filters))).toEqual(filters);
  });
  it("ondersteunt oude homepageparameters en canonicaliseert deze", () => {
    const filters = parseSearchFilters(new URLSearchParams("locatie=Amsterdam&min=500&max=1000"));
    expect(filters.maxPrice).toBe(1000);
    expect(serializeSearchFilters(filters).get("max_prijs")).toBe("1000");
    expect(filters.minPrice).toBe(500);
  });
  it("negeert ongeldige getallen en types", () => {
    const filters = parseSearchFilters(new URLSearchParams("max_prijs=NaN&min=-1&inkomen=Infinity&type=onbekend&aanbod=anders"));
    expect(filters.maxPrice).toBeUndefined(); expect(filters.minPrice).toBeUndefined(); expect(filters.grossIncome).toBeUndefined();
    expect(filters.propertyType).toBe(""); expect(filters.listingType).toBe("");
  });
  it("waarschuwt bij minimum boven maximum", () => {
    expect(validateSearchFilters({ ...EMPTY_FILTERS, minPrice: 1100, maxPrice: 1000 })).toBeTruthy();
    expect(validateSearchFilters({ ...EMPTY_FILTERS, minPrice: 1000, maxPrice: 1000 })).toBeNull();
    expect(validateSearchFilters({ ...EMPTY_FILTERS, minPrice: 1100, grossIncome: 3000 })).toBeTruthy();
    expect(validateSearchFilters(EMPTY_FILTERS)).toBeNull();
  });
  it("behoudt nul en ruimt witruimte op", () => {
    const filters = parseSearchFilters(new URLSearchParams("locatie=%20Amsterdam%20&max_prijs=0"));
    expect(filters.city).toBe("Amsterdam"); expect(serializeSearchFilters(filters).get("max_prijs")).toBe("0");
  });
});
