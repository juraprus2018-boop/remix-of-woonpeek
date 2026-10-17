import { describe, expect, it } from "vitest";
import { calculateCityRentalStats, median, type RentalObservation } from "./cityRentalStats";

const now = Date.parse("2026-10-17T12:00:00Z");
const row = (id: string, price: number, extra: Partial<RentalObservation> = {}): RentalObservation => ({
  id, price, city: "Amsterdam", status: "actief", listing_type: "huur", property_type: "appartement",
  surface_area: 50, neighborhood: "Centrum", created_at: "2026-10-16T12:00:00Z", ...extra,
});

describe("actuele huurdata per stad", () => {
  it("telt alleen actieve huuradvertenties in de exacte stad en unieke ids", () => {
    const stats = calculateCityRentalStats([row("a", 1000), row("a", 1000), row("b", 300000, { listing_type: "koop" }), row("c", 900, { status: "inactief" }), row("d", 800, { city: "Amsterdam-Zuidoost" })], "Amsterdam", now);
    expect(stats.total).toBe(1);
    expect(stats.medianPrice).toBe(1000);
  });
  it("berekent de mediaan voor een even en oneven steekproef", () => {
    expect(median([1000, 2000])).toBe(1500);
    expect(median([2000, 900, 1000])).toBe(1000);
    expect(median([])).toBeNull();
  });
  it("telt huur tot en met de budgetgrens zonder onbekende prijzen", () => {
    const stats = calculateCityRentalStats([row("a", 1000), row("b", 1500), row("c", 1501), row("d", 0)], "Amsterdam", now);
    expect(stats.budgets).toEqual([{ max: 1000, count: 1 }, { max: 1500, count: 2 }, { max: 2000, count: 3 }]);
    expect(stats.priceSample).toBe(3);
  });
  it("berekent m² alleen bij bekende positieve oppervlakte", () => {
    const stats = calculateCityRentalStats([row("a", 1000), row("b", 1500, { surface_area: null }), row("c", 900, { surface_area: 0 })], "Amsterdam", now);
    expect(stats.medianPerM2).toBe(20);
    expect(stats.areaSample).toBe(1);
  });
  it("telt nieuw aanbod in zeven dagen, geen toekomstige of oude advertenties", () => {
    const stats = calculateCityRentalStats([row("a", 1000), row("b", 900, { created_at: "2026-10-01T12:00:00Z" }), row("c", 800, { created_at: "2026-10-18T12:00:00Z" })], "Amsterdam", now);
    expect(stats.new7d).toBe(1);
  });
});