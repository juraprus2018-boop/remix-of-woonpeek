import { Home, RefreshCw, Heart, Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";

const ABOUT_FAQ = [
  {
    question: "Is Woonaanbod NL echt gratis?",
    answer: "De kosten en voorwaarden kunnen per functie verschillen. Bekijk de informatie bij de betreffende functie.",
  },
  {
    question: "Hoe verdienen jullie dan geld?",
    answer: "Informatie over inkomstenbronnen is nog niet gepubliceerd.",
  },
  {
    question: "Kan ik zelf een huurwoning plaatsen?",
    answer: "Bekijk de plaatsingspagina voor de actuele mogelijkheden en voorwaarden.",
  },
];

const stats = [
  { label: "Aanbod bekijken", value: "Op één plek" },
  { label: "Zoeken", value: "Via filters" },
  { label: "Organisatie", value: "Woonaanbod NL" },
];

const usps = [
  {
    icon: Home,
    title: "Een berg aanbod",
    description:
      "Bekijk huurwoningen van verschillende aanbieders, waaronder appartementen, huizen, studio’s en kamers.",
  },
  {
    icon: RefreshCw,
    title: "Elke dag bij",
    description:
      "Beschikbaarheid kan veranderen. Controleer de actuele status bij de aanbieder voordat je reageert.",
  },
  {
    icon: Heart,
    title: "Echt gratis",
    description:
      "Geen freemium, geen plus-pakket. Zoeken, alerts en zelf plaatsen kost niks. Punt.",
  },
  {
    icon: Bell,
    title: "E-mailmeldingen",
    description:
      "Meldingen kunnen je attenderen op aanbod dat bij je zoekvoorkeuren past. Bekijk de instellingen voor de beschikbare opties.",
  },
];

const About = () => {
  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Over Woonaanbod NL",
    description:
      "Woonaanbod NL presenteert huurwoningen van verschillende aanbieders op één plek.",
    url: "https://www.woonaanbod-nl.nl/over-woonaanbod-nl",
    mainEntity: {
      "@type": "Organization",
      name: "Woonaanbod NL",
      url: "https://www.woonaanbod-nl.nl",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ABOUT_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Over Woonaanbod NL – Gratis platform voor huurwoningen in heel NL"
        description="Bekijk huurwoningen van verschillende aanbieders op Woonaanbod NL."
        canonical="/over"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-primary text-primary-foreground">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>
           <div className="container relative py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4">
                <Breadcrumbs
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Over Woonaanbod NL" },
                  ]}
                />
              </div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
                Over Woonaanbod NL
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
                Woonaanbod NL presenteert huurwoningen van verschillende aanbieders op één plek. Gebruik de zoekfilters om aanbod te bekijken.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-card">
          <div className="container py-10">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-primary md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USPs */}
        <section className="py-16 md:py-20">
          <div className="container">
            <h2 className="font-display text-center text-2xl font-bold text-foreground md:text-3xl">
              Waarom Woonaanbod NL?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Dit is waarom wij anders zijn dan de rest.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {usps.map((usp) => (
                <div
                  key={usp.title}
                  className="rounded-2xl border bg-card p-6 md:p-8"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <usp.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {usp.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {usp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="border-y bg-muted/30 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-6">
              <h2 className="font-display text-center text-2xl font-bold text-foreground md:text-3xl">
                Onze missie
              </h2>
              <p className="text-center leading-relaxed text-muted-foreground">
                De huurmarkt in Nederland is krap. Echt krap. Wie er bovenop wil zitten,
                checkt elke ochtend tien sites en is dan nog te laat. Dat moet anders.
                Woonaanbod NL brengt alles bij elkaar, gratis en elke dag bij.
              </p>
              <p className="text-center leading-relaxed text-muted-foreground">
                Wij vinden dat iedereen eerlijk bij het aanbod moet kunnen. Geen abo om de beste
                woningen te zien, geen kosten om een alert aan te zetten. Voor huurders, door mensen
                die zelf weten hoe vervelend dat zoeken is.
              </p>
            </div>
          </div>
        </section>

        {/* Gratis woning plaatsen */}
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Zelf je huurwoning plaatsen
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Heb je een huurwoning beschikbaar? Bekijk de plaatsingsstappen en voorwaarden voordat je begint.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/plaatsen-start">
                  <Button size="lg" className="gap-2">
                    Plaats gratis je woning
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/woonmelding">
                  <Button size="lg" variant="outline" className="gap-2">
                    Zet een alert aan
                    <Bell className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t bg-muted/30 py-16 md:py-20">
          <div className="container">
            <h2 className="font-display text-center text-2xl font-bold text-foreground md:text-3xl mb-8">
              Veelgestelde vragen over Woonaanbod NL
            </h2>
            <div className="space-y-6">
              {ABOUT_FAQ.map((item, i) => (
                <div key={i} className="rounded-lg border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {item.question}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
