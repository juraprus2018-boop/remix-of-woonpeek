import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCityRentalStats } from "@/hooks/useCityRentalStats";
import { useMarketStats } from "@/hooks/useMarketStats";
import { useProperties } from "@/hooks/useProperties";
import { getStockPropertyImage } from "@/lib/stockImages";
import { Quote, Newspaper, TrendingUp, Home, Ruler, Sparkles, MapPin } from "lucide-react";

const eur = (v: number | null | undefined) => (v == null ? "n.b." : `€ ${Math.round(v).toLocaleString("nl-NL")}`);
const TYPE_LABEL: Record<string, string> = { appartement: "Appartement", huis: "Eengezinswoning", studio: "Studio", kamer: "Kamer", vakantiehuis: "Vakantiewoning" };

interface Stats { count?: number; median_rent?: number; median_ppm2?: number; new_7d?: number; new_30d?: number; m2_sample?: number }

export function PressKpis({ stats }: { stats?: Stats }) {
  if (!stats?.count) return null;
  const kpis = [
    { icon: Home, label: "Actieve huurwoningen", value: stats.count.toLocaleString("nl-NL") },
    { icon: TrendingUp, label: "Mediane vraaghuur", value: `${eur(stats.median_rent)} per maand` },
    { icon: Ruler, label: "Mediane huur per m²", value: stats.median_ppm2 ? `€ ${stats.median_ppm2.toLocaleString("nl-NL")}` : "n.b." },
    { icon: Sparkles, label: "Nieuw in 7 dagen", value: (stats.new_7d ?? 0).toLocaleString("nl-NL"), sub: stats.new_30d ? `${stats.new_30d.toLocaleString("nl-NL")} in 30 dagen` : undefined },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => (
        <Card key={k.label} className="border-primary/15">
          <CardContent className="p-4">
            <k.icon className="h-5 w-5 text-accent" />
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">{k.value}</p>
            {k.sub && <p className="text-xs text-muted-foreground">{k.sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PressCityDeepDive({ city, stats }: { city: string; stats?: Stats }) {
  const { data: live, isLoading } = useCityRentalStats(city);
  const { data: market } = useMarketStats();
  const { data: listings } = useProperties({ city, listingType: "huur", pageSize: 12 });
  const photos = (listings?.properties || []).filter((p) => p.images?.[0]).slice(0, 6);
  const nat = market?.national;
  const median = stats?.median_rent ?? live?.medianPrice ?? null;
  const ppm2 = stats?.median_ppm2 ?? live?.medianPerM2 ?? null;
  const diff = median && nat?.rent_median ? Math.round(((median - nat.rent_median) / nat.rent_median) * 100) : null;
  const rankRow = market?.rent_per_m2_cities?.findIndex((c) => c.city.toLowerCase() === city.toLowerCase());

  return (
    <div className="space-y-8">
      {photos.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Zo ziet het aanbod in {city} eruit</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {photos.map((p, i) => (
              <Link key={p.id} to={`/huurwoningen/${city.toLowerCase().replace(/\s+/g, "-")}`} className={`group relative aspect-[4/3] overflow-hidden rounded-lg ${i === 0 ? "col-span-2 md:row-span-2 md:aspect-auto" : ""}`}>
                <img src={p.images?.[0] || getStockPropertyImage(p.id)} alt={`Huurwoning in ${city}, ${p.property_type || "woning"}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 rounded bg-background/90 px-2 py-0.5 text-xs font-semibold">{eur(p.price)} per maand</span>
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Foto's: actuele advertenties op Woonaanbod NL in {city}.</p>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/70">{city} vs. Nederland</p>
            <p className="mt-2 font-display text-4xl font-bold">{diff == null ? "n.b." : `${diff > 0 ? "+" : ""}${diff}%`}</p>
            <p className="mt-2 text-sm text-primary-foreground/85">
              Mediane vraaghuur {eur(median)} in {city} tegenover {eur(nat?.rent_median)} landelijk.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6 text-sm">
            <p className="font-semibold">Vergelijking per m²</p>
            <p className="text-muted-foreground">{city}: <strong className="text-foreground">{ppm2 ? `€ ${Number(ppm2).toFixed(2).replace(".", ",")}` : "n.b."}</strong></p>
            <p className="text-muted-foreground">Nederland: <strong className="text-foreground">{nat?.rent_per_m2 ? `€ ${nat.rent_per_m2.toFixed(2).replace(".", ",")}` : "n.b."}</strong></p>
            {rankRow != null && rankRow >= 0 && <p className="text-muted-foreground">Plaats <strong className="text-foreground">{rankRow + 1}</strong> op onze ranglijst duurste steden per m².</p>}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Huur per woningtype</h2>
          <div className="overflow-hidden rounded-xl border bg-card">
            {isLoading ? <Skeleton className="h-40 w-full" /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead className="text-right">Aanbod</TableHead><TableHead className="text-right">Mediane huur</TableHead></TableRow></TableHeader>
                <TableBody>{(live?.types || []).map((t) => (
                  <TableRow key={t.type}><TableCell>{TYPE_LABEL[t.type] || t.type}</TableCell><TableCell className="text-right tabular-nums">{t.count}</TableCell><TableCell className="text-right tabular-nums">{eur(t.medianPrice)}</TableCell></TableRow>
                ))}</TableBody>
              </Table>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Wijken met het meeste aanbod</h2>
          <div className="overflow-hidden rounded-xl border bg-card">
            {isLoading ? <Skeleton className="h-40 w-full" /> : (live?.neighborhoods?.length ?? 0) === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Te weinig wijkgegevens voor een betrouwbare uitsplitsing.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Wijk</TableHead><TableHead className="text-right">Aanbod</TableHead><TableHead className="text-right">Mediane huur</TableHead></TableRow></TableHeader>
                <TableBody>{live!.neighborhoods.map((n) => (
                  <TableRow key={n.name}><TableCell><MapPin className="mr-1 inline h-3 w-3 text-accent" />{n.name}</TableCell><TableCell className="text-right tabular-nums">{n.count}</TableCell><TableCell className="text-right tabular-nums">{eur(n.medianPrice)}</TableCell></TableRow>
                ))}</TableBody>
              </Table>
            )}
          </div>
        </div>
      </section>

      {live && live.total > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Wat is er te huur per budget?</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {live.budgets.map((b) => {
              const pct = Math.round((b.count / live.priceSample) * 100);
              return (
                <Card key={b.max}><CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Tot € {b.max.toLocaleString("nl-NL")} per maand</p>
                  <p className="mt-1 font-display text-2xl font-bold">{pct}%</p>
                  <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} /></div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.count.toLocaleString("nl-NL")} woningen</p>
                </CardContent></Card>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Live berekend uit het actuele aanbod; kan afwijken van de vaste cijfers op de peildatum.</p>
        </section>
      )}
    </div>
  );
}

export function PressQuote({ city, median }: { city?: string | null; median?: number }) {
  const where = city ? `in ${city}` : "in Nederland";
  return (
    <figure className="rounded-xl border-l-4 border-accent bg-card p-6">
      <Quote className="h-6 w-6 text-accent" />
      <blockquote className="mt-2 font-display text-lg font-semibold leading-snug">
        "Wie {where} zoekt, ziet vooral een grote spreiding in prijzen. {median ? `Met een mediane vraaghuur van ${eur(median)} per maand ` : ""}loont het om breed te zoeken en snel te reageren op nieuw aanbod."
      </blockquote>
      <figcaption className="mt-3 text-sm text-muted-foreground">Redactie Woonaanbod NL, data-analyse huurmarkt</figcaption>
    </figure>
  );
}

export function PressStoryAngles({ city }: { city?: string | null }) {
  const c = city || "Nederland";
  const angles = [
    `Hoeveel huurwoningen in ${c} zijn nog betaalbaar voor starters?`,
    `In welke wijken van ${c} is het meeste aanbod?`,
    `Hoe verhoudt ${c} zich tot de rest van Nederland?`,
    `Hoe snel komt er nieuw huuraanbod bij in ${c}?`,
  ];
  return (
    <div className="rounded-xl border bg-card p-5 text-sm">
      <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold"><Newspaper className="h-5 w-5 text-accent" /> Invalshoeken voor media</h2>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">{angles.map((a) => <li key={a}>{a}</li>)}</ul>
      <p className="mt-3 text-muted-foreground">Vrij te gebruiken onder CC BY 4.0 met bronvermelding. Maatwerkcijfers op aanvraag.</p>
    </div>
  );
}
