import { describe, expect, it } from "vitest";
import { facebookPropertyUrl } from "../../supabase/functions/_shared/facebookPropertyUrl";

describe("Facebook listing destination", () => {
  it("links to Woonaanbod NL even when the listing has an affiliate URL", () => {
    expect(facebookPropertyUrl({
      id: "listing-1", city: "Heiloo", listing_type: "huur",
      address_slug: "vossenakkers-1852gk", source_url: "https://partner.example/affiliate/123",
    })).toBe("https://www.woonaanbod-nl.nl/huurwoning/heiloo/vossenakkers-1852gk");
  });

  it("keeps a usable own-site destination without an affiliate URL", () => {
    expect(facebookPropertyUrl({ id: "listing-2", city: "Utrecht", listing_type: "koop" }))
      .toBe("https://www.woonaanbod-nl.nl/koopwoning/utrecht/listing-2");
  });
});