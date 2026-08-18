import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import DaisyconInternetWidget from "@/components/energy/DaisyconInternetWidget";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, PiggyBank, ShieldCheck, Tv } from "lucide-react";

const InternetVergelijken = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Hoeveel kan ik besparen door internet te vergelijken?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Huishoudens besparen gemiddeld € 150 tot € 400 per jaar door over te stappen naar een goedkopere internet- of tv-aanbieder.",
        },
      },
      {
        "@type": "Question",
        name: "Welke aanbieders worden vergeleken?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Alle grote Nederlandse aanbieders, waaronder Ziggo, KPN, Odido, Online.nl, Solcon en Caiway.",
        },
      },
      {
        "@type": "Question",
        name: "Hoe snel ben ik online na een overstap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bij een overstap met behoud van aansluiting ben je vaak binnen 5 tot 10 werkdagen online. Voor een nieuwe aansluiting kan het 2 tot 4 weken duren.",
        },
      },
    ],
  };

  const benefits = [
    {
      icon: PiggyBank,
      title: "Bespaar tot € 400 per jaar",
      desc: "Vergelijk alle internet, tv en bel-pakketten van alle providers.",
    },
    {
      icon: ShieldCheck,
      title: "Welkomstkortingen",
      desc: "Nieuwe klanten krijgen vaak cashback of de eerste maanden gratis.",
    },
    {
      icon: Tv,
      title: "Internet, tv en bellen",
      desc: "Vergelijk losse abonnementen of voordelige all-in pakketten.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Internet vergelijken – Beste internet en tv aanbieder | Woonaanbod NL"
        description="Vergelijk internet, tv en bellen van Ziggo, KPN, Odido en meer. Bespaar tot € 400 per jaar bij een overstap. Gratis en vrijblijvend via Woonaanbod NL."
        canonical="https://www.woonaanbod-nl.nl/internet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container py-8 md:py-12">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Internet vergelijken" }]} />
            <div className="mt-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Wifi className="h-3.5 w-3.5" /> Internet & tv
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Internet vergelijken en{" "}
                <span className="text-primary">tot € 400 per jaar besparen</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Net verhuisd of toe aan een nieuw abonnement? Vergelijk binnen één
                minuut alle Nederlandse internet, tv en bel-aanbieders en kies het
                beste pakket voor jouw nieuwe woning.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container">
            <Card className="overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <DaisyconInternetWidget />
              </CardContent>
            </Card>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Vergelijking aangeboden via Daisycon. Woonaanbod NL ontvangt mogelijk een
              vergoeding bij een succesvolle overstap.
            </p>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold md:text-3xl">
              Waarom internet vergelijken via Woonaanbod NL?
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
              Hoe werkt internet vergelijken?
            </h2>
            <p>
              Vul je postcode en huisnummer in en de tool toont direct welke
              aanbieders en snelheden beschikbaar zijn op jouw adres. Filter op
              prijs, snelheid, looptijd en of je tv of vaste telefoon erbij wilt.
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              Glasvezel, kabel of DSL?
            </h3>
            <p>
              Glasvezel biedt de hoogste snelheden (tot 8 Gbit/s) en is in steeds
              meer plaatsen beschikbaar. Kabel (Ziggo) zit in vrijwel heel
              Nederland en haalt tot 1 Gbit/s. DSL via koperdraad is vaak nog de
              goedkoopste optie maar lager in snelheid.
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              Combineer met energie en bespaar nog meer
            </h3>
            <p>
              Veel huishoudens regelen bij een verhuizing in één moeite door ook
              energie en verzekeringen. Bekijk ook onze{" "}
              <a href="/energie" className="text-primary underline">energievergelijker</a>{" "}
              om dubbel te besparen.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InternetVergelijken;
