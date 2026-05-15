import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Bed,
  Ruler,
  Search,
  Bell,
  Sparkles,
  Building2,
  Home,
  Calculator,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFeaturedProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import { cityToSlug } from "@/lib/cities";
import { BRAND_NAME, CANONICAL_URL, SUPPORT_EMAIL } from "@/lib/brand";
import { useState } from "react";

const POPULAR_CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Tilburg",
  "Almere",
];

const Index = () => {
  const { data: properties, isLoading } = useFeaturedProperties();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/zoeken?city=${encodeURIComponent(q)}`);
  };

  const featured = properties?.slice(0, 6) ?? [];
  const heroProp = featured[0];
  const tileProps = featured.slice(1, 4);
  const stripProps = featured.slice(4, 6);

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: CANONICAL_URL,
    description:
      "Stekly verzamelt dagelijks het nieuwste woningaanbod uit heel Nederland op één plek.",
    email: SUPPORT_EMAIL,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Stekly. Wonen vinden, eenvoudig gemaakt."
        description="Het nieuwste woningaanbod uit heel Nederland, dagelijks bijgewerkt. Huren en kopen in één rustig overzicht."
        canonical="/"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <Header />

      <main className="flex-1">
        {/* ============== EDITORIAL HEADLINE STRIP ============== */}
        <section className="border-b border-border/60">
          <div className="container py-12 md:py-20">
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              Uitgave nr. {new Date().getFullYear()} · Wonen in Nederland
            </p>
            <h1 className="font-serif-display text-5xl leading-[1.02] text-foreground md:text-7xl lg:text-[5.5rem]">
              Een rustige plek
              <br />
              om <span className="italic text-[hsl(var(--accent))]">jouw stek</span> te vinden.
            </h1>
            <div className="mt-8 grid gap-6 lg:grid-cols-12">
              <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-7 lg:text-xl">
                Stekly bundelt dagelijks het actuele huur- en koopaanbod van honderden makelaars
                en corporaties. Geen pop-ups, geen drukte: alleen woningen, helder gepresenteerd.
              </p>
              <form onSubmit={onSearch} className="lg:col-span-5">
                <div className="flex items-center gap-2 rounded-full border border-foreground/20 bg-background px-2 py-2 shadow-sm focus-within:border-accent">
                  <Search className="ml-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Zoek stad, wijk of postcode"
                    className="h-10 flex-1 border-0 bg-transparent px-1 text-base shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
                  />
                  <Button
                    type="submit"
                    className="h-10 gap-1.5 rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-semibold text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90"
                  >
                    Zoeken
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="uppercase tracking-wider">Snel naar</span>
                  {POPULAR_CITIES.slice(0, 5).map((c) => (
                    <Link
                      key={c}
                      to={`/woningen-${cityToSlug(c)}`}
                      className="underline-offset-4 transition-colors hover:text-[hsl(var(--accent))] hover:underline"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ============== BENTO GRID ============== */}
        <section className="border-b border-border/60 bg-cream-deep">
          <div className="container py-14 md:py-20">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
                  Nieuw aanbod · vandaag
                </p>
                <h2 className="font-serif-display text-3xl text-foreground md:text-5xl">
                  Vers van de pers.
                </h2>
              </div>
              <Link
                to="/zoeken"
                className="hidden items-center gap-1.5 text-sm font-medium underline-offset-4 hover:text-[hsl(var(--accent))] hover:underline md:inline-flex"
              >
                Volledig aanbod
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Bento layout: hero tile + 3 listings + 3 utility tiles */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
              {/* Hero featured property — 4 cols, 2 rows */}
              <article className="group relative overflow-hidden rounded-3xl bg-card ring-1 ring-border md:col-span-4 md:row-span-2">
                {heroProp ? (
                  <Link to={`/woning/${heroProp.slug || heroProp.id}`} className="block h-full">
                    <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted md:aspect-auto md:h-full md:min-h-[480px]">
                      {heroProp.images?.[0] && (
                        <img
                          src={heroProp.images[0]}
                          alt={heroProp.title || ""}
                          loading="eager"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
                      <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                        <Sparkles className="h-3 w-3" />
                        Uitgelicht
                      </span>
                      <div className="absolute inset-x-5 bottom-5 text-[hsl(var(--background))] md:inset-x-7 md:bottom-7">
                        <p className="text-xs uppercase tracking-[0.18em] opacity-80">
                          {heroProp.city} {heroProp.listing_type === "huur" ? "· te huur" : "· te koop"}
                        </p>
                        <h3 className="mt-2 font-serif-display text-2xl leading-tight md:text-4xl">
                          {heroProp.title}
                        </h3>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          {heroProp.price && (
                            <span className="font-semibold">
                              €{Number(heroProp.price).toLocaleString("nl-NL")}
                              {heroProp.listing_type === "huur" ? " /m" : ""}
                            </span>
                          )}
                          {heroProp.bedrooms != null && (
                            <span className="inline-flex items-center gap-1">
                              <Bed className="h-3.5 w-3.5" />
                              {heroProp.bedrooms} slpk
                            </span>
                          )}
                          {heroProp.surface_area && (
                            <span className="inline-flex items-center gap-1">
                              <Ruler className="h-3.5 w-3.5" />
                              {heroProp.surface_area} m²
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Skeleton className="h-full min-h-[480px] w-full" />
                )}
              </article>

              {/* Stat tile */}
              <div className="rounded-3xl border border-border bg-background p-6 md:col-span-2">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Vandaag online
                  </p>
                  <Building2 className="h-5 w-5 text-[hsl(var(--accent))]" />
                </div>
                <p className="mt-3 font-serif-display text-5xl text-foreground md:text-6xl">
                  {properties ? properties.length : "—"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  woningen in heel Nederland, dagelijks vers.
                </p>
                <Link
                  to="/nieuw-aanbod"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:text-[hsl(var(--accent))] hover:underline"
                >
                  Bekijk aanbod
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Alert tile (terracotta) */}
              <Link
                to="/dagelijkse-alert"
                className="group rounded-3xl bg-[hsl(var(--accent))] p-6 text-[hsl(var(--accent-foreground))] transition-all hover:-translate-y-0.5 hover:shadow-xl md:col-span-2"
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-80">
                    Dagelijkse alert
                  </p>
                  <Bell className="h-5 w-5" />
                </div>
                <p className="mt-3 font-serif-display text-2xl leading-tight md:text-3xl">
                  Nieuw aanbod direct in je inbox.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 group-hover:underline">
                  Inschrijven
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              {/* Side property tiles */}
              {(isLoading ? Array.from({ length: 3 }) : tileProps).map((p: any, i) => (
                <article
                  key={p?.id ?? i}
                  className="group overflow-hidden rounded-3xl bg-background ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-lg md:col-span-2"
                >
                  {p ? (
                    <Link to={`/woning/${p.slug || p.id}`} className="block">
                      <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted">
                        {p.images?.[0] && (
                          <img
                            src={p.images[0]}
                            alt={p.title || ""}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        )}
                      </div>
                      <div className="space-y-2 p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {p.city}
                        </p>
                        <h3 className="font-serif-display text-lg leading-tight text-foreground line-clamp-2">
                          {p.title}
                        </h3>
                        <div className="flex items-center justify-between pt-1 text-sm">
                          <span className="font-semibold">
                            €{Number(p.price).toLocaleString("nl-NL")}
                            {p.listing_type === "huur" ? "/m" : ""}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            {p.surface_area && (
                              <>
                                <Ruler className="h-3 w-3" />
                                {p.surface_area}m²
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <Skeleton className="aspect-[5/4] w-full" />
                      <div className="space-y-2 p-4">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>

            {/* Mobile fallback for "alle woningen" link */}
            <div className="mt-8 md:hidden">
              <Link
                to="/zoeken"
                className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:text-[hsl(var(--accent))] hover:underline"
              >
                Volledig aanbod
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============== EDITORIAL CITIES INDEX ============== */}
        <section className="border-b border-border/60">
          <div className="container py-20 md:py-28">
            <div className="mb-12 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  § Steden index
                </p>
                <h2 className="font-serif-display text-4xl leading-tight text-foreground md:text-6xl">
                  Per stad,
                  <br />
                  <span className="italic text-[hsl(var(--accent))]">gesorteerd.</span>
                </h2>
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Verken het aanbod stad voor stad. Van Amsterdam tot Maastricht: alle
                  huur- en koopwoningen, overzichtelijk per locatie. Compleet, dagelijks
                  bijgewerkt, en altijd zonder kosten.
                </p>
              </div>
            </div>

            <ul className="divide-y divide-border border-y border-border">
              {POPULAR_CITIES.map((city, i) => (
                <li key={city}>
                  <Link
                    to={`/woningen-${cityToSlug(city)}`}
                    className="group flex items-center justify-between py-6 transition-colors hover:bg-cream-deep"
                  >
                    <div className="flex items-baseline gap-6">
                      <span className="w-10 font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-serif-display text-2xl text-foreground md:text-3xl">
                        {city}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:inline">
                        Huren · Kopen
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all group-hover:border-[hsl(var(--accent))] group-hover:bg-[hsl(var(--accent))] group-hover:text-[hsl(var(--accent-foreground))]">
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex justify-center">
              <Link
                to="/steden"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/30 px-6 py-3 text-sm font-medium transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                Bekijk alle steden
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============== TYPE TILES ============== */}
        <section className="border-b border-border/60 bg-cream-deep">
          <div className="container py-20 md:py-24">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
              § Verken op type
            </p>
            <h2 className="font-serif-display text-4xl leading-tight text-foreground md:text-5xl">
              Wat zoek je precies?
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {[
                { label: "Huurwoningen", to: "/huurwoningen", icon: Home, desc: "Alle huurwoningen NL" },
                { label: "Koopwoningen", to: "/koopwoningen", icon: Building2, desc: "Beschikbaar te koop" },
                { label: "Appartementen", to: "/appartementen", icon: Building2, desc: "Stedelijk wonen" },
                { label: "Budget tool", to: "/budget-tool", icon: Calculator, desc: "Wat past bij jou?" },
              ].map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className="group rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-0.5 hover:border-foreground hover:shadow-md"
                >
                  <t.icon className="h-6 w-6 text-[hsl(var(--accent))]" />
                  <p className="mt-6 font-serif-display text-2xl leading-tight">{t.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  <ArrowUpRight className="mt-6 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============== MANIFESTO ============== */}
        <section className="border-b border-border/60">
          <div className="container grid grid-cols-1 gap-12 py-20 md:py-28 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                § Waarom Stekly
              </p>
            </div>
            <div className="lg:col-span-8">
              <p className="font-serif-display text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl">
                Geen pop-ups, geen gekleurde rangen, geen druk-marketing. Alleen
                het nieuwste aanbod, gepresenteerd zoals het hoort:{" "}
                <span className="italic text-muted-foreground">
                  rustig, eerlijk, en op tijd.
                </span>
              </p>

              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
                {[
                  { n: "01", t: "Dagelijks vers", d: "Iedere ochtend opnieuw geïndexeerd." },
                  { n: "02", t: "Eén feed", d: "Huur en koop, zonder filters-dwang." },
                  { n: "03", t: "Geen kosten", d: "Voor iedereen die zoekt, gratis." },
                ].map((b) => (
                  <div key={b.n} className="border-t border-border pt-4">
                    <p className="font-mono text-xs text-[hsl(var(--accent))]">{b.n}</p>
                    <h3 className="mt-2 font-serif-display text-xl">{b.t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============== EXTRA STRIP LISTINGS ============== */}
        {stripProps.length > 0 && (
          <section className="border-b border-border/60 bg-cream-deep">
            <div className="container py-16 md:py-20">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Verder kijken
                  </p>
                  <h2 className="font-serif-display text-3xl md:text-4xl">
                    Andere recente woningen
                  </h2>
                </div>
                <Link
                  to="/nieuw-aanbod"
                  className="text-sm font-medium underline-offset-4 hover:text-[hsl(var(--accent))] hover:underline"
                >
                  Alles bekijken →
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {stripProps.map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/woning/${p.slug || p.id}`}
                    className="group flex gap-4 rounded-2xl bg-background p-3 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-32 w-40 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {p.images?.[0] && (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col py-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {p.city} · {p.listing_type === "huur" ? "huur" : "koop"}
                      </p>
                      <h3 className="mt-1 font-serif-display text-lg leading-tight line-clamp-2">
                        {p.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between pt-2 text-sm">
                        <span className="font-semibold">
                          €{Number(p.price).toLocaleString("nl-NL")}
                          {p.listing_type === "huur" ? "/m" : ""}
                        </span>
                        {p.bedrooms != null && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Bed className="h-3 w-3" />
                            {p.bedrooms}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============== FINAL CTA ============== */}
        <section>
          <div className="container py-20 md:py-28">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  § Dagelijkse alert
                </p>
                <h2 className="font-serif-display text-4xl leading-tight text-foreground md:text-6xl">
                  Laat het nieuws naar jou komen,
                  <br />
                  <span className="italic text-muted-foreground">één e-mail per dag.</span>
                </h2>
              </div>
              <div className="lg:col-span-5">
                <Link
                  to="/dagelijkse-alert"
                  className="group inline-flex w-full items-center justify-between rounded-2xl border-2 border-foreground bg-background px-6 py-5 transition-colors hover:bg-foreground hover:text-background"
                >
                  <span className="font-serif-display text-xl">Stel jouw alert in</span>
                  <ArrowRight
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  Geen account nodig. Uitschrijven met één klik.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
