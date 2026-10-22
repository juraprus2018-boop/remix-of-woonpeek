import { describe, it, expect } from "vitest";
import { mapRenthunter, rentalIdentity } from "../../supabase/functions/renthunter-import/mapping";
import { normalizeAffiliateUrl } from "./affiliateUrl";
import { normalizeAffiliateUrl as serverNormalize } from "../../supabase/functions/_shared/affiliateUrl";

const row = { id: "abc123", link: "https://renthunter.nl/nl/huren/abc123", titel: "Appartement in Amsterdam - 130 m²", plaats: "Amsterdam", woningtype: "Appartement", huurprijs: "1800", woonoppervlakte_m2: "130", omschrijving: "Nederlandse omschrijving" };
describe("Direct Renthunter feed", () => {
  it("maps an Amsterdam apartment to the requested Dutch title", () => {
    const property = mapRenthunter(row, "2026-10-21T20:00:00Z");
    expect(property.title).toBe("Appartement te huur in Amsterdam");
    expect(property.property_type).toBe("appartement");
    expect(property.description).toBe("Nederlandse omschrijving");
    expect(property.status).toBe("actief");
  });
  it("adds the referral without losing the listing", () => {
    expect(mapRenthunter(row, "2026-10-21T20:00:00Z").source_url).toBe("https://renthunter.nl/nl/huren/abc123?via=woonaanbod");
  });
  it.each([normalizeAffiliateUrl, serverNormalize])("normalizes all direct links and preserves other parameters", (normalize) => {
    expect(normalize("https://renthunter.nl?via=old")).toBe("https://renthunter.nl/?via=woonaanbod");
    expect(normalize("https://renthunter.nl/rental/abc123?foo=1")).toBe("https://renthunter.nl/rental/abc123?foo=1&via=woonaanbod");
    expect(normalize("https://example.com?via=other")).toBe("https://example.com/?via=other");
  });
  it("matches old English and Daisycon links to the same listing", () => {
    expect(rentalIdentity("https://glp8.net/c/?dl=rental%2Fabc123&wi=418821")).toBe("abc123");
    expect(rentalIdentity("https://renthunter.nl/rental/abc123?via=woonaanbod")).toBe("abc123");
  });
  it("labels anti-squat as Antikraakwoning", () => {
    expect(mapRenthunter({ ...row, woningtype: "Antikraak" }, "x").title).toBe("Antikraakwoning te huur in Amsterdam");
  });
});