import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

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

  const featured = properties?.slice(0, 4) ?? [];
  const heroProperty = featured[0];
  const sideProperties = featured.slice(1, 4);

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
        {/* ============== HERO (Rentbird-style) ============== */}
        <section className="relative bg-[hsl(var(--hero))] text-[hsl(var(--hero-foreground))]">
          {/* Subtiele radial glow op de achtergrond */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 0%, hsl(var(--accent) / 0.18), transparent 55%), radial-gradient(circle at 90% 100%, hsl(var(--accent) / 0.10), transparent 50%)",
            }}
          />

          <div className="container relative py-16 md:py-24 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/80 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
                Dagelijks vers aanbod uit heel Nederland
              </span>

              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Vind sneller jouw{" "}
                <span className="text-[hsl(var(--accent))]">droomwoning</span>
                <br className="hidden sm:block" /> in Nederland.
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                Eén overzichtelijke plek voor huur en koop. Geen ruis, geen
                eindeloos klikken: direct het nieuwste aanbod, gefilterd op
                stad, type en budget.
              </p>
            </div>

            {/* Witte search card */}
            <form
              onSubmit={onSearch}
              className="mx-auto mt-10 w-full max-w-3xl rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/5 md:p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-xl bg-secondary px-4 py-3 sm:bg-transparent sm:px-2">
                  <svg
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Zoek op stad, wijk of postcode"
                    className="h-11 flex-1 border-0 bg-transparent px-0 text-base text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 gap-2 rounded-xl bg-[hsl(var(--accent))] px-6 text-base font-semibold text-white hover:bg-[hsl(var(--accent))]/90"
                >
                  Zoeken
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Quick chips */}
            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-xs uppercase tracking-wider text-white/50">
                Snel naar:
              </span>
              {POPULAR_CITIES.slice(0, 6).map((c) => (
                <Link
                  key={c}
                  to={`/woningen-${cityToSlug(c)}`}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/85 transition-colors hover:border-[hsl(var(--accent))] hover:text-white"
                >
                  {c}
                </Link>
              ))}
            </div>

            {/* Stats strip */}
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 border-t border-white/10 pt-8 text-center md:grid-cols-4">
              <div>
                <p className="font-display text-2xl font-bold text-[hsl(var(--accent))] md:text-3xl">
                  Dagelijks
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/60">
                  Bijgewerkt
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[hsl(var(--accent))] md:text-3xl">
                  {POPULAR_CITIES.length}+
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/60">
                  Grote steden
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[hsl(var(--accent))] md:text-3xl">
                  Huur · Koop
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/60">
                  In één feed
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[hsl(var(--accent))] md:text-3xl">
                  100%
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/60">
                  Gratis voor jou
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured hero property strip onder de hero */}
        {heroProperty && !isLoading && (
          <section className="border-b border-border bg-secondary/40">
            <div className="container py-10">
              <Link
                to={`/woning/${heroProperty.slug || heroProperty.id}`}
                className="group grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                  {heroProperty.images?.[0] && (
                    <img
                      src={heroProperty.images[0]}
                      alt={heroProperty.title || ""}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )}
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    Uitgelicht
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {heroProperty.city}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold leading-tight md:text-3xl">
                    {heroProperty.title}
                  </h3>
                  {heroProperty.price && (
                    <p className="mt-3 text-lg font-semibold text-[hsl(var(--accent))]">
                      €{Number(heroProperty.price).toLocaleString("nl-NL")}
                      {heroProperty.listing_type === "rent" ? " p/m" : ""}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:text-[hsl(var(--accent))]">
                    Bekijk woning
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ============== LATEST GRID ============== */}
        <section className="border-b border-border">
          <div className="container py-20 md:py-28">
            <div className="mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  § Nieuw aanbod
                </p>
                <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  Vers binnen, nog niet door iedereen gezien.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <Link
                  to="/zoeken"
                  className="inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-medium hover:border-accent hover:text-foreground"
                >
                  Volledig aanbod
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {(isLoading ? Array.from({ length: 3 }) : sideProperties.concat(featured.slice(0, 1))).map(
                (p: any, i) => (
                  <article key={p?.id ?? i} className="group">
                    {p ? (
                      <Link to={`/woning/${p.slug || p.id}`}>
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          {p.images?.[0] && (
                            <img
                              src={p.images[0]}
                              alt={p.title || ""}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          )}
                        </div>
                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                              {String(i + 1).padStart(2, "0")} · {p.city}
                            </p>
                            <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug">
                              {p.title}
                            </h3>
                            {p.price && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                €{Number(p.price).toLocaleString("nl-NL")}
                                {p.listing_type === "rent" ? " p/m" : ""}
                              </p>
                            )}
                          </div>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" strokeWidth={1.5} />
                        </div>
                      </Link>
                    ) : (
                      <>
                        <Skeleton className="aspect-[4/3] w-full rounded-none" />
                        <Skeleton className="mt-4 h-4 w-24" />
                        <Skeleton className="mt-2 h-5 w-3/4" />
                      </>
                    )}
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        {/* ============== CITIES INDEX ============== */}
        <section className="border-b border-border">
          <div className="container py-20 md:py-28">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  § Steden index
                </p>
                <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Per stad, gesorteerd.
                </h2>
              </div>
            </div>

            <ul className="divide-y divide-border border-y border-border">
              {POPULAR_CITIES.map((city, i) => (
                <li key={city}>
                  <Link
                    to={`/woningen-${cityToSlug(city)}`}
                    className="group flex items-center justify-between py-6 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-baseline gap-6">
                      <span className="w-10 font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                        {city}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:inline">
                        Huren · Kopen
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============== MANIFESTO STRIP ============== */}
        <section className="border-b border-border bg-muted/30">
          <div className="container grid grid-cols-1 gap-12 py-20 md:py-28 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                § Waarom Stekly
              </p>
            </div>
            <div className="lg:col-span-8">
              <p className="font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl lg:text-5xl">
                Geen pop-ups, geen gekleurde rangen, geen druk-marketing. Alleen
                het nieuwste aanbod, gepresenteerd zoals het hoort:{" "}
                <span className="text-muted-foreground">
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
                    <p className="font-mono text-xs text-muted-foreground">{b.n}</p>
                    <h3 className="mt-2 font-display text-lg font-semibold">{b.t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============== ALERT CTA ============== */}
        <section>
          <div className="container py-20 md:py-28">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  § Dagelijkse alert
                </p>
                <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  Laat het nieuws naar jou komen,
                  <br />
                  <span className="text-muted-foreground">één e-mail per dag.</span>
                </h2>
              </div>
              <div className="lg:col-span-5">
                <Link
                  to="/dagelijkse-alert"
                  className="group inline-flex w-full items-center justify-between border-2 border-foreground bg-background px-6 py-5 transition-colors hover:bg-foreground hover:text-background"
                >
                  <span className="font-display text-lg font-semibold">
                    Stel jouw alert in
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
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
