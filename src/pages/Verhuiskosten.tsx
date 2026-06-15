import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Truck, ArrowRight } from "lucide-react";

interface CityCost {
  city: string;
  slug: string;
  studio: number;
  appartement: number;
  eengezins: number;
}

// Indicatieve gemiddelden 2025 op basis van Verhuizers.nl, Independer en NVU. Inclusief
// busje, verhuizers, dozen en eindschoonmaak. Tarieven schommelen 20% per seizoen.
const CITY_COSTS: CityCost[] = [
  { city: "Amsterdam", slug: "amsterdam", studio: 650, appartement: 1250, eengezins: 2400 },
  { city: "Rotterdam", slug: "rotterdam", studio: 525, appartement: 1050, eengezins: 2100 },
  { city: "Utrecht", slug: "utrecht", studio: 600, appartement: 1180, eengezins: 2250 },
  { city: "Den Haag", slug: "den-haag", studio: 575, appartement: 1100, eengezins: 2150 },
  { city: "Eindhoven", slug: "eindhoven", studio: 475, appartement: 950, eengezins: 1900 },
  { city: "Groningen", slug: "groningen", studio: 450, appartement: 900, eengezins: 1800 },
  { city: "Tilburg", slug: "tilburg", studio: 425, appartement: 880, eengezins: 1750 },
  { city: "Almere", slug: "almere", studio: 475, appartement: 950, eengezins: 1850 },
  { city: "Breda", slug: "breda", studio: 460, appartement: 920, eengezins: 1820 },
  { city: "Nijmegen", slug: "nijmegen", studio: 440, appartement: 900, eengezins: 1780 },
];

const Verhuiskosten = () => {
  const [m2, setM2] = useState(60);
  const [afstand, setAfstand] = useState(25);
  const [verhuizers, setVerhuizers] = useState<"zelf" | "deels" | "volledig">("deels");

  const totaal = useMemo(() => {
    // Basis: € 8 per m² inboedel + € 1,80 per km. Bij volledige ontzorging 2,5x, doe-het-zelf 0,4x.
    const inboedel = m2 * 8;
    const transport = Math.max(75, afstand * 1.8);
    const dozen = Math.round(m2 * 1.2) * 2.5;
    const verzekering = 35;
    const basis = inboedel + transport + dozen + verzekering;
    const factor = verhuizers === "zelf" ? 0.4 : verhuizers === "volledig" ? 2.5 : 1;
    return Math.round(basis * factor);
  }, [m2, afstand, verhuizers]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Verhuiskosten berekenen 2025: wat kost een verhuizing? | Huurbaasje"
        description="Bereken in 1 minuut wat je verhuizing gaat kosten. Inclusief gemiddelde prijzen voor Amsterdam, Rotterdam, Utrecht en 7 andere steden. Gratis, geen e-mail nodig."
      />
      <Header />
      <main>
        <section className="border-b-2 border-foreground bg-card">
          <div className="container py-10 md:py-14">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Verhuiskosten" }]} />
            <div className="mt-6 flex items-start gap-4">
              <div className="rounded-xl border-2 border-foreground bg-accent/10 p-3">
                <Calculator className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-5xl lowercase text-foreground">
                  verhuiskosten berekenen
                </h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  Wat kost jouw verhuizing realistisch? Vul oppervlakte, afstand en hoeveelheid hulp in.
                  De gemiddelden hieronder zijn gebaseerd op marktdata uit 2024-2025.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground py-12">
          <div className="container grid gap-8 lg:grid-cols-2">
            <Card className="border-2 border-foreground">
              <CardContent className="space-y-5 p-6 md:p-8">
                <h2 className="font-display text-2xl lowercase">snelle calculator</h2>

                <div>
                  <Label htmlFor="m2">Oppervlakte huidige woning ({m2} m²)</Label>
                  <input
                    id="m2"
                    type="range"
                    min={20}
                    max={200}
                    value={m2}
                    onChange={(e) => setM2(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="km">Afstand verhuizing ({afstand} km)</Label>
                  <input
                    id="km"
                    type="range"
                    min={1}
                    max={300}
                    value={afstand}
                    onChange={(e) => setAfstand(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                <div>
                  <Label>Hoeveel hulp wil je?</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { id: "zelf", label: "Zelf doen" },
                      { id: "deels", label: "Verhuizers" },
                      { id: "volledig", label: "Ontzorging" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setVerhuizers(opt.id as typeof verhuizers)}
                        className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                          verhuizers === opt.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:bg-accent/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-foreground bg-accent/10 p-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Indicatieve totaalprijs
                  </p>
                  <p className="mt-1 font-display text-4xl text-foreground">
                    € {totaal.toLocaleString("nl-NL")}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Inclusief transport, dozen, verzekering en arbeidsuren. Excl. eventuele opslag.
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link to="/verhuisservice">
                    Vergelijk verhuizers <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <h2 className="font-display text-2xl lowercase">wat zit er in de prijs?</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Een gemiddelde verhuizing binnen Nederland kost tussen de € 400 en € 2.500. De
                  prijs hangt af van vier dingen: hoe veel spullen je hebt, hoe ver het gaat, of er
                  een lift of trap is, en of je het zelf doet of uitbesteedt.
                </p>
                <ul className="ml-5 list-disc space-y-2">
                  <li><strong>Busje huren:</strong> € 75 tot € 180 per dag, exclusief brandstof.</li>
                  <li><strong>Verhuizers:</strong> € 45 tot € 65 per uur per persoon, meestal 2 of 3 mensen.</li>
                  <li><strong>Dozen en materialen:</strong> reken op € 2 tot € 3 per m² woning.</li>
                  <li><strong>Verhuisverzekering:</strong> € 30 tot € 75 eenmalig.</li>
                  <li><strong>Opslag (optioneel):</strong> € 75 tot € 150 per maand voor 5 m³.</li>
                </ul>
                <p>
                  Tip: einde van de maand en zaterdagen zijn duurder. Plan midweeks midden in de
                  maand en je betaalt soms 25% minder.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground bg-card py-12">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl lowercase">
              gemiddelde verhuiskosten per stad
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Indicatieve all-in prijzen voor een verhuizing binnen de stad, inclusief verhuizers en
              materialen. Tarieven zijn hoger in steden met parkeerproblemen en hoge dichtheid.
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border-2 border-foreground bg-background">
              <table className="w-full text-left text-sm">
                <thead className="border-b-2 border-foreground bg-accent/10">
                  <tr>
                    <th className="px-4 py-3">Stad</th>
                    <th className="px-4 py-3 text-right">Studio</th>
                    <th className="px-4 py-3 text-right">Appartement</th>
                    <th className="px-4 py-3 text-right">Eengezinswoning</th>
                  </tr>
                </thead>
                <tbody>
                  {CITY_COSTS.map((c) => (
                    <tr key={c.slug} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/stad/${c.slug}`} className="hover:underline">
                          {c.city}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">€ {c.studio}</td>
                      <td className="px-4 py-3 text-right">€ {c.appartement}</td>
                      <td className="px-4 py-3 text-right">€ {c.eengezins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Verhuischecklist",
                body: "Wat regel je 8 weken van tevoren, en wat op de laatste dag?",
                to: "/verhuischecklist",
              },
              {
                title: "Energie afsluiten",
                body: "Op je nieuwe adres meteen een vast tarief regelen.",
                to: "/energie",
              },
              {
                title: "Internet aanvragen",
                body: "Installatie duurt soms weken. Vraag op tijd aan.",
                to: "/internet",
              },
            ].map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group rounded-2xl border-2 border-foreground bg-card p-5 transition-colors hover:bg-accent/10"
              >
                <Truck className="mb-3 h-5 w-5 text-primary" />
                <h3 className="font-display text-lg lowercase">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                  Lees meer <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Verhuiskosten;
