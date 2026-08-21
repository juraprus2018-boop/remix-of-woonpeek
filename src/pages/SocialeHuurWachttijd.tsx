import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Clock, AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react";

interface WaitRow {
  city: string;
  slug: string;
  /** Gemiddelde inschrijfduur in jaren waarbij actief zoekers een woning krijgen. */
  jaren: number;
  /** Naam van het regionale aanbodsysteem. */
  systeem: string;
  systeemUrl: string;
}

// Bronnen: jaarrapportages woningcorporaties 2024, NOS-overzicht juni 2024,
// regionale aanbodsites (WoningNet, Woonnet Haaglanden, Maaskoepel etc.).
// Cijfers zijn mediane inschrijfduur voor reguliere zoekers, geen urgenten.
const WAIT_DATA: WaitRow[] = [
  { city: "Amsterdam", slug: "amsterdam", jaren: 14, systeem: "WoningNet Stadsregio Amsterdam", systeemUrl: "https://www.woningnetregioamsterdam.nl" },
  { city: "Utrecht", slug: "utrecht", jaren: 11, systeem: "WoningNet Regio Utrecht", systeemUrl: "https://www.woningnetregioutrecht.nl" },
  { city: "Den Haag", slug: "den-haag", jaren: 8, systeem: "Woonnet Haaglanden", systeemUrl: "https://www.woonnet-haaglanden.nl" },
  { city: "Rotterdam", slug: "rotterdam", jaren: 5, systeem: "Woonnet Rijnmond (Maaskoepel)", systeemUrl: "https://www.woonnetrijnmond.nl" },
  { city: "Eindhoven", slug: "eindhoven", jaren: 7, systeem: "Wooniezie", systeemUrl: "https://www.wooniezie.nl" },
  { city: "Groningen", slug: "groningen", jaren: 6, systeem: "WoningNet Groningen", systeemUrl: "https://www.woningnetgroningen.nl" },
  { city: "Tilburg", slug: "tilburg", jaren: 4, systeem: "Woning in Zicht", systeemUrl: "https://www.woninginzicht.nl" },
  { city: "Almere", slug: "almere", jaren: 9, systeem: "WoningNet Almere", systeemUrl: "https://www.woningnetalmere.nl" },
  { city: "Breda", slug: "breda", jaren: 5, systeem: "Klik voor Wonen", systeemUrl: "https://www.klikvoorwonen.nl" },
  { city: "Nijmegen", slug: "nijmegen", jaren: 7, systeem: "Entree (WoningNet)", systeemUrl: "https://www.entree.nu" },
  { city: "Leiden", slug: "leiden", jaren: 8, systeem: "Hureninhollandrijnland", systeemUrl: "https://www.hureninhollandrijnland.nl" },
  { city: "Haarlem", slug: "haarlem", jaren: 10, systeem: "Mijn Woonservice", systeemUrl: "https://www.mijnwoonservice.nl" },
  { city: "Arnhem", slug: "arnhem", jaren: 6, systeem: "Entree (WoningNet)", systeemUrl: "https://www.entree.nu" },
  { city: "Zwolle", slug: "zwolle", jaren: 5, systeem: "deWoningzoeker", systeemUrl: "https://www.dewoningzoeker.nl" },
  { city: "Maastricht", slug: "maastricht", jaren: 4, systeem: "Thuis in Limburg", systeemUrl: "https://www.thuisinlimburg.nl" },
];

const SocialeHuurWachttijd = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Hoe lang is de wachttijd voor sociale huur in Nederland?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "De gemiddelde inschrijfduur waarop actieve zoekers een sociale huurwoning krijgen ligt tussen de 4 en 14 jaar. Amsterdam is met 14 jaar het langst, Tilburg en Maastricht zijn met 4 jaar het kortst.",
        },
      },
      {
        "@type": "Question",
        name: "Wat is het verschil tussen inschrijftijd en zoektijd?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Inschrijftijd begint zodra je je inschrijft, ook als je niet actief reageert. Zoektijd telt alleen mee als je echt op woningen reageert. Steeds meer regio's stappen over op een combinatie of puur zoektijd om passieve wachters te ontmoedigen.",
        },
      },
      {
        "@type": "Question",
        name: "Kan ik op meerdere wachtlijsten tegelijk staan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Inschrijven bij meerdere regio's mag, en is verstandig als je flexibel bent over locatie. Je betaalt per systeem een jaarlijkse bijdrage van € 8 tot € 25.",
        },
      },
      {
        "@type": "Question",
        name: "Wanneer kom ik in aanmerking voor urgentie?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Urgentie krijg je alleen in uitzonderlijke situaties: medische noodzaak, huiselijk geweld, sloop van je huidige woning of een echtscheiding met kinderen. Aanvraag loopt via de gemeente of woningcorporatie en wordt streng beoordeeld.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Wachttijd sociale huurwoning per stad 2025 | Woonaanbod NL"
        description="Hoe lang sta je op de wachtlijst voor sociale huur in jouw stad? Actuele inschrijfduur voor Amsterdam, Utrecht, Rotterdam en 12 andere steden. Plus uitleg en directe links."
      />
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <section className="border-b-2 border-foreground bg-card">
          <div className="container py-10 md:py-14">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sociale huur wachttijd" }]} />
            <div className="mt-6 flex items-start gap-4">
              <div className="rounded-xl border-2 border-foreground bg-accent/10 p-3">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-5xl lowercase text-foreground">
                  wachttijd sociale huur per stad
                </h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  Hoe lang sta je gemiddeld op de wachtlijst voor een sociale huurwoning? Een
                  overzicht per stad, met de juiste inschrijfsite en wat je nu al kunt doen.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground py-12">
          <div className="container">
            <div className="overflow-x-auto rounded-2xl border-2 border-foreground bg-card">
              <table className="w-full text-left text-sm">
                <thead className="border-b-2 border-foreground bg-accent/10">
                  <tr>
                    <th className="px-4 py-3">Stad</th>
                    <th className="px-4 py-3 text-right">Inschrijfduur</th>
                    <th className="px-4 py-3">Inschrijfsysteem</th>
                    <th className="px-4 py-3 text-right">Inschrijven</th>
                  </tr>
                </thead>
                <tbody>
                  {WAIT_DATA.map((row) => (
                    <tr key={row.slug} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/stad/${row.slug}`} className="hover:underline">
                          {row.city}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="font-display text-base">{row.jaren}</span>{" "}
                        <span className="text-muted-foreground">jaar</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.systeem}</td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={row.systeemUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Naar site <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Bron: jaarrapportages van regionale aanbodsystemen, peildatum 2024. Het gaat om de
              mediane inschrijfduur waarop actieve zoekers daadwerkelijk een woning toegewezen
              krijgen. Voor specifieke buurten of woningtypes kan dit fors afwijken.
            </p>
          </div>
        </section>

        <section className="border-b-2 border-foreground bg-card py-12">
          <div className="container grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl md:text-3xl lowercase">
                inschrijftijd of zoektijd?
              </h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  In Nederland werken regio's met twee verschillende meters: <strong>inschrijftijd</strong>{" "}
                  en <strong>zoektijd</strong>. Inschrijftijd loopt door zodra je je inschrijft,
                  zelfs als je niets doet. Zoektijd telt alleen als je echt op aanbod reageert.
                </p>
                <p>
                  Regio's als Utrecht en Eindhoven gebruiken inmiddels een combinatie. Amsterdam zit
                  middenin een hervorming naar puur zoektijd: passieve wachters verliezen daarmee
                  hun jarenlange voorsprong.
                </p>
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl lowercase">slim doen, nu</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Schrijf je in bij minimaal twee regio's. De kosten zijn beperkt en je kansen verdubbelen.",
                  "Reageer wekelijks, ook op woningen waarvan je denkt dat je geen kans maakt. Activiteit telt mee.",
                  "Overweeg vrije sector als overbrugging. Bij Woonaanbod NL vind je dagelijks nieuw aanbod.",
                  "Check of je urgentie kunt aanvragen. Lijst van geldige gronden staat op de gemeentesite.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-3 rounded-lg border-2 border-foreground bg-background p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="flex items-start gap-4 rounded-2xl border-2 border-foreground bg-accent/10 p-6">
              <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h2 className="font-display text-xl lowercase">geen 14 jaar wachten?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Voor wie nu een woning nodig heeft is de vrije sector vaak de enige optie. Op
                  Woonaanbod NL verschijnt elke dag nieuw vrije sector huuraanbod. Zet een gratis
                  woonradar en je krijgt het meteen in je mailbox.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to="/woonradar"
                    className="inline-flex items-center rounded-lg border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
                  >
                    Zet woonradar aan
                  </Link>
                  <Link
                    to="/huurwoningen"
                    className="inline-flex items-center rounded-lg border-2 border-foreground bg-background px-4 py-2 text-sm font-medium hover:bg-accent/10"
                  >
                    Bekijk vrije sector aanbod
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SocialeHuurWachttijd;
