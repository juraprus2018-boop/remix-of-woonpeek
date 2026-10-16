import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import FAQSchema from "@/components/seo/FAQSchema";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Printer, FileText } from "lucide-react";
import { toast } from "sonner";

type Kind = "borg" | "bemiddeling" | "gebreken";

const kinds: { v: Kind; title: string; desc: string }[] = [
  { v: "borg", title: "Borg terugvorderen", desc: "Verhuurder betaalt je waarborgsom niet (volledig) terug." },
  { v: "bemiddeling", title: "Bemiddelingskosten terugvragen", desc: "Je betaalde sleutelgeld of bemiddelingskosten aan een makelaar." },
  { v: "gebreken", title: "Gebreken melden", desc: "Verhuurder herstelt onderhoudsproblemen niet." },
];

const faqs = [
  { question: "Binnen hoeveel tijd moet de verhuurder mijn borg terugbetalen?", answer: "Voor huurovereenkomsten vanaf 1 juli 2023 geldt: binnen 14 dagen na het einde van de huur, of binnen 30 dagen als de verhuurder kosten voor schade wil verrekenen (artikel 7:261b BW)." },
  { question: "Mag een makelaar bemiddelingskosten rekenen aan de huurder?", answer: "Nee, als de makelaar ook voor de verhuurder werkt mag hij geen bemiddelingskosten aan jou rekenen (artikel 7:417 BW). Je kunt het bedrag tot vijf jaar terugvorderen." },
  { question: "Wat als de verhuurder niet reageert op mijn brief?", answer: "Je kunt naar het Juridisch Loket, de Huurcommissie (bij gebreken) of de kantonrechter. Bewaar je brief en een bewijs van verzending, bijvoorbeeld via aangetekende post." },
];

const today = () => new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
const clean = (s: string, max = 200) => s.replace(/[<>]/g, "").slice(0, max);

export default function BorgTerugvorderen() {
  const [kind, setKind] = useState<Kind>("borg");
  const [f, setF] = useState({
    naam: "", adres: "", woningAdres: "", verhuurder: "", verhuurderAdres: "",
    einddatum: "", bedrag: "", iban: "", toelichting: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: clean(e.target.value, k === "toelichting" ? 1000 : 200) });

  const v = (x: string, ph: string) => x.trim() || `[${ph}]`;

  const letter = useMemo(() => {
    const head = `${v(f.naam, "Jouw naam")}
${v(f.adres, "Jouw adres")}

${v(f.verhuurder, "Naam verhuurder of makelaar")}
${v(f.verhuurderAdres, "Adres verhuurder")}

${today()}

`;
    const bedrag = f.bedrag ? `€ ${f.bedrag}` : "[bedrag]";
    const end = `

Ik verzoek u het bedrag binnen 14 dagen na dagtekening van deze brief over te maken op rekeningnummer ${v(f.iban, "IBAN")} ten name van ${v(f.naam, "jouw naam")}. Blijft betaling uit, dan zie ik mij genoodzaakt verdere (juridische) stappen te nemen. De eventuele kosten daarvan komen voor uw rekening.

Met vriendelijke groet,

${v(f.naam, "Jouw naam")}`;

    if (kind === "borg") {
      return head + `Betreft: terugbetaling waarborgsom ${v(f.woningAdres, "adres huurwoning")}

Geachte heer/mevrouw,

Op ${v(f.einddatum, "datum")} is de huurovereenkomst voor de woning aan ${v(f.woningAdres, "adres huurwoning")} geëindigd en heb ik de sleutels ingeleverd. Bij aanvang van de huur heb ik een waarborgsom betaald. Tot op heden heb ik ${bedrag} niet terugontvangen.

Volgens artikel 7:261b van het Burgerlijk Wetboek moet de verhuurder de waarborgsom binnen 14 dagen na het einde van de huur terugbetalen. Wil de verhuurder kosten voor schade verrekenen, dan geldt een termijn van 30 dagen en moet hij deze kosten schriftelijk en onderbouwd toelichten. Die termijn is verstreken.${f.toelichting ? `\n\n${f.toelichting}` : ""}` + end;
    }
    if (kind === "bemiddeling") {
      return head + `Betreft: terugvordering onterecht betaalde bemiddelingskosten

Geachte heer/mevrouw,

Voor de huur van de woning aan ${v(f.woningAdres, "adres huurwoning")} heb ik u ${bedrag} aan bemiddelings- of contractkosten betaald. U trad daarbij (ook) op namens de verhuurder.

Op grond van artikel 7:417 lid 4 en artikel 7:427 van het Burgerlijk Wetboek mag een bemiddelaar die ook voor de verhuurder werkt geen kosten bij de huurder in rekening brengen. Dit is bevestigd door de Hoge Raad (16 oktober 2015, ECLI:NL:HR:2015:3099). Ik vorder het betaalde bedrag daarom terug.${f.toelichting ? `\n\n${f.toelichting}` : ""}` + end;
    }
    return head + `Betreft: ingebrekestelling onderhoudsgebreken ${v(f.woningAdres, "adres huurwoning")}

Geachte heer/mevrouw,

Ik huur de woning aan ${v(f.woningAdres, "adres huurwoning")}. In de woning zijn de volgende gebreken aanwezig:

${v(f.toelichting, "Beschrijf hier de gebreken, sinds wanneer ze bestaan en wanneer je ze eerder hebt gemeld")}

Volgens artikel 7:204 en 7:206 van het Burgerlijk Wetboek bent u als verhuurder verplicht deze gebreken te verhelpen. Hierbij stel ik u in gebreke en verzoek ik u de gebreken binnen zes weken na dagtekening van deze brief te herstellen.

Gebeurt dit niet, dan behoud ik mij het recht voor om de Huurcommissie in te schakelen voor huurverlaging, de gebreken zelf te laten herstellen en de kosten met de huur te verrekenen, of andere juridische stappen te zetten.

Met vriendelijke groet,

${v(f.naam, "Jouw naam")}`;
  }, [kind, f]);

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    toast.success("Brief gekopieerd");
  };

  return (
    <>
      <SEOHead
        title="Borg terugvorderen: gratis voorbeeldbrief | Woonaanbod NL"
        description="Borg niet terug of onterechte bemiddelingskosten betaald? Maak gratis een voorbeeldbrief met de juiste wetsartikelen en download hem als PDF."
        canonical="/borg-terugvorderen"
      />
      <FAQSchema faqs={faqs} />
      <style>{`@media print { body * { visibility: hidden; } #brief, #brief * { visibility: visible; } #brief { position: absolute; inset: 0; border: 0; padding: 20mm; } }`}</style>
      <Header />
      <main className="container py-8">
        <Breadcrumbs items={[{ label: "Borg terugvorderen" }]} />
        <h1 className="mt-4 font-display text-3xl font-extrabold text-foreground md:text-4xl">Borg terugvorderen: gratis voorbeeldbrief</h1>
        <p className="mt-2 text-muted-foreground">Vul je gegevens in en je brief staat direct klaar, met de juiste wetsartikelen. Download als PDF of kopieer de tekst.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {kinds.map((k) => (
            <button key={k.v} onClick={() => setKind(k.v)}
              className={`rounded-xl border p-4 text-left transition ${kind === k.v ? "border-accent bg-accent/10" : "bg-card hover:border-primary/40"}`}>
              <p className="font-semibold text-foreground">{k.title}</p>
              <p className="text-sm text-muted-foreground">{k.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-xl border bg-card p-5">
            {([
              ["naam", "Jouw naam"], ["adres", "Jouw huidige adres"], ["woningAdres", "Adres van de huurwoning"],
              ["verhuurder", kind === "bemiddeling" ? "Naam makelaar" : "Naam verhuurder"], ["verhuurderAdres", "Adres verhuurder of makelaar"],
            ] as const).map(([k, l]) => (
              <div key={k}><Label htmlFor={k}>{l}</Label><Input id={k} value={f[k]} onChange={set(k)} /></div>
            ))}
            {kind === "borg" && (
              <div><Label htmlFor="einddatum">Datum einde huur / sleuteloverdracht</Label><Input id="einddatum" value={f.einddatum} onChange={set("einddatum")} placeholder="1 september 2026" /></div>
            )}
            {kind !== "gebreken" && (
              <>
                <div><Label htmlFor="bedrag">Bedrag in euro</Label><Input id="bedrag" inputMode="decimal" value={f.bedrag} onChange={set("bedrag")} placeholder="1500" /></div>
                <div><Label htmlFor="iban">Jouw IBAN</Label><Input id="iban" value={f.iban} onChange={set("iban")} /></div>
              </>
            )}
            <div>
              <Label htmlFor="toelichting">{kind === "gebreken" ? "Welke gebreken?" : "Extra toelichting (optioneel)"}</Label>
              <Textarea id="toelichting" rows={4} value={f.toelichting} onChange={set("toelichting")} />
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Opslaan als PDF</Button>
              <Button variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4" />Kopieer tekst</Button>
            </div>
            <pre id="brief" className="whitespace-pre-wrap rounded-xl border bg-background p-6 font-sans text-sm leading-relaxed text-foreground">{letter}</pre>
            <p className="mt-2 text-xs text-muted-foreground">Kies bij "Opslaan als PDF" in het printvenster voor "Opslaan als PDF". Stuur de brief bij voorkeur aangetekend. Dit is een voorbeeldbrief en geen juridisch advies.</p>
          </div>
        </div>

        <section className="mt-10 rounded-xl border bg-card p-6">
          <FileText className="h-6 w-6 text-accent" />
          <h2 className="mt-2 font-display text-xl font-bold text-foreground">Op zoek naar een nieuwe huurwoning?</h2>
          <p className="mt-1 text-muted-foreground">Bekijk het actuele aanbod of laat je direct mailen als er een passende woning bijkomt.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild><Link to="/zoeken">Bekijk huurwoningen</Link></Button>
            <Button asChild variant="outline"><Link to="/woonmelding">Woonmelding instellen</Link></Button>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-foreground">Veelgestelde vragen</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((q) => (
              <div key={q.question} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold text-foreground">{q.question}</h3>
                <p className="mt-1 text-muted-foreground">{q.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
