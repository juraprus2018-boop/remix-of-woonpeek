import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import FAQSchema from "@/components/seo/FAQSchema";
import { Button } from "@/components/ui/button";
import { useHomeStats } from "@/hooks/useHomeStats";
import { ArrowRight, Check, RefreshCw, Link2, TrendingUp, BadgeEuro, Building2 } from "lucide-react";
import { FEED_TYPES } from "@/lib/agency";

const nf = new Intl.NumberFormat("nl-NL");

const FAQ = [
  { question: "Wat kost het?", answer: "Niets. Plaatsen en koppelen is gratis, zonder abonnement en zonder opzegtermijn." },
  { question: "Welke koppelingen worden ondersteund?", answer: "Een XML-feed, een JSON-feed of API-link, de XML-export van Realworks, of handmatig woningen toevoegen in je dashboard." },
  { question: "Hoe vaak wordt mijn aanbod bijgewerkt?", answer: "Elke nacht automatisch. Nieuwe woningen komen erbij, gewijzigde woningen worden bijgewerkt en woningen die uit je feed verdwijnen gaan offline." },
  { question: "Waar komen reacties terecht?", answer: "Woningzoekers klikken door naar jouw website of nemen direct contact op via je telefoon of e-mail. In je dashboard zie je vertoningen, clicks en reacties." },
  { question: "Kan ik stoppen?", answer: "Ja, altijd. Haal je woningen offline in het dashboard of ontkoppel je feed." },
];

const VoorMakelaars = () => {
  const { data: stats } = useHomeStats();
  const total = stats?.properties_count ?? 0;
  const cities = (stats as { cities_count?: number } | undefined)?.cities_count ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Woningaanbod gratis plaatsen als makelaar | Woonaanbod NL"
        description="Plaats je volledige woningaanbod gratis op Woonaanbod NL. Koppel je XML-, JSON- of Realworks-feed en bereik dagelijks extra woningzoekers. Geen abonnement."
      />
      <FAQSchema items={FAQ} />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-primary text-primary-foreground">
          <div className="container py-16 md:py-24">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-primary-foreground/70">Voor makelaars en verhuurders</p>
            <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">
              Plaats je volledige woningaanbod gratis op Woonaanbod NL
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">
              Koppel je feed één keer en je aanbod staat elke dag automatisch online, voor extra woningzoekers uit heel Nederland.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="gap-2 text-base">
                <Link to="/makelaar-portal">Plaats je woningaanbod gratis <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/makelaars">Bekijk aangesloten makelaars</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b">
          <div className="container grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Building2, title: total > 0 ? `${nf.format(total)}+ woningen` : "Duizenden woningen", text: cities > 0 ? `in ${nf.format(cities)} plaatsen op ons platform` : "op ons platform" },
              { icon: Link2, title: "Gratis koppeling", text: "XML, JSON of Realworks" },
              { icon: RefreshCw, title: "Dagelijkse sync", text: "automatisch, elke nacht" },
              { icon: TrendingUp, title: "Extra bereik", text: "Google, social en e-mailalerts" },
              { icon: BadgeEuro, title: "Geen abonnement", text: "nu volledig gratis" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <Icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <div className="font-display text-lg font-semibold text-foreground">{title}</div>
                  <div className="text-sm text-muted-foreground">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-14">
          <h2 className="font-display text-3xl font-semibold text-foreground">In drie stappen online</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { n: 1, t: "Aanmelden", d: "Maak een gratis account aan met je zakelijke e-mailadres." },
              { n: 2, t: "Bedrijfsprofiel", d: "Vul kantoornaam, plaats, website en logo in. Je krijgt een eigen pagina op Woonaanbod NL." },
              { n: 3, t: "Feed koppelen", d: "Plak je feed-link, test hem direct en klaar. Vanaf dan loopt alles automatisch." },
            ].map((s) => (
              <div key={s.n} className="rounded-lg border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">{s.n}</div>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="container py-14">
            <h2 className="font-display text-3xl font-semibold text-foreground">Ondersteunde koppelingen</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEED_TYPES.map((f) => (
                <div key={f.value} className="rounded-lg border bg-card p-5">
                  <div className="flex items-center gap-2 font-semibold text-foreground"><Check className="h-5 w-5 text-primary" />{f.label}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.help}</p>
                </div>
              ))}
            </div>
            <h3 className="mt-12 font-display text-xl font-semibold text-foreground">Wat je krijgt</h3>
            <ul className="mt-4 grid gap-2 text-foreground sm:grid-cols-2">
              {["Eigen makelaarspagina met logo, omschrijving en actueel aanbod", "Dashboard met vertoningen, clicks en reacties", "Woningen direct aangemeld bij Google en Bing", "Woningen toevoegen, bewerken en offline halen", "Zichtbaar in stadspagina's, zoekresultaten en e-mailalerts", "Feedstatus en foutmeldingen per synchronisatie"].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{t}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container py-14">
          <h2 className="font-display text-3xl font-semibold text-foreground">Veelgestelde vragen</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {FAQ.map((f) => (
              <div key={f.question} className="rounded-lg border bg-card p-5">
                <h3 className="font-semibold text-foreground">{f.question}</h3>
                <p className="mt-2 text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-lg bg-primary p-8 text-primary-foreground md:flex md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">Klaar om je aanbod te tonen?</h2>
              <p className="mt-1 text-primary-foreground/80">Binnen vijf minuten gekoppeld. Gratis.</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="mt-4 gap-2 md:mt-0">
              <Link to="/makelaar-portal">Plaats je woningaanbod gratis <ArrowRight className="h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VoorMakelaars;
