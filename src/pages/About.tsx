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
    answer: "Yep. Zoeken, alerts, je eigen huurwoning plaatsen. Allemaal nul euro. Geen abo, geen kleine lettertjes.",
  },
  {
    question: "Hoe verdienen jullie dan geld?",
    answer: "Via samenwerkingen met makelaars en verhuurplatforms. Zij betalen, jij niet.",
  },
  {
    question: "Hoeveel huurwoningen staan er online?",
    answer: "Elke dag duizenden actieve huurwoningen uit heel Nederland, van meerdere bronnen tegelijk.",
  },
  {
    question: "Kan ik zelf een huurwoning plaatsen?",
    answer: "Zeker. Als particuliere verhuurder zet je je woning gratis online en bereik je een hoop zoekers.",
  },
];

const stats = [
  { label: "Huurwoningen online", value: "6.000+" },
  { label: "Update", value: "Elke dag" },
  { label: "Voor jou", value: "Gratis" },
  { label: "Steden", value: "100+" },
];

const usps = [
  {
    icon: Home,
    title: "Een berg aanbod",
    description:
      "Wij trekken huurwoningen uit allerlei platforms naar elkaar toe. Van appartementen en huizen tot studio's en kamers. Geen vijf sites meer openhebben dus.",
  },
  {
    icon: RefreshCw,
    title: "Elke dag bij",
    description:
      "Het platform ververst zichzelf elke dag. Weg is weg, nieuw staat er meteen op. Niks meer reageren op iets dat al verhuurd is.",
  },
  {
    icon: Heart,
    title: "Echt gratis",
    description:
      "Geen freemium, geen plus-pakket. Zoeken, alerts en zelf plaatsen kost niks. Punt.",
  },
  {
    icon: Bell,
    title: "Mail-alerts die werken",
    description:
      "Elke ochtend een overzicht van wat er bij is gekomen in jouw stad en budget. Bevalt het niet? Eén klik en je bent eruit.",
  },
];

const About = () => {
  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Over Woonaanbod NL",
    description:
      "Woonaanbod NL is een gratis platform voor huurwoningen. Elke dag vers aanbod uit heel Nederland op één plek.",
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
        description="Woonaanbod NL verzamelt elke dag het verste huuraanbod uit heel Nederland op één plek. Gratis zoeken, alerts en zelf je huurwoning plaatsen."
        canonical="https://www.woonaanbod-nl.nl/over-woonaanbod-nl"
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
                Woonaanbod NL is het gratis platform voor huurwoningen in Nederland. Wij trekken elke dag
                het nieuwste huuraanbod van allerlei bronnen naar één plek. Zodat jij niet hoeft te switchen.
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
                Heb je een huurwoning beschikbaar? Zet hem hier gratis online en bereik in een paar tellen
                duizenden zoekers. Geen plaatsingskosten, geen rare voorwaarden.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/plaatsen-start">
                  <Button size="lg" className="gap-2">
                    Plaats gratis je woning
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/woonradar">
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
