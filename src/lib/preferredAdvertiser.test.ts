import { describe, expect, it } from "vitest";
import { isPreferredAdvertiser, pickPreferredBanner } from "./preferredAdvertiser";

describe("Huurwoningen.nl preference", () => {
  it("selects only Huurwoningen.nl banners even when other advertisers are available", () => {
    const banners = [
      { id: "other", advertiser_name: "Huurzone.nl" },
      { id: "first", advertiser_name: "Huurwoningen.nl" },
      { id: "second", advertiser_name: "Huurwoningen.nl" },
    ];
    expect(pickPreferredBanner(banners, () => 0)?.id).toBe("first");
    expect(pickPreferredBanner(banners, () => 0.99)?.id).toBe("second");
  });
  it("never falls back to another advertiser", () => {
    expect(pickPreferredBanner([{ advertiser_name: "Huurzone.nl" }])).toBeNull();
  });
  it("matches only the selected provider, case-insensitively", () => {
    expect(isPreferredAdvertiser("Huurwoningen.nl")).toBe(true);
    expect(isPreferredAdvertiser("HUURWONINGEN")).toBe(true);
    expect(isPreferredAdvertiser("Huurzone.nl")).toBe(false);
    expect(isPreferredAdvertiser("Huurwoningen.nl.example.com")).toBe(false);
  });
});