// Shared facts for the social-housing portal guides. Used by the React page and
// the static HTML written into dist, so Google and visitors see the same text.
export interface PortalGuide {
  slug: string;
  name: string;
  region: string;
  officialUrl: string;
  title: string;
  description: string;
  intro: string;
  facts: Array<[string, string]>;
  steps: string[];
  cities: Array<[string, string]>;
  faq: Array<[string, string]>;
  checked: string;
}

const INKOMEN = "Voor een sociale huurwoning geldt in 2026 een inkomensgrens van € 51.537 per jaar voor een eenpersoonshuishouden en € 56.910 voor meerpersoonshuishoudens.";

export const PORTAL_GUIDES: PortalGuide[] = [
  {
    slug: "wooniezie",
    name: "Wooniezie",
    region: "regio Eindhoven en Helmond (Zuidoost-Brabant)",
    officialUrl: "https://www.wooniezie.nl",
    title: "Wooniezie: inschrijven, kans en actueel aanbod Eindhoven | Woonaanbod NL",
    description: "Hoe werkt Wooniezie? Gratis inschrijven, inschrijfduur of loting, inkomensgrens 2026 en actuele huurwoningen in Eindhoven, Helmond en omgeving.",
    intro: "Wooniezie is de website waarop woningcorporaties in de regio Eindhoven en Helmond hun sociale huurwoningen aanbieden. Op deze pagina lees je hoe inschrijven werkt, hoe woningen worden verdeeld en welke huurwoningen er nu buiten Wooniezie te vinden zijn.",
    facts: [
      ["Regio", "Eindhoven, Helmond en omliggende gemeenten zoals Veldhoven, Best, Geldrop, Nuenen, Valkenswaard en Deurne"],
      ["Inschrijven", "Gratis, vanaf 18 jaar, met recht op verblijf in Nederland en een e-mailadres"],
      ["Verlengen", "Elk jaar, ook gratis"],
      ["Verdeling", "Op inschrijfduur (langst ingeschreven wint) of via loting"],
      ["Middenhuur en vrije sector", "Geen inschrijving nodig"],
    ],
    steps: [
      "Schrijf je gratis in op wooniezie.nl. Dat duurt ongeveer 10 minuten.",
      "Voeg je inkomensverklaring van de Belastingdienst toe. Zonder inkomen kun je niet reageren.",
      "Maak een zoekprofiel en zet tipberichten aan, maar maak het profiel niet te strikt.",
      "Reageer vooral op lotingwoningen als je net ingeschreven bent: daar telt inschrijfduur niet.",
      "Verleng je inschrijving elk jaar, anders verlies je je opgebouwde tijd.",
    ],
    cities: [["Eindhoven", "eindhoven"], ["Helmond", "helmond"], ["Veldhoven", "veldhoven"], ["Best", "best"], ["Geldrop", "geldrop"], ["Nuenen", "nuenen"], ["Valkenswaard", "valkenswaard"], ["Deurne", "deurne"]],
    faq: [
      ["Kost inschrijven bij Wooniezie geld?", "Nee. Inschrijven en jaarlijks verlengen bij Wooniezie is gratis."],
      ["Hoe lang is de wachttijd bij Wooniezie?", "Voor reguliere woningen op inschrijfduur ligt de inschrijfduur in de regio Eindhoven rond de 7 jaar. Bij loting maak je direct kans, ook als je net ingeschreven bent."],
      ["Heb ik Wooniezie nodig voor vrije sector huur?", "Nee. Voor middenhuur en vrije sector woningen is geen inschrijving nodig. Die woningen vind je ook op Woonaanbod NL."],
      ["Wat is de inkomensgrens?", INKOMEN],
    ],
    checked: "9 november 2026",
  },
  {
    slug: "thuiskompas",
    name: "Thuiskompas",
    region: "Drenthe en enkele gemeenten in Groningen, Friesland en Overijssel",
    officialUrl: "https://www.thuiskompas.nl",
    title: "Thuiskompas: gratis inschrijven en huurwoning vinden in Drenthe | Woonaanbod NL",
    description: "Alles over Thuiskompas: gratis inschrijven, hoe reageren werkt, welke corporaties meedoen en actuele huurwoningen in Assen, Emmen, Hoogeveen en Meppel.",
    intro: "Thuiskompas is het samenwerkingsverband van de 9 Drentse woningcorporaties. Met één inschrijving reageer je op sociale huurwoningen in heel Drenthe. Hier lees je hoe het werkt en waar je daarnaast nog huurwoningen vindt.",
    facts: [
      ["Regio", "Drenthe, plus een klein aantal gemeenten in Groningen, Friesland en Overijssel"],
      ["Corporaties", "Actium, Domesta, Lefier, De Volmacht, Woonborg, Woonconcept, Woonservice, Woonzorg Nederland en Eelder Woningbouw"],
      ["Inschrijven", "Gratis, vanaf 18 jaar, met recht op verblijf in Nederland en een e-mailadres"],
      ["Na tekenen huurcontract", "Je inschrijving vervalt, voor een volgende verhuizing bouw je opnieuw tijd op"],
      ["Let op", "Woningen van Lefier in Stadskanaal en Midden-Groningen staan sinds november 2025 op Groningen Huurt"],
    ],
    steps: [
      "Schrijf je gratis in op thuiskompas.nl.",
      "Vul direct je inkomen in, bijvoorbeeld via MijnOverheid met DigiD, zodat je meteen kunt reageren.",
      "Geef je woonwensen op. Je krijgt dan een mail zodra er een passend huis online komt.",
      "Reageer op huizen. Onder 'Mijn reacties' zie je op welke plek je staat.",
      "Krijg je een aanbod, geef dan altijd aan of je wel of geen interesse hebt.",
    ],
    cities: [["Assen", "assen"], ["Emmen", "emmen"], ["Hoogeveen", "hoogeveen"], ["Meppel", "meppel"], ["Coevorden", "coevorden"], ["Roden", "roden"]],
    faq: [
      ["Is Thuiskompas gratis?", "Ja. Inschrijven en verlengen bij Thuiskompas is gratis."],
      ["Welke corporaties zitten bij Thuiskompas?", "De 9 Drentse corporaties: Actium, Domesta, Lefier, De Volmacht, Woonborg, Woonconcept, Woonservice, Woonzorg Nederland en Stichting Eelder Woningbouw."],
      ["Wat gebeurt er met mijn inschrijving als ik een huis krijg?", "Zodra je een huurcontract tekent, vervalt je inschrijving. Wil je later weer verhuizen, dan schrijf je je opnieuw in."],
      ["Wat is de inkomensgrens?", INKOMEN],
    ],
    checked: "9 november 2026",
  },
  {
    slug: "woningnet",
    name: "WoningNet",
    region: "regio Amsterdam (nu DĀK) en andere WoningNet-regio's",
    officialUrl: "https://amsterdam.mijndak.nl",
    title: "WoningNet Amsterdam (DĀK): inschrijven, kosten en kans 2026 | Woonaanbod NL",
    description: "WoningNet regio Amsterdam heet nu DĀK. Inschrijfkosten, verlengen, inkomensgrens 2026, loting tips en actuele huurwoningen in Amsterdam en omgeving.",
    intro: "Sociale huurwoningen in de regio Amsterdam werden jarenlang aangeboden via WoningNet. Het aanbod staat nu op DĀK (amsterdam.mijndak.nl). Op deze pagina lees je wat inschrijven kost, hoe je sneller kans maakt en waar je ondertussen een vrije sector woning vindt.",
    facts: [
      ["Regio", "Amsterdam, Amstelveen, Zaandam, Haarlemmermeer en andere gemeenten in de stadsregio"],
      ["Inschrijven", "Eenmalig € 50"],
      ["Verlengen", "€ 9 per jaar na het eerste jaar"],
      ["Gemiddelde inschrijfduur Amsterdam", "Rond de 14 jaar voor reguliere woningen"],
      ["Inkomensgrens 2026", "€ 51.537 (1 persoon) en € 56.910 (meer personen)"],
    ],
    steps: [
      "Schrijf je in via amsterdam.mijndak.nl, ook als je inkomen nu nog te hoog is. Je bouwt dan alvast wachttijd op.",
      "Huur je al sociaal? Schrijf je toch in, dat gaat niet automatisch.",
      "Net ingeschreven? Reageer op lotingwoningen. Daar telt wachttijd niet mee.",
      "Kijk ondertussen naar middenhuur en vrije sector, waar geen wachttijd geldt.",
      "Betaal je verlenging op tijd, anders verlies je je opgebouwde punten.",
    ],
    cities: [["Amsterdam", "amsterdam"], ["Amstelveen", "amstelveen"], ["Zaandam", "zaandam"], ["Hoofddorp", "hoofddorp"], ["Purmerend", "purmerend"], ["Almere", "almere"]],
    faq: [
      ["Bestaat WoningNet Amsterdam nog?", "Het aanbod van de regio Amsterdam staat nu op DĀK via amsterdam.mijndak.nl. Bestaande inschrijvingen lopen daar door."],
      ["Wat kost inschrijven bij WoningNet Amsterdam?", "Eenmalig € 50. Na het eerste jaar betaal je € 9 per jaar om je inschrijving te verlengen."],
      ["Hoe lang is de wachttijd in Amsterdam?", "Gemiddeld rond de 14 jaar voor reguliere sociale huurwoningen. Via loting kun je eerder kans maken."],
      ["Wat is de inkomensgrens?", INKOMEN],
    ],
    checked: "9 november 2026",
  },
];

export const getPortalGuide = (slug: string) => PORTAL_GUIDES.find(g => g.slug === slug);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function portalGuideFaqLd(g: PortalGuide) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: g.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
}

/** Plain HTML for crawlers, written into dist after bundling. */
export function portalGuideHtml(g: PortalGuide) {
  return `<div class="ssr-home-content"><h1>${esc(g.name)}: inschrijven en huurwoning vinden</h1><p>${esc(g.intro)}</p><p>Woonaanbod NL is geen officiële site van ${esc(g.name)}. Officiële site: <a href="${g.officialUrl}" rel="nofollow">${esc(g.officialUrl.replace("https://", ""))}</a>.</p><h2>Kort overzicht</h2><ul>${g.facts.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join("")}</ul><h2>Zo vergroot je je kans</h2><ol>${g.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol><h2>Huurwoningen in de regio zonder wachtlijst</h2><ul>${g.cities.map(([n, s]) => `<li><a href="/huurwoningen/${s}">Huurwoningen in ${esc(n)}</a></li>`).join("")}</ul><h2>Veelgestelde vragen</h2>${g.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}<p>Gecontroleerd op ${esc(g.checked)}. Zie ook <a href="/sociale-huur-wachttijd">wachttijd sociale huur per stad</a>.</p></div><script type="application/ld+json">${JSON.stringify(portalGuideFaqLd(g)).replace(/</g, "\\u003c")}</script>`;
}
