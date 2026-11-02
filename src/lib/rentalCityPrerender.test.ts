import { describe, expect, it } from "vitest";
import { groupRentalCities, renderRentalCity, type StaticRental } from "./rentalCityPrerender";
import { isRentalCityIndexable } from "./rentalCityIndexing";
import { renderSnapshotPage, staticNoindexCanonical } from "./rentalStaticPages";

const shell = `<html><head><title>Homepage title</title><meta name="description" content="Home"><script type="module" src="/assets/app.js"></script></head><body><div id="root"><div class="fallback"></div><div><h1>Homepage H1</h1><div>Nested</div></div></div></body></html>`;
const date = new Date("2026-11-02T09:02:00Z");
const rows = (count = 10): StaticRental[] => Array.from({ length: count }, (_, i) => ({ id: String(i), city: "Eindhoven", status: "actief", listing_type: "huur", price: 1000 + i * 100, surface_area: 50, property_type: "appartement", neighborhood: null, created_at: date.toISOString(), street: "Teststraat", house_number: String(i + 1), postal_code: i < 3 ? "5611AB" : i < 5 ? "5612AB" : "5613AB", slug: null, address_slug: `teststraat-${i + 1}`, title: "Advertentie", bedrooms: 1, number_of_rooms: "2" }));
const doc = (data = rows()) => new DOMParser().parseFromString(renderRentalCity(shell, "Eindhoven", data, date), "text/html");

describe("rental city HTML rules", () => {
  it("writes noindex templates with hub canonical and language pages with Dutch canonical", () => {
    expect(staticNoindexCanonical("/energie/eindhoven", rows(6))).toBe("https://www.woonaanbod-nl.nl/huurwoningen/eindhoven");
    expect(staticNoindexCanonical("/energie/eindhoven", rows(5))).toBe("https://www.woonaanbod-nl.nl/energie/eindhoven");
    expect(staticNoindexCanonical("/en/energie/eindhoven", rows())).toBe("https://www.woonaanbod-nl.nl/energie/eindhoven");
    const page = new DOMParser().parseFromString(renderSnapshotPage(shell, "/energie/eindhoven", rows(), date, true), "text/html");
    expect(page.querySelector("meta[name='robots']")?.getAttribute("content")).toBe("noindex,follow");
    expect(page.querySelector("link[rel='canonical']")?.getAttribute("href")).toBe("https://www.woonaanbod-nl.nl/huurwoningen/eindhoven");
  });
  it("preserves merged city statistics in the HTML and groups", () => {
    const data = rows(6).map((row, i) => ({ ...row, city: i < 3 ? "Den Haag" : "'s-Gravenhage" }));
    expect(groupRentalCities(data)).toHaveLength(1);
    const page = new DOMParser().parseFromString(renderRentalCity(shell, "Den Haag", data, date), "text/html");
    expect(page.title).toContain("Den Haag: 6 te huur, gem. € 1.250");
  });
  it("requires at least six active rentals, excluding sales and inactive rows", () => {
    expect(isRentalCityIndexable(5)).toBe(false);
    expect(isRentalCityIndexable(6)).toBe(true);
    expect(groupRentalCities([...rows(5), { ...rows(1)[0], id: "sale", listing_type: "koop" }, { ...rows(1)[0], id: "old", status: "inactief" }])).toHaveLength(0);
    expect(groupRentalCities(rows(6))).toHaveLength(1);
  });
  it("calculates factual statistics from exact-city active rentals only", () => {
    const data = [...rows(6), { ...rows(1)[0], id: "other", city: "Eindhoven-Noord", price: 99999 }];
    const page = doc(data);
    expect(page.title).toBe("Huurwoningen in Eindhoven: 6 te huur, gem. € 1.250 (november 2026) | Woonaanbod NL");
    expect(page.querySelector("p")?.textContent).toContain("mediane huur is € 1.250");
    expect(page.querySelector("p")?.textContent).toContain("per m² is € 25,00");
  });
  it("uses only PC4 samples of at least three priced rentals", () => {
    const page = doc();
    expect([...page.querySelectorAll("tbody th")].map(cell => cell.textContent)).toEqual(["5611", "5613"]);
    expect(page.querySelector("tbody td")?.textContent).toBe("€ 1.100");
  });
  it("omits prices and area statistics when their sample is zero", () => {
    const page = doc(rows(6).map(row => ({ ...row, price: 0, surface_area: null })));
    expect(page.title).not.toContain("gem.");
    expect(page.querySelector("p")?.textContent).not.toMatch(/mediane|per m²/);
    expect(page.querySelector("table")).toBeNull();
    const faq = [...page.querySelectorAll("script[type='application/ld+json']")].map(el => JSON.parse(el.textContent || "{}")).find(schema => schema["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(1);
  });
  it("links ten real rentals or all six when fewer than ten exist", () => {
    expect(doc(rows(12)).querySelectorAll("a[href^='/huurwoning/eindhoven/']")).toHaveLength(10);
    expect(doc(rows(6)).querySelectorAll("a[href^='/huurwoning/eindhoven/']")).toHaveLength(6);
    expect(doc().querySelector("a")?.textContent).toContain("2 kamers");
    expect(doc().querySelector("a")?.textContent).not.toContain("1 kamer");
  });
  it("adds only the requested cities' local context", () => {
    const page = doc();
    for (const name of ["Strijp-S", "Woensel", "TU/e", "Woonbedrijf", "Trudo"]) expect(page.body.textContent).toContain(name);
    const other = new DOMParser().parseFromString(renderRentalCity(shell, "Arnhem", rows(6).map(row => ({ ...row, city: "Arnhem" })), date), "text/html");
    expect(other.body.textContent).not.toContain("teams leefomgeving");
  });
  it("replaces the whole nested root and adds canonical and factual head schemas while retaining SPA scripts", () => {
    const html = renderRentalCity(shell, "Eindhoven", rows(), date);
    const page = doc();
    expect(html).not.toContain("Homepage");
    expect(page.querySelectorAll("h1")).toHaveLength(1);
    expect(page.querySelector("h1")?.textContent).toBe("Huurwoningen in Eindhoven");
    expect(page.querySelector("link[rel='canonical']")?.getAttribute("href")).toBe("https://www.woonaanbod-nl.nl/huurwoningen/eindhoven");
    expect(page.querySelector("script[type='module']")?.getAttribute("src")).toBe("/assets/app.js");
    const schemas = [...page.head.querySelectorAll("script[type='application/ld+json']")].map(el => JSON.parse(el.textContent || "{}"));
    expect(schemas.map(schema => schema["@type"])).toEqual(["BreadcrumbList", "FAQPage", "ItemList"]);
    expect(schemas[1].mainEntity[1].acceptedAnswer.text).toContain("€ 1.450");
    expect(schemas[2].itemListElement).toHaveLength(10);
  });
});