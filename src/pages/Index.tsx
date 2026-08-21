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
  X,
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
import PropertyCard from "@/components/properties/PropertyCard";
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
  { key: "apartments" as const, href: "/appartement-huren", icon: Building2 },
  { key: "rooms" as const, href: "/kamer-huren", icon: DoorOpen },
  { key: "studios" as const, href: "/studio-huren", icon: BedDouble },
  { key: "houses" as const, href: "/huis-huren", icon: Home },
];

const Index = () => {
  const { t } = useTranslation();
  const { data: properties, isLoading } = useFeaturedProperties();
  const { data: homeStats } = useHomeStats();
  const { data: newToday } = useNewTodayCount();
  const { data: popularCities = [] } = useTopHuurCities();
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("locatie", query.trim());
    if (minPrice) params.set("min", minPrice);
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

      {/* ZOEKBALK */}
      <section className="relative overflow-hidden border-b border-border bg-primary">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-10 md:py-14">

          <h1 className="sr-only">{t("meta.homeTitle")}</h1>
          <form
            onSubmit={onSearch}
            className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-4 shadow-lg md:p-6"
          >
            <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:gap-0">
              {/* Locatie */}
              <div className="sm:col-span-2 lg:col-span-1 lg:pr-6">

                <label htmlFor="home-locatie" className="mb-1.5 block text-sm font-bold text-foreground">
                  {t("home.location")}
                </label>
                <div className="relative">
                  <Input
                    id="home-locatie"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("home.locationPlaceholder")}
                    className="h-12 rounded-xl border-border bg-secondary/50 pr-10 text-base"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label={t("home.clear")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Minimale prijs */}
              <div className="lg:border-l lg:border-border lg:px-6">
                <label htmlFor="home-min" className="mb-1.5 block text-sm font-bold text-foreground">
                  {t("home.minPrice")}
                </label>
                <select
                  id="home-min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground lg:border-0 lg:bg-transparent lg:px-0 lg:text-muted-foreground"

                >
                  <option value="">{t("home.noMinimum")}</option>
                  <option value="500">€ 500</option>
                  <option value="750">€ 750</option>
                  <option value="1000">€ 1.000</option>
                  <option value="1250">€ 1.250</option>
                  <option value="1500">€ 1.500</option>
                </select>
              </div>

              {/* Maximale prijs */}
              <div className="lg:px-6">
                <label htmlFor="home-max" className="mb-1.5 block text-sm font-bold text-foreground">
                  {t("home.maxPrice")}
                </label>
                <select
                  id="home-max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground lg:border-0 lg:bg-transparent lg:px-0 lg:text-muted-foreground"
                >
                  <option value="">{t("home.noMaximum")}</option>
                  <option value="750">€ 750</option>
                  <option value="1000">€ 1.000</option>
                  <option value="1500">€ 1.500</option>
                  <option value="2000">€ 2.000</option>
                  <option value="3000">€ 3.000</option>
                </select>
              </div>

              <Button
                type="submit"
                className="h-12 w-full gap-2 rounded-xl px-7 text-base font-bold sm:col-span-2 lg:col-span-1 lg:w-auto"
              >
                {t("home.searchBtn")}
                <Search className="h-4 w-4" />
              </Button>

            </div>
          </form>

          <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center gap-2 text-sm text-primary-foreground/80">
            <span className="font-semibold">{t("hero.popular")}:</span>
            {popularCities.slice(0, 6).map((c) => (
              <Link
                key={c.name}
                to={`/huurwoningen/${cityToSlug(c.name)}`}
                className="rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/20"
              >
                {c.name}
              </Link>
            ))}
            <span className="ml-auto hidden items-center gap-2 text-xs font-semibold text-primary-foreground/90 sm:inline-flex">
              <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />

              {homeStats?.properties_count !== undefined
                ? t("home.homesTotal", { count: homeStats.properties_count })
                : t("home.homesTotal", { count: "…" })}
              {newToday !== undefined ? ` · ${t("home.newToday", { count: newToday })}` : ""}
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
                {t("home.newestTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("home.newestSub")}
              </p>
            </div>

            <Link
              to="/vandaag"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-foreground hover:text-sun md:inline-flex"
            >
              {t("home.allNew")}
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
              {t("home.allNew")}
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
              {t("home.stepsBadge")}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {t("home.stepsTitle")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: t("home.step1Title"),
                d: t("home.step1Desc"),
                icon: Search,
              },
              {
                n: "02",
                t: t("home.step2Title"),
                d: t("home.step2Desc"),
                icon: Bell,
              },
              {
                n: "03",
                t: t("home.step3Title"),
                d: t("home.step3Desc"),
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
                {t("home.citiesTitle")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("home.citiesSub")}
              </p>
            </div>
            <Link
              to="/plekken"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-foreground hover:text-sun md:inline-flex"
            >
              {t("home.allCities")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {popularCities.map((c) => (
              <Link
                key={c.name}
                to={`/huurwoningen/${cityToSlug(c.name)}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-sun hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("home.forRent")}
                    </div>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                      {c.name}
                    </h3>
                    <div className="mt-2 text-sm font-semibold text-foreground/70">
                      {c.count === 1 ? t("home.rentalCount", { count: c.count }) : t("home.rentalsCount", { count: c.count })}
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
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-primary-foreground md:px-14 md:py-20">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-foreground/15 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" aria-hidden />
            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  <Bell className="h-3.5 w-3.5" />
                  {t("home.alertBadge")}
                </span>
                <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-primary-foreground md:text-5xl">
                  {t("home.alertTitle")}
                </h2>
                <p className="mt-4 max-w-md text-primary-foreground/80">
                  {t("home.alertSub")}
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link to="/woonradar" className="w-full lg:w-auto">
                  <Button
                    size="lg"
                    className="h-14 w-full gap-2 rounded-xl bg-primary-foreground px-8 text-base font-extrabold text-primary shadow-lg hover:bg-primary-foreground/90 lg:w-auto"
                  >
                    {t("home.alertBtn")}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <p className="flex items-center gap-2 text-xs text-primary-foreground/70">
                  <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                  {t("home.alertFree")}
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
