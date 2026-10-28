import { describe, it, expect } from "vitest";
import { rotateProperties } from "./propertyRotation";
import { pickRandomBanner } from "./bannerRotation";

describe("provider rotation", () => {
  const rows = ["Huurzone.nl", "RentHunter", "Huurwoningen.nl", "Huurzone.nl", "Renthunter.nl", "Huurwoningen.nl"].map((source_site, i) => ({ id: String(i), source_site, price: i + 100 }));
  it("alternates Huurzone and Huurwoningen before any other source", () => {
    expect(rotateProperties(rows).map(r => r.source_site)).toEqual(["Huurzone.nl", "Huurwoningen.nl", "Huurzone.nl", "Huurwoningen.nl", "RentHunter", "Renthunter.nl"]);
  });
  it("puts crawler listings last", () => {
    const out = rotateProperties([{ id: "c", source_site: "Kamernet", price: 1 }, ...rows]).map(r => r.source_site);
    expect(out.slice(0, 4)).toEqual(["Huurzone.nl", "Huurwoningen.nl", "Huurzone.nl", "Huurwoningen.nl"]);
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
