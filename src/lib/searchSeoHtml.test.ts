import { describe, expect, it } from "vitest";
import { CRAWLABLE_CITIES, citySeoContent, utrechtSeoContent, withStaticSeo, type CrawlableRental } from "./searchSeoHtml";

const listing = (i: number): CrawlableRental => ({ id: String(i), city: "Utrecht", status: "actief", listing_type: "huur", property_type: "appartement", price: 1000, surface_area: 50, neighborhood: null, created_at: "2026-11-09T08:00:00Z", title: `Woning ${i}`, address_slug: `straat-${i}`, slug: null });
describe("crawlbare Utrecht HTML", () => {
  it("requires six matching rentals for every priority hub", () => {
    for (const city of CRAWLABLE_CITIES) {
      const rows = Array.from({ length: 6 }, (_, i) => ({ ...listing(i), city: city.name }));
      expect(citySeoContent(rows, "2026-11-09T08:00:00Z", city).indexable).toBe(true);
      expect(citySeoContent(rows.slice(1), "2026-11-09T08:00:00Z", city).indexable).toBe(false);
    }
  });
  it("merges only The Hague municipality aliases, not Hoef en Haag", () => {
    const city = CRAWLABLE_CITIES.find(c => c.slug === "den-haag");
    if (!city) throw new Error("missing Hague configuration");
    const rows = ["Den Haag", "'s-Gravenhage", "The Hague", "Hoef en Haag"].map((name, i) => ({ ...listing(i), city: name }));
    expect(citySeoContent(rows, "2026-11-09T08:00:00Z", city).title).toContain("3 te huur");
  });
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
describe("static SEO with module script in head", () => {
  it("replaces nested homepage content when root is the last body element", async () => {
    const { withStaticSeo } = await import("./searchSeoHtml");
    const html = withStaticSeo('<html><head><title>x</title><script type="module" src="/a.js"></script></head><body><div id="root"><div class="ssr"><h1>Home</h1></div></div>\n</body></html>', { title: "Gids", description: "d", path: "/wooniezie", indexable: true, content: "<h1>Gids</h1>" });
    expect(html).not.toContain("<h1>Home</h1>");
    expect(html.match(/<h1>/g)).toHaveLength(1);
  });
});
