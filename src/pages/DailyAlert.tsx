import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import DailyAlertSection from "@/components/home/DailyAlertSection";
import SEOHead from "@/components/seo/SEOHead";
import { Mail, Clock, Filter, ShieldCheck, MousePointerClick, Inbox } from "lucide-react";
import alertIllustration from "@/assets/woonradar-illustratie.jpg";

const ALERT_FAQ = [
  {
    question: "Hoe vaak ontvang ik een woningalert?",
    answer:
      "Je ontvangt elke maandagochtend één e-mail met het nieuwste woningaanbod van de afgelopen week. Geen spam, alleen relevant aanbod.",
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
    question: "Is de wekelijkse alert gratis?",
    answer: "Ja, de wekelijkse woningalert is volledig gratis. Er zijn geen kosten aan verbonden.",
  },
];

const STEPS = [
  {
    icon: Mail,
    title: "1. Laat je e-mailadres achter",
    text: "Kies je stad en vul je e-mailadres in. Meer heb je niet nodig, geen account, geen betaalgegevens.",
  },
  {
    icon: Inbox,
    title: "2. Wij verzamelen het aanbod",
    text: "Elke dag halen we nieuwe woningen op bij makelaars, verhuurders en corporaties en bundelen die voor jou.",
  },
  {
    icon: MousePointerClick,
    title: "3. Jij reageert als eerste",
    text: "Maandagochtend staat het nieuwste aanbod in je inbox, met directe links naar de woningen.",
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
        title="Wekelijkse Woningalert – Ontvang nieuw aanbod per e-mail | Woonaanbod NL"
        description="Schrijf je gratis in voor de Woonaanbod NL wekelijkse alert en ontvang elke maandag een e-mail met het nieuwste woningaanbod in Nederland."
        canonical="/woonradar"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-primary text-primary-foreground">
          <div className="container grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Breadcrumbs
                items={[{ label: "Home", href: "/" }, { label: "Woonradar" }]}
              />
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground">
                Gratis e-mailalert
              </span>
              <h1 className="mt-4 max-w-2xl font-display text-3xl font-bold md:text-4xl lg:text-5xl">
                Woonradar: nieuw woningaanbod in je inbox
              </h1>
              <p className="mt-4 max-w-xl text-lg text-primary-foreground/85">
                Zet de radar aan voor jouw stad en ontvang elke maandag een overzicht van
                alles wat er nieuw bij kwam. Zo hoef je niet elke dag zelf te zoeken en ben
                je toch snel als er iets vrijkomt.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-primary-foreground/85 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sun" /> Eén e-mail per week
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sun" /> Zelf je stad kiezen
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sun" /> Geen account nodig
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sun" /> Altijd opzegbaar
                </li>
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <div className="overflow-hidden rounded-3xl border border-primary-foreground/15 shadow-xl">
                <img
                  src={alertIllustration}
                  alt="Woonradar stuurt nieuw woningaanbod per e-mail"
                  width={1024}
                  height={1024}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Hoe het werkt */}
        <section className="container py-12 md:py-16">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Zo werkt de woonradar
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

        {/* Inschrijven */}
        <DailyAlertSection />

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
                  die maandag online komen, hebben dinsdag vaak al tientallen reacties. De
                  woonradar zorgt dat je niet achter de feiten aanloopt.
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
              Veelgestelde vragen over de woonradar
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
