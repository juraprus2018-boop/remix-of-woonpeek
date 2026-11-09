import { describe, expect, it } from "vitest";
import { utrechtSeoContent, withStaticSeo, type CrawlableRental } from "./searchSeoHtml";

const listing = (i: number): CrawlableRental => ({ id: String(i), city: "Utrecht", status: "actief", listing_type: "huur", property_type: "appartement", price: 1000, surface_area: 50, neighborhood: null, created_at: "2026-11-09T08:00:00Z", title: `Woning ${i}`, address_slug: `straat-${i}`, slug: null });
describe("crawlbare Utrecht HTML", () => {
  it("indexes only from six active rentals and includes their real links", () => {
    expect(utrechtSeoContent(Array.from({ length: 5 }, (_, i) => listing(i)), "2026-11-09T08:00:00Z").indexable).toBe(false);
    const page = utrechtSeoContent(Array.from({ length: 6 }, (_, i) => listing(i)), "2026-11-09T08:00:00Z");
    expect(page.indexable).toBe(true);
    expect(page.title).toContain("6 te huur, gem. € 1.000 (november 2026)");
    expect(page.content).toContain('/huurwoning/utrecht/straat-5');
  });
  it("shows no fabricated prices for an empty sample", () => {
    const page = utrechtSeoContent([], "2026-11-09T08:00:00Z");
    expect(page.title).not.toContain("gem. €");
    expect(page.content).not.toContain("Mediane vraaghuur:");
  });
  it("replaces homepage content with one H1 and a slash-free canonical", () => {
    const html = withStaticSeo('<html><head><title>Home</title></head><body><div id="root"><h1>Home</h1></div><script type="module" src="/assets/main.js"></script></body></html>', { title: "Utrecht", description: "Huren", content: "<h1>Huurwoningen in Utrecht</h1>", path: "/huurwoningen/utrecht", indexable: true });
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain('href="https://www.woonaanbod-nl.nl/huurwoningen/utrecht"');
    expect(html).toContain('/assets/main.js');
    expect(html).not.toContain('<h1>Home</h1>');
  });
});