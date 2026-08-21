import { useParams, Navigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import EnergyCompareTeaser from "@/components/energy/EnergyCompareTeaser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Leaf, Shield, ArrowRight } from "lucide-react";
import { getValidCityName } from "@/lib/dutchCities";

const NieuwbouwCity = () => {
  const { city } = useParams<{ city: string }>();
  const cityName = city ? getValidCityName(city) : undefined;
  if (!city || !cityName) return <Navigate to="/nieuwbouw" replace />;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Waar vind ik nieuwbouw in ${cityName}?`,
        acceptedAnswer: { "@type": "Answer", text: `Nieuwbouwprojecten in ${cityName} zijn vooral te vinden in nieuwe wijken en herontwikkellocaties. Filter op bouwjaar 2020 of nieuwer voor het volledige nieuwbouwaanbod.` } },
      { "@type": "Question", name: `Wat zijn de gemiddelde nieuwbouwprijzen in ${cityName}?`,
        acceptedAnswer: { "@type": "Answer", text: `Nieuwbouw in ${cityName} ligt prijstechnisch ongeveer 10 tot 20 procent boven bestaande bouw, maar dat verdient zich snel terug via lagere energiekosten en garantie.` } },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title={`Nieuwbouw ${cityName} – energiezuinige woningen huren en kopen`}
        description={`Bekijk het complete nieuwbouwaanbod in ${cityName}. Label A++, garantie en lagere maandlasten. Filter op huur of koop.`}
        canonical={`https://www.woonaanbod-nl.nl/nieuwbouw/${city}`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container py-8 md:py-12">
            <Breadcrumbs items={[
              { label: "Home", href: "/" },
              { label: "Nieuwbouw", href: "/nieuwbouw" },
              { label: cityName },
            ]} />
            <div className="mt-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Building2 className="h-3.5 w-3.5" />
                Nieuwbouw {cityName}
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Nieuwbouw in <span className="text-primary">{cityName}</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Energiezuinige nieuwbouwwoningen in {cityName}: label A++, gasloos en
                met volledige garantie. Lagere maandlasten dan bij bestaande bouw.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container">
            <EnergyCompareTeaser context={cityName} />
          </div>
        </section>

        <section className="border-t py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold md:text-3xl">Waarom nieuwbouw in {cityName}?</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[
                { icon: Leaf, title: `Label A++ standaard`, desc: `Alle nieuwbouw in ${cityName} is gasloos en uitstekend geïsoleerd. Reken op € 100 tot € 200 per maand lagere energiekosten dan in bestaande bouw.` },
                { icon: Shield, title: `Tot 10 jaar garantie`, desc: `Via Woningborg of SWK ben je beschermd tegen verborgen gebreken. Bij koop val je vaak onder de overdrachtsbelasting-vrijstelling.` },
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

        <section className="bg-muted/30 py-12">
          <div className="container flex flex-wrap gap-3">
            <Button asChild>
              <Link to={`/stad/${city}`}>Alle woningen in {cityName} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/huurwoningen/${city}`}>Huren in {cityName}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/koopwoningen/${city}`}>Kopen in {cityName}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/energie/${city}`}>Energie in {cityName}</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NieuwbouwCity;
