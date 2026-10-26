import { isPreferredAdvertiser } from "@/lib/preferredAdvertiser";

/** Share of banner views reserved for the preferred advertiser (Huurzone.nl). */
export const PREFERRED_BANNER_SHARE = 0.7;

export const pickRandomBanner = <T extends { advertiser_name: string | null }>(banners: T[], random: () => number = Math.random): T | null => {
  const preferred = banners.filter((b) => isPreferredAdvertiser(b.advertiser_name));
  const others = banners.filter((b) => !isPreferredAdvertiser(b.advertiser_name));
  const pickFrom = (list: T[]) => list[Math.floor(random() * list.length)] ?? null;
  if (preferred.length && (!others.length || random() < PREFERRED_BANNER_SHARE)) return pickFrom(preferred);

  const groups = new Map<string, T[]>();
  for (const banner of others) {
    const key = (banner.advertiser_name ?? "").trim().toLowerCase();
    const group = groups.get(key) ?? [];
    group.push(banner);
    groups.set(key, group);
  }
  const pools = [...groups.values()];
  const pool = pools[Math.floor(random() * pools.length)];
  return pool ? pickFrom(pool) : null;
};
