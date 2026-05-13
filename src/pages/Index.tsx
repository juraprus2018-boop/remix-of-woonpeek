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
        {/* ============== EDITORIAL HERO SPLIT ============== */}
        <section className="border-b border-border">
          <div className="container grid grid-cols-1 gap-0 lg:grid-cols-12 lg:gap-12 py-16 md:py-24 lg:py-32">
            {/* LEFT: statement + search */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <p className="mb-8 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="inline-block h-px w-8 bg-foreground/30" />
                  Index № 01 · {new Date().getFullYear()}
                </p>

                <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-[5.5rem]">
                  Wonen vinden,
                  <br />
                  <span className="inline-flex items-baseline">
                    eenvoudig
                    <span className="ml-3 inline-block h-3 w-3 rounded-full bg-accent md:h-4 md:w-4" aria-hidden />
                  </span>
                  <br />
                  gemaakt.
                </h1>

                <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                  Eén rustig overzicht van het nieuwste huur- en koopaanbod uit
                  heel Nederland. Geen ruis, geen overbodige filters, alleen
                  woningen die er toe doen.
                </p>
              </div>

              {/* Search */}
              <form onSubmit={onSearch} className="mt-12 max-w-xl">
                <label className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Begin in een stad
                </label>
                <div className="flex items-center gap-0 border-b-2 border-foreground pb-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Amsterdam, Utrecht, Groningen..."
                    className="h-12 flex-1 border-0 bg-transparent px-0 text-lg shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="text-xs uppercase tracking-wider">Snel naar:</span>
                  {POPULAR_CITIES.slice(0, 5).map((c) => (
                    <Link
                      key={c}
                      to={`/woningen-${cityToSlug(c)}`}
                      className="border-b border-transparent text-sm text-foreground transition-colors hover:border-accent hover:text-foreground"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </form>
            </div>

            {/* RIGHT: hero listing */}
            <aside className="lg:col-span-5 mt-16 lg:mt-0">
              {isLoading ? (
                <Skeleton className="aspect-[4/5] w-full rounded-none" />
              ) : heroProperty ? (
                <Link
                  to={`/woning/${heroProperty.slug || heroProperty.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                    {heroProperty.images?.[0] && (
                      <img
                        src={heroProperty.images[0]}
                        alt={heroProperty.title || ""}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                    <div className="absolute left-4 top-4 flex items-center gap-2 bg-background px-3 py-1.5 text-xs font-medium uppercase tracking-wider">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                      Uitgelicht
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        {heroProperty.city}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
                        {heroProperty.title}
                      </h3>
                    </div>
                    <ArrowUpRight
                      className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                    />
                  </div>
                </Link>
              ) : null}
            </aside>
          </div>
        </section>

        {/* ============== INDEX TICKER ============== */}
        <section className="border-b border-border bg-foreground text-background">
          <div className="container flex flex-wrap items-center justify-between gap-6 py-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] opacity-70">
              Vandaag in Stekly
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
              <span><span className="font-semibold">Dagelijks</span> bijgewerkt</span>
              <span><span className="font-semibold">{POPULAR_CITIES.length}+</span> grote steden</span>
              <span><span className="font-semibold">Huur · Koop</span> in één feed</span>
              <span className="hidden md:inline">
                <span className="font-semibold">Geen</span> verborgen kosten
              </span>
            </div>
          </div>
        </section>

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
