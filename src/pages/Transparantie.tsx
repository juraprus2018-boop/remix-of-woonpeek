import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import { Database, Users, ShieldCheck, RefreshCw, Trash2, Mail } from "lucide-react";

const Transparantie = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SEOHead
      title="Transparantie - Hoe Stekly werkt | Stekly"
      description="Lees hoe Stekly aan zijn aanbod komt, welke databronnen we gebruiken, hoe we kwaliteit borgen en hoe je een woning kunt laten verwijderen."
      canonical="/transparantie"
    />
    <Header />
    <main className="flex-1">
      <section className="border-b-2 border-foreground bg-sage">
        <div className="container py-16 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/70">Transparantie</p>
          <h1 className="mt-3 font-display text-5xl lowercase leading-[0.95] md:text-7xl">
            geen black box. <span className="font-serif-display italic text-accent">openheid.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/80">
            Stekly bundelt huur- en koopwoningen uit heel Nederland. Hier leggen we precies uit waar ons aanbod vandaan komt, hoe vaak we actualiseren en wat je rechten zijn.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-foreground">
        <div className="container py-16">
          <h2 className="font-display text-3xl lowercase md:text-4xl">waar ons aanbod vandaan komt</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <article className="border-2 border-foreground p-6">
              <Database className="h-6 w-6" />
              <h3 className="mt-4 font-display text-xl lowercase">officiële makelaarsfeeds</h3>
              <p className="mt-2 text-sm text-foreground/80">Veel makelaars stellen hun aanbod als XML-feed beschikbaar. Wij halen die feeds 1x per dag op (03:00 - 04:00 NL-tijd) en synchroniseren direct met onze database.</p>
            </article>
            <article className="border-2 border-foreground p-6">
              <Users className="h-6 w-6" />
              <h3 className="mt-4 font-display text-xl lowercase">eigenaars die zelf plaatsen</h3>
              <p className="mt-2 text-sm text-foreground/80">Particulieren en verhuurders kunnen gratis hun woning op Stekly zetten via een eenvoudige wizard. Zij beheren zelf hun listing.</p>
            </article>
            <article className="border-2 border-foreground p-6">
              <ShieldCheck className="h-6 w-6" />
              <h3 className="mt-4 font-display text-xl lowercase">affiliate partners</h3>
              <p className="mt-2 text-sm text-foreground/80">Een deel van het aanbod komt via Daisycon, een netwerk van geverifieerde Nederlandse vastgoedplatformen. Dit verbreedt het aanbod zonder kwaliteit te verliezen.</p>
            </article>
            <article className="border-2 border-foreground p-6">
              <RefreshCw className="h-6 w-6" />
              <h3 className="mt-4 font-display text-xl lowercase">actualisering</h3>
              <p className="mt-2 text-sm text-foreground/80">Elke dag controleren we welke woningen nog actueel zijn. Verlopen of verwijderde objecten zetten we op 'inactief' (niet meer zichtbaar in zoekresultaten).</p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-sage/50">
        <div className="container py-16">
          <h2 className="font-display text-3xl lowercase md:text-4xl">kwaliteit & veiligheid</h2>
          <ul className="mt-8 space-y-4 text-foreground/85">
            <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" /> We tonen altijd de bron van een woning (logo van het oorspronkelijke platform).</li>
            <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" /> Verdachte advertenties (geen postcode, onrealistische prijs) filteren we automatisch eruit.</li>
            <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" /> Wij vragen huurders nooit om vooruitbetaling of borg via ons platform. Doe dit altijd via de officiële makelaar.</li>
            <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" /> Bezoekersanalyse gebeurt geanonimiseerd en alleen met cookie-toestemming.</li>
          </ul>
        </div>
      </section>

      <section className="border-b-2 border-foreground">
        <div className="container py-16">
          <h2 className="font-display text-3xl lowercase md:text-4xl">jouw rechten</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <article className="border-2 border-foreground p-6">
              <Trash2 className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-xl lowercase">woning laten verwijderen</h3>
              <p className="mt-2 text-sm text-foreground/80">Ben je makelaar of eigenaar en wil je een woning offline halen? Mail naar <a className="underline" href="mailto:info@stekly.nl">info@stekly.nl</a> met de URL. We zetten de woning binnen 24 uur op inactief.</p>
            </article>
            <article className="border-2 border-foreground p-6">
              <Mail className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-xl lowercase">gegevens inzien of wissen</h3>
              <p className="mt-2 text-sm text-foreground/80">Onder de AVG heb je recht op inzage en verwijdering van persoonsgegevens. Stuur een mail vanaf het adres waarmee je je hebt geregistreerd.</p>
            </article>
          </div>
          <p className="mt-10 text-sm text-foreground/70">
            Meer details vind je in onze <Link to="/privacy" className="underline">privacyverklaring</Link> en <Link to="/voorwaarden" className="underline">voorwaarden</Link>.
          </p>
        </div>
      </section>

      <section className="bg-foreground text-background">
        <div className="container py-16">
          <h2 className="font-display text-3xl lowercase md:text-4xl">vragen of feedback?</h2>
          <p className="mt-4 max-w-xl text-background/80">We staan open voor kritiek, suggesties en correcties. Mail ons gerust.</p>
          <a href="mailto:info@stekly.nl" className="mt-8 inline-block bg-accent px-6 py-3 font-bold text-background hover:opacity-90">info@stekly.nl</a>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Transparantie;
