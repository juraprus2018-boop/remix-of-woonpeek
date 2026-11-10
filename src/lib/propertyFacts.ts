interface PropertyFactsInput {
  street?: string | null;
  house_number?: string | null;
  city: string;
  property_type: string | null;
  listing_type: string;
  price: number;
  surface_area?: number | null;
  bedrooms?: number | null;
  available_from?: string | null;
  status: string;
}

export function propertyFacts(p: PropertyFactsInput) {
  const propertyType = p.property_type || "woning";
  const typeLabel = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
  const street = (p.street || "").split(",")[0].trim();
  const number = (p.house_number || "").trim().replace(/^[\s\-–]+$|[\s\-–,]+$/g, "");
  const address = [street, number].filter(Boolean).join(" ");
  const availableDate = p.available_from ? Date.parse(p.available_from) : NaN;
  const availability = p.status !== "actief" ? "Niet meer beschikbaar"
    : Number.isFinite(availableDate) ? `Beschikbaar vanaf ${new Date(availableDate).toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam" })}`
    : "Startdatum niet opgegeven";
  const price = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p.price);
  const summary = [
    `${address || "Deze woning"} in ${p.city} wordt aangeboden als ${propertyType} ${p.listing_type === "huur" ? "te huur" : "te koop"}${p.price > 0 ? ` voor ${price}${p.listing_type === "huur" ? " per maand" : ""}` : ""}.`,
    p.surface_area && p.surface_area > 0 ? `Het opgegeven woonoppervlak is ${p.surface_area} m².` : "",
    p.bedrooms && p.bedrooms > 0 ? `De advertentie vermeldt ${p.bedrooms} slaapkamers.` : "",
    `${availability}. Controleer beschikbaarheid, servicekosten en voorwaarden bij de aanbieder.`,
  ].filter(Boolean).join(" ");
  return { address, availability, summary, propertyType, typeLabel };
}