/** Exact aliases only: never merge cities by a partial name match. */
export function rentalCitySlug(city: string): string {
  const slug = city.trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, "-");
  if (["den-haag", "'s-gravenhage", "s-gravenhage", "the-hague"].includes(slug)) return "den-haag";
  if (["den-bosch", "'s-hertogenbosch", "'s-hertogenbosch", "s-hertogenbosch"].includes(slug)) return "den-bosch";
  return slug;
}

export function rentalCityName(city: string): string {
  const slug = rentalCitySlug(city);
  return slug === "den-haag" ? "Den Haag" : slug === "den-bosch" ? "Den Bosch" : city.trim();
}

export function rentalCityAliases(city: string): string[] {
  const slug = rentalCitySlug(city);
  return slug === "den-haag" ? ["Den Haag", "'s-Gravenhage", "The Hague"]
    : slug === "den-bosch" ? ["Den Bosch", "'s-Hertogenbosch", "'s Hertogenbosch"] : [city];
}