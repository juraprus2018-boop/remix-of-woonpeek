import { describe, expect, it } from "vitest";
import { shouldNoindexRentalCity } from "./rentalCityIndexing";
import { hasRentSample, usableRentPoints } from "./rentIndexData";
import { repairSitemap, rentalSelectionCount, urlEntry, type SitemapRental } from "../../supabase/functions/_shared/sitemapPolicy";

const rows: SitemapRental[] = Array.from({ length: 6 }, (_, i) => ({ city: "Eindhoven", status: "actief", listing_type: "huur", property_type: "appartement", price: i === 5 ? 1700 : 900, bedrooms: 1, updated_at: "2026-11-01T04:00:00Z" }));

describe("rental SEO correction rules", () => {
  it("does not noindex while city query loads", () => {
    expect(shouldNoindexRentalCity(false, undefined)).toBe(false);
    expect(shouldNoindexRentalCity(false, 0)).toBe(false);
    expect(shouldNoindexRentalCity(true, 5)).toBe(true);
    expect(shouldNoindexRentalCity(true, 6)).toBe(false);
  });
  it("does not retain the reported 1743 rent at sample zero as a chart point", () => {
    expect(hasRentSample(0)).toBe(false);
    expect(hasRentSample(1)).toBe(true);
    expect(usableRentPoints([{ month: "nov", avg: 1743, median: 1500, sample: 0 }, { month: "oct", avg: 1400, median: 1200, sample: 3 }])).toEqual([{ month: "oct", avg: 1400, median: 1200, sample: 3 }]);
  });
  it("counts six active rentals within the actual selection, not sales or inactive", () => {
    const mixed = [...rows, { ...rows[0], listing_type: "koop" }, { ...rows[0], status: "inactief" }];
    expect(rentalSelectionCount(mixed, "eindhoven")).toBe(6);
    expect(rentalSelectionCount(mixed, "eindhoven", "onder-1500")).toBe(5);
    expect(rentalSelectionCount(mixed, "eindhoven", "appartement")).toBe(6);
  });
  it("removes income and non-Dutch alternates, limits filters and gives hubs snapshot lastmod", () => {
    const old = urlEntry("/inkomen/3000/eindhoven", "2026-10-06") + urlEntry("/huurwoningen/eindhoven/onder-1500", "2026-10-06") + urlEntry("/stad/eindhoven", "2026-10-06").replace("</url>", '<xhtml:link hreflang="en" href="https://www.woonaanbod-nl.nl/en/stad/eindhoven" /></url>');
    const xml = repairSitemap(old, rows, ["eindhoven"], "2026-11-02", "steden");
    expect(xml).not.toContain("/inkomen/");
    expect(xml).not.toContain('hreflang="en"');
    expect(xml).not.toContain("/onder-1500");
    const page = new DOMParser().parseFromString(xml, "application/xml");
    const hub = [...page.querySelectorAll("url")].find(el => el.querySelector("loc")?.textContent === "https://www.woonaanbod-nl.nl/huurwoningen/eindhoven");
    expect(hub?.querySelector("lastmod")?.textContent).toBe("2026-11-02");
    expect(xml).toContain("/huurwoningen/eindhoven/appartement");
    expect(xml).not.toContain("2026-10-06");
    expect(xml).not.toContain("/index.html");
  });
  it("omits generated fallback dates for static pages and keeps authoritative property dates", () => {
    expect(repairSitemap(urlEntry("/vragen", "2026-10-06"), rows, [], "2026-11-02", "pages")).not.toContain("lastmod");
    expect(repairSitemap(urlEntry("/huurwoning/eindhoven/test", "2026-10-30"), rows, [], "2026-11-02", "woningen")).toContain("2026-10-30");
  });
});