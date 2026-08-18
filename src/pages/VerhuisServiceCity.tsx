import { useParams, Navigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, ShieldCheck, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { getValidCityName } from "@/lib/dutchCities";

const QUOTE_URL = "https://www.verhuisofferte.nl/?utm_source=woonaanbod-nl&utm_medium=affiliate";

const VerhuisServiceCity = () => {
  const { city } = useParams<{ city: string }>();
  const cityName = city ? getValidCityName(city) : undefined;
  if (!city || !cityName) return <Navigate to="/verhuisservice" replace />;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Wat kost een verhuisbedrijf in ${cityName}?`,
        acceptedAnswer: { "@type": "Answer", text: `Een lokale verhuizing in ${cityName} kost gemiddeld € 400 tot € 1.200, afhankelijk van het volume, de bereikbaarheid van de woning en eventuele extra services.` } },
      { "@type": "Question", name: `Welke verhuisbedrijven werken in ${cityName}?`,
        acceptedAnswer: { "@type": "Answer", text: `In ${cityName} zijn meerdere AMV-erkende verhuizers actief, van zzp'ers tot landelijke ketens. Via onze tool ontvang je in één aanvraag offertes van tot vijf bedrijven die direct beschikbaar zijn voor jouw verhuisdatum.` } },
      { "@type": "Question", name: `Wanneer boek ik een verhuizer in ${cityName}?`,
        acceptedAnswer: { "@type": "Answer", text: `In drukke steden als ${cityName} adviseren we minstens 4 tot 6 weken vooraf te boeken, zeker rond einde maand en tijdens de zomermaanden.` } },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title={`Verhuisbedrijf ${cityName} vergelijken – tot 40% besparen`}
        description={`Vergelijk gratis erkende verhuisbedrijven in ${cityName}. Ontvang binnen 24 uur tot vijf offertes en bespaar tot 40% op je verhuizing.`}
        canonical={`https://www.woonaanbod-nl.nl/verhuisservice/${city}`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container py-8 md:py-12">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Verhuisservice", href: "/verhuisservice" }, { label: cityName }]} />
            <div className="mt-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Truck className="h-3.5 w-3.5" />
                Verhuisbedrijf {cityName}
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Verhuisbedrijf <span className="text-primary">{cityName}</span> vergelijken
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Verhuis je naar, vanuit of binnen {cityName}? Ontvang in één aanvraag
                offertes van meerdere erkende verhuizers en kies de scherpste prijs.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={QUOTE_URL} target="_blank" rel="noopener nofollow sponsored">
                    Gratis offertes aanvragen <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/verhuischecklist">Verhuischecklist</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold md:text-3xl">Verhuizers in {cityName}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { icon: Truck, title: "Lokale kennis", desc: `Verhuizers met ervaring in de smalle straten en grachten van ${cityName}.` },
                { icon: ShieldCheck, title: "AMV-erkend", desc: "Alleen verzekerde verhuisbedrijven met geldig keurmerk." },
                { icon: Clock, title: "Snelle reactie", desc: "Offertes binnen 24 uur in je mailbox, vergelijk op je gemak." },
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
          <div className="container grid gap-10 md:grid-cols-2">
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Wat is inbegrepen?</h2>
              <ul className="space-y-3">
                {[
                  `Transport binnen en buiten ${cityName}`,
                  "Optioneel in- en uitpakken",
                  "Verhuislift bij hoge verdiepingen",
                  "Tijdelijke opslag indien nodig",
                  "Volledige transportverzekering",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Verhuizen naar {cityName}?</h2>
              <p>
                Regel direct ook je{" "}
                <Link to={`/energie/${city}`} className="text-primary underline">energiecontract in {cityName}</Link>{" "}
                en bekijk het{" "}
                <Link to={`/stad/${city}`} className="text-primary underline">actuele woningaanbod</Link>.
                Een lege woning is ook een mooi moment om je{" "}
                <Link to="/internet" className="text-primary underline">internetabonnement</Link>{" "}
                te vergelijken.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-10">
          <div className="container">
            <p className="text-xs text-muted-foreground">
              Offertes worden aangeboden via onze partner. Woonaanbod NL ontvangt
              mogelijk een vergoeding bij een succesvolle aanvraag.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VerhuisServiceCity;
