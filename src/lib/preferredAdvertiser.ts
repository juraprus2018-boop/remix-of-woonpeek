export const PREFERRED_ADVERTISER = "Huurwoningen.nl";

export const isPreferredAdvertiser = (name: string | null | undefined) =>
  ["huurwoningen", "huurwoningen.nl"].includes((name ?? "").trim().toLowerCase());

export const pickPreferredBanner = <T extends { advertiser_name: string | null }>(
  banners: T[],
  random: () => number = Math.random,
): T | null => {
  const pool = banners.filter((banner) => isPreferredAdvertiser(banner.advertiser_name));
  return pool.length ? pool[Math.floor(random() * pool.length)] : null;
};