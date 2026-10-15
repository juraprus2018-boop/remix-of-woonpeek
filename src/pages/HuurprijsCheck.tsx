import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import FAQSchema from "@/components/seo/FAQSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Bell, Search } from "lucide-react";

// Vereenvoudigde WWS-puntentelling (zelfstandige woning), indicatief.
const ENERGY_POINTS: Record<string, number> = { "A++++": 52, "A+++": 48, "A++": 44, "A+": 40, A: 36, B: 32, C: 22, D: 14, E: 8, F: 4, G: 0 };
// Indicatieve grenzen 2026 (Wet betaalbare huur). Bedragen worden jaarlijks geïndexeerd.
const SOCIAL_MAX_POINTS = 143;
const MID_MAX_POINTS = 186;
const SOCIAL_MAX_RENT = 932;
const MID_MAX_RENT = 1228;
// Benadering maximale huur per punt boven de sociale grens.
const rentForPoints = (p: number) => Math.round(SOCIAL_MAX_RENT + (Math.min(p, MID_MAX_POINTS) - SOCIAL_MAX_POINTS) * ((MID_MAX_RENT - SOCIAL_MAX_RENT) / (MID_MAX_POINTS - SOCIAL_MAX_POINTS)));

const faqs = [
  { question: "Hoe controleer ik of mijn huurprijs te hoog is?", answer: "Tel de punten van je woning volgens het woningwaarderingsstelsel (WWS). Het aantal punten bepaalt de maximale huur. Valt je woning in de sociale huur of middenhuur en betaal je meer, dan kun je bij de Huurcommissie huurverlaging vragen." },
  { question: "Wat is de Wet betaalbare huur?", answer: "Sinds 1 juli 2024 geldt het puntenstelsel ook voor middenhuur. Woningen tot ongeveer 186 punten hebben een maximale huurprijs. Daarboven is de huur vrij." },
  { question: "Is deze huurprijs check bindend?", answer: "Nee. Dit is een vereenvoudigde indicatie. Voor een officiële berekening gebruik je de huurprijscheck van de Huurcommissie." },
];

const HuurprijsCheck = () => {
  const [m2, setM2] = useState("60");
  const [energy, setEnergy] = useState("C");
  const [outdoor, setOutdoor] = useState("0");
  const [woz, setWoz] = useState("300000");
  const [kitchen, setKitchen] = useState<"basis" | "luxe">("basis");
  const [bathroom, setBathroom] = useState<"basis" | "luxe">("basis");
  const [rent, setRent] = useState("1200");

  const result = useMemo(() => {
    const area = Math.max(0, Number(m2) || 0);
    const out = Math.max(0, Number(outdoor) || 0);
    const wozVal = Math.max(0, Number(woz) || 0);
    let pts = area * 1; // oppervlakte
    pts += ENERGY_POINTS[energy] ?? 0;
    pts += out > 0 ? 2 + Math.min(out, 100) * 0.35 : -5;
    pts += kitchen === "luxe" ? 7 : 4;
    pts += bathroom === "luxe" ? 10 : 6;
    pts += 5; // verwarming/basisvoorzieningen
    const wozPts = area > 0 ? Math.min(wozVal / 15000 + wozVal / area / 250, (pts * 0.33)) : 0;
    pts += wozPts;
    const total = Math.round(pts);
    const sector = total <= SOCIAL_MAX_POINTS ? "Sociale huur" : total <= MID_MAX_POINTS ? "Middenhuur" : "Vrije sector";
    const maxRent = total <= SOCIAL_MAX_POINTS ? Math.round((total / SOCIAL_MAX_POINTS) * SOCIAL_MAX_RENT) : total <= MID_MAX_POINTS ? rentForPoints(total) : null;
    return { total, sector, maxRent };
  }, [m2, energy, outdoor, woz, kitchen, bathroom]);

  const rentNum = Number(rent) || 0;
  const tooHigh = result.maxRent !== null && rentNum > result.maxRent;

  const toggle = (val: string, cur: string, set: (v: any) => void, label: string) => (
    <Button type="button" size="sm" variant={cur === val ? "default" : "outline"} onClick={() => set(val)}>{label}</Button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Huurprijs check 2026: bereken je WWS-punten | Woonaanbod NL"
        description="Gratis huurprijs check: tel de WWS-punten van je huurwoning en zie direct of je huur te hoog is volgens de Wet betaalbare huur."
        canonical="/huurprijs-check"
      />
      <Header />
      <main className="container flex-1 py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Huurprijs check" }]} />
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">Huurprijs check: betaal je te veel huur?</h1>
        <p className="mt-2 text-muted-foreground">Tel in een minuut de punten van je woning en zie of je huur past binnen de Wet betaalbare huur.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-2xl border bg-card p-5">
            <label className="block text-sm font-medium">Woonoppervlakte (m²)<Input inputMode="numeric" value={m2} onChange={(e) => setM2(e.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-1" /></label>
            <div>
              <p className="text-sm font-medium">Energielabel</p>
              <div className="mt-1 flex flex-wrap gap-2">{Object.keys(ENERGY_POINTS).map((l) => toggle(l, energy, setEnergy, l))}</div>
            </div>
            <label className="block text-sm font-medium">Buitenruimte (m², 0 = geen)<Input inputMode="numeric" value={outdoor} onChange={(e) => setOutdoor(e.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-1" /></label>
            <label className="block text-sm font-medium">WOZ-waarde (€)<Input inputMode="numeric" value={woz} onChange={(e) => setWoz(e.target.value.replace(/\D/g, "").slice(0, 8))} className="mt-1" /></label>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm font-medium">Keuken</p><div className="mt-1 flex gap-2">{toggle("basis", kitchen, setKitchen, "Basis")}{toggle("luxe", kitchen, setKitchen, "Luxe")}</div></div>
              <div><p className="text-sm font-medium">Badkamer</p><div className="mt-1 flex gap-2">{toggle("basis", bathroom, setBathroom, "Basis")}{toggle("luxe", bathroom, setBathroom, "Luxe")}</div></div>
            </div>
            <label className="block text-sm font-medium">Huidige kale huur (€ per maand)<Input inputMode="numeric" value={rent} onChange={(e) => setRent(e.target.value.replace(/\D/g, "").slice(0, 5))} className="mt-1" /></label>
          </section>

          <section className="rounded-2xl bg-primary p-6 text-primary-foreground">
            <p className="flex items-center gap-2 text-sm uppercase tracking-wider opacity-80"><Calculator className="h-4 w-4" /> Jouw uitslag</p>
            <p className="mt-3 font-display text-5xl font-bold">{result.total} punten</p>
            <p className="mt-1 text-xl font-semibold">{result.sector}</p>
            {result.maxRent !== null ? (
              <p className="mt-4">Maximale kale huur volgens deze indicatie: <strong>€{result.maxRent.toLocaleString("nl-NL")}</strong> per maand.</p>
            ) : (
              <p className="mt-4">Boven {MID_MAX_POINTS} punten geldt geen wettelijke maximumhuur.</p>
            )}
            {rentNum > 0 && result.maxRent !== null && (
              <p className={`mt-3 rounded-lg p-3 font-semibold ${tooHigh ? "bg-accent text-accent-foreground" : "bg-primary-foreground/10"}`}>
                {tooHigh
                  ? `Je betaalt mogelijk €${(rentNum - result.maxRent).toLocaleString("nl-NL")} per maand te veel. Je kunt huurverlaging aanvragen bij de Huurcommissie.`
                  : "Je huur lijkt binnen de grens te vallen."}
              </p>
            )}
            <p className="mt-4 text-xs opacity-70">Vereenvoudigde indicatie. Controleer officieel via de Huurcommissie.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="secondary" className="gap-2"><Link to="/huurwoningen"><Search className="h-4 w-4" />Bekijk betaalbaar aanbod</Link></Button>
              <Button asChild className="gap-2"><Link to="/woonmelding"><Bell className="h-4 w-4" />Ontvang gratis meldingen</Link></Button>
            </div>
          </section>
        </div>

        <FAQSchema items={faqs} title="Veelgestelde vragen" className="mt-10" />
      </main>
      <Footer />
    </div>
  );
};

export default HuurprijsCheck;
