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
import { Link } from "react-router-dom";

/**
 * WOZ-waarde tool: helps users look up their property's WOZ value and
 * understand what it means. Internal link magnet + AdSense slot anchor.
 */
const WozWaarde = () => {
  const [address, setAddress] = useState("");

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Wat is de WOZ-waarde?",
        acceptedAnswer: { "@type": "Answer", text: "De WOZ-waarde (Waardering Onroerende Zaken) is de geschatte marktwaarde van een woning op 1 januari van het vorige jaar. Gemeenten gebruiken deze waarde voor heffingen zoals OZB, waterschapsbelasting en eigenwoningforfait." } },
      { "@type": "Question", name: "Waar kan ik mijn WOZ-waarde gratis opvragen?",
        acceptedAnswer: { "@type": "Answer", text: "Iedereen kan elke Nederlandse WOZ-waarde gratis bekijken via het WOZ-waardeloket (wozwaardeloket.nl). Vul het adres in en je ziet de actuele waarde plus historie." } },
      { "@type": "Question", name: "Waarom is de WOZ-waarde belangrijk voor huurders?",
        acceptedAnswer: { "@type": "Answer", text: "Bij gereguleerde huur bepaalt de WOZ-waarde mede de maximale huurprijs via het puntensysteem. Te hoge huur? Dan kun je via de Huurcommissie verlaging vragen." } },
      { "@type": "Question", name: "Kan ik bezwaar maken tegen de WOZ-waarde?",
        acceptedAnswer: { "@type": "Answer", text: "Ja. Je hebt zes weken na ontvangst van de WOZ-beschikking om bezwaar te maken bij je gemeente. Een lagere WOZ levert directe besparing op OZB en eigenwoningforfait op." } },
    ],
  };

  const handleLookup = () => {
    const q = address.trim();
    if (!q) return;
    window.open(`https://www.wozwaardeloket.nl/index.jsp?q=${encodeURIComponent(q)}`, "_blank", "noopener");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="WOZ-waarde opvragen – gratis en direct online | Woonaanbod NL"
        description="Vraag gratis de WOZ-waarde van elke Nederlandse woning op. Inclusief uitleg over OZB, huurprijs, bezwaar maken en eigenwoningforfait."
        canonical="/woz-waarde"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container py-8 md:py-12">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "WOZ-waarde" }]} />
            <div className="mt-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Calculator className="h-3.5 w-3.5" />
                WOZ-tool
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                WOZ-waarde <span className="text-primary">opvragen</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Vul een adres in en bekijk direct de actuele WOZ-waarde. Handig bij
                aankoop, verkoop of bezwaar tegen je gemeentelijke aanslag.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container max-w-3xl">
            <Card>
              <CardContent className="p-5 md:p-6">
                <Label htmlFor="woz-address" className="text-sm font-semibold">Adres</Label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="woz-address"
                    placeholder="Bijv. Damrak 1, Amsterdam"
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
                  Opzoeken gebeurt via het officiële WOZ-waardeloket. Volledig gratis en zonder account.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container space-y-6 text-sm leading-relaxed text-muted-foreground md:text-base">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Wat doet de WOZ-waarde?</h2>
            <p>
              De WOZ-waarde wordt jaarlijks vastgesteld door je gemeente en bepaalt
              de hoogte van onder andere de onroerendezaakbelasting (OZB),
              waterschapsbelasting, eigenwoningforfait in box 1 en erfbelasting.
              Voor verhuurders en huurders in de gereguleerde sector bepaalt de WOZ
              bovendien een deel van het puntensysteem.
            </p>
            <h3 className="text-xl font-semibold text-foreground">Bezwaar maken loont</h3>
            <p>
              Bij twijfel over de waarde heb je zes weken na ontvangst van de
              beschikking om bezwaar te maken. Een verlaging van € 25.000 op de
              WOZ-waarde levert jaarlijks tientallen tot honderden euro's belasting-
              voordeel op. Verzamel referentiewoningen uit dezelfde straat en wijk
              en onderbouw waarom jouw woning afwijkt.
            </p>
            <h3 className="text-xl font-semibold text-foreground">WOZ en huurprijs</h3>
            <p>
              Voor sociale huurwoningen en gereguleerde middenhuur telt de WOZ-
              waarde mee in het woningwaarderingsstelsel. Een hoge WOZ kan de
              maximale huur omhoog duwen, een lage juist beperken. Twijfel je of
              jouw huur te hoog is, check dan de puntentelling via de Huurcommissie.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/hypotheek-berekenen">Hypotheek berekenen <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/energie">Energie vergelijken</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/budgetcheck">Budgetcheck</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-10">
          <div className="container">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Lage WOZ? Lagere lasten.</h3>
                <p className="mt-1 text-sm text-muted-foreground">Combineer een succesvolle WOZ-aanpassing met een scherper energiecontract en bespaar al snel honderden euro's per jaar.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WozWaarde;
