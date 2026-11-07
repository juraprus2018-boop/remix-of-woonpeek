import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import DailyAlertSection from "@/components/home/DailyAlertSection";
import SEOHead from "@/components/seo/SEOHead";
import { Mail, Clock, Filter, ShieldCheck, MousePointerClick, Inbox } from "lucide-react";

const ALERT_FAQ = [
  {
    question: "Hoe vaak ontvang ik een woningalert?",
    answer:
      "Zodra er nieuw aanbod bijkomt dat past bij jouw zoekopdracht, sturen we je een melding. Geen spam, alleen relevante woningen.",
  },
  {
    question: "Kan ik de alert filteren op stad?",
    answer:
      "Ja, je kunt bij het inschrijven een stad kiezen zodat je alleen woningen uit die regio ontvangt.",
  },
  {
    question: "Hoe schrijf ik me uit voor de alert?",
    answer: "In elke alert-e-mail staat een uitschrijflink. Eén klik en je bent direct afgemeld.",
  },
  {
    question: "Is de melding gratis?",
    answer: "Ja, de melding is volledig gratis. Je hebt alleen een e-mailadres nodig, geen account.",
  },
];

const STEPS = [
  {
    icon: Mail,
    title: "1. Laat je e-mailadres achter",
    text: "Kies je stad of stel filters in en vul je e-mailadres in. Meer heb je niet nodig, geen account.",
  },
  {
    icon: Inbox,
    title: "2. Wij verzamelen het aanbod",
    text: "Elke dag halen we nieuwe woningen op bij makelaars, verhuurders en corporaties en bundelen die voor jou.",
  },
  {
    icon: MousePointerClick,
    title: "3. Jij reageert als eerste",
    text: "Nieuw aanbod staat in je inbox met directe links, zodat je snel kunt reageren.",
  },
];

const BENEFITS = [
  { icon: Clock, title: "Scheelt uren zoekwerk", text: "Eén overzicht in plaats van tien websites afstruinen." },
  { icon: Filter, title: "Alleen jouw regio", text: "Je ziet alleen woningen in de stad die je zelf kiest." },
  { icon: ShieldCheck, title: "Gratis, altijd opzegbaar", text: "Uitschrijven met één klik onderaan elke e-mail." },
];

const DailyAlert = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ALERT_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Gratis woningmelding – Nieuw aanbod direct per e-mail | Woonaanbod NL"
        description="Nieuwe woning gevonden? Ontvang direct een gratis melding per e-mail. Stel je zoekopdracht in, vul je e-mailadres in, geen account nodig."
        canonical="/woonmelding"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header />
      <main className="flex-1">
        {/* Compacte header-balk — daaronder direct het inschrijfformulier */}
        <section className="border-b border-border bg-primary text-primary-foreground">
          <div className="container py-5 md:py-6">
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Woonmelding" }]}
            />
            <h1 className="mt-3 max-w-3xl font-display text-2xl font-bold md:text-3xl">
              Nieuwe woning gevonden? Ontvang direct een gratis melding
            </h1>
          </div>
        </section>

        {/* Inschrijven — direct zichtbaar bij openen */}
        <DailyAlertSection />

        {/* Hoe het werkt */}
        <section className="container py-12 md:py-16">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Zo werkt de gratis woningmelding
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Voordelen */}
        <section className="border-t border-border bg-muted/40 py-12 md:py-16">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  Waarom mensen de radar aanzetten
                </h2>
                <p className="mt-3 text-muted-foreground">
                  In een krappe woningmarkt is snelheid het enige dat echt helpt. Woningen
                  die vandaag online komen, hebben morgen vaak al tientallen reacties. Met een
                  melding loop je niet achter de feiten aan.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {BENEFITS.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-2xl border border-border bg-card p-5">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border py-12 md:py-16">
          <div className="container">
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground md:text-3xl">
              Veelgestelde vragen over de woningmelding
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {ALERT_FAQ.map((item) => (
                <div key={item.question} className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {item.question}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{item.answer}</p>
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

export default DailyAlert;
