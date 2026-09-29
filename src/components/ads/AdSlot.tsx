import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AdSlotKey } from "@/hooks/useAdSlot";

interface AdSlotProps {
  slotKey: AdSlotKey;
  className?: string;
  /** Prefer banners of this advertiser (e.g. property source_site). */
  advertiser?: string | null;
}

interface Banner {
  id: string;
  advertiser_name: string | null;
  width: number | null;
  height: number | null;
  image_url: string;
  click_url: string;
}

/** Sidebar slots use rectangles, the rest use wide leaderboards. */
const RECT_SLOTS: AdSlotKey[] = ["property_detail"];
const WIDE = [[970, 90], [728, 90]];
const MOBILE = [[320, 100], [320, 50]];
const RECT = [[300, 250], [336, 280], [250, 250]];

const fits = (b: Banner, sizes: number[][]) => sizes.some(([w, h]) => b.width === w && b.height === h);

const useBanners = () =>
  useQuery({
    queryKey: ["daisycon-banners"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("daisycon_banners")
        .select("id, advertiser_name, width, height, image_url, click_url")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as Banner[];
    },
    staleTime: 30 * 60 * 1000,
  });

const pickOne = (list: Banner[], advertiser?: string | null) => {
  if (!list.length) return null;
  const own = advertiser ? list.filter((b) => b.advertiser_name?.toLowerCase() === advertiser.toLowerCase()) : [];
  const pool = own.length ? own : list;
  return pool[Math.floor(Math.random() * pool.length)];
};

const BannerLink = ({ b, className }: { b: Banner; className?: string }) => (
  <a
    href={b.click_url}
    target="_blank"
    rel="sponsored noopener"
    className={className}
    aria-label={`Bekijk aanbod op ${b.advertiser_name ?? "partner"}`}
  >
    <img
      src={b.image_url}
      width={b.width ?? undefined}
      height={b.height ?? undefined}
      alt={`Advertentie ${b.advertiser_name ?? ""}`}
      loading="lazy"
      decoding="async"
      className="mx-auto h-auto max-w-full rounded-md"
    />
  </a>
);

/** Toont automatisch een Daisycon-banner van een aangesloten aanbieder. */
const AdSlot = ({ slotKey, className = "", advertiser }: AdSlotProps) => {
  const { data } = useBanners();

  const chosen = useMemo(() => {
    const all = data ?? [];
    if (RECT_SLOTS.includes(slotKey)) {
      return { main: pickOne(all.filter((b) => fits(b, RECT)), advertiser), mobile: null };
    }
    return {
      main: pickOne(all.filter((b) => fits(b, WIDE)), advertiser),
      mobile: pickOne(all.filter((b) => fits(b, MOBILE)), advertiser),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, slotKey, advertiser]);

  if (!chosen.main && !chosen.mobile) return null;

  return (
    <aside className={`my-6 ${className}`}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Advertentie</p>
      {chosen.mobile ? (
        <>
          {chosen.main && <BannerLink b={chosen.main} className="hidden md:block" />}
          <BannerLink b={chosen.mobile} className="block md:hidden" />
        </>
      ) : (
        chosen.main && <BannerLink b={chosen.main} className="block" />
      )}
    </aside>
  );
};

export default AdSlot;
