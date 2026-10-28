import { Link } from "react-router-dom";
import { cityToSlug } from "@/lib/cityUtils";

const regions: { title: string; cities: string[] }[] = [
  { title: "Randstad", cities: ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Haarlem", "Leiden", "Delft", "Amersfoort"] },
  { title: "Noord en Oost", cities: ["Groningen", "Zwolle", "Enschede", "Leeuwarden", "Apeldoorn", "Deventer"] },
  { title: "Zuid", cities: ["Eindhoven", "Tilburg", "Breda", "'s-Hertogenbosch", "Maastricht", "Helmond"] },
  { title: "Gelderland en midden", cities: ["Arnhem", "Nijmegen", "Ede", "Almere", "Hilversum", "Zeist"] },
];

const faq = [
  {
    q: "Hoe vind ik snel een huurwoning?",
    a: "Kijk elke dag even, want goede woningen zijn vaak binnen een paar dagen weg. Nog makkelijker: zet een woonalert aan voor jouw plaats en budget. Dan krijg je een mail zodra er iets nieuws bijkomt en hoef je niet zelf te blijven verversen.",
  },
  {
    q: "Kost Woonaanbod NL iets?",
    a: "Nee. Zoeken, woonalerts en de handige tools zoals de huurprijscheck zijn gratis. Je hoeft er ook geen account voor te maken.",
  },
  {
    q: "Waar komen de woningen vandaan?",
    a: "We verzamelen aanbod van verhuurders, makelaars en woningsites op één plek. Bij elke woning zie je bij wie hij staat. Reageren doe je rechtstreeks bij die aanbieder.",
  },
  {
    q: "Hoeveel inkomen heb ik nodig voor een huurwoning?",
    a: "Veel verhuurders vragen een bruto maandinkomen van drie tot vier keer de kale huur. Voor een woning van € 1.200 per maand is dat dus ongeveer € 3.600 tot € 4.800. Vul je inkomen in bij de filters, dan zie je meteen wat binnen bereik ligt.",
  },
  {
    q: "Wat betekent het als een woning inactief is?",
    a: "Dan is hij verhuurd of offline gehaald. We laten de pagina staan zodat je kunt zien wat er in die straat werd gevraagd, en we tonen vergelijkbare woningen die wel beschikbaar zijn.",
  },
];

/** Visitor-first explanatory copy for the Dutch homepage, with links into city pages. */
const HomeSeoContent = () => (
  <section className="border-t border-border py-14 md:py-20">
    <div className="container">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Huurwoningen in heel Nederland, op één plek
          </h2>
          <div className="mt-4 space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <p>
              Een huurwoning zoeken betekent vaak tien tabbladen open, overal een account en toch het gevoel dat je iets mist.
              Daarom zetten we het aanbod van makelaars, verhuurders en woningsites bij elkaar. Je zoekt op plaats,
              postcode of budget en ziet appartementen, studio's, kamers en eengezinswoningen naast elkaar.
            </p>
            <p>
              Elke dag komen er nieuwe woningen bij. Bovenaan elke woning zie je hoe lang hij al online staat, zodat je
              weet waar je snel moet zijn. Op de woningpagina lees je ook hoe ver de supermarkt, het station en de school zijn,
              met cijfers van het CBS.
            </p>
            <p>
              Zoek je in een kleinere plaats waar weinig vrijkomt? Zet dan een{" "}
              <Link to="/woonmelding" className="font-semibold text-foreground underline underline-offset-4">woonalert</Link>{" "}
              aan. Twijfel je of een huur eerlijk is, doe dan de{" "}
              <Link to="/huurprijs-check" className="font-semibold text-foreground underline underline-offset-4">huurprijscheck</Link>.
              Liever op de kaart kijken? Dat kan via{" "}
              <Link to="/op-kaart" className="font-semibold text-foreground underline underline-offset-4">woningen op de kaart</Link>.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Huurwoningen per regio
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {regions.map((r) => (
              <div key={r.title}>
                <h3 className="font-semibold text-foreground">{r.title}</h3>
                <ul className="mt-2 space-y-1.5 text-[0.9375rem]">
                  {r.cities.map((c) => (
                    <li key={c}>
                      <Link to={`/huurwoningen/${cityToSlug(c)}`} className="text-muted-foreground hover:text-foreground hover:underline">
                        Huurwoningen {c}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link to="/woonaanbod-per-stad" className="mt-5 inline-block text-sm font-bold text-foreground underline underline-offset-4">
            Bekijk alle plaatsen
          </Link>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Vragen die we vaak krijgen
        </h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {faq.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border bg-card">
              <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-foreground">{f.q}</summary>
              <p className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HomeSeoContent;
