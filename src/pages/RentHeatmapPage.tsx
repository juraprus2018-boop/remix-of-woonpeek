import { useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { cityPath, citySlugToName, cityToSlug } from "@/lib/cities";
import { CANONICAL_URL } from "@/lib/brand";

const formatEuro = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

type PC4Agg = {
  pc4: string;
  avg: number;
  median: number;
  count: number;
  lat: number;
  lng: number;
  min: number;
  max: number;
};

const RentHeatmapPage = () => {
  const { city: citySlug = "" } = useParams<{ city: string }>();
  const cityName = citySlugToName(citySlug);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const { data: properties, isLoading } = useQuery({
    queryKey: ["heatmap-properties", citySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("price, postal_code, latitude, longitude, surface_area, listing_type")
        .eq("status", "actief")
        .eq("listing_type", "huur")
        .ilike("city", `%${cityName}%`)
        .not("postal_code", "is", null)
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      return data || [];
    },
    enabled: !!cityName,
  });

  const aggregates = useMemo<PC4Agg[]>(() => {
    if (!properties?.length) return [];
    const groups = new Map<string, { prices: number[]; lats: number[]; lngs: number[] }>();
    for (const p of properties) {
      const pc4 = String(p.postal_code || "").replace(/\s+/g, "").slice(0, 4);
      if (!/^\d{4}$/.test(pc4)) continue;
      if (!p.latitude || !p.longitude || !p.price) continue;
      if (!groups.has(pc4)) groups.set(pc4, { prices: [], lats: [], lngs: [] });
      const g = groups.get(pc4)!;
      g.prices.push(Number(p.price));
      g.lats.push(Number(p.latitude));
      g.lngs.push(Number(p.longitude));
    }
    return Array.from(groups.entries())
      .filter(([, g]) => g.prices.length >= 1)
      .map(([pc4, g]) => {
        const sorted = [...g.prices].sort((a, b) => a - b);
        return {
          pc4,
          avg: Math.round(sorted.reduce((s, n) => s + n, 0) / sorted.length),
          median: sorted[Math.floor(sorted.length / 2)],
          min: sorted[0],
          max: sorted[sorted.length - 1],
          count: sorted.length,
          lat: g.lats.reduce((a, b) => a + b, 0) / g.lats.length,
          lng: g.lngs.reduce((a, b) => a + b, 0) / g.lngs.length,
        };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [properties]);

  // Render Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !aggregates.length) return;

    const center: [number, number] = [
      aggregates.reduce((s, a) => s + a.lat, 0) / aggregates.length,
      aggregates.reduce((s, a) => s + a.lng, 0) / aggregates.length,
    ];
    const map = L.map(mapRef.current, { center, zoom: 12, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    const allPrices = aggregates.map((a) => a.avg);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const colorFor = (price: number) => {
      const t = max === min ? 0.5 : (price - min) / (max - min);
      // green → red ramp
      const r = Math.round(255 * t);
      const g = Math.round(180 * (1 - t));
      return `rgb(${r},${g},80)`;
    };

    aggregates.forEach((a) => {
      const radius = 280 + (a.count * 40);
      L.circle([a.lat, a.lng], {
        radius,
        color: colorFor(a.avg),
        fillColor: colorFor(a.avg),
        fillOpacity: 0.45,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(
          `<strong>Postcode ${a.pc4}</strong><br/>
           Gem. huur: <strong>${formatEuro(a.avg)}</strong><br/>
           Mediaan: ${formatEuro(a.median)}<br/>
           ${a.count} woning${a.count > 1 ? "en" : ""}`
        );
    });

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [aggregates]);

  const month = new Date().toLocaleString("nl-NL", { month: "long" });
  const year = new Date().getFullYear();

  const title = `Huurprijs heatmap ${cityName} per postcode | Stekly`;
  const description = `Interactieve kaart met gemiddelde huurprijs per PC4-postcode in ${cityName}. Zie meteen welke wijken het duurst of het goedkoopst zijn. Bron: ${properties?.length || 0} actieve huurwoningen, ${month} ${year}.`;

  // Dataset JSON-LD
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Huurprijs heatmap ${cityName} per postcode (${month} ${year})`,
    description,
    url: `${CANONICAL_URL}/heatmap/${citySlug}`,
    keywords: ["huurprijs", "postcode", "PC4", cityName, "huurmarkt", "Nederland"],
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: "Stekly", url: CANONICAL_URL },
    spatialCoverage: { "@type": "Place", name: cityName, address: { "@type": "PostalAddress", addressLocality: cityName, addressCountry: "NL" } },
    temporalCoverage: new Date().toISOString().slice(0, 7),
    variableMeasured: [
      { "@type": "PropertyValue", name: "Gemiddelde huurprijs", unitText: "EUR/maand" },
      { "@type": "PropertyValue", name: "Mediaan huurprijs", unitText: "EUR/maand" },
      { "@type": "PropertyValue", name: "Aantal woningen per PC4", unitText: "count" },
    ],
    distribution: aggregates.slice(0, 25).map((a) => ({
      "@type": "DataDownload",
      name: `PC4 ${a.pc4}`,
      contentUrl: `${CANONICAL_URL}/postcode/${a.pc4}`,
      encodingFormat: "text/html",
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: CANONICAL_URL },
      { "@type": "ListItem", position: 2, name: cityName, item: `${CANONICAL_URL}${cityPath(cityName)}` },
      { "@type": "ListItem", position: 3, name: "Huurprijs heatmap", item: `${CANONICAL_URL}/heatmap/${citySlug}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead title={title} description={description} canonical={`/heatmap/${citySlug}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-10">
          <div className="container">
            <Breadcrumbs items={[
              { label: "Home", href: "/" },
              { label: cityName, href: cityPath(cityName) },
              { label: "Huurprijs heatmap" },
            ]} />
            <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold text-foreground">
              Huurprijzen per postcode in {cityName}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Visuele heatmap met gemiddelde huurprijs per PC4-postcodegebied. Hoe roder de cirkel, hoe duurder de gemiddelde huur. Klik op een cirkel voor details.
            </p>
          </div>
        </section>

        <section className="container py-8">
          {isLoading ? (
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          ) : aggregates.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <p className="text-muted-foreground">Nog te weinig data om een heatmap te tekenen voor {cityName}.</p>
              <Link to={cityPath(cityName)} className="mt-3 inline-block text-primary underline">Bekijk het aanbod in {cityName}</Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border-2 border-foreground shadow-[6px_6px_0_hsl(var(--primary)/0.3)]">
              <div ref={mapRef} style={{ height: "560px", width: "100%" }} />
            </div>
          )}
        </section>

        {aggregates.length > 0 && (
          <section className="container pb-12">
            <h2 className="font-display text-2xl font-bold mb-4">Top postcodes — gemiddelde huur</h2>
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="grid grid-cols-4 gap-2 border-b bg-muted/50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                <span>Postcode</span>
                <span className="text-right">Gem. huur</span>
                <span className="text-right">Mediaan</span>
                <span className="text-right">Aanbod</span>
              </div>
              {aggregates.slice(0, 30).map((a) => (
                <Link
                  key={a.pc4}
                  to={`/postcode/${a.pc4}`}
                  className="grid grid-cols-4 gap-2 border-b px-4 py-3 last:border-0 hover:bg-muted/30"
                >
                  <span className="font-semibold text-foreground">{a.pc4}</span>
                  <span className="text-right text-primary font-semibold">{formatEuro(a.avg)}</span>
                  <span className="text-right text-sm text-muted-foreground">{formatEuro(a.median)}</span>
                  <span className="text-right text-sm text-muted-foreground">{a.count}</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Data: actieve huurwoningen op Stekly · {month} {year} · vrij te gebruiken onder CC-BY 4.0 met bronvermelding.
            </p>
          </section>
        )}

        <section className="border-t bg-muted/30 py-10">
          <div className="container space-y-3 text-sm text-muted-foreground">
            <h2 className="font-display text-xl font-bold text-foreground">Over deze kaart</h2>
            <p>
              We aggregeren de huurprijzen van alle actieve woningen in {cityName} per 4-cijferige postcode (PC4). De cirkelgrootte representeert het aantal aangeboden woningen en de kleur de gemiddelde maandhuur. Hiermee zie je in één oogopslag welke wijken duurder of betaalbaarder zijn.
            </p>
            <p>
              Bekijk ook de <Link to={`/markt/${cityToSlug(cityName)}`} className="text-primary underline">huurprijs-index van {cityName}</Link> voor de maandelijkse trend.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RentHeatmapPage;
