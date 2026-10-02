import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { L as LocalizedLink } from "@/components/LocalizedLink";
import { cityToSlug } from "@/lib/cities";
import { ArrowRight } from "lucide-react";

interface Props {
  cityName: string;
  /** Huidig pad (zonder taalprefix), wordt uit de lijst gelaten. */
  currentPath?: string;
}

const euro = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/**
 * Datagedreven linkblok per stad. Verbindt aanbod, nieuw vandaag, prijsfilters,
 * huurprijs per m², buurten, inkomen en vergelijking met echte cijfers.
 */
const CityDataHub = ({ cityName, currentPath }: Props) => {
  const slug = cityToSlug(cityName);

  const { data } = useQuery({
    queryKey: ["city-data-hub", cityName],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const base = () =>
        supabase.from("properties").select("id", { count: "exact", head: true })
          .eq("status", "actief").eq("listing_type", "huur").ilike("city", cityName);
      const [total, today, under1500, sample] = await Promise.all([
        base(),
        base().gte("created_at", since),
        base().lte("price", 1500),
        supabase.from("properties").select("price, surface_area, neighborhood")
          .eq("status", "actief").eq("listing_type", "huur").ilike("city", cityName).limit(1000),
      ]);
      const rows = sample.data || [];
      const withM2 = rows.filter((r) => r.surface_area && r.surface_area >= 10 && r.price >= 200 && r.price <= 10000);
      const perM2 = withM2.length ? withM2.reduce((s, r) => s + r.price / (r.surface_area as number), 0) / withM2.length : 0;
      const prices = rows.map((r) => Number(r.price)).filter((p) => p >= 200 && p <= 10000).sort((a, b) => a - b);
      const median = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
      const nb = new Map<string, number>();
      rows.forEach((r) => r.neighborhood && nb.set(r.neighborhood, (nb.get(r.neighborhood) || 0) + 1));
      return {
        total: total.count || 0,
        today: today.count || 0,
        under1500: under1500.count || 0,
        perM2,
        median,
        neighborhoods: [...nb.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
      };
    },
  });

  if (!data || data.total === 0) return null;

  const items = [
    { href: `/huurwoningen/${slug}`, title: `Huurwoningen ${cityName}`, stat: `${data.total} actief` },
    data.today > 0 && { href: `/vandaag/${slug}`, title: `Nieuw vandaag in ${cityName}`, stat: `${data.today} in 24 uur` },
    data.under1500 > 0 && { href: `/huurwoningen/${slug}/onder-1500`, title: `Onder ${euro(1500)}`, stat: `${data.under1500} woningen` },
    data.perM2 > 0 && { href: `/markt/${slug}`, title: `Huurprijs per m² ${cityName}`, stat: `${euro(Math.round(data.perM2 * 100) / 100)} per m²` },
    data.median > 0 && { href: `/huurprijs-index/${slug}`, title: `Huurprijzen ${cityName}`, stat: `mediaan ${euro(data.median)}` },
    { href: `/toplijst/${slug}/goedkoop-huur`, title: `Goedkoopste huurwoningen`, stat: "top 10" },
    { href: `/inkomen/4000/${slug}`, title: `Huren met ${euro(4000)} bruto`, stat: "wat past bij je inkomen" },
    { href: `/toplijst/${slug}/buurten`, title: `Buurten in ${cityName}`, stat: data.neighborhoods.length ? `${data.neighborhoods.length}+ buurten met aanbod` : "overzicht" },
  ].filter(Boolean) as Array<{ href: string; title: string; stat: string }>;

  const visible = items.filter((i) => i.href !== currentPath);

  return (
    <section className="py-10">
      <div className="container">
        <h2 className="mb-1 font-display text-2xl font-semibold text-foreground">Woningmarkt {cityName} in cijfers</h2>
        <p className="mb-5 text-sm text-muted-foreground">Actuele cijfers uit ons eigen aanbod, dagelijks bijgewerkt.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((i) => (
            <LocalizedLink key={i.href} to={i.href}
              className="group rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="font-display text-lg font-semibold text-primary">{i.stat}</div>
              <div className="mt-1 flex items-center justify-between text-sm text-foreground">
                {i.title}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </LocalizedLink>
          ))}
        </div>
        {data.neighborhoods.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {data.neighborhoods.map(([n, c]) => (
              <LocalizedLink key={n} to={`/buurt/${slug}/${cityToSlug(n)}`}
                className="rounded-full border bg-card px-3 py-1.5 text-sm text-foreground hover:text-primary">
                {n} <span className="text-muted-foreground">({c})</span>
              </LocalizedLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CityDataHub;
