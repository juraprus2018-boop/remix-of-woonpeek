export const pickRandomBanner = <T extends { advertiser_name: string | null }>(banners: T[], random: () => number = Math.random): T | null => {
  const groups = new Map<string, T[]>();
  for (const banner of banners) {
    const key = (banner.advertiser_name ?? "").trim().toLowerCase();
    const group = groups.get(key) ?? [];
    group.push(banner);
    groups.set(key, group);
  }
  const pools = [...groups.values()];
  const pool = pools[Math.floor(random() * pools.length)];
  return pool?.[Math.floor(random() * pool.length)] ?? null;
};