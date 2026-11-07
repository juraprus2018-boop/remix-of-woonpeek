import { useParams, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import DaisyconEnergyWidget from "@/components/energy/DaisyconEnergyWidget";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, PiggyBank, ShieldCheck, Leaf, ArrowRight } from "lucide-react";
import { getValidCityName } from "@/lib/dutchCities";

/**
 * City-specific energy comparison landing. Long-tail SEO: "energie vergelijken {stad}".
 * Mirrors EnergieVergelijken structure but with city context everywhere.
 */
const EnergieCityPage = () => {
  const { city } = useParams<{ city: string }>();
  const cityName = city ? getValidCityName(city) : undefined;

  if (!city || !cityName) {
    return <Navigate to="/energie" replace />;
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Hoeveel kan ik besparen op energie in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Huishoudens in ${cityName} besparen gemiddeld € 200 tot € 600 per jaar door over te stappen naar een goedkopere energieleverancier.`,
        },
      },
      {
        "@type": "Question",
        name: `Welke energieleveranciers leveren in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Alle grote landelijke leveranciers zoals Vattenfall, Essent, Eneco, Greenchoice en Budget Energie leveren stroom en gas in ${cityName}.`,
        },
      },
      {
        "@type": "Question",
        name: "Hoe lang duurt een overstap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Na bevestiging duurt een overstap meestal 3 tot 4 weken. Je zit niet zonder energie tijdens de overstap.",
        },
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title={`Energie vergelijken ${cityName} – Bespaar op gas en stroom`}
        description={`Vergelijk de actuele energietarieven van alle leveranciers in ${cityName} en bespaar tot € 600 per jaar. Gratis en vrijblijvend overstappen.`}
        canonical={`/energie/${city}`}
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
                { label: "Energie", href: "/energie" },
                { label: cityName },
              ]}
            />
            <div className="mt-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Zap className="h-3.5 w-3.5" />
                Energievergelijker {cityName}
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Energie vergelijken in <span className="text-primary">{cityName}</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Net verhuisd of binnenkort onderweg naar {cityName}? Vergelijk binnen één
                minuut alle energieleveranciers en regel direct het scherpste tarief
                voor jouw nieuwe adres.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container">
            <Card className="overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <DaisyconEnergyWidget />
              </CardContent>
            </Card>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Vergelijking aangeboden via Daisycon.
            </p>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold md:text-3xl">
              Waarom energie vergelijken in {cityName}?
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { icon: PiggyBank, title: "Tot € 600 besparen", desc: `Inwoners van ${cityName} betalen vaak meer dan nodig. Een snelle vergelijking levert direct besparing op.` },
                { icon: ShieldCheck, title: "100% vrijblijvend", desc: "Bekijk eerst alle aanbiedingen, je sluit pas af als je echt wilt overstappen." },
                { icon: Leaf, title: "Groene stroom", desc: "Filter op 100% Nederlandse groene stroom van zon, wind of waterkracht." },
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

        <section className="py-12 md:py-16">
          <div className="container space-y-6 text-sm leading-relaxed text-muted-foreground md:text-base">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Energieleveranciers in {cityName}
            </h2>
            <p>
              In {cityName} kun je bij elke landelijke energieleverancier terecht.
              Het regionale netbeheer wordt verzorgd door de regionale netbeheerder,
              maar je bent volledig vrij om zelf de leverancier te kiezen die je
              stroom en gas levert. Dat maakt vergelijken extra interessant.
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              Verhuizen binnen {cityName}?
            </h3>
            <p>
              Geef je verhuizing minstens vier weken van tevoren door. Bij een
              verhuizing mag je je contract zonder boete opzeggen en is dit hét
              moment om naar een scherper tarief over te stappen.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link to={`/stad/${city}`}>
                  Huurwoningen in {cityName} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/energie">Algemene energievergelijker</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EnergieCityPage;
