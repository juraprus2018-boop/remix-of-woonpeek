export type FeedRow = Record<string, string>;

export function rentalIdentity(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const path = u.searchParams.get("dl") || u.pathname;
    return path.match(/(?:^|\/)(?:rental|huren)\/([a-zA-Z0-9]+)/)?.[1] || null;
  } catch { return null; }
}

const types: Record<string, string> = { appartement: "appartement", huis: "huis", kamer: "kamer", studio: "studio" };
const labels: Record<string, string> = { appartement: "Appartement", huis: "Huis", kamer: "Kamer", studio: "Studio", antikraak: "Antikraakwoning" };
const number = (value: string): number | null => {
  if (!value?.trim()) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const integer = (value: string) => { const n = number(value); return n === null ? null : Math.round(n); };
const date = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value || "") && Number.isFinite(Date.parse(value)) ? value : null;

/** Maps a row of the Dutch feed (feed-nl.csv). Every row in that feed is available. */
export function mapRenthunter(row: FeedRow, checkedAt: string) {
  const url = new URL(row.link);
  if (!["renthunter.nl", "www.renthunter.nl"].includes(url.hostname) || url.protocol !== "https:") throw new Error("Invalid listing URL");
  if (!row.id || rentalIdentity(row.link) !== row.id || !row.plaats?.trim()) throw new Error("Missing listing identity or city");
  const price = number(row.huurprijs);
  if (price === null || price <= 0) throw new Error("Invalid rental price");
  url.hostname = "renthunter.nl";
  url.searchParams.set("via", "woonaanbod");
  const kind = row.woningtype?.trim().toLowerCase();
  const city = row.plaats.trim();
  const images = Array.from({ length: 10 }, (_, i) => row[i === 0 ? "afbeelding" : `afbeelding_${i + 1}`])
    .filter((v): v is string => !!v && /^https?:\/\//.test(v));
  const energy = row.energielabel?.toUpperCase();
  const created = Date.parse(row.geplaatst_op || "");
  return {
    title: `${labels[kind] || "Woning"} te huur in ${city}`,
    description: row.omschrijving || null,
    property_type: types[kind] || null,
    listing_type: "huur",
    price, surface_area: integer(row.woonoppervlakte_m2), bedrooms: integer(row.aantal_slaapkamers),
    bathrooms: integer(row.aantal_badkamers), build_year: integer(row.bouwjaar),
    energy_label: ["A++", "A+", "A", "B", "C", "D", "E", "F", "G"].includes(energy) ? energy : null,
    street: row.straat?.trim() || row.adres?.split(",")[0]?.trim() || city,
    house_number: row.huisnummer?.trim() || "", postal_code: row.postcode?.trim() || "",
    city, neighborhood: row.buurt || row.wijk || null,
    latitude: number(row.breedtegraad), longitude: number(row.lengtegraad), images: [...new Set(images)],
    status: "actief",
    source_site: "Renthunter", source_url: url.toString(),
    source_raw: { provider: "renthunter-direct-nl", sku: row.id, updated_at: row.bijgewerkt_op },
    available_from: date(row.beschikbaar_vanaf), last_checked_at: checkedAt,
    created_at: Number.isFinite(created) ? new Date(created).toISOString() : checkedAt,
  };
}
