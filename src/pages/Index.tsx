import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bed,
  Ruler,
  Search,
  Bell,
  Leaf,
  Building2,
  Home,
  Calculator,
  Sparkles,
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
    navigate(`/zoeken?locatie=${encodeURIComponent(q)}`);
  };

  const featured = properties?.slice(0, 7) ?? [];
  const heroProp = featured[0];
  const tileProps = featured.slice(1, 7);

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
        {/* ============== 01 · MEGA HERO ============== */}
        <section className="relative overflow-hidden border-b-2 border-foreground bg-sage">
          {/* botanical decor */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl"
            style={{ backgroundColor: "hsl(var(--leaf))" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: "hsl(var(--accent))" }}
          />

          <div className="container relative py-16 md:py-24 lg:py-32">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              <Leaf className="h-3.5 w-3.5" />
              Editie {new Date().getFullYear()} · Wonen in Nederland
            </div>

            <h1 className="mt-8 font-display text-[3.4rem] leading-[0.92] text-foreground sm:text-7xl md:text-8xl lg:text-[9.5rem]">
              VIND&nbsp;JOUW
              <br />
              <span className="font-serif-display italic text-accent">stekje.</span>
              <br />
              IN&nbsp;HET&nbsp;GROEN.
            </h1>

            <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
              <p className="text-lg leading-relaxed text-foreground/80 lg:col-span-5 lg:text-xl">
                Stekly bundelt elke dag huur- en koopwoningen uit heel Nederland.
                Geen pop-ups, geen ruis, gewoon één rustig overzicht waar nieuw
                aanbod als eerste opduikt.
              </p>

              <form onSubmit={onSearch} className="lg:col-span-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/60" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Zoek stad, wijk of postcode"
                      className="h-16 rounded-none border-2 border-foreground bg-background pl-14 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-16 gap-2 rounded-none bg-foreground px-8 text-base font-semibold uppercase tracking-wider text-background hover:bg-accent hover:text-accent-foreground"
                  >
                    Zoeken
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
                  <span className="font-semibold uppercase tracking-[0.18em] text-foreground/60">
                    Snel naar
                  </span>
                  {POPULAR_CITIES.slice(0, 6).map((c) => (
                    <Link
                      key={c}
                      to={`/woningen-${cityToSlug(c)}`}
                      className="rounded-full border border-foreground/25 bg-background/60 px-3 py-1 font-medium text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ============== 02 · TICKER STRIP ============== */}
        <section className="border-b-2 border-foreground bg-foreground py-4 text-background">
          <div className="flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee items-center gap-12 whitespace-nowrap pr-12">
              {Array.from({ length: 2 }).flatMap((_, idx) =>
                [
                  "Dagelijks vers aanbod",
                  "Huur · Koop · Studio · Kamer",
                  "100% gratis voor zoekers",
                  "Eén feed voor heel Nederland",
                  "Stel je alert in 30 sec",
                  "Wonen, helder gepresenteerd",
                ].map((t) => (
                  <span
                    key={`${idx}-${t}`}
                    className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em]"
                  >
                    <Leaf className="h-3.5 w-3.5 text-accent" />
                    {t}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ============== 03 · HERO LISTING (full width) ============== */}
        {heroProp && (
          <section className="border-b-2 border-foreground">
            <Link
              to={`/woning/${heroProp.slug || heroProp.id}`}
              className="group relative block"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted md:aspect-[21/9]">
                {heroProp.images?.[0] && (
                  <img
                    src={heroProp.images[0]}
                    alt={heroProp.title || ""}
                    loading="eager"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent" />
                <span className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-accent-foreground md:left-10 md:top-10">
                  <Sparkles className="h-3 w-3" />
                  Vandaag uitgelicht
                </span>
                <div className="container absolute inset-x-0 bottom-0 pb-10 text-background md:pb-16">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-80">
                    {heroProp.city} · {heroProp.listing_type === "huur" ? "Te huur" : "Te koop"}
                  </p>
                  <h2 className="mt-4 max-w-4xl font-display text-4xl leading-[1] md:text-6xl lg:text-7xl">
                    {heroProp.title}
                  </h2>
                  <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-base font-semibold">
                    {heroProp.price && (
                      <span className="text-2xl">
                        €{Number(heroProp.price).toLocaleString("nl-NL")}
                        {heroProp.listing_type === "huur" ? " /m" : ""}
                      </span>
                    )}
                    {heroProp.bedrooms != null && (
                      <span className="inline-flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        {heroProp.bedrooms} slaapkamers
                      </span>
                    )}
                    {heroProp.surface_area && (
                      <span className="inline-flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        {heroProp.surface_area} m²
                      </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] opacity-90 transition-transform group-hover:translate-x-1">
                      Bekijk woning
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ============== 04 · NIEUW AANBOD GRID ============== */}
        <section className="border-b-2 border-foreground bg-background">
          <div className="container py-20 md:py-28">
            <div className="grid gap-8 border-b-2 border-foreground pb-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                  § 04 · Vers aanbod
                </p>
                <h2 className="mt-4 font-display text-5xl leading-[0.95] text-foreground md:text-7xl">
                  NIEUW
                  <br />
                  <span className="font-serif-display italic text-accent">deze week.</span>
                </h2>
              </div>
              <div className="lg:col-span-5 lg:text-right">
                <Link
                  to="/nieuw-aanbod"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-foreground hover:text-accent"
                >
                  Volledig aanbod
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3">
              {(isLoading ? Array.from({ length: 6 }) : tileProps).map((p: any, i) => (
                <article key={p?.id ?? i} className="group">
                  {p ? (
                    <Link to={`/woning/${p.slug || p.id}`} className="block">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        {p.images?.[0] && (
                          <img
                            src={p.images[0]}
                            alt={p.title || ""}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                          />
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                          {p.listing_type === "huur" ? "Huur" : "Koop"}
                        </span>
                      </div>
                      <div className="border-b-2 border-foreground pb-5 pt-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {p.city}
                        </p>
                        <h3 className="mt-2 font-display text-2xl leading-tight text-foreground line-clamp-2">
                          {p.title}
                        </h3>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="font-display text-xl text-foreground">
                            €{Number(p.price).toLocaleString("nl-NL")}
                            {p.listing_type === "huur" ? "/m" : ""}
                          </span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <Skeleton className="aspect-[4/3] w-full" />
                      <div className="space-y-2 pt-5">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============== 05 · CATEGORIES BAND ============== */}
        <section className="border-b-2 border-foreground bg-cream-deep">
          <div className="container py-20 md:py-28">
            <div className="mb-12 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                § 05 · Verken op type
              </p>
              <h2 className="mt-4 font-display text-5xl leading-[0.95] text-foreground md:text-6xl">
                WAT&nbsp;ZOEK&nbsp;
                <span className="font-serif-display italic text-accent">je?</span>
              </h2>
            </div>

            <div className="grid gap-0 border-2 border-foreground bg-background md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Huurwoningen", to: "/huurwoningen", icon: Home, desc: "Alles te huur in NL" },
                { label: "Koopwoningen", to: "/koopwoningen", icon: Building2, desc: "Vandaag op de markt" },
                { label: "Appartementen", to: "/appartementen", icon: Building2, desc: "Stedelijk wonen" },
                { label: "Budget tool", to: "/budget-tool", icon: Calculator, desc: "Wat past bij jou?" },
              ].map((t, idx) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`group relative flex flex-col gap-4 p-8 transition-colors hover:bg-foreground hover:text-background ${
                    idx > 0 ? "border-t-2 border-foreground md:border-t-0 md:border-l-2" : ""
                  }`}
                >
                  <t.icon className="h-7 w-7 text-accent transition-colors group-hover:text-background" />
                  <div>
                    <p className="font-display text-2xl leading-tight">{t.label}</p>
                    <p className="mt-1 text-sm opacity-70">{t.desc}</p>
                  </div>
                  <ArrowUpRight className="absolute right-6 top-6 h-5 w-5 opacity-50 transition-all group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============== 06 · CITIES LEDGER ============== */}
        <section className="border-b-2 border-foreground bg-background">
          <div className="container py-20 md:py-28">
            <div className="mb-12 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                  § 06 · Steden ledger
                </p>
                <h2 className="mt-4 font-display text-5xl leading-[0.95] text-foreground md:text-7xl">
                  PER&nbsp;STAD,
                  <br />
                  <span className="font-serif-display italic text-accent">gesorteerd.</span>
                </h2>
              </div>
              <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
                <p className="text-lg leading-relaxed text-foreground/75">
                  Verken het woningaanbod stad voor stad. Van Amsterdam tot
                  Maastricht, overzichtelijk gesorteerd en elke ochtend opnieuw
                  bijgewerkt.
                </p>
              </div>
            </div>

            <ul className="border-t-2 border-foreground">
              {POPULAR_CITIES.map((city, i) => (
                <li key={city} className="border-b-2 border-foreground">
                  <Link
                    to={`/woningen-${cityToSlug(city)}`}
                    className="group flex items-center justify-between py-7 transition-colors hover:bg-foreground hover:text-background hover:px-6"
                  >
                    <div className="flex items-baseline gap-8">
                      <span className="font-mono text-xs opacity-60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-3xl md:text-5xl">
                        {city.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] opacity-70 sm:inline">
                        Huur · Koop
                      </span>
                      <ArrowUpRight className="h-7 w-7 transition-transform group-hover:rotate-12" strokeWidth={1.5} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============== 07 · MANIFESTO SPLIT ============== */}
        <section className="border-b-2 border-foreground bg-forest text-background">
          <div className="container grid gap-12 py-24 md:py-32 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-foreground/70">
                § 07 · Manifest
              </p>
              <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">
                RUSTIG.
                <br />
                EERLIJK.
                <br />
                <span className="font-serif-display italic" style={{ color: "hsl(var(--leaf))" }}>
                  op tijd.
                </span>
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="font-serif-display text-2xl leading-snug md:text-3xl lg:text-4xl">
                Geen pop-ups. Geen gekleurde rangen. Geen druk-marketing. Alleen
                het nieuwste aanbod, gepresenteerd zoals het hoort.
              </p>

              <div className="mt-14 grid gap-8 sm:grid-cols-3">
                {[
                  { n: "01", t: "Dagelijks vers", d: "Iedere ochtend opnieuw geïndexeerd." },
                  { n: "02", t: "Eén feed", d: "Huur en koop, zonder filters-dwang." },
                  { n: "03", t: "Geen kosten", d: "Voor iedereen die zoekt, gratis." },
                ].map((b) => (
                  <div key={b.n} className="border-t-2 border-background/40 pt-5">
                    <p className="font-mono text-xs opacity-70">{b.n}</p>
                    <h3 className="mt-3 font-display text-2xl">{b.t}</h3>
                    <p className="mt-2 text-sm opacity-75">{b.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============== 08 · FINAL ALERT CTA ============== */}
        <section className="bg-accent text-accent-foreground">
          <div className="container py-24 md:py-32">
            <div className="grid items-end gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] opacity-80">
                  <Bell className="h-3.5 w-3.5" />
                  § 08 · Dagelijkse alert
                </p>
                <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl">
                  LAAT&nbsp;HET
                  <br />
                  <span className="font-serif-display italic">naar jou komen.</span>
                </h2>
                <p className="mt-6 max-w-xl text-lg opacity-90">
                  Stel je zoekopdracht in en ontvang elke ochtend om 06:00 het
                  verse aanbod in je inbox. Geen account nodig.
                </p>
              </div>
              <div className="lg:col-span-5">
                <Link
                  to="/dagelijkse-alert"
                  className="group flex items-center justify-between gap-4 border-2 border-background bg-background px-8 py-7 text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <span className="font-display text-2xl">Stel mijn alert in</span>
                  <ArrowRight className="h-7 w-7 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] opacity-80">
                  Uitschrijven met één klik
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
