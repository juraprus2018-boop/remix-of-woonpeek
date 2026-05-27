import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Users, Home, Euro, MapPin, Building2, Baby, TrendingUp } from "lucide-react";

interface CbsData {
  period?: string;
  city_name?: string;
  inhabitants?: number;
  men?: number;
  women?: number;
  age_0_15?: number;
  age_15_25?: number;
  age_25_45?: number;
  age_45_65?: number;
  age_65_plus?: number;
  avg_household_size?: number;
  households?: number;
  single_households?: number;
  population_density?: number;
  area_km2?: number;
  avg_income?: number;
  avg_house_value?: number;
  housing_stock?: number;
}

const fmt = (n: number | null | undefined, suffix = "") => {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("nl-NL").format(Math.round(n)) + suffix;
};
const fmtEuro = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "—";
  return "€ " + new Intl.NumberFormat("nl-NL").format(Math.round(n * (n < 1000 ? 1000 : 1)));
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function CityStats() {
  const { city } = useParams<{ city: string }>();
  const cityName = city ? cap(city.replace(/-/g, " ")) : "";
  const [data, setData] = useState<CbsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyCount, setPropertyCount] = useState(0);

  useEffect(() => {
    if (!city) return;
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [{ data: cbsRes, error: cbsErr }, { count }] = await Promise.all([
          supabase.functions.invoke("fetch-cbs-stats", { body: { city: cityName } }),
          supabase.from("properties").select("*", { count: "exact", head: true }).ilike("city", cityName).eq("status", "actief"),
        ]);
        if (!alive) return;
        if (cbsErr) throw cbsErr;
        if ((cbsRes as any)?.error) throw new Error((cbsRes as any).error);
        setData(cbsRes as CbsData);
        setPropertyCount(count || 0);
      } catch (e: any) {
        if (alive) setError(e?.message || "Kon CBS-data niet ophalen");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [city, cityName]);

  const totalPop = data?.inhabitants || 0;
  const ageGroups = data ? [
    { label: "0-15 jaar", value: data.age_0_15 || 0, color: "bg-emerald-500" },
    { label: "15-25 jaar", value: data.age_15_25 || 0, color: "bg-blue-500" },
    { label: "25-45 jaar", value: data.age_25_45 || 0, color: "bg-violet-500" },
    { label: "45-65 jaar", value: data.age_45_65 || 0, color: "bg-amber-500" },
    { label: "65+ jaar", value: data.age_65_plus || 0, color: "bg-rose-500" },
  ] : [];
  const ageTotal = ageGroups.reduce((s, a) => s + a.value, 0) || totalPop || 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{`Cijfers ${cityName} — bevolking, inkomen & woningen | Huurbaasje`}</title>
        <meta
          name="description"
          content={`Officiële CBS-cijfers over ${cityName}: aantal inwoners, gemiddeld inkomen, leeftijdsopbouw, woningvoorraad en woningwaarde. Updates per jaar.`}
        />
        <link rel="canonical" href={`https://www.huurbaasje.nl/cijfers/${city}`} />
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <Breadcrumbs items={[
            { label: "Plekken", href: "/plekken" },
            { label: cityName, href: `/stad/${city}` },
            { label: "Cijfers" },
          ]} />

          <div className="mb-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Officiële CBS-cijfers</p>
            <h1 className="text-4xl md:text-5xl font-bold lowercase">cijfers {cityName.toLowerCase()}</h1>
            {data?.period && (
              <p className="text-sm text-muted-foreground mt-2">Bron: CBS · meetjaar {data.period}</p>
            )}
          </div>

          {loading && (
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
          )}

          {error && !loading && (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <p className="text-muted-foreground">{error}</p>
                <Button asChild variant="outline"><Link to={`/stad/${city}`}>Terug naar {cityName}</Link></Button>
              </CardContent>
            </Card>
          )}

          {data && !loading && (
            <div className="space-y-6">
              {/* Top KPI grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard icon={Users} label="Inwoners" value={fmt(data.inhabitants)} />
                <KpiCard icon={Home} label="Huishoudens" value={fmt(data.households)} />
                <KpiCard icon={Euro} label="Gem. inkomen" value={data.avg_income ? `€ ${fmt(data.avg_income * 1000)}` : "—"} sub="per inkomensontvanger" />
                <KpiCard icon={Building2} label="Woningen" value={fmt(data.housing_stock)} />
                <KpiCard icon={MapPin} label="Oppervlakte" value={data.area_km2 ? `${data.area_km2} km²` : "—"} />
                <KpiCard icon={TrendingUp} label="Bevolkingsdichtheid" value={data.population_density ? `${fmt(data.population_density)}/km²` : "—"} />
                <KpiCard icon={Baby} label="Huishoudgrootte" value={data.avg_household_size ? data.avg_household_size.toFixed(2) : "—"} sub="personen gemiddeld" />
                <KpiCard icon={Home} label="Gem. WOZ-waarde" value={data.avg_house_value ? `€ ${fmt(data.avg_house_value * 1000)}` : "—"} />
              </div>

              {/* Leeftijdsopbouw */}
              {ageGroups.some((a) => a.value > 0) && (
                <Card>
                  <CardHeader><CardTitle>Leeftijdsopbouw</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex w-full h-8 rounded-md overflow-hidden mb-4">
                      {ageGroups.map((a) => (
                        <div key={a.label} className={a.color} style={{ width: `${(a.value / ageTotal) * 100}%` }} title={`${a.label}: ${fmt(a.value)}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      {ageGroups.map((a) => (
                        <div key={a.label} className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-sm ${a.color}`} />
                          <span className="flex-1">{a.label}</span>
                          <span className="font-medium">{((a.value / ageTotal) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Geslachtsverdeling */}
              {(data.men || data.women) && (
                <Card>
                  <CardHeader><CardTitle>Geslachtsverdeling</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-1 text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <p className="text-3xl font-bold text-blue-600">{fmt(data.men)}</p>
                        <p className="text-sm text-muted-foreground">Mannen ({((data.men || 0) / totalPop * 100).toFixed(1)}%)</p>
                      </div>
                      <div className="flex-1 text-center p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20">
                        <p className="text-3xl font-bold text-rose-600">{fmt(data.women)}</p>
                        <p className="text-sm text-muted-foreground">Vrouwen ({((data.women || 0) / totalPop * 100).toFixed(1)}%)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CTA naar huuraanbod */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-6 flex flex-col md:flex-row items-center gap-4 md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Op zoek naar een woning in {cityName}?</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {propertyCount > 0 ? `${propertyCount} actieve woningen` : "Bekijk actueel aanbod en huurzones"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild><Link to={`/huren/${city}`}>Bekijk huurwoningen</Link></Button>
                    <Button asChild variant="outline"><Link to={`/markt/${city}`}>Huurprijzen</Link></Button>
                  </div>
                </CardContent>
              </Card>

              <section className="prose prose-sm max-w-none dark:prose-invert mt-12">
                <h2>Over deze cijfers</h2>
                <p>
                  Alle gegevens op deze pagina komen uit de openbare dataset <em>Regionale kerncijfers Nederland</em> (85984NED) van het Centraal Bureau voor de Statistiek (CBS). Deze cijfers worden jaarlijks bijgewerkt en geven een betrouwbaar beeld van de gemeente {cityName}.
                </p>
                <h2>Wat betekenen deze getallen voor jou?</h2>
                <ul>
                  <li><strong>Inkomen & WOZ-waarde</strong>: indicatie van de prijsklasse die past bij de gemeente.</li>
                  <li><strong>Leeftijdsopbouw</strong>: handig om te checken of de buurt past bij jouw levensfase (studenten, gezinnen, 65+).</li>
                  <li><strong>Bevolkingsdichtheid</strong>: stedelijk of landelijk karakter.</li>
                  <li><strong>Huishoudgrootte</strong>: aandeel singles vs gezinnen.</li>
                </ul>
                <p>
                  Bekijk ook <Link to={`/markt/${city}`}>huurprijs-ontwikkeling in {cityName}</Link> en de <Link to={`/stadsgids/${city}`}>stadsgids</Link> met praktische tips.
                </p>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
