import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Clock, Star, ArrowRight, CheckCircle2 } from "lucide-react";

const QUOTE_URL = "https://www.verhuisofferte.nl/?utm_source=huurbaasje&utm_medium=affiliate";

const VerhuisService = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Wat kost een verhuisbedrijf gemiddeld?",
        acceptedAnswer: { "@type": "Answer", text: "Een gemiddelde verhuizing binnen Nederland kost tussen € 350 en € 1.500. De prijs hangt af van het volume, de afstand, het aantal verhuizers en eventuele extra services zoals in- en uitpakken." } },
      { "@type": "Question", name: "Hoe vergelijk ik verhuisbedrijven het beste?",
        acceptedAnswer: { "@type": "Answer", text: "Vraag minimaal drie offertes op bij erkende verhuizers, controleer of ze AMV-erkend en verzekerd zijn en lees onafhankelijke reviews. Onze tool stuurt je aanvraag in één keer naar meerdere bedrijven." } },
      { "@type": "Question", name: "Wanneer moet ik een verhuisbedrijf boeken?",
        acceptedAnswer: { "@type": "Answer", text: "Boek minstens 4 tot 6 weken vooraf, zeker in de drukke periode rond einde maand en in de zomer. Korter dan twee weken vooraf betaal je vaak een toeslag." } },
      { "@type": "Question", name: "Is een verhuisbedrijf verzekerd?",
        acceptedAnswer: { "@type": "Answer", text: "Erkende verhuizers zijn verplicht een transportverzekering te hebben. Controleer altijd of het bedrijf AMV-keurmerk heeft voor extra zekerheid bij schade." } },
    ],
  };

  const benefits = [
    { icon: Truck, title: "Tot 5 offertes", desc: "Eén aanvraag, meerdere erkende verhuisbedrijven reageren binnen 24 uur." },
    { icon: ShieldCheck, title: "Alleen AMV-erkend", desc: "Wij werken uitsluitend met verzekerde verhuizers met geldig keurmerk." },
    { icon: Clock, title: "Gratis & vrijblijvend", desc: "Vergelijk eerst, beslis daarna. Geen verplichtingen, geen verborgen kosten." },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Verhuisbedrijf vergelijken – Tot 40% besparen | Huurbaasje"
        description="Vergelijk gratis erkende verhuisbedrijven en bespaar tot 40% op je verhuizing. Ontvang binnen 24 uur tot vijf offertes van AMV-erkende verhuizers."
        canonical="https://www.huurbaasje.nl/verhuisservice"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container py-8 md:py-12">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Verhuisservice" }]} />
            <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                  <Truck className="h-3.5 w-3.5" />
                  Verhuisbedrijf vergelijker
                </span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                  Verhuisbedrijf <span className="text-primary">vergelijken</span> en tot 40% besparen
                </h1>
                <p className="mt-4 text-base text-muted-foreground md:text-lg">
                  Vraag in 2 minuten gratis offertes op bij erkende verhuizers in
                  heel Nederland. Eén formulier, tot vijf reacties binnen 24 uur.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <a href={QUOTE_URL} target="_blank" rel="noopener nofollow sponsored">
                      Vraag gratis offertes aan <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/verhuischecklist">Bekijk verhuischecklist</Link>
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-2">Gemiddeld 4,7/5 op basis van duizenden verhuizingen</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold md:text-3xl">Waarom via Huurbaasje vergelijken?</h2>
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
          <div className="container grid gap-10 md:grid-cols-2">
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Wat krijg je?</h2>
              <ul className="space-y-3">
                {[
                  "Tot 5 offertes van erkende verhuisbedrijven",
                  "Vergelijking op prijs, beschikbaarheid en reviews",
                  "Inclusief in- en uitpakservice (optioneel)",
                  "Verhuislift, opslag en demontage op aanvraag",
                  "Verzekerd transport via AMV-erkende verhuizers",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-4">
                <a href={QUOTE_URL} target="_blank" rel="noopener nofollow sponsored">
                  Start vergelijken <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Tips voor goedkoper verhuizen</h2>
              <p>
                Plan je verhuizing midweek en buiten de zomermaanden om tot 30%
                korting te krijgen. Lever ook duidelijke informatie aan: aantal m³,
                trappen, parkeerafstand en of er een verhuislift nodig is. Hoe
                preciezer de offerte-aanvraag, hoe scherper de prijs.
              </p>
              <p>
                Combineer je verhuizing direct met een nieuw{" "}
                <Link to="/energie" className="text-primary underline">energiecontract</Link>{" "}
                en{" "}
                <Link to="/internet" className="text-primary underline">internetabonnement</Link>{" "}
                voor het nieuwe adres. Dat scheelt al snel honderden euro's per jaar.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-10">
          <div className="container">
            <p className="text-xs text-muted-foreground">
              Offertes worden aangeboden via onze partner. Huurbaasje ontvangt
              mogelijk een vergoeding bij een succesvolle aanvraag. Dit beïnvloedt
              niet de prijs die jij betaalt.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VerhuisService;
