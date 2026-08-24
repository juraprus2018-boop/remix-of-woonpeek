import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { MapPin, Home, Loader2, Search, TrendingUp, Building2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { cityPath } from "@/lib/cities";
import { paths, ROUTES } from "@/lib/routes";
import { useTranslation } from "react-i18next";

type CityCount = { city: string; count: number };

const useCityCounts = () =>
  useQuery({
    queryKey: ["city-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_city_counts");
      if (error) throw error;
      return (data ?? []).map((row: { city: string; count: number }) => ({
        city: row.city,
        count: Number(row.count),
      })) as CityCount[];
    },
  });

const Cities = () => {
  const { data: cities, isLoading } = useCityCounts();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const total = useMemo(
    () => (cities ?? []).reduce((sum, c) => sum + c.count, 0),
    [cities],
  );

  const top = useMemo(
    () => [...(cities ?? [])].sort((a, b) => b.count - a.count).slice(0, 8),
    [cities],
  );

  const grouped = useMemo(() => {
    const filtered = (cities ?? []).filter((c) =>
      c.city.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const map = new Map<string, CityCount[]>();
    for (const item of [...filtered].sort((a, b) => a.city.localeCompare(b.city, "nl"))) {
      const letter = item.city.charAt(0).toUpperCase();
      map.set(letter, [...(map.get(letter) ?? []), item]);
    }
    return [...map.entries()];
  }, [cities, query]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title={t("meta.citiesTitle")}
        description={t("meta.citiesDesc")}
        canonical={ROUTES.cities}
      />
      <Header />
      <main className="flex-1">
        {/* Intro */}
        <section className="border-b border-border bg-primary text-primary-foreground">
          <div className="container py-10 md:py-14">
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Woonaanbod per stad" }]}
            />
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold md:text-4xl lg:text-5xl">
              Woonaanbod per stad in Nederland
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
              Kies je stad en zie direct wat er te huur en te koop staat. We bundelen het
              aanbod van makelaars, verhuurders en woningcorporaties op één plek en werken
              de aantallen elke dag bij.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-primary-foreground/10 p-4">
                <p className="font-display text-2xl font-bold">
                  {isLoading ? "…" : cities?.length ?? 0}
                </p>
                <p className="text-sm text-primary-foreground/75">steden met aanbod</p>
              </div>
              <div className="rounded-2xl bg-primary-foreground/10 p-4">
                <p className="font-display text-2xl font-bold">
                  {isLoading ? "…" : total.toLocaleString("nl-NL")}
                </p>
                <p className="text-sm text-primary-foreground/75">woningen online</p>
              </div>
              <div className="rounded-2xl bg-primary-foreground/10 p-4">
                <p className="font-display text-2xl font-bold">Dagelijks</p>
                <p className="text-sm text-primary-foreground/75">nieuw aanbod toegevoegd</p>
              </div>
            </div>
          </div>
        </section>

        {/* Grootste steden */}
        <section className="container py-10 md:py-14">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Steden met het meeste aanbod
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Hier verandert het aanbod het snelst. Check deze steden vaker, of zet een
            gratis melding aan zodat je nieuwe woningen als eerste ziet.
          </p>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {top.map(({ city, count }) => (
                <div
                  key={city}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <Link to={cityPath(city)} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-semibold text-foreground">
                        {city}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Home className="h-3.5 w-3.5" />
                        {count} {count === 1 ? "woning" : "woningen"}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                      <Building2 className="h-5 w-5 text-primary" />
                    </span>
                  </Link>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <Link
                      to={paths.rent(city)}
                      className="rounded-full bg-muted px-3 py-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      Huren
                    </Link>
                    <Link
                      to={paths.buy(city)}
                      className="rounded-full bg-muted px-3 py-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      Kopen
                    </Link>
                    <Link
                      to={paths.rentMonitor(city)}
                      className="rounded-full bg-muted px-3 py-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      Huurprijzen
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Alle steden A-Z */}
        <section className="border-t border-border bg-muted/40 py-10 md:py-14">
          <div className="container">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Alle steden van A tot Z
                </h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Zoek je stad of dorp op naam. Staat jouw plaats er niet tussen? Dan is er
                  op dit moment geen actief aanbod, maar we tonen je woningen in de buurt.
                </p>
              </div>
              <div className="relative w-full md:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Zoek op plaatsnaam"
                  className="h-11 bg-background pl-9"
                  aria-label="Zoek op plaatsnaam"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : grouped.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                Geen plaats gevonden voor "{query}".
              </p>
            ) : (
              <div className="mt-8 space-y-8">
                {grouped.map(([letter, items]) => (
                  <div key={letter}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-primary-foreground">
                        {letter}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {items.map(({ city, count }) => (
                        <li key={city}>
                          <Link
                            to={cityPath(city)}
                            className="flex items-center justify-between gap-2 rounded-xl border border-transparent bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0 text-primary" />
                              <span className="truncate font-medium text-foreground">
                                {city}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {count}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Uitleg + interne links */}
        <section className="container py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-3 text-muted-foreground">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Hoe kies je de juiste stad?
              </h2>
              <p>
                In de Randstad is het aanbod het grootst, maar de concurrentie ook. Voor
                dezelfde huur vind je in steden als Tilburg, Arnhem, Enschede of Helmond
                vaak tientallen vierkante meters extra. Kijk daarom niet alleen naar de
                stad zelf, maar ook naar de plaatsen eromheen: een kwartier reistijd
                scheelt in de praktijk snel een paar honderd euro per maand.
              </p>
              <p>
                Per stad zie je het complete aanbod, de gemiddelde huurprijs per vierkante
                meter en de buurten waar de meeste woningen vrijkomen. Zo weet je vooraf of
                je budget realistisch is voordat je begint met reageren.
              </p>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Snel verder zoeken
              </h2>
              <p>
                Wil je liever filteren op woningtype of prijs? Gebruik dan een van deze
                ingangen. Elke pagina laat actueel aanbod zien en wordt dagelijks
                bijgewerkt.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { to: "/huurwoningen", label: "Huurwoningen" },
                  { to: "/koopwoningen", label: "Koopwoningen" },
                  { to: "/appartement-huren", label: "Appartementen" },
                  { to: "/huis-huren", label: "Huizen" },
                  { to: "/studio-huren", label: "Studio's" },
                  { to: "/kamer-huren", label: "Kamers" },
                  { to: ROUTES.map, label: "Op de kaart" },
                  { to: ROUTES.marketData, label: "Woningmarktcijfers" },
                ].map((link) => (
                  <Link key={link.to} to={link.to}>
                    <Button variant="outline" size="sm" className="gap-1">
                      {link.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cities;
