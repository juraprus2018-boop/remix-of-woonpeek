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
        {/* ============== HERO + LISTINGS CARD (Rentbird-style) ============== */}
        <section className="relative bg-[hsl(var(--hero))] text-[hsl(var(--hero-foreground))]">
          {/* Subtiele radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 0%, hsl(var(--accent) / 0.18), transparent 55%), radial-gradient(circle at 85% 30%, hsl(var(--accent) / 0.10), transparent 50%)",
            }}
          />

          <div className="container relative pb-40 pt-12 md:pb-56 md:pt-20">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/70"
            >
              <Link to="/" className="hover:text-white">Stekly</Link>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              <Link to="/huurwoningen" className="hover:text-white">Huurwoningen</Link>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              <Link to="/koopwoningen" className="hover:text-white">Koopwoningen</Link>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              <span className="text-white">Heel Nederland</span>
            </nav>

            {/* Headline + description (2-col Rentbird style) */}
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8">
                <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-[5rem]">
                  Vind sneller jouw{" "}
                  <span className="text-[hsl(var(--accent))]">droomwoning</span>{" "}
                  in Nederland
                </h1>
              </div>
              <div className="flex items-end lg:col-span-4">
                <p className="text-base leading-relaxed text-white/75 md:text-lg">
                  Op zoek naar een huur- of koopwoning? Stekly bundelt dagelijks
                  het actuele aanbod van honderden makelaars en woningcorporaties
                  in één overzicht.
                </p>
              </div>
            </div>
          </div>

          {/* Witte content-card overlap met afgeschuinde top */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-12 bg-background md:h-20"
              style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%, 0 100%)" }}
            />
          </div>
        </section>

        {/* CONTENT CARD (lift omhoog op de navy) */}
        <section className="bg-background">
          <div className="container -mt-32 md:-mt-44">
            <div className="rounded-2xl bg-background shadow-xl ring-1 ring-border md:p-8">
              {/* Search + filter bar */}
              <form
                onSubmit={onSearch}
                className="flex flex-col gap-3 p-4 md:p-0"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-xl bg-secondary px-4 py-3">
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

                {/* Snelle stadschips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Snel naar:
                  </span>
                  {POPULAR_CITIES.slice(0, 6).map((c) => (
                    <Link
                      key={c}
                      to={`/woningen-${cityToSlug(c)}`}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-sm text-foreground transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </form>

              {/* Listings header */}
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4 px-4 md:mt-10 md:px-0">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
                    Nieuw aanbod
                  </p>
                  <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                    Vandaag toegevoegd
                  </h2>
                </div>
                <Link
                  to="/zoeken"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-[hsl(var(--accent))]"
                >
                  Volledig aanbod
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Property grid Rentbird-style */}
              <div className="mt-6 grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 md:p-0 lg:grid-cols-3">
                {(isLoading
                  ? Array.from({ length: 6 })
                  : (properties?.slice(0, 6) ?? [])
                ).map((p: any, i) => (
                  <article
                    key={p?.id ?? i}
                    className="group overflow-hidden rounded-2xl bg-secondary/60 ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    {p ? (
                      <Link to={`/woning/${p.slug || p.id}`} className="block">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          {p.images?.[0] && (
                            <img
                              src={p.images[0]}
                              alt={p.title || ""}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          )}
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--accent))] shadow-sm">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
                            Nieuw
                          </span>
                        </div>
                        <div className="space-y-3 p-4">
                          <div>
                            <h3 className="font-display text-lg font-semibold leading-tight text-foreground line-clamp-1">
                              {p.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {p.created_at
                                ? new Date(p.created_at).toLocaleDateString("nl-NL", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : ""}{" "}
                              {p.source_site ? `· ${p.source_site}` : ""}
                            </p>
                          </div>

                          {/* Icon-chips */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {p.city && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-medium">
                                <MapPin className="h-3 w-3 text-[hsl(var(--accent))]" />
                                {p.city}
                              </span>
                            )}
                            {p.bedrooms != null && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-medium">
                                <Bed className="h-3 w-3 text-[hsl(var(--accent))]" />
                                {p.bedrooms}
                              </span>
                            )}
                            {p.surface_area && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-medium">
                                <Ruler className="h-3 w-3 text-[hsl(var(--accent))]" />
                                {p.surface_area}m²
                              </span>
                            )}
                            {p.price && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-semibold">
                                <Tag className="h-3 w-3 text-[hsl(var(--accent))]" />
                                €{Number(p.price).toLocaleString("nl-NL")}
                                {p.listing_type === "huur" ? "/m" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <>
                        <Skeleton className="aspect-[4/3] w-full" />
                        <div className="space-y-2 p-4">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-3 w-1/3" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-14 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
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
