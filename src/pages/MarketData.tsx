import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMarketStats, type CityRow } from "@/hooks/useMarketStats";
import { cityToSlug } from "@/lib/cities";
import { CANONICAL_URL } from "@/lib/brand";
import { TrendingUp, Home, Euro, Ruler, CalendarClock, Building2 } from "lucide-react";

const nf = new Intl.NumberFormat("nl-NL");
const euro = (n?: number | null, decimals = 0) =>
  n === null || n === undefined
    ? "—"
    : "€ " +
      new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(Number(n));
const num = (n?: number | null) => (n === null || n === undefined ? "—" : nf.format(Number(n)));

const MONTHS = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

interface Column {
  key: keyof CityRow;
  label: string;
  format: (row: CityRow) => string;
  align?: "right";
}

const CityTable = ({
  id,
  title,
  question,
  answer,
  rows,
  columns,
  loading,
}: {
  id: string;
  title: string;
  question: string;
  answer: string;
  rows: CityRow[];
  columns: Column[];
  loading: boolean;
}) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{question}</h2>
    <p className="mt-2 max-w-4xl text-muted-foreground">{answer}</p>
    <Card className="mt-4 overflow-hidden">
      <CardHeader className="border-b border-border bg-secondary/40 py-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="p-4 text-muted-foreground">Nog geen data beschikbaar voor deze vraag.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Plaats</TableHead>
                  {columns.map((c) => (
                    <TableHead key={String(c.key) + c.label} className={c.align === "right" ? "text-right" : ""}>
                      {c.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.city}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/huurwoningen/${cityToSlug(row.city)}`} className="text-primary hover:underline">
                        {row.city}
                      </Link>
                    </TableCell>
                    {columns.map((c) => (
                      <TableCell
                        key={String(c.key) + c.label}
                        className={c.align === "right" ? "text-right tabular-nums" : "tabular-nums"}
                      >
                        {c.format(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  </section>
);

export default function MarketData() {
  const { data, isLoading } = useMarketStats();
  const n = data?.national;
  const now = data?.generated_at ? new Date(data.generated_at) : new Date();
  const period = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const updated = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const kpis = [
    { icon: Home, label: "Actief woningaanbod", value: num(n?.total), sub: `${num(n?.rent_total)} huur · ${num(n?.buy_total)} koop` },
    { icon: Euro, label: "Gemiddelde huurprijs", value: euro(n?.rent_avg), sub: `mediaan ${euro(n?.rent_median)} per maand` },
    { icon: Ruler, label: "Huurprijs per m²", value: euro(n?.rent_per_m2, 2), sub: "gemiddeld over heel Nederland" },
    { icon: Building2, label: "Gemiddelde vraagprijs koop", value: euro(n?.buy_avg), sub: `${euro(n?.buy_per_m2)} per m²` },
    { icon: CalendarClock, label: "Nieuw aanbod deze week", value: num(n?.new_7d), sub: `${num(n?.new_30d)} in de afgelopen 30 dagen` },
    { icon: TrendingUp, label: "Huurwoningen onder € 1.500", value: num(n?.rent_under_1500), sub: `${num(n?.buy_under_400k)} koopwoningen onder € 400.000` },
  ];

  const faq = n
    ? [
        {
          q: `Wat is de gemiddelde huurprijs per m² in Nederland (${period})?`,
          a: `De gemiddelde huurprijs in het actuele aanbod op Woonaanbod NL is ${euro(n.rent_per_m2, 2)} per m² per maand, gemeten over ${num(n.rent_total)} actieve huurwoningen. De gemiddelde maandhuur is ${euro(n.rent_avg)}, de mediaan ${euro(n.rent_median)}.`,
        },
        {
          q: "Welke gemeenten hebben deze week het meeste nieuwe huuraanbod?",
          a:
            (data?.new_this_week_cities || [])
              .slice(0, 5)
              .map((c) => `${c.city} (${c.n} nieuwe woningen)`)
              .join(", ") + `. In totaal kwamen er deze week ${num(n.new_7d)} woningen bij.`,
        },
        {
          q: "Waar vind je de meeste huurwoningen onder € 1.500?",
          a:
            (data?.rent_under_1500_cities || [])
              .slice(0, 5)
              .map((c) => `${c.city} (${c.n})`)
              .join(", ") + `. Landelijk staan er nu ${num(n.rent_under_1500)} huurwoningen onder € 1.500 per maand.`,
        },
        {
          q: "Hoeveel koopwoningen onder € 400.000 staan er momenteel te koop?",
          a: `Op dit moment staan er ${num(n.buy_under_400k)} koopwoningen onder € 400.000 in het aanbod van Woonaanbod NL, verdeeld over ${num((data?.buy_under_400k_cities || []).length)} plaatsen.`,
        },
      ]
    : [];

  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Woningmarktcijfers Nederland – ${period}`,
    description:
      "Actuele huur- en koopprijzen, prijs per m², nieuw aanbod per week en beschikbaarheid per prijsklasse, berekend uit het live woningaanbod van Woonaanbod NL.",
    url: `${CANONICAL_URL}/woningmarkt`,
    keywords: ["huurprijzen", "huurprijs per m2", "koopwoningen", "woningaanbod", "Nederland", "woningmarkt"],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    temporalCoverage: now.toISOString().slice(0, 10),
    spatialCoverage: { "@type": "Country", name: "Nederland" },
    dateModified: now.toISOString(),
    creator: { "@type": "Organization", name: "Woonaanbod NL", url: CANONICAL_URL },
    variableMeasured: n
      ? [
          { "@type": "PropertyValue", name: "Gemiddelde huurprijs per m² (Nederland)", value: n.rent_per_m2, unitText: "EUR/m²/maand" },
          { "@type": "PropertyValue", name: "Gemiddelde maandhuur (Nederland)", value: n.rent_avg, unitText: "EUR/maand" },
          { "@type": "PropertyValue", name: "Mediane maandhuur (Nederland)", value: n.rent_median, unitText: "EUR/maand" },
          { "@type": "PropertyValue", name: "Gemiddelde vraagprijs koopwoning", value: n.buy_avg, unitText: "EUR" },
          { "@type": "PropertyValue", name: "Nieuw aanbod laatste 7 dagen", value: n.new_7d },
          { "@type": "PropertyValue", name: "Huurwoningen onder € 1.500", value: n.rent_under_1500 },
          { "@type": "PropertyValue", name: "Koopwoningen onder € 400.000", value: n.buy_under_400k },
        ]
      : undefined,
  };

  const faqLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  useEffect(() => {
    const blocks = [dataset, faqLd].filter(Boolean);
    const nodes = blocks.map((block) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.marketData = "true";
      el.textContent = JSON.stringify(block);
      document.head.appendChild(el);
      return el;
    });
    return () => nodes.forEach((el) => el.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Woningmarktcijfers Nederland ${period}: huurprijs per m² & aanbod`}
        description={`Actuele woningmarktdata van Woonaanbod NL (${period}): gemiddelde huurprijs per m², nieuw aanbod per gemeente, huurwoningen onder € 1.500 en koopwoningen onder € 400.000.`}
        canonical="/woningmarkt"
      />

      <Header />
      <main>
        <section className="border-b border-border bg-primary text-primary-foreground">
          <div className="container py-10 sm:py-14">
            <Breadcrumbs items={[{ label: "Woningmarktcijfers", href: "/woningmarkt" }]} />
            <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
              Woningmarktcijfers Nederland, {period}
            </h1>
            <p className="mt-4 max-w-4xl text-lg text-primary-foreground/85">
              Deze cijfers komen niet uit een rapport of persbericht: ze worden live berekend uit het volledige
              actieve woningaanbod op Woonaanbod NL. Je ziet wat er vandaag daadwerkelijk te huur en te koop
              staat, wat het per vierkante meter kost en in welke gemeenten het aanbod groeit.
            </p>
            <p className="mt-3 text-sm text-primary-foreground/70">
              Laatst bijgewerkt: {updated} · bron: eigen aanbodadministratie Woonaanbod NL
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link to="/huurwoningen">Bekijk huurwoningen</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/woonradar">Gratis dagelijkse alert</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((k) => (
              <Card key={k.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <k.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{k.label}</span>
                  </div>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground tabular-nums">
                    {isLoading ? <Skeleton className="h-8 w-28" /> : k.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{k.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="container space-y-12 pb-16">
          <CityTable
            id="huurprijs-per-m2"
            loading={isLoading}
            question="Wat is de gemiddelde huurprijs per m² per stad?"
            answer="Prijs per vierkante meter maakt steden pas echt vergelijkbaar: een studio van 30 m² voor € 900 is duurder dan een appartement van 80 m² voor € 1.600. Alleen plaatsen met minimaal 4 huurwoningen met een bekend woonoppervlak zijn opgenomen."
            title="Gemiddelde huurprijs per m² per maand"
            rows={data?.rent_per_m2_cities || []}
            columns={[
              { key: "per_m2", label: "Per m²", format: (r) => euro(r.per_m2, 2), align: "right" },
              { key: "avg_price", label: "Gem. huur", format: (r) => euro(r.avg_price), align: "right" },
              { key: "avg_area", label: "Gem. m²", format: (r) => num(r.avg_area), align: "right" },
              { key: "n", label: "Woningen", format: (r) => num(r.n), align: "right" },
            ]}
          />

          <CityTable
            id="nieuw-aanbod-deze-week"
            loading={isLoading}
            question="Welke gemeenten hebben deze week het meeste nieuwe aanbod?"
            answer="Alle woningen die in de afgelopen 7 dagen nieuw op Woonaanbod NL zijn geplaatst, geteld per gemeente. Hier zie je waar de doorstroom op de woningmarkt op dit moment het hoogst is en waar je kans dus het grootst is."
            title="Nieuw aanbod laatste 7 dagen"
            rows={data?.new_this_week_cities || []}
            columns={[
              { key: "n", label: "Nieuw", format: (r) => num(r.n), align: "right" },
              { key: "avg_price", label: "Gem. prijs", format: (r) => euro(r.avg_price), align: "right" },
            ]}
          />

          <CityTable
            id="huur-onder-1500"
            loading={isLoading}
            question="Waar vind je de meeste huurwoningen onder € 1.500?"
            answer="Voor veel huishoudens is € 1.500 per maand de bovengrens. Deze tabel toont per gemeente hoeveel huurwoningen daar nu onder blijven, plus de laagste huurprijs die op dit moment beschikbaar is."
            title="Huurwoningen tot € 1.500 per maand"
            rows={data?.rent_under_1500_cities || []}
            columns={[
              { key: "n", label: "Aanbod", format: (r) => num(r.n), align: "right" },
              { key: "min_price", label: "Vanaf", format: (r) => euro(r.min_price), align: "right" },
              { key: "avg_price", label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
            ]}
          />

          <CityTable
            id="koop-onder-400k"
            loading={isLoading}
            question="Hoeveel koopwoningen onder € 400.000 staan er te koop?"
            answer="Het budget van veel starters ligt rond de vier ton. Hieronder staat per gemeente hoeveel koopwoningen binnen dat budget vallen in het huidige aanbod."
            title="Koopwoningen tot € 400.000"
            rows={data?.buy_under_400k_cities || []}
            columns={[
              { key: "n", label: "Aanbod", format: (r) => num(r.n), align: "right" },
              { key: "min_price", label: "Vanaf", format: (r) => euro(r.min_price), align: "right" },
              { key: "avg_price", label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
            ]}
          />

          <CityTable
            id="gemiddelde-vraagprijs"
            loading={isLoading}
            question={`Wat is de gemiddelde vraagprijs van koopwoningen per stad (${period})?`}
            answer="Gemiddelde en mediane vraagprijs van alle koopwoningen die nu op Woonaanbod NL staan. De mediaan is minder gevoelig voor een enkele villa of penthouse en geeft daarom een realistischer beeld van de middenmarkt."
            title={`Gemiddelde vraagprijs koopwoningen, ${period}`}
            rows={data?.buy_avg_cities || []}
            columns={[
              { key: "avg_price", label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
              { key: "median_price", label: "Mediaan", format: (r) => euro(r.median_price), align: "right" },
              { key: "n", label: "Woningen", format: (r) => num(r.n), align: "right" },
            ]}
          />

          <CityTable
            id="gemiddelde-huurprijs"
            loading={isLoading}
            question={`Wat is de gemiddelde huurprijs per stad (${period})?`}
            answer="De gemiddelde en mediane maandhuur per gemeente, gebaseerd op het volledige actieve huuraanbod. Wijkt het gemiddelde sterk af van de mediaan? Dan zit er een klein aantal zeer dure woningen in het aanbod."
            title={`Gemiddelde huurprijs per maand, ${period}`}
            rows={data?.rent_avg_cities || []}
            columns={[
              { key: "avg_price", label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
              { key: "median_price", label: "Mediaan", format: (r) => euro(r.median_price), align: "right" },
              { key: "n", label: "Woningen", format: (r) => num(r.n), align: "right" },
            ]}
          />

          <section id="veelgestelde-vragen">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Veelgestelde vragen over deze cijfers
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {faq.map((f) => (
                <Card key={f.q}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground">{f.q}</h3>
                    <p className="mt-2 text-muted-foreground">{f.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="methode">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Methode en bron</h2>
            <div className="mt-3 max-w-4xl space-y-3 text-muted-foreground">
              <p>
                Alle cijfers op deze pagina worden op het moment van opvragen berekend uit het actieve
                woningaanbod op Woonaanbod NL ({num(n?.total)} woningen). We rekenen met de gevraagde huur- of
                vraagprijs zoals die door de aanbieder is opgegeven.
              </p>
              <p>
                Om uitschieters en invoerfouten eruit te filteren nemen we huurprijzen tussen € 200 en € 10.000
                per maand mee en koopprijzen tussen € 50.000 en € 5.000.000. Voor prijs per m² gebruiken we
                alleen woningen met een woonoppervlak tussen 10 en 500 m². Plaatsen met te weinig woningen om
                een betrouwbaar gemiddelde te vormen worden weggelaten.
              </p>
              <p>
                Dit is een momentopname van het aanbod, geen transactieprijsindex: het gaat om wat er nu wordt
                gevraagd, niet om wat er uiteindelijk is betaald. Wil je per stad verder inzoomen? Bekijk de{" "}
                <Link to="/markt/amsterdam" className="text-primary underline hover:no-underline">
                  huurprijsmonitor per stad
                </Link>{" "}
                of de{" "}
                <Link to="/huurprijs-index/amsterdam" className="text-primary underline hover:no-underline">
                  maandelijkse huurprijsindex
                </Link>
                . Overnemen van deze cijfers mag, met bronvermelding en een link naar deze pagina.
              </p>
            </div>
          </section>

          <section id="per-stad">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Cijfers per stad</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(data?.rent_avg_cities || []).slice(0, 24).map((c) => (
                <Button key={c.city} asChild variant="outline" size="sm">
                  <Link to={`/markt/${cityToSlug(c.city)}`}>Woningmarkt {c.city}</Link>
                </Button>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
