import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Sparkles, Leaf, Shield, ArrowRight } from "lucide-react";

const TOP_CITIES = [
  "amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven", "groningen",
  "tilburg", "almere", "breda", "nijmegen", "haarlem", "arnhem", "zwolle",
];

const Nieuwbouw = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wat telt als nieuwbouw?",
        acceptedAnswer: { "@type": "Answer", text: "Woningen die in de afgelopen vijf jaar zijn opgeleverd of nog in aanbouw zijn, worden in Nederland gerekend tot nieuwbouw." },
      },
      {
        "@type": "Question",
        name: "Wat zijn de voordelen van een nieuwbouwwoning?",
        acceptedAnswer: { "@type": "Answer", text: "Lage energiekosten dankzij label A++, geen achterstallig onderhoud, garantie via Woningborg of SWK en vaak 6% lagere overdrachtsbelasting (vrijstelling onder voorwaarden)." },
      },
      {
        "@type": "Question",
        name: "Kan ik nieuwbouw huren?",
        acceptedAnswer: { "@type": "Answer", text: "Ja, een groeiend deel van de nieuwbouw wordt aangeboden in de vrije huursector. Filter op bouwjaar 2020 of nieuwer om alleen recente nieuwbouw te zien." },
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Nieuwbouw woningen in Nederland – huren en kopen | Huurbaasje"
        description="Bekijk het complete nieuwbouwaanbod in Nederland. Energiezuinig wonen met label A++, garantie en lagere maandlasten. Filter op stad of bouwjaar."
        canonical="https://www.huurbaasje.nl/nieuwbouw"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container py-8 md:py-12">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Nieuwbouw" }]} />
            <div className="mt-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Building2 className="h-3.5 w-3.5" />
                Nieuwbouwgids
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Nieuwbouw in <span className="text-primary">heel Nederland</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Energiezuinige woningen met label A++, garantie en lagere maandlasten.
                Bekijk het aanbod nieuwbouw per stad en regel direct de scherpste
                energietarieven voor je nieuwe adres.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold md:text-3xl">Voordelen van nieuwbouw</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { icon: Leaf, title: "Energiezuinig label A++", desc: "Nieuwbouw is gasloos en goed geïsoleerd. Bespaar honderden euro's per jaar op je energierekening." },
                { icon: Shield, title: "Garantie en zekerheid", desc: "Via Woningborg of SWK heb je tot 10 jaar garantie op constructie en installaties." },
                { icon: Sparkles, title: "Niets te klussen", desc: "Verhuis direct in en geniet van moderne afwerking, slimme indeling en eigentijds comfort." },
              ].map((b) => (
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

        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold md:text-3xl">Nieuwbouw per stad</h2>
            <p className="mt-2 text-muted-foreground">Bekijk het complete woningaanbod in de grootste nieuwbouwsteden van Nederland.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {TOP_CITIES.map((c) => (
                <Link key={c} to={`/nieuwbouw/${c}`} className="rounded-lg border bg-card px-4 py-3 text-sm font-medium capitalize transition hover:border-primary hover:text-primary">
                  {c.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/huren">Bekijk huuraanbod <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/energie">Vergelijk energie</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/hypotheek-berekenen">Hypotheek berekenen</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Nieuwbouw;
