import { describe, expect, it } from "vitest";
import { pickScopedProperty, scopeFromPath } from "./propertyLookup";

const a = { id: "utrecht-koop", city: "Utrecht", listing_type: "koop" };
const b = { id: "utrecht-huur", city: "Utrecht", listing_type: "huur" };
const c = { id: "leiden-huur", city: "Leiden", listing_type: "huur" };

describe("pickScopedProperty", () => {
  it("kiest de woning in de stad uit de URL", () => {
    expect(pickScopedProperty([c, b], { city: "utrecht" })?.id).toBe("utrecht-huur");
  });
  it("geeft niets als het adres niet in die stad bestaat", () => {
    expect(pickScopedProperty([c], { city: "utrecht", listingType: "huur" })).toBeNull();
  });
  it("geeft voorrang aan het woningtype uit de URL", () => {
    expect(pickScopedProperty([a, b], { city: "utrecht", listingType: "huur" })?.id).toBe("utrecht-huur");
  });
  it("valt terug op de nieuwste in de stad bij ander type", () => {
    expect(pickScopedProperty([a], { city: "utrecht", listingType: "huur" })?.id).toBe("utrecht-koop");
  });
  it("voegt Den Haag en 's-Gravenhage samen", () => {
    expect(pickScopedProperty([{ id: "dh", city: "'s-Gravenhage", listing_type: "huur" }], { city: "den-haag" })?.id).toBe("dh");
  });
  it("leest type uit het pad", () => {
    expect(scopeFromPath("/en/koopwoning/utrecht/x", "utrecht")).toEqual({ city: "utrecht", listingType: "koop" });
  });
});
