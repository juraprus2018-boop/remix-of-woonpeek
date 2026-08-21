import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { cityPath, citySlugToName } from "@/lib/cities";
import { CANONICAL_URL } from "@/lib/brand";

const formatEuro = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const monthLabel = (iso: string) =>
  new Date(iso).toLocaleString("nl-NL", { month: "short", year: "2-digit" });

const RentIndexPage = () => {
  const { city: citySlug = "" } = useParams<{ city: string }>();
  const cityName = citySlugToName(citySlug);

  const { data: snapshots, isLoading } = useQuery({
    queryKey: ["rent-index", citySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from("rent_index_snapshots")
        .select("*")
        .eq("city_slug", citySlug)
        .order("snapshot_month", { ascending: true })
        .limit(36);
      return data || [];
    },
  });

  // Live current month from properties (fallback as latest data point)
  const { data: liveStats } = useQuery({
    queryKey: ["rent-index-live", citySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("price, surface_area")
        .eq("status", "actief")
        .eq("listing_type", "huur")
        .ilike("city", `%${cityName}%`);
      if (!data?.length) return null;
      const prices = data.map((p) => Number(p.price)).filter((n) => n > 0).sort((a, b) => a - b);
      const m2 = data.filter((p) => p.surface_area && p.price).map((p) => Number(p.price) / (p.surface_area as number));
      return {
        avg: Math.round(prices.reduce((s, n) => s + n, 0) / prices.length),
        median: prices[Math.floor(prices.length / 2)],
        min: prices[0],
        max: prices[prices.length - 1],
        sample: prices.length,
        ppm2: m2.length ? Math.round(m2.reduce((s, n) => s + n, 0) / m2.length) : null,
      };
    },
    enabled: !!cityName,
  });

  const chartData = useMemo(() => {
    const arr = (snapshots || []).map((s) => ({
      month: monthLabel(s.snapshot_month),
      avg: s.avg_rent ? Number(s.avg_rent) : null,
      median: s.median_rent ? Number(s.median_rent) : null,
      sample: s.sample_size,
    }));
    // append live point if today's month not present
    if (liveStats) {
      const thisMonth = monthLabel(new Date().toISOString().slice(0, 10));
      if (!arr.some((d) => d.month === thisMonth)) {
        arr.push({ month: thisMonth, avg: liveStats.avg, median: liveStats.median, sample: liveStats.sample });
      }
    }
    return arr;
  }, [snapshots, liveStats]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].avg;
    const last = chartData[chartData.length - 1].avg;
    if (!first || !last) return null;
    const pct = ((last - first) / first) * 100;
    return { pct, first, last };
  }, [chartData]);

  const month = new Date().toLocaleString("nl-NL", { month: "long" });
  const year = new Date().getFullYear();

  const currentAvg = liveStats?.avg ?? (chartData.at(-1)?.avg ?? 0);

  const title = `Huurprijs-index ${cityName} ${month} ${year} — maandelijkse update | Stekly`;
  const description = `Maandelijks bijgewerkte huurprijs-index voor ${cityName}. Gemiddelde huur ${month} ${year}: ${formatEuro(currentAvg)}. Bekijk de trend, mediaan en prijs per m².`;

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Huurprijs-index ${cityName}`,
    description: `Maandelijkse snapshots van gemiddelde, mediane, minimale en maximale huurprijs in ${cityName} (Nederland).`,
    url: `${CANONICAL_URL}/huurprijs-index/${citySlug}`,
    keywords: ["huurprijs-index", "huurprijzen", cityName, "Nederland", "maandelijks"],
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: "Stekly", url: CANONICAL_URL },
    temporalCoverage: snapshots?.length
      ? `${snapshots[0].snapshot_month}/${snapshots[snapshots.length - 1].snapshot_month}`
      : new Date().toISOString().slice(0, 7),
    variableMeasured: [
      { "@type": "PropertyValue", name: "Gemiddelde huurprijs", unitText: "EUR/maand" },
      { "@type": "PropertyValue", name: "Mediaan huurprijs", unitText: "EUR/maand" },
      { "@type": "PropertyValue", name: "Prijs per m²", unitText: "EUR/m²" },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead title={title} description={description} canonical={`/huurprijs-index/${citySlug}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />

      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-10">
          <div className="container">
            <Breadcrumbs items={[
              { label: "Home", href: "/" },
              { label: cityName, href: cityPath(cityName) },
              { label: "Huurprijs-index" },
            ]} />
            <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold text-foreground">
              Huurprijs-index {cityName}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              De officiële huurprijs-index van {cityName}, elke maand opnieuw berekend op basis van het actieve aanbod. Vaste URL — bookmark deze pagina voor de maandelijkse update.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Laatst bijgewerkt: {month} {year}</p>
          </div>
        </section>

        {/* Big number */}
        <section className="container py-8">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-xs uppercase text-muted-foreground">Gemiddelde huur</p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">{formatEuro(currentAvg)}</p>
              {trend && (
                <p className={`mt-1 flex items-center gap-1 text-xs ${trend.pct > 0 ? "text-destructive" : trend.pct < 0 ? "text-green-600" : "text-muted-foreground"}`}>
                  {trend.pct > 0 ? <TrendingUp className="h-3 w-3" /> : trend.pct < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {trend.pct > 0 ? "+" : ""}{trend.pct.toFixed(1)}% sinds {chartData[0].month}
                </p>
              )}
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-xs uppercase text-muted-foreground">Mediaan</p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">{formatEuro(liveStats?.median ?? null)}</p>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-xs uppercase text-muted-foreground">Prijs per m²</p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">{liveStats?.ppm2 ? `€${liveStats.ppm2}` : "—"}</p>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-xs uppercase text-muted-foreground">Sample</p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">{liveStats?.sample ?? 0}</p>
              <p className="text-xs text-muted-foreground">woningen meegerekend</p>
            </div>
          </div>
        </section>

        {/* Chart */}
        <section className="container pb-8">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-display text-xl font-bold mb-4">Trend afgelopen maanden</h2>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : chartData.length < 2 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nog niet genoeg snapshots voor een trendlijn. We bouwen de index elke maand op — kom terug volgende maand.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `€${v}`} />
                  <Tooltip formatter={(v: number) => formatEuro(v)} />
                  <Area type="monotone" dataKey="avg" stroke="hsl(var(--primary))" fill="url(#g)" name="Gemiddeld" />
                  <Line type="monotone" dataKey="median" stroke="hsl(var(--foreground))" strokeDasharray="4 2" name="Mediaan" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* SEO body */}
        <section className="border-t bg-muted/30 py-10">
          <div className="container space-y-3 text-sm text-muted-foreground">
            <h2 className="font-display text-2xl font-bold text-foreground">Hoe werkt de huurprijs-index?</h2>
            <p>
              Elke maand maken we een snapshot van alle actieve huurwoningen in {cityName}. We berekenen gemiddelde, mediaan, minimum, maximum en prijs per vierkante meter. Zo zie je niet alleen waar de markt vandaag staat, maar ook hoe deze beweegt over de tijd.
            </p>
            <p>
              Bekijk ook de <Link to={`/heatmap/${citySlug}`} className="text-primary underline">huurprijs heatmap van {cityName}</Link> voor verschillen tussen postcodes, of het <Link to={cityPath(cityName)} className="text-primary underline">actuele aanbod</Link>.
            </p>
            <Link to="/woonradar" className="mt-2 inline-flex items-center gap-1 text-primary underline">
              Ontvang nieuwe woningen direct in je mailbox <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RentIndexPage;
