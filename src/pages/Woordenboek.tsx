import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

type Term = {
  term: string;
  category: "Huren" | "Kopen" | "Financieel" | "Juridisch" | "Bouw & techniek";
  short: string;
  long: string;
  links?: { label: string; to: string }[];
};

const TERMS: Term[] = [
  { term: "Aanvaarding", category: "Juridisch", short: "Moment waarop de woning aan jou wordt overgedragen.", long: "Bij koop staat dit in de koopakte: de datum waarop de sleutel overgaat en je risico draagt. Bij huur is het de ingangsdatum van het huurcontract." },
  { term: "Borg (waarborgsom)", category: "Huren", short: "Bedrag dat je vooraf betaalt als zekerheid voor de verhuurder.", long: "Meestal 1 tot 2 maanden kale huur. Sinds 2023 mag het maximaal 2 maanden zijn. Krijg je terug bij oplevering, minus eventuele schade." },
  { term: "Bruto inkomen", category: "Financieel", short: "Je salaris vóór belasting.", long: "Verhuurders eisen meestal 3x de kale huur als bruto maandinkomen. Voor een hypotheek wordt vaak het bruto jaarinkomen gebruikt.", links: [{ label: "Check je budget", to: "/budgetcheck" }] },
  { term: "Bruto huur", category: "Huren", short: "Kale huur + servicekosten + voorschot nutsvoorzieningen.", long: "Het totaalbedrag dat je elke maand overmaakt. De huurprijs op een advertentie is meestal kaal — vraag altijd na wat er bovenop komt." },
  { term: "Casco", category: "Bouw & techniek", short: "Een woning zonder afwerking.", long: "Vloeren, keuken en sanitair ontbreken. Goedkoper bij koop, maar reken op flinke investeringen om hem bewoonbaar te maken." },
  { term: "Courtage", category: "Juridisch", short: "Vergoeding voor de makelaar.", long: "Bij huur mag de makelaar deze NIET aan jou vragen als hij door de verhuurder is ingehuurd. Bij koop betaalt meestal de verkoper." },
  { term: "Eigenwoningforfait", category: "Financieel", short: "Bedrag dat je optelt bij je inkomen als je een eigen huis bezit.", long: "Een percentage van de WOZ-waarde dat de Belastingdienst telt als 'fictief inkomen' uit je woning." },
  { term: "Energielabel", category: "Bouw & techniek", short: "Officiële klasse van A++++ tot G die de energiezuinigheid aangeeft.", long: "Verplicht bij verkoop én verhuur. Een hoger label betekent lagere energierekening en hogere woningwaarde.", links: [{ label: "Energie vergelijken", to: "/energie" }] },
  { term: "Erfpacht", category: "Juridisch", short: "Je bezit het huis maar huurt de grond eronder.", long: "Veel in Amsterdam. Je betaalt een canon. Erfpachtcontracten kunnen aflopen of herzien worden — check dit altijd vóór koop." },
  { term: "Geliberaliseerde huur", category: "Huren", short: "Huurprijzen boven de sociale huurgrens.", long: "Vrije sector. Verhuurder mag de prijs zelf bepalen, maar moet zich aan het puntenstelsel houden sinds de Wet betaalbare huur (2024)." },
  { term: "Huurcommissie", category: "Juridisch", short: "Onafhankelijke instantie die geschillen tussen huurder en verhuurder beslecht.", long: "Vraag een toetsing aan bij vermoeden van te hoge huur, achterstallig onderhoud of onterechte servicekosten." },
  { term: "Huurpunten", category: "Huren", short: "Puntensysteem dat bepaalt of een woning sociaal of vrije sector is.", long: "Wordt berekend op basis van oppervlakte, WOZ, energielabel, voorzieningen. Tot 187 punten = sociale huur (max ~€900)." },
  { term: "Huurtoeslag", category: "Financieel", short: "Bijdrage van de overheid in je huurkosten.", long: "Alleen voor sociale huur. Hoogte hangt af van inkomen, huur en huishoudensgrootte. Aanvragen via Belastingdienst/toeslagen." },
  { term: "Hypotheek", category: "Financieel", short: "Lening waarmee je een huis koopt, met de woning als onderpand.", long: "Maximaal 100% van de woningwaarde sinds 2018. Maandlasten bestaan uit rente + aflossing." },
  { term: "Inboedelverzekering", category: "Financieel", short: "Dekt schade aan je spullen door brand, diefstal of waterlekkage.", long: "Niet verplicht maar wel verstandig. Verhuurders verzekeren alleen het pand zelf, niet jouw bezittingen." },
  { term: "Kale huur", category: "Huren", short: "Huur zonder servicekosten of nutsvoorzieningen.", long: "Wat je puur betaalt voor het gebruik van de woning. De wet werkt altijd met kale huur (bv. voor huurtoeslag)." },
  { term: "Kosten koper (k.k.)", category: "Kopen", short: "Bijkomende kosten bij het kopen van een huis.", long: "Ongeveer 4-6% bovenop de koopsom: overdrachtsbelasting (2%, 0% voor starters tot 35), notaris, taxatie, hypotheekadvies." },
  { term: "Koopakte", category: "Juridisch", short: "Schriftelijke overeenkomst tussen koper en verkoper.", long: "Hierna heb je 3 dagen wettelijke bedenktijd. Daarna kun je alleen nog onder ontbindende voorwaarden (financiering, bouwkundige keuring) annuleren." },
  { term: "Makelaarscourtage", category: "Kopen", short: "Provisie voor de aankoopmakelaar.", long: "Meestal 1-2% van de koopsom of een vast bedrag (€2.500-€5.000). Volledig vrij onderhandelbaar." },
  { term: "NHG", category: "Financieel", short: "Nationale Hypotheek Garantie.", long: "Vangnet als je je hypotheek niet meer kan betalen door scheiding, werkloosheid of arbeidsongeschiktheid. Levert vaak 0,3-0,6% rentekorting op. In 2025 tot €450.000." },
  { term: "Onderhandse verkoop", category: "Kopen", short: "Verkoop zonder veiling, direct tussen koper en verkoper.", long: "De gangbare manier. Tegenovergestelde van een executieveiling, die vaak lagere prijzen oplevert maar veel risico kent." },
  { term: "Onroerendezaakbelasting (OZB)", category: "Financieel", short: "Gemeentebelasting op het bezit van een woning.", long: "Tarieven verschillen flink per gemeente, gemiddeld 0,07% tot 0,15% van de WOZ-waarde per jaar." },
  { term: "Ontbindende voorwaarden", category: "Juridisch", short: "Clausules in de koopakte waarmee je zonder boete kunt annuleren.", long: "Meestal financiering binnen 6 weken en goedkeuring bouwkundige keuring. Onmisbaar — laat ze er nooit uit halen." },
  { term: "Opleveringsinspectie", category: "Huren", short: "Gezamenlijke check van de woning bij in- of uithuizen.", long: "Maak foto's en een proces-verbaal. Cruciaal om bij vertrek je borg terug te krijgen zonder gedoe over schade." },
  { term: "Overdrachtsbelasting", category: "Financieel", short: "Belasting bij aankoop van bestaand vastgoed.", long: "2% voor eigen bewoning, 10,4% voor beleggers en tweede woning. Starters tot 35 jaar betalen 0% op woningen tot €525.000 (2025)." },
  { term: "Puntensysteem", category: "Huren", short: "Bepaalt de maximale huurprijs van een woning.", long: "Officieel het Woningwaarderingsstelsel (WWS). Sinds juli 2024 ook bindend voor middenhuur tot 186 punten (~€1.157).", links: [{ label: "Huurprijs check", to: "/markt/amsterdam" }] },
  { term: "Servicekosten", category: "Huren", short: "Vergoeding voor leveringen en diensten naast de kale huur.", long: "Schoonmaak gangen, glasbewassing, huismeester, tuinonderhoud. Mogen maximaal 5% van de huur zijn als ze niet apart gespecificeerd worden." },
  { term: "Sociale huur", category: "Huren", short: "Huurwoningen onder de liberalisatiegrens (€900 in 2025).", long: "Vooral via woningcorporaties. Inkomensgrens van ~€48.000 (1-persoon) of ~€53.000 (meerpersoons)." },
  { term: "Taxatierapport", category: "Kopen", short: "Onafhankelijke schatting van de woningwaarde.", long: "Verplicht voor hypotheek. Kost €400-€700. Hypotheekverstrekkers eisen meestal een NWWI-gevalideerd rapport." },
  { term: "Verhuurdersheffing", category: "Financieel", short: "Belasting voor woningcorporaties op sociale huurwoningen.", long: "Afgeschaft in 2023. Gevolg: corporaties kunnen meer investeren in nieuwbouw en verduurzaming." },
  { term: "Voorlopig koopcontract", category: "Juridisch", short: "Niets voorlopigs aan — dit is juridisch bindend.", long: "Misleidende term. Zodra je tekent ben je gebonden, behalve binnen de 3 dagen bedenktijd of via ontbindende voorwaarden." },
  { term: "VvE", category: "Kopen", short: "Vereniging van Eigenaars.", long: "Verplicht bij appartementen. Iedere eigenaar is lid en betaalt maandelijks bij aan onderhoud. Check de reserves vóór koop." },
  { term: "Waardepeildatum", category: "Financieel", short: "Datum waarop de WOZ-waarde wordt vastgesteld.", long: "Altijd 1 januari van het voorgaande jaar. Je WOZ 2025 is dus de marktwaarde per 1 januari 2024." },
  { term: "Woningcorporatie", category: "Huren", short: "Stichting die sociale huurwoningen verhuurt.", long: "Ymere, Vestia, Eigen Haard, Woonbron — bekende namen. Inschrijven via WoningNet of regionale equivalenten." },
  { term: "WOZ-waarde", category: "Financieel", short: "Door de gemeente bepaalde waarde van je woning.", long: "Basis voor OZB, eigenwoningforfait en waterschapsbelasting. Bezwaar maken kan binnen 6 weken na ontvangst." },
  { term: "Huurverlaging", category: "Huren", short: "Verlaging van de huurprijs op verzoek van de huurder.", long: "Mogelijk via Huurcommissie bij sociale huur of via puntentoetsing in vrije sector. In 2023-2024 verplichte verlaging bij lage inkomens." },
  { term: "Maximale huurverhoging", category: "Huren", short: "Wettelijk plafond voor jaarlijkse huurverhoging.", long: "2025: 4,1% in vrije sector, 5% in sociale huur (laagste inkomens minder). Geldt per 1 juli." },
  { term: "Bedenktijd", category: "Juridisch", short: "3 dagen om na ondertekening de koop alsnog terug te draaien.", long: "Wettelijk recht voor particulieren. Begint zodra je een kopie van de getekende akte hebt ontvangen." },
  { term: "Bankgarantie", category: "Kopen", short: "Garantie van je bank dat de waarborgsom betaald wordt als de koop niet doorgaat.", long: "Alternatief voor het storten van 10% bij de notaris. Kost ongeveer 1% van het gegarandeerde bedrag." },
  { term: "Indexering", category: "Huren", short: "Jaarlijkse aanpassing van de huur aan inflatie.", long: "Op basis van CPI of CAO-lonen. Moet in het contract staan, anders mag het niet zomaar doorgevoerd worden." },
  { term: "Doorstromer", category: "Kopen", short: "Iemand die verhuist binnen de koopmarkt.", long: "Tegenovergestelde van een starter. Heeft vaak overwaarde uit huidige woning beschikbaar." },
  { term: "Starter", category: "Kopen", short: "Eerste-keer-koper op de woningmarkt.", long: "Onder 35 jaar = vrijstelling overdrachtsbelasting tot €525.000. Hypotheekrenteaftrek volledig beschikbaar." },
];

const CATEGORIES = ["Alles", "Huren", "Kopen", "Financieel", "Juridisch", "Bouw & techniek"] as const;

export default function Woordenboek() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<typeof CATEGORIES[number]>("Alles");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TERMS
      .filter((t) => cat === "Alles" || t.category === cat)
      .filter((t) => !q || t.term.toLowerCase().includes(q) || t.short.toLowerCase().includes(q) || t.long.toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term, "nl"));
  }, [query, cat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Term[]>();
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Huurbaasje woordenboek",
    description: "Begrippen rondom huren, kopen en de Nederlandse woningmarkt — kort uitgelegd.",
    hasDefinedTerm: TERMS.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.short,
      inDefinedTermSet: "https://www.huurbaasje.nl/woordenboek",
    })),
  };

  return (
    <>
      <Helmet>
        <title>Woningwoordenboek — 40+ begrippen over huren en kopen | Huurbaasje</title>
        <meta
          name="description"
          content="Alle belangrijke woningmarkt-termen op één plek: van borg en bedenktijd tot WOZ, NHG en puntensysteem. Helder uitgelegd in gewone taal."
        />
        <link rel="canonical" href="https://www.huurbaasje.nl/woordenboek" />
        <meta property="og:title" content="Woningwoordenboek — Huurbaasje" />
        <meta property="og:description" content="40+ begrippen rondom huren en kopen, in gewone taal uitgelegd." />
        <meta property="og:url" content="https://www.huurbaasje.nl/woordenboek" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <main className="bg-background">
        <section className="border-b-2 border-foreground bg-sage/30">
          <div className="container py-12 md:py-16">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Woordenboek" }]} />
            <h1 className="mt-4 font-display text-4xl uppercase tracking-tight text-foreground md:text-6xl">
              Het woningwoordenboek
            </h1>
            <p className="mt-4 max-w-2xl font-serif-display text-xl italic text-foreground/80 md:text-2xl">
              Alle termen rondom huren, kopen en hypotheken. Geen jargon, gewoon mensentaal.
            </p>
          </div>
        </section>

        <section className="border-b-2 border-foreground bg-background">
          <div className="container py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Input
                type="search"
                placeholder="Zoek een begrip… (bv. WOZ, borg, NHG)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="md:max-w-md"
              />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`rounded-full border-2 border-foreground px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${
                      cat === c ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {filtered.length} van {TERMS.length} begrippen
            </p>
          </div>
        </section>

        <section className="container py-12">
          {grouped.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">Geen begrippen gevonden voor "{query}".</p>
          ) : (
            <div className="space-y-12">
              {grouped.map(([letter, items]) => (
                <div key={letter}>
                  <h2 className="mb-4 font-display text-3xl uppercase text-accent">{letter}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((t) => (
                      <article
                        key={t.term}
                        id={t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                        className="border-2 border-foreground bg-background p-5"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="font-display text-xl text-foreground">{t.term}</h3>
                          <Badge variant="outline" className="shrink-0 text-[10px] uppercase">{t.category}</Badge>
                        </div>
                        <p className="font-semibold text-foreground">{t.short}</p>
                        <p className="mt-2 text-sm text-foreground/80">{t.long}</p>
                        {t.links && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {t.links.map((l) => (
                              <Link
                                key={l.to}
                                to={l.to}
                                className="text-xs font-semibold text-accent underline underline-offset-4 hover:text-foreground"
                              >
                                → {l.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border-t-2 border-foreground bg-foreground py-12 text-background">
          <div className="container">
            <h2 className="font-display text-3xl uppercase">Verder lezen</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link to="/budgetcheck" className="border-2 border-background/30 bg-background/5 p-4 transition-colors hover:bg-background/10">
                <p className="font-display text-lg uppercase">Budget berekenen</p>
                <p className="mt-1 text-sm text-background/70">Wat kun je verantwoord huren of kopen?</p>
              </Link>
              <Link to="/vragen" className="border-2 border-background/30 bg-background/5 p-4 transition-colors hover:bg-background/10">
                <p className="font-display text-lg uppercase">Veelgestelde vragen</p>
                <p className="mt-1 text-sm text-background/70">Antwoorden op de meest gestelde vragen.</p>
              </Link>
              <Link to="/journaal" className="border-2 border-background/30 bg-background/5 p-4 transition-colors hover:bg-background/10">
                <p className="font-display text-lg uppercase">Journaal</p>
                <p className="mt-1 text-sm text-background/70">Actueel woningmarktnieuws en tips.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
