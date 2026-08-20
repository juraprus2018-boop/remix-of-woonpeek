import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L as Link } from "@/components/LocalizedLink";
import {
  ArrowRight,
  Search,
  Bell,
  Building2,
  Home,
  DoorOpen,
  BedDouble,
  MapPin,
  ShieldCheck,
  Sparkles,
  Heart,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFeaturedProperties } from "@/hooks/useProperties";
import { useHomeStats } from "@/hooks/useHomeStats";
import { useNewTodayCount } from "@/hooks/useNewTodayCount";
import { Skeleton } from "@/components/ui/skeleton";
import EnergyCompareTeaser from "@/components/energy/EnergyCompareTeaser";
import { cityToSlug } from "@/lib/cities";
import { BRAND_NAME, CANONICAL_URL, SUPPORT_EMAIL } from "@/lib/brand";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";


const useTopHuurCities = () =>
  useQuery({
    queryKey: ["top-huur-cities-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("city")
        .eq("listing_type", "huur")
        .eq("status", "actief");
      if (error) throw error;
      const counts = new Map<string, number>();
      (data ?? []).forEach((r: { city: string | null }) => {
        if (!r.city) return;
        counts.set(r.city, (counts.get(r.city) ?? 0) + 1);
      });
      return Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
    staleTime: 5 * 60 * 1000,
  });

const TYPES_DEF = [
  { key: "rentals" as const, href: "/huurwoningen", icon: Home },
  { key: "apartments" as const, href: "/appartementen", icon: Building2 },
  { key: "rooms" as const, href: "/kamers", icon: DoorOpen },
  { key: "studios" as const, href: "/studios", icon: BedDouble },
  { key: "houses" as const, href: "/huizen", icon: Home },
];

const Index = () => {
  const { t } = useTranslation();
  const { data: properties, isLoading } = useFeaturedProperties();
  const { data: homeStats } = useHomeStats();
  const { data: newToday } = useNewTodayCount();
  const { data: popularCities = [] } = useTopHuurCities();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("locatie", query.trim());
    if (type) params.set("type", type);
    if (maxPrice) params.set("max", maxPrice);
    navigate(`/zoeken${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const featured = properties?.slice(0, 12) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("meta.homeTitle")}
        description={t("meta.homeDesc")}
        canonical="/"
      />

      {/* Trust bar */}
      <div className="hidden border-b border-border bg-sun-tint md:block">
        <div className="container flex h-10 items-center justify-between text-xs font-medium text-foreground/80">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
              {t("trustBar.free")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
              {t("trustBar.fresh")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
              {t("trustBar.nl")}
            </span>
          </div>
          <span className="text-foreground/60">info@woonaanbod-nl.nl</span>
        </div>
      </div>

      <Header />

      {/* COMPACTE ZOEKBALK */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container py-5 md:py-7">
          <h1 className="sr-only">{t("meta.homeTitle")}</h1>
          <form
            onSubmit={onSearch}
            className="mx-auto grid max-w-5xl gap-2 md:grid-cols-[1fr_auto_auto_auto]"
          >
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("hero.searchPlaceholder")}
                className="h-12 rounded-xl border-border bg-card pl-11 pr-4 text-base"
                aria-label={t("hero.searchPlaceholder")}
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-12 rounded-xl border border-input bg-card px-4 text-sm text-foreground"
              aria-label={t("hero.type")}
            >
              <option value="">{t("hero.typeAll")}</option>
              <option value="appartement">{t("hero.typeApartment")}</option>
              <option value="huis">{t("hero.typeHouse")}</option>
              <option value="kamer">{t("hero.typeRoom")}</option>
              <option value="studio">{t("hero.typeStudio")}</option>
            </select>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-12 rounded-xl border border-input bg-card px-4 text-sm text-foreground"
              aria-label={t("hero.maxPrice")}
            >
              <option value="">{t("hero.maxPrice")}</option>
              <option value="750">€ 750</option>
              <option value="1000">€ 1.000</option>
              <option value="1500">€ 1.500</option>
              <option value="2000">€ 2.000</option>
              <option value="3000">€ 3.000</option>
            </select>
            <Button
              type="submit"
              className="h-12 gap-2 rounded-xl px-7 text-sm font-bold"
            >
              <Search className="h-4 w-4" />
              {t("hero.searchBtn")}
            </Button>
          </form>

          <div className="mx-auto mt-3 flex max-w-5xl flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold">{t("hero.popular")}:</span>
            {popularCities.slice(0, 6).map((c) => (
              <Link
                key={c.name}
                to={`/huren/${cityToSlug(c.name)}`}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
            <span className="ml-auto hidden items-center gap-2 text-xs font-semibold sm:inline-flex">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {homeStats?.properties_count !== undefined
                ? `${homeStats.properties_count.toLocaleString("nl-NL")} woningen`
                : "… woningen"}
              {newToday !== undefined ? ` · +${newToday} nieuw vandaag` : ""}
            </span>
          </div>
        </div>
      </section>



      {/* NIEUW AANBOD */}
      <section className="pb-14 pt-8 md:pb-16 md:pt-10">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                Nieuwste huurwoningen
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Direct het laatste aanbod, elke dag bijgewerkt.
              </p>
            </div>

            <Link
              to="/vandaag"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-foreground hover:text-sun md:inline-flex"
            >
              Alle nieuwe woningen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-2xl" />
                ))
              : featured.map((p: any) => (
                  <PropertyCard key={p.id} property={p} />
                ))}

          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/vandaag"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground"
            >
              Alle nieuwe woningen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOE WERKT HET */}
      <section className="bg-sun-tint py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest text-background">
              Zo werkt het
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Binnen drie stappen in je nieuwe huis.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Zoek slim",
                d: "Pak je stad, prik je budget, klaar. Geen onnodige filters waar je gek van wordt.",
                icon: Search,
              },
              {
                n: "02",
                t: "Zet je alert aan",
                d: "Plop in je mail zodra er iets binnenkomt dat klopt. Geen spam, eerlijk.",
                icon: Bell,
              },
              {
                n: "03",
                t: "Wees er bij",
                d: "Eén klik door naar de aanbieder en reageren. Wie eerst komt, eerst maalt.",
                icon: Heart,
              },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-foreground/10 bg-card p-7 shadow-sm"
              >
                <div className="absolute -top-4 left-7 rounded-full bg-sun px-3 py-1 text-xs font-extrabold tracking-wider text-foreground shadow">
                  {s.n}
                </div>
                <s.icon className="mt-3 h-8 w-8 text-foreground" />
                <h3 className="mt-4 text-xl font-extrabold text-foreground">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAIRE STEDEN */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Populaire steden
              </h2>
              <p className="mt-2 text-muted-foreground">
                Kijk wat er nu te huur staat in de drukste steden van NL.
              </p>
            </div>
            <Link
              to="/plekken"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-foreground hover:text-sun md:inline-flex"
            >
              Alle steden
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {popularCities.map((c) => (
              <Link
                key={c.name}
                to={`/huren/${cityToSlug(c.name)}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-sun hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Te huur
                    </div>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                      {c.name}
                    </h3>
                    <div className="mt-2 text-sm font-semibold text-foreground/70">
                      {c.count} {c.count === 1 ? "huurwoning" : "huurwoningen"}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-tint transition-colors group-hover:bg-sun">
                    <ArrowRight className="h-4 w-4 text-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ENERGIE TEASER — affiliate */}
      <section className="py-10">
        <div className="container">
          <EnergyCompareTeaser />
        </div>
      </section>

      {/* ALERT CTA */}
      <section className="py-16 md:py-20">

        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-14 text-background md:px-14 md:py-20">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-sun/40 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-sun/30 blur-3xl" aria-hidden />
            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Bell className="h-3.5 w-3.5" />
                  Gratis alert
                </span>
                <h2 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Wees gewoon de eerste.
                </h2>
                <p className="mt-4 max-w-md text-background/80">
                  Wij mailen je zodra er een huurwoning binnenkomt die past bij jouw stad en budget.
                  Geen spam, één klik om eruit.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link to="/woonradar" className="w-full lg:w-auto">
                  <Button
                    size="lg"
                    className="h-14 w-full gap-2 rounded-xl bg-sun px-8 text-base font-extrabold text-foreground shadow-lg hover:bg-sun/90 lg:w-auto"
                  >
                    Stel mijn alert in
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <p className="flex items-center gap-2 text-xs text-background/70">
                  <ShieldCheck className="h-4 w-4 text-sun" />
                  100% gratis. Geen account nodig.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

function HeroIllustration() {
  return (
    <svg viewBox="0 0 360 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--sun-tint))" />
          <stop offset="1" stopColor="hsl(var(--sun-soft))" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="360" height="360" rx="40" fill="url(#sky)" />
      {/* Sun */}
      <circle cx="280" cy="90" r="38" fill="hsl(var(--sun))" />
      {/* Ground */}
      <rect x="0" y="260" width="360" height="100" fill="hsl(var(--foreground))" opacity="0.06" />
      {/* House */}
      <g>
        <polygon points="180,90 90,170 270,170" fill="hsl(var(--foreground))" />
        <rect x="100" y="170" width="160" height="110" fill="hsl(var(--sun))" />
        <rect x="120" y="195" width="40" height="40" rx="4" fill="hsl(var(--foreground))" />
        <rect x="200" y="195" width="40" height="40" rx="4" fill="hsl(var(--foreground))" />
        <rect x="170" y="225" width="30" height="55" rx="3" fill="hsl(var(--foreground))" />
        <rect x="182" y="248" width="3" height="6" fill="hsl(var(--sun))" />
      </g>
      {/* Tree */}
      <g>
        <rect x="50" y="220" width="10" height="50" fill="hsl(var(--foreground))" opacity="0.7" />
        <circle cx="55" cy="215" r="28" fill="hsl(var(--foreground))" opacity="0.15" />
        <circle cx="55" cy="215" r="22" fill="hsl(var(--foreground))" opacity="0.25" />
      </g>
      {/* Clouds */}
      <g fill="hsl(var(--background))" opacity="0.9">
        <ellipse cx="80" cy="80" rx="28" ry="10" />
        <ellipse cx="100" cy="75" rx="20" ry="8" />
      </g>
    </svg>
  );
}

export default Index;
