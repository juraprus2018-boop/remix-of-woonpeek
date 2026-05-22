export const realtorSlug = (name: string, city?: string | null): string => {
  const base = `${name} ${city ?? ""}`.trim();
  return base
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
