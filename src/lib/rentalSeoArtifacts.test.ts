import { beforeEach, describe, expect, it, vi } from "vitest";
import { SITE_URL, urlEntry } from "../../supabase/functions/_shared/sitemapPolicy";
import type { StaticRental } from "./rentalCityPrerender";

const files = vi.hoisted(() => new Map<string, string>());
vi.mock("node:fs/promises", () => {
  const mock = {
  mkdir: vi.fn(async () => undefined),
  readdir: vi.fn(async (root: string) => [...files.keys()].filter(file => file.startsWith(`${root}/`)).map(file => file.slice(root.length + 1))),
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
import { writeRentalSeoArtifacts, writeSnapshotHtml } from "../../scripts/rental-seo-artifacts";
import { assertStaticFileBudget, verifyRentalSeoOutput } from "../../scripts/verify-rental-seo";
import { MAX_STATIC_RENTAL_FILES, planStaticRentalFiles } from "./rentalStaticPages";

const shell = '<html><head><title>Homepage title</title><script type="module" src="/assets/app.js"></script></head><body><div id="root"><h1>Homepage H1</h1></div></body></html>';
const rows: StaticRental[] = Array.from({ length: 6 }, (_, i) => ({ id: String(i), city: "Eindhoven", status: "actief", listing_type: "huur", property_type: "appartement", price: 1200, surface_area: 50, postal_code: "5611AB", neighborhood: null, street: "Teststraat", house_number: String(i + 1), address_slug: `test-${i}`, slug: null, title: "Woning", bedrooms: 1, created_at: "2026-11-02" }));

describe("SEO output with read-only public input", () => {
  beforeEach(() => files.clear());
  it("rejects public as an artifact destination before reading or writing", async () => {
    await expect(writeRentalSeoArtifacts(rows, new Date("2026-11-02"), ["public"])).rejects.toThrow("only be written to dist");
    expect(files.size).toBe(0);
  });
  it("writes only planned hub-related files, no property or locale copies, without writing public", async () => {
    const xml = urlEntry("/huurwoning/eindhoven/test-0", "2026-11-02") + urlEntry("/huurprijs-index/eindhoven", "2026-11-02");
    const plan = planStaticRentalFiles(rows);
    await writeSnapshotHtml(shell, rows, new Date("2026-11-02"), plan);
    expect(files.get("dist/stad/eindhoven/index.html")).toContain('content="noindex,follow"');
    expect(files.get("dist/energie/eindhoven/index.html")).toContain(`href="${SITE_URL}/huurwoningen/eindhoven"`);
    expect(files.get("dist/huurprijs-index/eindhoven/index.html")).toContain('content="index,follow"');
    expect(files.has("dist/huurwoning/eindhoven/test-0/index.html")).toBe(false);
    expect(files.has("dist/en/huurwoningen/eindhoven/index.html")).toBe(false);
    expect(files.has("dist/postcode/5611/index.html")).toBe(false);
    expect(files.has("dist/huurwoningen/eindhoven/appartement/index.html")).toBe(false);
    expect(await verifyRentalSeoOutput("dist", [xml])).toBe(1);
  });
  it("counts at most 800 extra index.html files and fails above that", async () => {
    files.set("dist/index.html", shell);
    for (let i = 0; i < 800; i++) files.set(`dist/huurwoningen/stad-${i}/index.html`, shell);
    expect(await assertStaticFileBudget("dist")).toBe(800);
    files.set("dist/huurwoningen/stad-800/index.html", shell);
    await expect(assertStaticFileBudget("dist")).rejects.toThrow("limit is 800");
  });
  it("fails planning when hubs and rent index pages alone exceed the budget", () => {
    expect(MAX_STATIC_RENTAL_FILES).toBe(800);
    expect(() => planStaticRentalFiles(rows, 1)).toThrow("budget exceeded");
  });
  it("trims noindex files in priority order to stay within the budget", () => {
    const plan = planStaticRentalFiles(rows, 3);
    expect(plan.hubs).toEqual(["eindhoven"]);
    expect(plan.rich).toContain("/huurprijs-index/eindhoven");
    expect(plan.total).toBeLessThanOrEqual(3);
  });
  it("rejects a sitemap file that still contains the homepage shell", async () => {
    files.set("dist/huurwoningen/eindhoven/index.html", shell);
    await expect(verifyRentalSeoOutput("dist", [urlEntry("/huurwoningen/eindhoven", undefined)])).rejects.toThrow("Invalid index HTML");
  });
});