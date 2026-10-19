/** Exact vetted aliases only: no fuzzy matching or municipality/place merging. */
const key = (value: string) => value.trim().replace(/[’‘]/g, "'").toLocaleLowerCase("nl");
export const CITY_ALIASES: Readonly<Record<string, string>> = {
  "den bosch": "'s-Hertogenbosch",
  "'s-hertogenbosch": "'s-Hertogenbosch",
  "s-hertogenbosch": "'s-Hertogenbosch",
  "alphen aan den rijn": "Alphen aan den Rijn",
  "berg en dal": "Berg en Dal",
};
export const canonicalizeCity = (value: string): string => CITY_ALIASES[key(value)] ?? value.trim();
export const cityKey = (value: string): string => key(canonicalizeCity(value));
