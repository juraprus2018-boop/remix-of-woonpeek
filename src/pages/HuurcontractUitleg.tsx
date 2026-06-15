import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Term {
  slug: string;
  term: string;
  short: string;
  long: string;
  category: "contract" | "kosten" | "rechten" | "einde";
}

const TERMS: Term[] = [
  {
    slug: "tijdelijk-huurcontract",
    term: "Tijdelijk huurcontract",
    short: "Contract voor bepaalde tijd, maximaal 2 jaar zelfstandige woning of 5 jaar kamer.",
    long: "Sinds 1 juli 2024 is het tijdelijke huurcontract voor zelfstandige woningen voor de meeste verhuurders afgeschaft. Alleen specifieke doelgroepen zoals studenten, expats en jongeren mogen nog tijdelijk verhuurd worden. Bij een tijdelijk contract heb je geen huurbescherming na afloop. De verhuurder moet je 1 tot 3 maanden voor afloop schriftelijk informeren, anders wordt het automatisch een vast contract.",
    category: "contract",
  },
  {
    slug: "vast-huurcontract",
    term: "Vast huurcontract",
    short: "Contract voor onbepaalde tijd met volledige huurbescherming.",
    long: "Sinds 2024 is het vaste contract weer de standaard. De verhuurder kan je niet zomaar uit huis zetten: opzeggen kan alleen op wettelijke gronden zoals dringend eigen gebruik, wanprestatie of sloop. Je hebt zelf een opzegtermijn van 1 maand (gelijk aan de betalingstermijn).",
    category: "contract",
  },
  {
    slug: "borg",
    term: "Borg (waarborgsom)",
    short: "Geldbedrag dat je vooraf betaalt als zekerheid, maximaal 2 maanden kale huur.",
    long: "Sinds de Wet goed verhuurderschap (juli 2023) mag de borg maximaal twee maanden kale huur zijn. De verhuurder moet de borg binnen 14 dagen na einde huur terugbetalen, of binnen 30 dagen als er kosten worden afgetrokken. Maakt de verhuurder bezwaar? Dan kan de Huurcommissie helpen.",
    category: "kosten",
  },
  {
    slug: "servicekosten",
    term: "Servicekosten",
    short: "Vergoeding voor leveringen en diensten naast de kale huur.",
    long: "Servicekosten dekken bijvoorbeeld schoonmaak van gemeenschappelijke ruimtes, glasbewassing, een huismeester of meubilering. Het moet gaan om werkelijke kosten. Elk jaar moet de verhuurder je een afrekening sturen. Geen afrekening gehad? Dan mag je naar de Huurcommissie.",
    category: "kosten",
  },
  {
    slug: "indexatie",
    term: "Huurindexatie",
    short: "Jaarlijkse huurverhoging volgens een wettelijk maximum.",
    long: "Voor sociale huur ligt het maximum vast, voor vrije sector geldt sinds 2024 een maximale verhoging gekoppeld aan inflatie of CAO-loonontwikkeling, afhankelijk welke lager is. In 2025 is dit maximaal 4,1%. Een verhoging boven dit percentage mag je weigeren en aanvechten bij de Huurcommissie.",
    category: "kosten",
  },
  {
    slug: "puntenstelsel",
    term: "Puntenstelsel (WWS)",
    short: "Woningwaarderingsstelsel dat bepaalt of een woning sociaal of vrije sector is.",
    long: "Het WWS kent punten toe op basis van oppervlakte, voorzieningen, WOZ-waarde en energielabel. Vanaf 1 juli 2024 valt elke woning tot 186 punten automatisch onder gereguleerde huur, met een wettelijk maximumhuur. Je kunt je punten zelf checken op de site van de Huurcommissie en bij teveel huur korting eisen.",
    category: "rechten",
  },
  {
    slug: "huurcommissie",
    term: "Huurcommissie",
    short: "Onafhankelijke instantie die geschillen tussen huurder en verhuurder beslecht.",
    long: "De Huurcommissie behandelt zaken over huurprijs, servicekosten, onderhoud en borg. Een verzoek kost € 25 voor huurders, je krijgt het terug als je gelijk krijgt. Uitspraken zijn bindend, behalve als één van de partijen binnen 8 weken naar de rechter stapt.",
    category: "rechten",
  },
  {
    slug: "huurbescherming",
    term: "Huurbescherming",
    short: "Wettelijke bescherming tegen onterechte opzegging door de verhuurder.",
    long: "Bij een vast contract kan de verhuurder de huur alleen opzeggen op wettelijke gronden, en je hoeft de woning niet te verlaten tot de rechter dat bepaalt. De grond moet zwaarwegend zijn: dringend eigen gebruik, slecht huurderschap, weigering redelijk aanbod of sloop. Familieargumenten zijn soms niet voldoende.",
    category: "rechten",
  },
  {
    slug: "eindinspectie",
    term: "Eindinspectie",
    short: "Controle van de woning bij vertrek, samen met verhuurder.",
    long: "Plan de eindinspectie vroeg in de laatste maand. Zorg dat de woning leeg en schoon is, alle schade is hersteld en de meterstanden zijn opgenomen. Vraag om een opleverrapport met foto's en een ondertekening van beide partijen. Dat voorkomt discussie over je borg.",
    category: "einde",
  },
  {
    slug: "opzegtermijn",
    term: "Opzegtermijn huurder",
    short: "Wettelijk 1 maand, gelijk aan de betalingstermijn.",
    long: "Als huurder mag je altijd opzeggen met een termijn van 1 maand, schriftelijk of via aangetekende post. Je kunt op elke dag van de maand opzeggen. De verhuurder heeft een opzegtermijn van 3 tot 6 maanden, afhankelijk van hoe lang je er woont.",
    category: "einde",
  },
  {
    slug: "diplomatenclausule",
    term: "Diplomatenclausule",
    short: "Bijzondere clausule waarmee verhuurder zijn eigen woning tijdelijk verhuurt.",
    long: "Eigenaren die tijdelijk in het buitenland zitten kunnen met een diplomatenclausule hun woning verhuren. Bij terugkomst moet de huurder weg. De clausule moet schriftelijk overeengekomen zijn en de termijn moet duidelijk benoemd. Zonder geldige clausule heb je gewoon huurbescherming.",
    category: "contract",
  },
  {
    slug: "voorrangsregeling",
    term: "Voorrangsregeling",
    short: "Regeling waardoor je sneller een sociale huurwoning krijgt.",
    long: "Voorrang krijg je op basis van urgentie (medisch, sociaal, dakloosheid) of doelgroep (jongeren, statushouders, mantelzorgers). Aanvraag loopt via de gemeente of woningcorporatie. De regels verschillen per regio en de toetsing is streng.",
    category: "rechten",
  },
];

const CATEGORIES: { id: Term["category"]; label: string }[] = [
  { id: "contract", label: "Contract" },
  { id: "kosten", label: "Kosten" },
  { id: "rechten", label: "Rechten" },
  { id: "einde", label: "Einde huur" },
];

const HuurcontractUitleg = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Term["category"] | null>(null);

  const filtered = useMemo(() => {
    return TERMS.filter((t) => {
      if (cat && t.category !== cat) return false;
      if (!q) return true;
      const needle = q.toLowerCase();
      return t.term.toLowerCase().includes(needle) || t.short.toLowerCase().includes(needle);
    });
  }, [q, cat]);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TERMS.map((t) => ({
      "@type": "Question",
      name: `Wat is ${t.term.toLowerCase()}?`,
      acceptedAnswer: { "@type": "Answer", text: t.long },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Huurcontract uitleg: alle begrippen op een rij 2025 | Huurbaasje"
        description="Wat betekent indexatie, borg, puntenstelsel of diplomatenclausule? 12 huurcontract-begrippen helder uitgelegd, met de actuele regels van 2025."
      />
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <section className="border-b-2 border-foreground bg-card">
          <div className="container py-10 md:py-14">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Huurcontract uitleg" }]} />
            <div className="mt-6 flex items-start gap-4">
              <div className="rounded-xl border-2 border-foreground bg-accent/10 p-3">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-5xl lowercase text-foreground">
                  huurcontract uitleg
                </h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  Wat staat er nu eigenlijk in dat contract? De belangrijkste begrippen uit het
                  huurrecht, helder uitgelegd. Bijgewerkt op de regels van 2025.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background py-6">
          <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek een begrip..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCat(null)}
                className={`rounded-full border-2 px-3 py-1 text-xs font-medium ${
                  cat === null ? "border-foreground bg-foreground text-background" : "border-border"
                }`}
              >
                Alle
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`rounded-full border-2 px-3 py-1 text-xs font-medium ${
                    cat === c.id ? "border-foreground bg-foreground text-background" : "border-border"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container grid gap-4 md:grid-cols-2">
            {filtered.map((t) => (
              <article
                key={t.slug}
                id={t.slug}
                className="rounded-2xl border-2 border-foreground bg-card p-6"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {CATEGORIES.find((c) => c.id === t.category)?.label}
                </p>
                <h2 className="mt-1 font-display text-xl lowercase text-foreground">{t.term}</h2>
                <p className="mt-2 text-sm font-medium text-foreground">{t.short}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.long}</p>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                Geen begrippen gevonden. Probeer een andere zoekterm.
              </p>
            )}
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-accent/10 py-12">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl lowercase">
              twijfel over je contract?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Laat onze AI je contract gratis controleren. Je krijgt binnen 30 seconden te zien of er
              onredelijke clausules in staan en of je huur klopt met het puntenstelsel.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/contract-check"
                className="inline-flex items-center rounded-lg border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
              >
                Check je huurcontract
              </Link>
              <Link
                to="/woordenboek"
                className="inline-flex items-center rounded-lg border-2 border-foreground bg-background px-4 py-2 text-sm font-medium hover:bg-accent/10"
              >
                Volledige woordenlijst
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HuurcontractUitleg;
