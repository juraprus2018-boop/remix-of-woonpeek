import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import DaisyconEnergyWidget from "@/components/energy/DaisyconEnergyWidget";
import {
  Box,
  Zap,
  Wifi,
  Shield,
  FileText,
  Truck,
  Key,
  Users,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

interface Step {
  id: string;
  weeks: string;
  icon: typeof Box;
  title: string;
  body: string;
  cta?: {
    label: string;
    href: string;
    note: string;
  };
  /** When true, show the inline Daisycon energy widget for native conversion. */
  embedEnergy?: boolean;
}

const STEPS: Step[] = [
  {
    id: "opzeggen",
    weeks: "8 weken vooraf",
    icon: FileText,
    title: "Huur opzeggen en contracten regelen",
    body:
      "Check je huurcontract: meestal moet je één maand van tevoren opzeggen, schriftelijk of via aangetekende post. Plan ook meteen de eindinspectie met je verhuurder.",
  },
  {
    id: "verhuizer",
    weeks: "6 weken vooraf",
    icon: Truck,
    title: "Verhuizer of busje boeken",
    body:
      "Vraag minstens drie offertes aan. Boek vroeg, vooral rond een weekend of einde maand. Doe je het zelf, reserveer dan op tijd een bestelbus.",
  },
  {
    id: "energie",
    weeks: "4 weken vooraf",
    icon: Zap,
    title: "Energiecontract afsluiten op je nieuwe adres",
    body:
      "Wacht hier niet mee. Wie blijft hangen bij het standaard variabel tarief van de huidige leverancier betaalt vaak honderden euro's per jaar te veel. Sluit voor je verhuist een vast contract af op het nieuwe adres en geef de begin-meterstanden door.",
    embedEnergy: true,
    cta: {
      label: "Vergelijk energie",
      href: "/energie",
      note: "Bespaar gemiddeld € 380 per jaar door over te stappen",
    },
  },
  {
    id: "internet",
    weeks: "4 weken vooraf",
    icon: Wifi,
    title: "Internet en TV regelen",
    body:
      "Installatie van glasvezel of kabel duurt soms weken. Vraag aan welke aanbieders op je nieuwe postcode leveren en bestel ruim op tijd, anders zit je de eerste week zonder wifi.",
    cta: {
      label: "Vergelijk internet aanbieders",
      href: "/energie",
      note: "Pak meteen een welkomstkorting mee",
    },
  },
  {
    id: "verzekering",
    weeks: "3 weken vooraf",
    icon: Shield,
    title: "Inboedel- en aansprakelijkheidsverzekering",
    body:
      "Je huidige inboedelverzekering past niet automatisch bij je nieuwe woning. Bereken opnieuw wat je inboedel waard is en pas het bedrag aan, of stap over naar een goedkopere polis.",
    cta: {
      label: "Bereken je inboedelverzekering",
      href: "/energie",
      note: "Vergelijk gratis en sluit direct online af",
    },
  },
  {
    id: "doorgeven",
    weeks: "2 weken vooraf",
    icon: ClipboardList,
    title: "Adreswijziging doorgeven",
    body:
      "Gemeente (verplicht binnen 5 dagen), zorgverzekeraar, bank, werkgever, abonnementen, online winkels, Belastingdienst. Zet een doorzendservice van PostNL aan voor de eerste maanden.",
  },
  {
    id: "inpakken",
    weeks: "1 week vooraf",
    icon: Box,
    title: "Inpakken en labelen",
    body:
      "Verzamel dozen via supermarkt of bouwmarkt. Label per kamer en zet kwetsbare spullen apart. Maak een doos met essentials (oplader, toiletspullen, koffie, beddengoed) voor de eerste avond.",
  },
  {
    id: "sleutel",
    weeks: "Verhuisdag",
    icon: Key,
    title: "Sleuteloverdracht en meterstanden",
    body:
      "Loop met je oude en nieuwe verhuurder samen door de woning, noteer alle meterstanden (gas, stroom, water) en maak foto's van eventuele schade. Geef de standen door aan je leveranciers.",
  },
  {
    id: "uitnodigen",
    weeks: "Na de verhuizing",
    icon: Users,
    title: "Buren leren kennen en inrichten",
    body:
      "Stel je voor aan de buren, check waar de meterkast en hoofdkraan zitten, en plan je inrichting rustig. Probeer in de eerste week één kamer helemaal af te maken voor een gevoel van rust.",
  },
];

const STORAGE_KEY = "woonaanbod-nl:verhuischecklist:v1";

const Verhuischecklist = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked]);

  const completed = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const pct = Math.round((completed / STEPS.length) * 100);

  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Verhuischecklist 2026: stap voor stap verhuizen zonder stress"
        description="Complete verhuischecklist met tijdlijn: 8 weken voor de verhuizing tot na de sleuteloverdracht. Energie, internet, verzekering en adreswijziging op tijd geregeld."
        canonical="/verhuischecklist"
      />
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <Breadcrumbs items={[{ label: "Verhuischecklist" }]} />
        </div>

        {/* Hero */}
        <section className="border-y-2 border-foreground bg-secondary">
          <div className="container py-12 md:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
              Gratis tool
            </p>
            <h1 className="font-display mt-3 text-4xl lowercase leading-[1.05] text-foreground md:text-6xl">
              verhuischecklist
            </h1>
            <p className="mt-4 max-w-2xl text-base text-foreground/70 md:text-lg">
              Alles wat je moet regelen voor, tijdens en na je verhuizing. Vink af terwijl je
              bezig bent, je voortgang wordt automatisch opgeslagen op dit apparaat.
            </p>

            <div className="mt-8 max-w-md">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {completed} van {STEPS.length} stappen gedaan
                </span>
                <span className="font-bold text-accent">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-10 md:py-14">
          <div className="container space-y-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isChecked = !!checked[step.id];
              return (
                <Card
                  key={step.id}
                  className={`border-2 transition-all ${
                    isChecked
                      ? "border-accent/40 bg-accent/5"
                      : "border-foreground/10 hover:border-foreground/30"
                  }`}
                >
                  <CardContent className="p-5 md:p-7">
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => toggle(step.id)}
                        className="mt-1 shrink-0"
                        aria-label={`Stap ${idx + 1} ${isChecked ? "uitvinken" : "afvinken"}`}
                      >
                        <Checkbox checked={isChecked} className="h-5 w-5" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <span className="rounded-full border border-foreground/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {step.weeks}
                          </span>
                          {isChecked && (
                            <span className="flex items-center gap-1 text-xs font-medium text-accent">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Klaar
                            </span>
                          )}
                        </div>
                        <h2 className={`font-display mt-3 text-xl font-bold md:text-2xl ${
                          isChecked ? "line-through opacity-60" : ""
                        }`}>
                          {idx + 1}. {step.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                          {step.body}
                        </p>

                        {step.cta && (
                          <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-medium text-foreground">
                                {step.cta.note}
                              </p>
                              <Button
                                asChild
                                size="sm"
                                className="shrink-0 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                              >
                                <Link to={step.cta.href}>
                                  {step.cta.label}
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                            {step.embedEnergy && (
                              <details className="mt-4">
                                <summary className="cursor-pointer text-xs font-medium text-accent hover:underline">
                                  Of vergelijk hier direct in de pagina
                                </summary>
                                <div className="mt-4 border-t border-accent/20 pt-4">
                                  <DaisyconEnergyWidget />
                                </div>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t-2 border-foreground bg-foreground py-12 text-background">
          <div className="container text-center">
            <h2 className="font-display text-3xl lowercase md:text-4xl">
              nog op zoek naar je nieuwe plek?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-background/70">
              Stel je zoekopdracht in en ontvang direct een gratis melding bij nieuw aanbod.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/woonradar">Gratis melding instellen</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
              >
                <Link to="/woning-zoeken">Bekijk het aanbod</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Verhuischecklist;
