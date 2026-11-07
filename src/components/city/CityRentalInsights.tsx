import { ArrowRight, MapPin } from "lucide-react";
import { L } from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCityRentalStats } from "@/hooks/useCityRentalStats";
import { cityToSlug } from "@/lib/cities";
import { cityLocalContext } from "@/lib/cityLocalContext";

const euro = (n: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const labels: Record<string, string> = { appartement: "Appartementen", huis: "Huizen", studio: "Studio's", kamer: "Kamers", vakantiehuis: "Vakantiehuizen" };

export default function CityRentalInsights({ cityName }: { cityName: string }) {
  const slug = cityToSlug(cityName);
  const base = `/huurwoningen/${slug}`;
  const context = cityLocalContext[slug];
  const { data, isLoading, isError, refetch } = useCityRentalStats(cityName);
  return (
    <section className="border-y bg-muted/30 py-10" aria-label={`Huurdata en lokale informatie ${cityName}`}>
      <div className="container space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">Huren in {cityName}: prijzen en beschikbaar aanbod</h2>
          <Button asChild variant="outline"><L to={base}>Alle huurwoningen <ArrowRight className="ml-2 h-4 w-4" /></L></Button>
        </div>
        {isLoading && <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>}
        {isError && <div className="flex flex-wrap items-center gap-3"><p className="text-sm text-muted-foreground">De huurcijfers konden niet worden geladen.</p><Button variant="outline" size="sm" onClick={() => refetch()}>Opnieuw proberen</Button></div>}
        {data && data.total > 0 && <>
          <p className="text-sm text-muted-foreground">{data.total} actieve huuradvertenties. Gecontroleerd op {new Date(data.checkedAt).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" })} (Nederlandse tijd).</p>
          <dl className="grid gap-6 border-y py-5 sm:grid-cols-3">
            {data.medianPrice !== null && <div><dt className="text-sm text-muted-foreground">Mediane vraaghuur</dt><dd className="mt-2 font-display text-2xl font-semibold">{euro(data.medianPrice)} <span className="text-sm font-normal">per maand</span></dd><p className="mt-1 text-xs text-muted-foreground">Op basis van {data.priceSample} advertenties met een prijs</p></div>}
            {data.medianPerM2 !== null && <div><dt className="text-sm text-muted-foreground">Mediane vraaghuur per m²</dt><dd className="mt-2 font-display text-2xl font-semibold">{new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(data.medianPerM2)}</dd><p className="mt-1 text-xs text-muted-foreground">Per maand, {data.areaSample} advertenties met oppervlakte</p></div>}
            <div><dt className="text-sm text-muted-foreground">Nieuw toegevoegd in zeven dagen</dt><dd className="mt-2 font-display text-2xl font-semibold">{data.new7d}</dd><p className="mt-1 text-xs text-muted-foreground">Nu nog actief op Woonaanbod NL</p></div>
          </dl>
          <div>
            <h3 className="mb-3 font-display text-lg font-semibold">Beschikbare huurwoningen per budget</h3>
            <div className="grid gap-3 sm:grid-cols-3">{data.budgets.filter(b => b.count > 0).map(b => <L key={b.max} to={`${base}/onder-${b.max}`} className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-4 text-foreground hover:border-primary"><span><strong className="block">Tot {euro(b.max)} per maand</strong><span className="text-sm text-muted-foreground">{b.count} advertenties</span></span><ArrowRight className="h-4 w-4 shrink-0 text-primary" /></L>)}</div>
          </div>
          <div>
            <h3 className="mb-3 font-display text-lg font-semibold">Vergelijk woningtypes in {cityName}</h3>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-3 font-medium">Woningtype</th><th className="px-3 py-3 font-medium">Advertenties</th><th className="py-3 pl-3 font-medium">Mediane huur per maand</th></tr></thead><tbody>{data.types.map(type => <tr key={type.type} className="border-b"><td className="py-3 pr-3"><L className="text-primary underline underline-offset-4" to={type.type === "vakantiehuis" ? `/woning-zoeken?aanbod=huur&locatie=${encodeURIComponent(cityName)}&type=vakantiehuis` : `${base}/${type.type}`}>{labels[type.type]}</L></td><td className="px-3 py-3">{type.count}</td><td className="py-3 pl-3">{type.medianPrice !== null ? euro(type.medianPrice) : "Prijs niet bekend"}</td></tr>)}</tbody></table></div>
          </div>
          {data.neighborhoods.length > 0 && <div><h3 className="mb-3 font-display text-lg font-semibold">Buurten met huuradvertenties</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.neighborhoods.map(n => <L key={n.name} to={`/buurt/${slug}/${n.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`} className="rounded-lg border bg-card p-4 hover:border-primary"><span className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 shrink-0 text-primary" />{n.name}</span><span className="mt-2 block text-sm text-muted-foreground">{n.count} advertenties{n.medianPrice !== null && n.priceSample >= 2 ? `, mediaan ${euro(n.medianPrice)} per maand` : ""}</span></L>)}</div><p className="mt-2 text-xs text-muted-foreground">Buurtnamen komen van aanbieders; advertenties zonder buurtnaam staan niet in dit overzicht.</p></div>}
          <p className="text-sm leading-relaxed text-muted-foreground">Bron: actieve huuradvertenties in {cityName} op Woonaanbod NL, geen landelijke huurprijsindex. Kamers, studio's en andere woningtypes zijn samen meegenomen. De mediaan is de middelste vraagprijs. Advertenties zonder positieve prijs tellen niet mee voor prijsstatistieken; voor m² is ook een bekende positieve oppervlakte nodig. Dezelfde woning kan bij meerdere aanbieders staan. Dit zijn geen unieke woningen of bewezen verhuurprijzen. Servicekosten en contractvoorwaarden verschillen per advertentie.</p>
        </>}
        {data?.total === 0 && <p className="text-muted-foreground">Er is nu geen actief huuraanbod in {cityName}. Bekijk het stadsaanbod voor alternatieven in de omgeving.</p>}
        {context && <div className="space-y-3 border-t pt-6"><h3 className="font-display text-xl font-semibold">Lokale oriëntatie in {cityName}</h3><p className="leading-relaxed text-muted-foreground">{context.text}</p><a className="text-sm text-primary underline underline-offset-4" href={context.source} target="_blank" rel="noopener noreferrer">{context.label}</a></div>}
      </div>
    </section>
  );
}