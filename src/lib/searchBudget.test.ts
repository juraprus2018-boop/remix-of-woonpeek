import { describe, expect, it } from "vitest";
import { readSearchBudget, writeSearchBudget } from "./searchBudget";

describe("search budget handoff", () => {
  it("retains the homepage minimum price", () => {
    expect(readSearchBudget(writeSearchBudget(new URLSearchParams(), { minPrice: 750 })).minPrice).toBe(750);
  });
  it("retains the homepage maximum price", () => {
    expect(readSearchBudget(writeSearchBudget(new URLSearchParams(), { maxPrice: 1000 })).maxPrice).toBe(1000);
  });
  it("accepts old homepage and shared budget links", () => {
    for (const query of ["min=750&max=1000", "minPrijs=750&maxPrijs=1000", "min_prijs=750&max_prijs=1000"]) {
      expect(readSearchBudget(new URLSearchParams(query))).toEqual({ minPrice: 750, maxPrice: 1000 });
    }
  });
  it("rejects invalid budgets instead of passing NaN to listing queries", () => {
    expect(readSearchBudget(new URLSearchParams("min=-100&max=Infinity"))).toEqual({ minPrice: undefined, maxPrice: undefined });
  });
  it("normalizes legacy keys without losing the city", () => {
    expect(writeSearchBudget(new URLSearchParams("locatie=Den+Haag&max=2000"), { minPrice: 750, maxPrice: 1000 }).toString()).toBe("locatie=Den+Haag&min_prijs=750&max_prijs=1000");
  });
});