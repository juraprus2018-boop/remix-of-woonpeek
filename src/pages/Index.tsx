import { Link, useNavigate } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cityToSlug } from "@/lib/cities";
import { BRAND_NAME, CANONICAL_URL, SUPPORT_EMAIL } from "@/lib/brand";
import { useState } from "react";

const POPULAR_CITIES = [
  { name: "Amsterdam", count: "1.240+" },
  { name: "Rotterdam", count: "820+" },
  { name: "Den Haag", count: "640+" },
  { name: "Utrecht", count: "510+" },
  { name: "Eindhoven", count: "390+" },
  { name: "Groningen", count: "310+" },
  { name: "Tilburg", count: "240+" },
  { name: "Haarlem", count: "180+" },
];

const TYPES = [
  { label: "Huurwoningen", href: "/huurwoningen", icon: Home },
  { label: "Koopwoningen", href: "/koopwoningen", icon: Building2 },
  { label: "Appartementen", href: "/appartementen", icon: Building2 },
  { label: "Kamers", href: "/kamers", icon: DoorOpen },
  { label: "Studio's", href: "/studios", icon: BedDouble },
];

const Index = () => {
  const { data: properties, isLoading } = useFeaturedProperties();
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

  const featured = properties?.slice(0, 6) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Stekly – Vind eenvoudig jouw huur- of koopwoning in Nederland"
        description="Dagelijks vers huur- en koopaanbod uit heel Nederland. Zoek per stad, type en budget. Stel een gratis alert in en mis geen enkele woning meer."
        canonical="/"
      />

      {/* Trust bar */}
      <div className="hidden border-b border-border bg-sun-tint md:block">
        <div className="container flex h-10 items-center justify-between text-xs font-medium text-foreground/80">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
              100% gratis voor woningzoekers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
              Dagelijks vers aanbod
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
              Heel Nederland
            </span>
          </div>
          <span className="text-foreground/60">info@stekly.nl</span>
        </div>
      </div>

      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-sun-tint">
        {/* sun decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-sun/60 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-sun-soft blur-3xl" aria-hidden />

        <div className="container relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-sun px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-md">
              <Sparkles className="h-3.5 w-3.5" />
              Dagelijks vers aanbod
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Vind <span className="relative inline-block">
                <span className="relative z-10">jouw stekje.</span>
                <span className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-sun md:h-5" aria-hidden />
              </span>
              <br />
              Snel, simpel, gratis.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-foreground/70">
              Eén overzichtelijke plek voor het nieuwste huur- en koopaanbod in heel Nederland.
              Zoek per stad, filter op je budget en ontvang een alert zodra er iets nieuws komt.
            </p>

            {/* SEARCH CARD */}
            <form
              onSubmit={onSearch}
              className="mt-8 rounded-2xl border-2 border-foreground/5 bg-card p-3 shadow-lg md:p-4"
            >
              <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Plaats, buurt of postcode"
                    className="h-12 rounded-xl border-border bg-background pl-10 text-base"
                    aria-label="Locatie"
                  />
                </div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-12 rounded-xl border border-input bg-background px-3 text-base text-foreground"
                  aria-label="Woningtype"
                >
                  <option value="">Alle types</option>
                  <option value="appartement">Appartement</option>
                  <option value="huis">Huis</option>
                  <option value="kamer">Kamer</option>
                  <option value="studio">Studio</option>
                </select>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-12 rounded-xl border border-input bg-background px-3 text-base text-foreground"
                  aria-label="Maximale prijs"
                >
                  <option value="">Max prijs</option>
                  <option value="750">€ 750</option>
                  <option value="1000">€ 1.000</option>
                  <option value="1500">€ 1.500</option>
                  <option value="2000">€ 2.000</option>
                  <option value="3000">€ 3.000</option>
                </select>
                <Button
                  type="submit"
                  className="h-12 gap-2 rounded-xl bg-sun px-6 text-base font-bold text-foreground shadow-sm hover:bg-sun/90"
                >
                  <Search className="h-4 w-4" />
                  Zoeken
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Populair:
                </span>
                {POPULAR_CITIES.slice(0, 5).map((c) => (
                  <Link
                    key={c.name}
                    to={`/huurwoningen/${cityToSlug(c.name)}`}
                    className="rounded-full bg-sun-tint px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-sun"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </form>
          </div>

          {/* Hero illustration */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rounded-[3rem] bg-sun shadow-xl" />
              <div className="absolute inset-6 rounded-[2.5rem] bg-card shadow-md">
                <HeroIllustration />
              </div>
              <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Vandaag online</div>
                  <div className="text-lg font-extrabold leading-none text-foreground">+287</div>
                </div>
              </div>
              <div className="absolute -right-4 top-10 flex items-center gap-3 rounded-2xl bg-foreground px-4 py-3 text-background shadow-lg">
                <Heart className="h-5 w-5 fill-sun text-sun" />
                <div className="text-xs font-medium">3.097 woningen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TYPES STRIP */}
      <section className="border-y border-border bg-background py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {TYPES.map((t) => (
              <Link
                key={t.href}
                to={t.href}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sun hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-tint transition-colors group-hover:bg-sun">
                  <t.icon className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm font-bold text-foreground">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NIEUW AANBOD */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sun-foreground">
                <span className="rounded-full bg-sun px-2.5 py-1 text-foreground">Nieuw deze week</span>
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Verse woningen, dagelijks bijgewerkt
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Een selectie uit het nieuwste aanbod. Geen pop-ups, geen abonnement. Klik en bekijk.
              </p>
            </div>
            <Link
              to="/nieuw-aanbod"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-foreground hover:text-sun md:inline-flex"
            >
              Alle nieuwe woningen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))
              : featured.map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/woning/${cityToSlug(p.city || "stad")}-${p.property_type || "woning"}-${p.id}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Home className="h-12 w-12 opacity-30" />
                        </div>
                      )}
                      {p.price && (
                        <div className="absolute left-3 top-3 rounded-full bg-sun px-3 py-1 text-xs font-extrabold text-foreground shadow-sm">
                          € {Number(p.price).toLocaleString("nl-NL")}
                          {p.listing_type === "rent" && <span className="font-medium"> /mnd</span>}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {p.city}
                      </div>
                      <h3 className="mt-1 line-clamp-1 text-base font-extrabold text-foreground">
                        {p.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        {p.bedrooms && <span>{p.bedrooms} kamers</span>}
                        {p.size_m2 && <span>{p.size_m2} m²</span>}
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/nieuw-aanbod"
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
              In drie stappen naar jouw stekje
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Zoek slim",
                d: "Filter op stad, type en budget. Bekijk meteen het verse aanbod, zonder pop-ups.",
                icon: Search,
              },
              {
                n: "02",
                t: "Stel een alert in",
                d: "Krijg een mail zodra er een woning binnenkomt die bij jouw wensen past.",
                icon: Bell,
              },
              {
                n: "03",
                t: "Reageer direct",
                d: "Ga in één klik naar de oorspronkelijke aanbieder en wees op tijd.",
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
                Bekijk het actuele aanbod in de grootste steden van Nederland.
              </p>
            </div>
            <Link
              to="/steden"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-foreground hover:text-sun md:inline-flex"
            >
              Alle steden
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {POPULAR_CITIES.map((c) => (
              <Link
                key={c.name}
                to={`/woningen-${cityToSlug(c.name)}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-sun hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Aanbod
                    </div>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                      {c.name}
                    </h3>
                    <div className="mt-2 text-sm font-semibold text-foreground/70">
                      {c.count} woningen
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
                  Wees als eerste binnen.
                </h2>
                <p className="mt-4 max-w-md text-background/80">
                  Krijg een mail zodra er een woning verschijnt die past bij jouw stad, budget en wensen.
                  Geen spam, één klik om uit te schrijven.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link to="/dagelijkse-alert" className="w-full lg:w-auto">
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
