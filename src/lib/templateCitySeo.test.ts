import { describe, expect, it } from "vitest";
import { templateCitySeo } from "./templateCitySeo";
import { isTemplateCityPath, repairSitemap, urlEntry, type SitemapRental } from "../../supabase/functions/_shared/sitemapPolicy";

const families = ["energie", "nieuwbouw", "studenten", "woz-waarde", "verhuisservice", "stadsgids", "vandaag", "markt", "cijfers", "toplijst", "stad"];
const rows: SitemapRental[] = Array.from({ length: 6 }, () => ({ city: "Eindhoven", status: "actief", listing_type: "huur", property_type: "appartement", price: 900, bedrooms: 1, postal_code: "5611AB" }));

describe("template place indexing", () => {
  for (const family of families) {
    it(`excludes /${family}/{city} including Swalmen and keeps national routes`, () => {
      const path = `/${family}/swalmen${family === "toplijst" ? "/goedkoop-huur" : ""}`;
      expect(isTemplateCityPath(path)).toBe(true);
      expect(isTemplateCityPath(`/${family}`)).toBe(false);
      expect(templateCitySeo(path, 0)).toEqual({ noindex: true, canonical: path });
      for (const kind of ["steden", "pages", "woningen"] as const) {
        const xml = repairSitemap(urlEntry(path, "2026-10-06") + urlEntry(`/${family}`, undefined), rows, [], "2026-11-02", kind);
        expect(xml).not.toContain(path);
        expect(xml).not.toContain("2026-10-06");
        if (kind !== "steden") expect(xml).toContain(`<loc>https://www.woonaanbod-nl.nl/${family}</loc>`);
      }
    });
  }
  it("uses a hub canonical from six active rentals, own URL below six and while unresolved", () => {
    expect(templateCitySeo("/stad/eindhoven", 6)).toEqual({ noindex: true, canonical: "/huurwoningen/eindhoven" });
    expect(templateCitySeo("/stad/eindhoven", 5)).toEqual({ noindex: true, canonical: "/stad/eindhoven" });
    expect(templateCitySeo("/stad/eindhoven")).toEqual({ noindex: true, canonical: "/stad/eindhoven" });
    expect(templateCitySeo("/en/energie/eindhoven", 6)).toEqual({ noindex: true, canonical: "/huurwoningen/eindhoven" });
  });
  it("preserves rental hubs, eligible filters, real data routes and property URLs", () => {
    const paths = ["/huurwoningen/eindhoven", "/huurwoningen/eindhoven/appartement", "/huurprijs-index/eindhoven", "/heatmap/eindhoven"];
    const input = paths.map(path => urlEntry(path, undefined)).join("");
    const output = repairSitemap(input, rows, ["eindhoven"], "2026-11-02", "steden");
    for (const path of paths) {
      expect(templateCitySeo(path, 6)).toBeUndefined();
      expect(output).toContain(`<loc>https://www.woonaanbod-nl.nl${path}</loc>`);
    }
    expect(repairSitemap(output, rows, ["eindhoven"], "2026-11-02", "steden")).toBe(output);
    expect(repairSitemap(urlEntry("/huurwoning/eindhoven/test", undefined), rows, [], "2026-11-02", "woningen")).toContain("/huurwoning/eindhoven/test");
  });
});