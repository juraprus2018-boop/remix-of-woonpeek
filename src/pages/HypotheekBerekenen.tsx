import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import MortgageCalculator from "@/components/properties/MortgageCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingDown, ShieldCheck, Home } from "lucide-react";

const HypotheekBerekenen = () => {
  const [price, setPrice] = useState(350000);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Hoeveel hypotheek kan ik krijgen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "De maximale hypotheek hangt af van je bruto jaarinkomen, eventuele studieschuld en de rente. Vuistregel: ongeveer 4,5 keer je bruto jaarinkomen.",
        },
      },
      {
        "@type": "Question",
        name: "Wat zijn de actuele hypotheekrentes in Nederland?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hypotheekrentes liggen momenteel rond de 3,8% tot 4,5% voor een 10-jaar vaste rente met NHG. Vergelijk de actuele tarieven via een onafhankelijke adviseur.",
        },
      },
      {
        "@type": "Question",
        name: "Is een hypotheekadvies gratis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Een oriëntatiegesprek is meestal gratis en vrijblijvend. Voor het volledige adviestraject betaal je een eenmalige adviesvergoeding, die je deels kunt aftrekken van de belasting.",
        },
      },
    ],
  };

  const benefits = [
    { icon: TrendingDown, title: "Bespaar duizenden euro's", desc: "Een 0,2% rentevoordeel op 30 jaar scheelt al snel € 10.000 of meer." },
    { icon: ShieldCheck, title: "100% vrijblijvend", desc: "Bekijk eerst meerdere voorstellen voordat je iets afsluit." },
    { icon: Home, title: "NHG, starter of doorstromer", desc: "Vergelijk hypotheken die passen bij jouw situatie en woningwens." },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Hypotheek berekenen 2026 – Vergelijk en bespaar | Woonaanbod NL"
        description="Bereken direct je maximale hypotheek en maandlasten. Vergelijk vrijblijvend de actuele hypotheekrentes en bespaar duizenden euro's op je woonlasten."
        canonical="/hypotheek-berekenen"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container py-8 md:py-12">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Hypotheek berekenen" },
              ]}
            />
            <div className="mt-6 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Calculator className="h-3.5 w-3.5" />
                Hypotheek calculator
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Hypotheek berekenen en{" "}
                <span className="text-primary">duizenden euro's besparen</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Bereken in één minuut wat je maandlasten worden bij verschillende
                woningprijzen en rentes. Vergelijk daarna vrijblijvend de scherpste
                hypotheken bij erkende adviseurs.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card>
              <CardContent className="space-y-6 p-6">
                <div>
                  <Label className="text-sm font-medium">Woningprijs</Label>
                  <div className="mt-2 flex items-center justify-between text-2xl font-bold text-primary">
                    € {price.toLocaleString("nl-NL")}
                  </div>
                  <Slider
                    value={[price]}
                    onValueChange={([v]) => setPrice(v)}
                    min={100000}
                    max={1000000}
                    step={10000}
                    className="mt-4"
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>€ 100.000</span>
                    <span>€ 1.000.000</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pas de woningprijs aan en zie meteen welke maandlasten erbij horen.
                  De berekening rechts past zich direct aan.
                </p>
              </CardContent>
            </Card>
            <MortgageCalculator propertyPrice={price} />
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold md:text-3xl">
              Waarom een hypotheek vergelijken loont
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {benefits.map((b) => (
                <Card key={b.title}>
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <b.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container space-y-6 text-sm leading-relaxed text-muted-foreground md:text-base">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Hoe werkt een hypotheek berekenen?
            </h2>
            <p>
              Bij het berekenen van je hypotheek kijk je naar drie variabelen: het
              leenbedrag, de rente en de looptijd. Een annuïtaire hypotheek (de meest
              gekozen vorm in Nederland) heeft elke maand dezelfde lasten, waarbij je
              in het begin veel rente en weinig aflossing betaalt.
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              Maximale hypotheek: 4,5x je bruto jaarinkomen
            </h3>
            <p>
              Als vuistregel kun je tot ongeveer 4,5 keer je bruto jaarinkomen lenen.
              Bij twee inkomens telt het tweede inkomen mee. Met NHG (Nationale
              Hypotheek Garantie) krijg je tot € 405.000 (2026) extra zekerheid en
              vaak een lagere rente.
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              Starter of doorstromer?
            </h3>
            <p>
              Starters mogen tot € 525.000 vrijgesteld zijn van overdrachtsbelasting
              (jubelregeling vervangen door startersvrijstelling). Doorstromers
              kunnen overwaarde meenemen naar de nieuwe woning.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HypotheekBerekenen;
