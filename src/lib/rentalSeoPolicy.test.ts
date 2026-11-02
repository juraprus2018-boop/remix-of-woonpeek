import { describe, expect, it } from "vitest";
import { shouldNoindexRentalCity } from "./rentalCityIndexing";
import { hasRentSample, usableRentPoints } from "./rentIndexData";
import { repairSitemap, rentalSelectionCount, urlEntry, snapshotPathIndexable, shouldWriteLocaleCopy, type SitemapRental } from "../../supabase/functions/_shared/sitemapPolicy";
import { rentalCitySlug } from "../../supabase/functions/_shared/rentalCityIdentity";

const rows: SitemapRental[] = Array.from({ length: 6 }, (_, i) => ({ city: "Eindhoven", status: "actief", listing_type: "huur", property_type: "appartement", price: i === 5 ? 1700 : 900, bedrooms: 1, updated_at: "2026-11-01T04:00:00Z" }));

describe("rental SEO correction rules", () => {
  it("keeps locale hub and retired template files but skips translated property detail files", () => {
    for (const path of ["/huurwoningen/eindhoven", "/stad/swalmen", "/energie/eindhoven", "/en/huurwoningen/eindhoven"]) expect(shouldWriteLocaleCopy(path)).toBe(true);
    for (const path of ["/huurwoning/eindhoven/test", "/en/huurwoning/eindhoven/test", "/de/koopwoning/breda/test", "/fr/woning/test"]) expect(shouldWriteLocaleCopy(path)).toBe(false);
  });
  it("merges 564 Den Haag and 437 Gravenhage rentals into one 1001-rental hub", () => {
    const merged = [...Array.from({ length: 564 }, () => ({ ...rows[0], city: "Den Haag" })), ...Array.from({ length: 437 }, () => ({ ...rows[0], city: "'s-Gravenhage" }))];
    expect(rentalSelectionCount(merged, "den-haag")).toBe(1001);
    const xml = repairSitemap("", merged, ["den-haag", "'s-gravenhage"], "2026-11-02", "steden");
    expect(xml.match(/<loc>[^<]*\/huurwoningen\/den-haag<\/loc>/g)).toHaveLength(1);
    expect(xml).not.toContain("'s-gravenhage");
    for (const alias of ["Den haag", "The hague", "'s-Gravenhage"]) expect(rentalCitySlug(alias)).toBe("den-haag");
  });
  it("merges 67 Den Bosch and 26 Hertogenbosch without merging other municipalities", () => {
    const merged = [...Array.from({ length: 67 }, () => ({ ...rows[0], city: "Den Bosch" })), ...Array.from({ length: 26 }, () => ({ ...rows[0], city: "'s-Hertogenbosch" }))];
    expect(rentalSelectionCount(merged, "den-bosch")).toBe(93);
    for (const alias of ["'s hertogenbosch", "'s-hertogenbosch", "Den bosch"]) expect(rentalCitySlug(alias)).toBe("den-bosch");
    for (const name of ["Oudenbosch", "Herkenbosch", "Hoef en Haag", "Bosch en Duin"]) expect(rentalCitySlug(name)).not.toMatch(/^(den-haag|den-bosch)$/);
  });
  it("excludes postcodes and neighborhoods below six active rentals in XML repair", () => {
    const data = rows.map((row, i) => ({ ...row, postal_code: i < 5 ? "5611AB" : "5612AB", neighborhood: i < 5 ? "Centrum" : "Woensel" }));
    const old = ["/postcode/5611", "/buurt/eindhoven/centrum", "/en/huurwoningen/eindhoven", "/energie/eindhoven"].map(path => urlEntry(path, "2026-10-06")).join("");
    const xml = repairSitemap(old, data, ["eindhoven"], "2026-11-02", "steden");
    for (const path of ["/postcode/", "/buurt/", "/en/", "/energie/", "2026-10-06"]) expect(xml).not.toContain(path);
    const six = [...data, { ...data[0] }];
    expect(snapshotPathIndexable(six, "/postcode/5611")).toBe(true);
    expect(snapshotPathIndexable(six, "/buurt/eindhoven/centrum")).toBe(true);
  });
  it("requires six priced rentals for index and heatmap, and a heatmap PC4 sample of three", () => {
    const zero = rows.map(row => ({ ...row, price: 0 }));
    expect(snapshotPathIndexable(zero, "/huurprijs-index/eindhoven")).toBe(false);
    expect(snapshotPathIndexable(rows.slice(0, 5), "/huurprijs-index/eindhoven")).toBe(false);
    expect(snapshotPathIndexable(rows, "/huurprijs-index/eindhoven")).toBe(true);
    expect(snapshotPathIndexable(rows, "/heatmap/eindhoven")).toBe(false);
    expect(snapshotPathIndexable(rows.map((row, i) => ({ ...row, postal_code: i < 3 ? "5611AB" : `${5612 + i}AB` })), "/heatmap/eindhoven")).toBe(true);
  });
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