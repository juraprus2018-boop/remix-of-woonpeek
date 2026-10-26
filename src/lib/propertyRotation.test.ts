import { describe, it, expect } from "vitest";
import { rotateProperties } from "./propertyRotation";
import { pickRandomBanner } from "./bannerRotation";

describe("provider rotation", () => {
  const rows = ["Huurzone.nl", "RentHunter", "Huurwoningen.nl", "Huurzone.nl", "Renthunter.nl", "Huurwoningen.nl"].map((source_site, i) => ({ id: String(i), source_site, price: i + 100 }));
  it("repeats Huurzone, Huurwoningen, RentHunter in that order", () => {
    expect(rotateProperties(rows).map(r => r.source_site)).toEqual(["Huurzone.nl", "Huurwoningen.nl", "RentHunter", "Huurzone.nl", "Huurwoningen.nl", "Renthunter.nl"]);
  });
  it("skips exhausted providers without losing listings", () => {
    expect(rotateProperties(rows.slice(0, 4)).map(r => r.source_site)).toEqual(["Huurzone.nl", "Huurwoningen.nl", "RentHunter", "Huurzone.nl"]);
  });
  it("places other providers after the named three each round", () => {
    expect(rotateProperties([...rows, { id: "other", source_site: "Kamernet", price: 99 }]).slice(0, 4).map(r => r.source_site)).toEqual(["Huurzone.nl", "Huurwoningen.nl", "RentHunter", "Kamernet"]);
  });
});
describe("banners", () => {
  const banners = [{ advertiser_name: "Huurwoningen.nl" }, { advertiser_name: "Huurzone.nl" }, { advertiser_name: "Other" }];
  it("shows Huurzone in 70% of picks", () => {
    expect(pickRandomBanner(banners, () => 0.69)?.advertiser_name).toBe("Huurzone.nl");
  });
  it("shows other partners in the remaining 30%", () => {
    const seq = [0.8, 0, 0];
    expect(pickRandomBanner(banners, () => seq.shift()!)?.advertiser_name).toBe("Huurwoningen.nl");
  });
  it("returns no banner when none are available", () => expect(pickRandomBanner([])).toBeNull());
});
