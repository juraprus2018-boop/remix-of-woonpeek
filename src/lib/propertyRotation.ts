import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export const providerGroup = (source?: string | null) => {
  const name = (source ?? "").trim().toLowerCase();
  if (["huurzone", "huurzone.nl"].includes(name)) return "0";
  if (["huurwoningen", "huurwoningen.nl"].includes(name)) return "1";
  if (name.includes("renthunter")) return "2";
  return `3:${name}`;
};

export const rotateProperties = <T extends { source_site?: string | null; id?: string; price?: number | null; created_at?: string | null }>(rows: T[], sort = "newest"): T[] => {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = providerGroup(row.source_site);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  const pools = [...groups.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([, group]) => group.sort((a, b) => {
    const priceDiff = Number(a.price ?? 0) - Number(b.price ?? 0);
    if (sort === "price_asc" && priceDiff) return priceDiff;
    if (sort === "price_desc" && priceDiff) return -priceDiff;
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime() || (a.id ?? "").localeCompare(b.id ?? "");
  }));
  const result: T[] = [];
  for (let round = 0; result.length < rows.length; round++) {
    for (const pool of pools) {
      const row = pool[round];
      if (row) result.push(row);
    }
  }
  return result;
};

export const fetchRotatingProperties = async (filters: object = {}, offset = 0, limit = 12, sort = "newest") => {
  // Serialize to omit undefined filter values and UI-only fields.
  const { data, error } = await supabase.rpc("search_properties_round_robin", {
    _filters: JSON.parse(JSON.stringify(filters)), _offset: offset, _limit: limit, _sort: sort,
  });
  if (error) throw error;
  return data as unknown as { properties: Property[]; totalCount: number };
};