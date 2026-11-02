import { beforeEach, describe, expect, it, vi } from "vitest";
import { SITE_URL, urlEntry } from "../../supabase/functions/_shared/sitemapPolicy";
import type { StaticRental } from "./rentalCityPrerender";

const files = vi.hoisted(() => new Map<string, string>());
vi.mock("node:fs/promises", () => {
  const mock = {
  mkdir: vi.fn(async () => undefined),
  readFile: vi.fn(async (file: string) => {
    const value = files.get(file);
    if (value === undefined) throw Object.assign(new Error("Missing test file"), { code: "ENOENT" });
    return value;
  }),
  writeFile: vi.fn(async (file: string, value: string) => {
    if (file.startsWith("public/")) throw Object.assign(new Error("Read-only public directory"), { code: "EROFS" });
    files.set(file, value);
  }),
  };
  return { ...mock, default: mock };
});
vi.mock("./dutchCities", async (importOriginal) => ({ ...await importOriginal<typeof import("./dutchCities")>(), DUTCH_CITIES: ["Eindhoven", "Swalmen", "Den Haag", "Den Bosch"] }));
import { writeSnapshotHtml } from "../../scripts/rental-seo-artifacts";
import { verifyRentalSeoOutput } from "../../scripts/verify-rental-seo";

const shell = '<html><head><title>Homepage title</title><script type="module" src="/assets/app.js"></script></head><body><div id="root"><h1>Homepage H1</h1></div></body></html>';
const rows: StaticRental[] = Array.from({ length: 6 }, (_, i) => ({ id: String(i), city: "Eindhoven", status: "actief", listing_type: "huur", property_type: "appartement", price: 1200, surface_area: 50, postal_code: "5611AB", neighborhood: null, street: "Teststraat", house_number: String(i + 1), address_slug: `test-${i}`, slug: null, title: "Woning", bedrooms: 1, created_at: "2026-11-02" }));

describe("SEO output with read-only public input", () => {
  beforeEach(() => files.clear());
  it("completes dist output and retirement manifest without writing public", async () => {
    files.set("public/seo-retired-paths.json", JSON.stringify(["/stad/swalmen", "/en/huurwoning/eindhoven/test-0"]));
    const xml = urlEntry("/huurwoning/eindhoven/test-0", "2026-11-02");
    await writeSnapshotHtml(shell, rows, new Date("2026-11-02"), [xml], "");
    expect(JSON.parse(files.get("dist/seo-retired-paths.json") || "[]")).toContain("/stad/swalmen");
    expect(files.get("dist/stad/swalmen/index.html")).toContain('content="noindex,follow"');
    expect(files.get("dist/energie/eindhoven/index.html")).toContain(`href="${SITE_URL}/huurwoningen/eindhoven"`);
    expect(files.get("dist/en/huurwoningen/eindhoven/index.html")).toContain('content="noindex,follow"');
    expect(files.has("dist/huurwoning/eindhoven/test-0/index.html")).toBe(true);
    expect(files.has("dist/en/huurwoning/eindhoven/test-0/index.html")).toBe(false);
    expect(await verifyRentalSeoOutput("dist", [xml])).toBe(1);
  });
  it("rejects a sitemap file that still contains the homepage shell", async () => {
    files.set("dist/vragen/index.html", shell);
    await expect(verifyRentalSeoOutput("dist", [urlEntry("/vragen", undefined)])).rejects.toThrow("Invalid index HTML");
  });
});