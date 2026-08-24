/**
 * Validation for city names accepted from public (unauthenticated) callers.
 * Keeps on-demand generation endpoints usable for visitors while blocking
 * arbitrary free-text input from being used to drive AI / API costs.
 */
const CITY_RE = /^[A-Za-zÀ-ÿ' .()\/-]{2,40}$/;

export function isValidPublicCity(city: unknown): city is string {
  return typeof city === "string" && CITY_RE.test(city.trim());
}

export function citySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
