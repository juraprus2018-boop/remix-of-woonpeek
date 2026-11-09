import { describe, expect, it } from "vitest";
import { propertyFacts } from "./propertyFacts";

const base = { street: "Teststraat, 1234AB, Utrecht", house_number: "-", city: "Utrecht", property_type: "appartement", listing_type: "huur", price: 1000, status: "actief" };
describe("verified property facts", () => {
  it("never invents an immediate start date for active listings", () => {
    expect(propertyFacts(base).availability).toBe("Startdatum niet opgegeven");
  });
  it("keeps inactive listings unavailable even with a start date", () => {
    expect(propertyFacts({ ...base, status: "inactief", available_from: "2026-11-10" }).availability).toBe("Niet meer beschikbaar");
  });
  it("cleans feed placeholders without losing the real address", () => {
    expect(propertyFacts(base).address).toBe("Teststraat");
    expect(propertyFacts({ ...base, house_number: "22A" }).address).toBe("Teststraat 22A");
  });
});