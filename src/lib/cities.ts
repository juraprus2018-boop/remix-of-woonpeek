export const cityToSlug = (city: string) =>
  city
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

export const citySlugToName = (slug: string) =>
  slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

/** Canonieke stad-URL. Bewust slash-based (anders dan woonpeek's `/woningen-xxx`). */
export const cityPath = (city: string) => `/stad/${cityToSlug(city)}`;
