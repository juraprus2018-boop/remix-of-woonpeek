import { useParams, Navigate, Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingDown, ExternalLink, ArrowRight } from "lucide-react";
import { getValidCityName } from "@/lib/dutchCities";

/**
 * City-specific WOZ landing. Long-tail SEO: "woz waarde {stad}".
 */
const WozWaardeCity = () => {
  const { city } = useParams<{ city: string }>();
  const cityName = city ? getValidCityName(city) : undefined;
  const [address, setAddress] = useState("");

  if (!city || !cityName) return <Navigate to="/woz-waarde" replace />;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Hoe vraag ik de WOZ-waarde op in ${cityName}?`,
        acceptedAnswer: { "@type": "Answer", text: `Vul het adres in het WOZ-waardeloket in. Iedere woning in ${cityName} is gratis op te zoeken, zonder account of registratie.` } },
      { "@type": "Question", name: `Hoe wordt de WOZ in ${cityName} bepaald?`,
        acceptedAnswer: { "@type": "Answer", text: `De gemeente ${cityName} stelt jaarlijks de WOZ-waarde vast op basis van vergelijkbare woningverkopen rondom de peildatum van 1 januari van het voorgaande jaar.` } },
      { "@type": "Question", name: `Kan ik bezwaar maken tegen de WOZ in ${cityName}?`,
        acceptedAnswer: { "@type": "Answer", text: `Ja, je hebt zes weken na ontvangst van de beschikking om bezwaar te maken bij de gemeente ${cityName}. Veel inwoners doen dit kosteloos via een no-cure-no-pay bureau.` } },
    ],
  };

  const handleLookup = () => {
    const q = address.trim() || cityName;
    window.open(`https://www.wozwaardeloket.nl/index.jsp?q=${encodeURIComponent(q)}`, "_blank", "noopener");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title={`WOZ-waarde ${cityName} opvragen – gratis en direct`}
        description={`Bekijk gratis de WOZ-waarde van elke woning in ${cityName}. Inclusief uitleg over OZB, eigenwoningforfait en bezwaarprocedure.`}
        canonical={`https://www.woonaanbod-nl.nl/woz-waarde/${city}`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container py-8 md:py-12">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "WOZ-waarde", href: "/woz-waarde" }, { label: cityName }]} />
            <div className="mt-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Calculator className="h-3.5 w-3.5" />
                WOZ-tool {cityName}
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                WOZ-waarde <span className="text-primary">{cityName}</span> opvragen
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Vul een adres in {cityName} in en bekijk direct de actuele WOZ-waarde.
                Handig bij aankoop, verkoop, bezwaar of het bepalen van een eerlijke
                huurprijs in de gereguleerde sector.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container max-w-3xl">
            <Card>
              <CardContent className="p-5 md:p-6">
                <Label htmlFor="woz-address" className="text-sm font-semibold">Adres in {cityName}</Label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="woz-address"
                    placeholder={`Bijv. Straatnaam 1, ${cityName}`}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    className="flex-1"
                  />
                  <Button onClick={handleLookup} className="gap-1.5">
                    Toon WOZ-waarde <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Opzoeken via het officiële WOZ-waardeloket. Gratis, zonder account.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container space-y-6 text-sm leading-relaxed text-muted-foreground md:text-base">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">WOZ in {cityName}</h2>
            <p>
              De gemeente {cityName} stelt jaarlijks per 1 januari de WOZ-waarde vast.
              Deze waarde bepaalt mede de hoogte van je OZB, het eigenwoningforfait
              in box 1 en, bij gereguleerde huur, de maximale huurprijs via het
              puntensysteem. Een te hoge WOZ betekent een te hoge belastingaanslag.
            </p>
            <h3 className="text-xl font-semibold text-foreground">Bezwaar maken</h3>
            <p>
              Inwoners van {cityName} kunnen binnen zes weken na de beschikking
              bezwaar maken. Verzamel referentiewoningen uit dezelfde straat of
              buurt en onderbouw waarom jouw woning lager gewaardeerd zou moeten
              worden. Veel bezwaarprocedures gaan via no-cure-no-pay bureaus die
              alleen kosten in rekening brengen bij succes.
            </p>
            <h3 className="text-xl font-semibold text-foreground">WOZ en huurprijs</h3>
            <p>
              Verhuur je of huur je in {cityName} in de gereguleerde sector? Dan
              speelt de WOZ-waarde mee in de puntentelling. Een te hoge huur kun je
              via de Huurcommissie laten controleren en zo nodig laten verlagen.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container flex flex-wrap gap-3">
            <Button asChild>
              <Link to={`/stad/${city}`}>Woningen in {cityName} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline"><Link to={`/markt/${city}`}>Huurprijsmonitor {cityName}</Link></Button>
            <Button asChild variant="outline"><Link to="/hypotheek-berekenen">Hypotheek berekenen</Link></Button>
            <Button asChild variant="outline"><Link to={`/energie/${city}`}>Energie {cityName}</Link></Button>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-10">
          <div className="container">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Lagere WOZ = lagere lasten</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Combineer een succesvol WOZ-bezwaar in {cityName} met een scherper
                  energiecontract en bespaar al snel honderden euro's per jaar.
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

export default WozWaardeCity;
