import { describe, expect, it } from "vitest";
import type { CrawlableRental } from "./searchSeoHtml";
import { createCitySitemaps, createPropertySitemaps, sitemapIndex } from "./sitemapGeneration";

const rental = (id: string, overrides: Partial<CrawlableRental> = {}): CrawlableRental => ({
  id,
  city: "Utrecht",
  status: "actief",
  listing_type: "huur",
  property_type: "appartement",
  price: 1200,
  surface_area: 60,
  neighborhood: null,
  created_at: "2026-11-01T10:00:00Z",
  title: `Woning ${id}`,
  address_slug: `straat-${id}`,
  slug: null,
  ...overrides,
});

describe("sitemap generation", () => {
  it("groups active properties by canonical city and omits non-page-specific lastmod values", () => {
    const files = createPropertySitemaps([
      rental("1", { city: "'s-Gravenhage" }),
      rental("2", { city: "Den Haag" }),
      rental("3", { city: "Amsterdam", listing_type: "koop" }),
      rental("4", { city: "Amsterdam", status: "inactief" }),
    ]);
    expect(files.map((file) => file.filename)).toEqual([
      "sitemap-woningen-amsterdam.xml",
      "sitemap-woningen-den-haag.xml",
    ]);
    expect(files[0]?.xml).toContain("https://www.woonaanbod-nl.nl/koopwoning/amsterdam/straat-3");
    expect(files[0]?.xml).not.toContain("straat-4");
    expect(files[1]?.urlCount).toBe(2);
    expect(files[1]?.xml).toContain("/huurwoning/den-haag/straat-1");
    expect(files[1]?.xml).toContain("/huurwoning/den-haag/straat-2");
    expect(files.every((file) => !file.xml.includes("<lastmod>"))).toBe(true);
  });

  it("keeps legacy city templates and undersupplied cities out of city sitemaps", () => {
    const rows = Array.from({ length: 6 }, (_, index) => rental(String(index + 1)));
    const files = createCitySitemaps(rows);
    const xml = files.map((file) => file.xml).join("\n");
    expect(xml).toContain("https://www.woonaanbod-nl.nl/huurwoningen/utrecht");
    expect(xml).not.toContain("/stad/");
    expect(xml).not.toContain("/energie/");
    expect(xml).not.toContain("/en/");
    expect(files.reduce((total, file) => total + file.urlCount, 0)).toBe(5);
  });

  it("links the property city files directly from a sitemap index", () => {
    const xml = sitemapIndex(["sitemap-woningen-amsterdam.xml", "sitemap-woningen-den-haag.xml"]);
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("https://www.woonaanbod-nl.nl/sitemap-woningen-amsterdam.xml");
    expect(xml).toContain("https://www.woonaanbod-nl.nl/sitemap-woningen-den-haag.xml");
    expect(xml).not.toContain("<lastmod>");
  });
});
