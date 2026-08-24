import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/properties/PropertyCard";
import EnergyCompareTeaser from "@/components/energy/EnergyCompareTeaser";
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  Train,
  Home,
  Zap,
  Wifi,
  ClipboardList,
} from "lucide-react";
import { cityToSlug, citySlugToName, cityPath } from "@/lib/cities";

const formatEuro = (n: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(n);

interface CityStats {
  avgRent: number;
  count: number;
  cheapest: number;
}

const calcStats = (rows: { price: number; listing_type: string }[] | undefined): CityStats => {
  if (!rows || rows.length === 0) return { avgRent: 0, count: 0, cheapest: 0 };
  const huur = rows.filter((r) => r.listing_type === "huur" && r.price > 0);
  if (huur.length === 0) return { avgRent: 0, count: 0, cheapest: 0 };
  const sum = huur.reduce((a, r) => a + r.price, 0);
  return {
    avgRent: Math.round(sum / huur.length),
    count: huur.length,
    cheapest: Math.min(...huur.map((r) => r.price)),
  };
};

const VerhuizenVanNaar = () => {
  const { from: slugFrom, to: slugTo } = useParams<{ from: string; to: string }>();
  if (!slugFrom || !slugTo) return <Navigate to="/" replace />;
  if (slugFrom === slugTo) return <Navigate to={cityPath(citySlugToName(slugFrom))} replace />;

  const cityFrom = citySlugToName(slugFrom);
  const cityTo = citySlugToName(slugTo);

  const { data: statsFromRows, isLoading: l1 } = useQuery({
    queryKey: ["verhuizen-stats", slugFrom],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("price, listing_type")
        .eq("status", "actief")
        .ilike("city", `%${cityFrom}%`);
      return data || [];
    },
  });

  const { data: statsToRows, isLoading: l2 } = useQuery({
    queryKey: ["verhuizen-stats", slugTo],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("price, listing_type")
        .eq("status", "actief")
        .ilike("city", `%${cityTo}%`);
      return data || [];
    },
  });

  const { data: topListings, isLoading: l3 } = useQuery({
    queryKey: ["verhuizen-listings", slugTo],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "actief")
        .eq("listing_type", "huur")
        .ilike("city", `%${cityTo}%`)
        .order("feed_priority", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const statsFrom = useMemo(() => calcStats(statsFromRows), [statsFromRows]);
  const statsTo = useMemo(() => calcStats(statsToRows), [statsToRows]);

  const priceDiff = statsTo.avgRent && statsFrom.avgRent ? statsTo.avgRent - statsFrom.avgRent : 0;
  const priceDiffPct =
    statsFrom.avgRent > 0 ? Math.round((priceDiff / statsFrom.avgRent) * 100) : 0;
  const isCheaper = priceDiff < 0;

  const seoTitle = `Verhuizen van ${cityFrom} naar ${cityTo}: woningen, huurprijzen en checklist`;
  const seoDesc = `Alles over verhuizen van ${cityFrom} naar ${cityTo}. Vergelijk huurprijzen, bekijk het actuele woningaanbod en regel energie, internet en verzekering op tijd.`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        canonical={`/verhuizen/${slugFrom}/${slugTo}`}
      />
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <Breadcrumbs
            items={[
              { label: "Verhuizen", href: "/verhuischecklist" },
              { label: `${cityFrom} naar ${cityTo}` },
            ]}
          />
        </div>

        {/* Hero */}
        <section className="border-y-2 border-foreground bg-secondary">
          <div className="container py-10 md:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
              Verhuisgids
            </p>
            <h1 className="font-display mt-3 text-3xl lowercase leading-[1.05] text-foreground md:text-5xl">
              verhuizen van {cityFrom.toLowerCase()} naar {cityTo.toLowerCase()}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-foreground/70 md:text-lg">
              Bekijk wat huren in {cityTo} kost, vergelijk met {cityFrom}, en regel meteen energie,
              internet en de complete verhuischecklist.
            </p>

            {/* Comparison stats */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 border-foreground/10">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> Gemiddelde huur {cityFrom}
                  </div>
                  <p className="font-display mt-2 text-3xl font-bold">
                    {l1 ? <Skeleton className="h-9 w-32" /> : formatEuro(statsFrom.avgRent)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {statsFrom.count} actieve huurwoningen
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/40 bg-accent/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                    <MapPin className="h-3.5 w-3.5" /> Gemiddelde huur {cityTo}
                  </div>
                  <p className="font-display mt-2 text-3xl font-bold">
                    {l2 ? <Skeleton className="h-9 w-32" /> : formatEuro(statsTo.avgRent)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {statsTo.count} actieve huurwoningen
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-foreground bg-foreground text-background">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-background/70">
                    {isCheaper ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingUp className="h-3.5 w-3.5" />
                    )}
                    Prijsverschil
                  </div>
                  <p className="font-display mt-2 text-3xl font-bold">
                    {l1 || l2 ? (
                      <Skeleton className="h-9 w-32 bg-background/20" />
                    ) : statsFrom.avgRent && statsTo.avgRent ? (
                      `${isCheaper ? "−" : "+"}${formatEuro(Math.abs(priceDiff))}`
                    ) : (
                      "—"
                    )}
                  </p>
                  <p className="mt-1 text-xs text-background/70">
                    {statsFrom.avgRent && statsTo.avgRent
                      ? `${isCheaper ? "Goedkoper" : "Duurder"} (${Math.abs(priceDiffPct)}%) dan ${cityFrom}`
                      : "Onvoldoende data"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Intro narrative */}
        <section className="border-b py-10 md:py-14">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4 text-base leading-relaxed text-muted-foreground">
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  Wat je moet weten over de overstap
                </h2>
                <p>
                  Een verhuizing van <strong>{cityFrom}</strong> naar <strong>{cityTo}</strong> betekent
                  meer dan dozen sjouwen. De huurmarkt, woonstijl en voorzieningen verschillen per stad.
                  {statsFrom.avgRent > 0 && statsTo.avgRent > 0 && (
                    <>
                      {" "}Op basis van actuele data huur je in {cityTo} gemiddeld voor{" "}
                      {formatEuro(statsTo.avgRent)} per maand, tegenover {formatEuro(statsFrom.avgRent)}{" "}
                      in {cityFrom}. Dat is {isCheaper ? "een besparing" : "een meerprijs"} van ongeveer{" "}
                      {formatEuro(Math.abs(priceDiff))} per maand.
                    </>
                  )}
                </p>
                <p>
                  Goedkoopste actuele huurwoning in {cityTo}:{" "}
                  <strong>{statsTo.cheapest > 0 ? formatEuro(statsTo.cheapest) : "—"}</strong>. Wil je
                  meer rendement uit je verhuizing halen? Sluit een nieuw energiecontract af op je
                  nieuwe adres en je bespaart al snel een paar honderd euro per jaar bovenop het
                  verschil in huur.
                </p>
              </div>

              <Card className="border-2 border-foreground/10">
                <CardContent className="space-y-3 p-5">
                  <h3 className="font-display text-lg font-bold">Quick-jump</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link to={cityPath(cityTo)} className="flex items-center gap-1.5 text-accent hover:underline">
                        <Home className="h-4 w-4" /> Alle woningen in {cityTo}
                      </Link>
                    </li>
                    <li>
                      <Link to={`/markt/${slugTo}`} className="flex items-center gap-1.5 text-accent hover:underline">
                        <TrendingUp className="h-4 w-4" /> Huurprijsmonitor {cityTo}
                      </Link>
                    </li>
                    <li>
                      <Link to="/verhuischecklist" className="flex items-center gap-1.5 text-accent hover:underline">
                        <ClipboardList className="h-4 w-4" /> Verhuischecklist
                      </Link>
                    </li>
                    <li>
                      <Link to="/energie" className="flex items-center gap-1.5 text-accent hover:underline">
                        <Zap className="h-4 w-4" /> Energie vergelijken
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Energy CTA */}
        <section className="border-b py-10">
          <div className="container">
            <EnergyCompareTeaser context={cityTo} />
          </div>
        </section>

        {/* Top listings in destination */}
        <section className="border-b py-10 md:py-14">
          <div className="container">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
                  Aanbod
                </p>
                <h2 className="font-display mt-2 text-2xl font-bold md:text-3xl">
                  Nieuwste huurwoningen in {cityTo}
                </h2>
              </div>
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link to={cityPath(cityTo)}>
                  Bekijk alles <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {l3 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : topListings && topListings.length > 0 ? (
              <div className="flex flex-col gap-5">
                {topListings.map((p) => (
                  <PropertyCard key={p.id} property={p as any} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Op dit moment geen actief aanbod in {cityTo}. Zet een gratis melding aan om als eerste op
                de hoogte te zijn.
              </p>
            )}
          </div>
        </section>

        {/* Practical regel-blok with Daisycon CTAs */}
        <section className="border-b py-10 md:py-14">
          <div className="container">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Wat je nu al kunt regelen
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Drie dingen die je het meest geld besparen wanneer je naar {cityTo} verhuist.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "Energiecontract",
                  text: `Sluit een vast tarief af op je nieuwe adres in ${cityTo}. Gemiddeld € 380 besparing per jaar.`,
                  cta: "Vergelijk energie",
                },
                {
                  icon: Wifi,
                  title: "Internet en TV",
                  text: `Check welke providers op de postcode in ${cityTo} leveren en pak de welkomstkorting mee.`,
                  cta: "Vergelijk providers",
                },
                {
                  icon: ClipboardList,
                  title: "Verhuischecklist",
                  text: "Houd alle stappen bij vanaf opzeggen tot sleuteloverdracht. Voortgang wordt opgeslagen.",
                  cta: "Open checklist",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Card key={i} className="border-2 border-foreground/10 hover:border-accent/40 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display mt-4 text-lg font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                      <Button asChild variant="link" className="mt-3 h-auto p-0 text-accent">
                        <Link to={i === 2 ? "/verhuischecklist" : "/energie"}>
                          {item.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 md:py-14">
          <div className="container">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Veelgestelde vragen</h2>
            <div className="mt-6 space-y-3">
              {[
                {
                  q: `Is huren in ${cityTo} duurder dan in ${cityFrom}?`,
                  a:
                    statsFrom.avgRent && statsTo.avgRent
                      ? `De gemiddelde huurprijs in ${cityTo} is ${formatEuro(statsTo.avgRent)} per maand, tegenover ${formatEuro(statsFrom.avgRent)} in ${cityFrom}. Dat is ${isCheaper ? "goedkoper" : "duurder"} (${Math.abs(priceDiffPct)}%).`
                      : `We hebben op dit moment onvoldoende data om beide steden goed te vergelijken.`,
                },
                {
                  q: "Wanneer moet ik mijn energiecontract regelen?",
                  a: "Idealiter 4 weken voor je verhuizing. Sluit een vast contract af op je nieuwe adres en geef bij de sleuteloverdracht de meterstanden door, dan voorkom je dat je terugvalt op het dure standaard variabel tarief van de huidige leverancier.",
                },
                {
                  q: "Moet ik mijn adres bij de gemeente doorgeven?",
                  a: "Ja, binnen vijf dagen na je verhuizing. Dat kan online via de website van de gemeente waar je gaat wonen, met je DigiD.",
                },
              ].map((item, i) => (
                <details key={i} className="group rounded-xl border-2 border-foreground/10 bg-card">
                  <summary className="cursor-pointer list-none p-5 font-display text-base font-semibold">
                    {item.q}
                  </summary>
                  <div className="border-t px-5 pb-5 pt-3 text-sm text-muted-foreground">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VerhuizenVanNaar;
