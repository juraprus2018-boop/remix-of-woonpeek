import { describe, it, expect } from "vitest";
import { rotateProperties } from "./propertyRotation";
import { pickRandomBanner } from "./bannerRotation";

describe("provider rotation", () => {
  const rows = ["Huurzone.nl", "RentHunter", "Huurwoningen.nl", "Huurzone.nl", "Renthunter.nl", "Huurwoningen.nl"].map((source_site, i) => ({ id: String(i), source_site, price: i + 100 }));
  it("repeats Huurwoningen, Huurzone, RentHunter in that order", () => {
    expect(rotateProperties(rows).map(r => r.source_site)).toEqual(["Huurwoningen.nl", "Huurzone.nl", "RentHunter", "Huurwoningen.nl", "Huurzone.nl", "Renthunter.nl"]);
  });
  it("skips exhausted providers without losing listings", () => {
    expect(rotateProperties(rows.slice(0, 4)).map(r => r.source_site)).toEqual(["Huurwoningen.nl", "Huurzone.nl", "RentHunter", "Huurzone.nl"]);
  });
  it("keeps chosen prices ordered inside each provider", () => {
    expect(rotateProperties(rows, "price_desc").map(r => r.price)).toEqual([105, 103, 104, 102, 100, 101]);
  });
  it("places other providers after the named three each round", () => {
    expect(rotateProperties([...rows, { id: "other", source_site: "Kamernet", price: 99 }]).slice(0, 4).map(r => r.source_site)).toEqual(["Huurwoningen.nl", "Huurzone.nl", "RentHunter", "Kamernet"]);
  });
});
describe("random banners", () => {
  const banners = [{ advertiser_name: "Huurwoningen.nl" }, { advertiser_name: "Huurzone.nl" }, { advertiser_name: "Other" }];
  it("can choose any active partner, not just the preferred one", () => {
    expect(pickRandomBanner(banners, () => 0)?.advertiser_name).toBe("Huurwoningen.nl");
    expect(pickRandomBanner(banners, () => 0.5)?.advertiser_name).toBe("Huurzone.nl");
    expect(pickRandomBanner(banners, () => 0.99)?.advertiser_name).toBe("Other");
  });
  it("returns no banner when none are available", () => expect(pickRandomBanner([])).toBeNull());
});