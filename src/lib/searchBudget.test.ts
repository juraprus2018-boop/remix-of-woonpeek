import { describe, expect, it } from "vitest";
import { readSearchBudget, writeSearchBudget } from "./searchBudget";

describe("search budget transfer", () => {
  it("keeps the homepage maximum of 1000", () => {
    expect(readSearchBudget(new URLSearchParams("max=1000")).maxPrice).toBe(1000);
  });
  it("keeps both boundaries after sharing and reloading", () => {
    const params = writeSearchBudget(new URLSearchParams("locatie=Amsterdam"), { minPrice: 750, maxPrice: 1000 });
    expect(params.get("locatie")).toBe("Amsterdam");
    expect(readSearchBudget(new URLSearchParams(params.toString()))).toEqual({ minPrice: 750, maxPrice: 1000 });
  });
  it.each(["min_prijs=750&max_prijs=1000", "minPrijs=750&maxPrijs=1000", "min=750&max=1000"])("supports existing links: %s", query => {
    expect(readSearchBudget(new URLSearchParams(query))).toEqual({ minPrice: 750, maxPrice: 1000 });
  });
  it("does not turn invalid or empty prices into a budget", () => {
    expect(readSearchBudget(new URLSearchParams("min=&max=NaN"))).toEqual({ minPrice: undefined, maxPrice: undefined });
  });
});