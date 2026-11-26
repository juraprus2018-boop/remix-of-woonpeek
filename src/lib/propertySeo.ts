import type { Database } from "@/integrations/supabase/types";
import { normalizePropertyDetail } from "@/lib/propertyDetailData";
import { propertyFacts } from "@/lib/propertyFacts";
import { propertyPath } from "@/lib/propertyUrl";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const SITE = "https://www.woonaanbod-nl.nl";

const euro = (price: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

/** Title, description and canonical for a property, shared by the page and the server-rendered head. */
export function propertySeo(raw: Property) {
  const property = normalizePropertyDetail(raw);
  const facts = propertyFacts(property);
  const cityLabel = property.city || "Onbekende plaats";
  const listingLabel = property.listing_type === "huur" ? "te huur" : "te koop";
  const bedroomsLabel = property.bedrooms ? `${property.bedrooms} kamers` : null;
  const surfaceLabel = property.surface_area ? `${property.surface_area} m²` : null;
  const priceFormatted = property.price === null ? "Prijs niet opgegeven" : euro(property.price);
  const perMonth = property.price !== null && property.listing_type === "huur" ? " per maand" : "";
  const streetLine = facts.address;
  const placeLabel = streetLine ? `${streetLine}${property.city ? `, ${property.city}` : ""}` : cityLabel;

  const title = `${placeLabel}: ${facts.propertyType} ${listingLabel}${bedroomsLabel ? `, ${bedroomsLabel}` : ""}, ${priceFormatted}${perMonth} | Woonaanbod NL`;
  const description = `${facts.typeLabel} ${listingLabel} aan ${placeLabel}.${bedroomsLabel ? ` ${bedroomsLabel}` : ""}${surfaceLabel ? ` • ${surfaceLabel}` : ""} • ${priceFormatted}${perMonth}. Bekijk foto's, kenmerken, de buurt en reageer direct.`;
  const canonicalPath = propertyPath(property);
  const image = property.images?.[0];
  return { title, description, canonicalPath, image: image && /^https:\/\//.test(image) ? image : undefined };
}

export function propertyHead(raw: Property | null) {
  if (!raw) {
    return { meta: [{ title: "Woning niet gevonden | Woonaanbod NL" }, { name: "robots", content: "noindex" }] };
  }
  const seo = propertySeo(raw);
  const url = `${SITE}${seo.canonicalPath}`;
  return {
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      ...(seo.image
        ? [{ property: "og:image", content: seo.image }, { name: "twitter:image", content: seo.image }]
        : []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
