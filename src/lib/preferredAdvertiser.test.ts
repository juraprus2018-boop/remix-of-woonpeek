import { describe, expect, it } from "vitest";
import { isPreferredAdvertiser, pickPreferredBanner } from "./preferredAdvertiser";

describe("Huurzone.nl preference", () => {
  it("selects only Huurzone.nl banners even when other advertisers are available", () => {
    const banners = [
      { id: "other", advertiser_name: "Huurwoningen.nl" },
      { id: "first", advertiser_name: "Huurzone.nl" },
      { id: "second", advertiser_name: "Huurzone.nl" },
    ];
    expect(pickPreferredBanner(banners, () => 0)?.id).toBe("first");
    expect(pickPreferredBanner(banners, () => 0.99)?.id).toBe("second");
  });
  it("never falls back to another advertiser", () => {
    expect(pickPreferredBanner([{ advertiser_name: "Huurwoningen.nl" }])).toBeNull();
  });
  it("matches only Huurzone, case-insensitively", () => {
    expect(isPreferredAdvertiser("HUURZONE")).toBe(true);
    expect(isPreferredAdvertiser("Huurwoningen.nl")).toBe(false);
  });
});
