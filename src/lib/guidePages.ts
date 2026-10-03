/**
 * SEO-gidsen voor zoektermen met >500 zoekvolume/mnd (Semrush NL, okt 2026).
 * Elke gids combineert echte antwoorden met live aanbod uit de database.
 * Sync paden met supabase/functions/generate-sitemap/index.ts.
 */
export interface GuideSection { title: string; paragraphs: string[]; bullets?: string[] }
export interface GuideFaq { q: string; a: string }
export interface GuidePage {
  path: string;
  keyword: string;
  volume: number;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  listings: { title: string; textMatch?: string; maxPrice?: number; propertyType?: "appartement" | "huis" | "studio" | "kamer" | "vakantiehuis" };
  related: string[];
}

export const GUIDE_PAGES: GuidePage[] = [
  {
    path: "/particulier-huren",
    keyword: "particulier huren",
    volume: 2900,
    title: "Particulier huren: actueel aanbod en tips | Woonaanbod NL",
    description: "Particulier een woning huren zonder wachtlijst? Bekijk dagelijks nieuw aanbod, wat je rechten zijn, welke inkomenseis geldt en hoe je oplichting voorkomt.",
    h1: "Particulier huren zonder wachtlijst",
    intro: "Bij particuliere verhuurders en makelaars heb je geen inschrijftijd nodig. Wie het eerst en het best reageert, maakt de meeste kans. Hieronder vind je actueel aanbod en alles wat je moet weten voordat je tekent.",
    sections: [
      {
        title: "Wat is particulier huren?",
        paragraphs: [
          "Je huurt van een eigenaar, belegger of makelaar en niet van een woningcorporatie. Dat betekent geen wachtlijst, maar wel vaak een hogere huur en strengere inkomenseisen.",
          "Sinds de Wet betaalbare huur (juli 2024) valt een groot deel van de particuliere woningen tot ongeveer 187 punten onder de middenhuur. Daar geldt een maximale huurprijs, ook bij particulieren.",
        ],
      },
      {
        title: "Waar let je op?",
        paragraphs: ["Particulier huren is snel, maar controleer altijd deze punten:"],
        bullets: [
          "Bezichtig de woning altijd zelf voordat je geld overmaakt.",
          "Een borg van maximaal twee maanden kale huur is wettelijk toegestaan.",
          "Bemiddelingskosten aan de huurder zijn verboden als de makelaar ook voor de verhuurder werkt.",
          "Een tijdelijk contract mag alleen nog in uitzonderingen (Wet vaste huurcontracten).",
          "Check met de huurprijscheck van de Huurcommissie of de huur klopt.",
        ],
      },
      {
        title: "Sneller een woning vinden",
        paragraphs: [
          "Nieuwe woningen zijn vaak binnen een dag weg. Zet een gratis woonmelding aan, zodat je nieuw aanbod direct in je mailbox krijgt en als een van de eersten kunt reageren.",
        ],
      },
    ],
    faq: [
      { q: "Heb ik inschrijftijd nodig om particulier te huren?", a: "Nee. Particuliere verhuurders en makelaars werken zonder wachtlijst. Je reageert direct op een woning." },
      { q: "Welke inkomenseis geldt bij particulier huren?", a: "Meestal vraagt de verhuurder een bruto maandinkomen van 3 tot 4 keer de kale huur. Een garantsteller kan helpen als je inkomen te laag is." },
      { q: "Hoeveel borg mag een particuliere verhuurder vragen?", a: "Maximaal twee keer de kale maandhuur, voor contracten die na 1 juli 2023 zijn gesloten." },
      { q: "Is particulier huren hetzelfde als vrije sector?", a: "Niet altijd. Particuliere woningen kunnen in de sociale huur, middenhuur of vrije sector vallen. Dat hangt af van het puntenaantal van de woning." },
    ],
    listings: { title: "Nieuw particulier huuraanbod" },
    related: ["/vrije-sector-huur", "/tijdelijke-woonruimte", "/woonmelding"],
  },
  {
    path: "/vrije-sector-huur",
    keyword: "vrije sector huur",
    volume: 2900,
    title: "Vrije sector huur 2026: grens, regels en aanbod | Woonaanbod NL",
    description: "Wat is vrije sector huur in 2026, welke huurgrens geldt en welke inkomenseis hoort erbij? Uitleg plus dagelijks nieuw vrije sector huuraanbod in heel Nederland.",
    h1: "Vrije sector huur: regels en actueel aanbod",
    intro: "In de vrije sector bepaalt de markt de huurprijs. Je hebt geen wachtlijst nodig en kunt vaak snel verhuizen. Hier lees je welke regels gelden en zie je het nieuwste aanbod.",
    sections: [
      {
        title: "Wanneer valt een woning in de vrije sector?",
        paragraphs: [
          "Sinds de Wet betaalbare huur valt een woning in de vrije sector boven ongeveer 187 punten in het woningwaarderingsstelsel. Daaronder gelden maximale huurprijzen voor sociale huur of middenhuur.",
          "Voor de huurder betekent dat: geen huurtoeslag, maar wel een jaarlijkse maximale huurverhoging die het Rijk vaststelt.",
        ],
      },
      {
        title: "Inkomenseis en kosten",
        paragraphs: ["Verhuurders kijken vooral naar je inkomen en zekerheid:"],
        bullets: [
          "Gangbaar is een bruto inkomen van 3 tot 4 keer de kale huur.",
          "Een vast contract of werkgeversverklaring vergroot je kans.",
          "Bereken met onze budgettool welke huur bij jouw inkomen past.",
        ],
      },
    ],
    faq: [
      { q: "Wat is de vrije sector huurgrens in 2026?", a: "De grens ligt bij ongeveer 187 punten in het woningwaarderingsstelsel. Boven die grens is de huurprijs vrij, met een wettelijke maximale jaarlijkse verhoging." },
      { q: "Krijg ik huurtoeslag in de vrije sector?", a: "Nee, huurtoeslag geldt alleen tot de huurtoeslaggrens. Vrije sector woningen liggen daarboven." },
      { q: "Heb ik een wachtlijst nodig voor vrije sector huur?", a: "Nee. Je reageert direct bij de verhuurder of makelaar." },
    ],
    listings: { title: "Nieuw vrije sector aanbod", maxPrice: 3000 },
    related: ["/particulier-huren", "/budget-tool", "/sociale-huur-wachttijd"],
  },
  {
    path: "/tijdelijke-woonruimte",
    keyword: "tijdelijke woonruimte",
    volume: 1600,
    title: "Tijdelijke woonruimte vinden: alle opties | Woonaanbod NL",
    description: "Snel tijdelijke woonruimte nodig na een scheiding, verbouwing of nieuwe baan? Alle opties op een rij: tijdelijke huur, antikraak, vakantiepark en short stay.",
    h1: "Tijdelijke woonruimte vinden",
    intro: "Of je nu gaat scheiden, je huis verbouwt of voor werk verhuist: soms heb je snel een dak boven je hoofd nodig voor een paar maanden. Dit zijn de opties, van goedkoop tot comfortabel.",
    sections: [
      {
        title: "De vijf opties voor tijdelijk wonen",
        paragraphs: ["Elke optie heeft eigen voor- en nadelen in prijs, zekerheid en snelheid:"],
        bullets: [
          "Tijdelijk huurcontract: mag alleen nog voor studenten, jongeren, grote gezinnen, bij hospitaverhuur of als de verhuurder zelf terugkeert.",
          "Leegstandwet-verhuur: een woning die te koop staat of gesloopt wordt, vaak met een korting op de huur.",
          "Antikraak: goedkoop, maar met korte opzegtermijn en weinig rechten.",
          "Vakantiepark of chalet: snel beschikbaar, let op of je je mag inschrijven bij de gemeente.",
          "Short stay of gemeubileerd appartement: duurder, maar je kunt direct intrekken.",
        ],
      },
      {
        title: "Snel iets vinden",
        paragraphs: [
          "Het snelst gaat het in de vrije sector en bij gemeubileerde woningen. Zet een woonmelding aan voor jouw plaats, zodat je als eerste reageert op nieuw aanbod.",
        ],
      },
    ],
    faq: [
      { q: "Hoe kom ik snel aan tijdelijke woonruimte?", a: "Kijk naar vrije sector huur, gemeubileerde appartementen, Leegstandwet-woningen en vakantieparken. Reageer snel: zet een melding aan voor nieuw aanbod." },
      { q: "Mag ik me inschrijven op een vakantiepark?", a: "Dat hangt af van de gemeente. Veel gemeenten staan tijdelijke inschrijving toe na een scheiding of in een noodsituatie. Vraag het na bij de gemeente." },
      { q: "Zijn tijdelijke huurcontracten nog toegestaan?", a: "Sinds 1 juli 2024 alleen voor specifieke groepen zoals studenten, jongeren tot 27 en bij hospitaverhuur. Verder zijn vaste contracten de regel." },
    ],
    listings: { title: "Gemeubileerd en direct beschikbaar", textMatch: "gemeubileerd" },
    related: ["/antikraak-wonen", "/permanent-wonen-recreatiewoning", "/scheiden-geen-woning"],
  },
  {
    path: "/urgentie-aanvragen",
    keyword: "urgentie aanvragen",
    volume: 1900,
    title: "Urgentie aanvragen voor een woning: zo werkt het | Woonaanbod NL",
    description: "Wanneer krijg je urgentie voor een huurwoning en hoe vraag je een urgentieverklaring aan? Voorwaarden, kansen en alternatieven als je wordt afgewezen.",
    h1: "Urgentie aanvragen voor een woning",
    intro: "Met een urgentieverklaring krijg je voorrang op een sociale huurwoning. Maar de regels zijn streng en de meeste aanvragen worden afgewezen. Lees hier wanneer je kans maakt en wat je kunt doen als het niet lukt.",
    sections: [
      {
        title: "Wanneer krijg je urgentie?",
        paragraphs: ["Elke gemeente heeft eigen regels, maar de gronden lijken op elkaar:"],
        bullets: [
          "Medische noodzaak waardoor je huidige woning niet meer geschikt is.",
          "Huiselijk geweld of een onveilige thuissituatie.",
          "Sloop of renovatie van je huidige woning.",
          "Uitstroom uit een opvang of zorginstelling.",
          "Scheiding: alleen in sommige gemeenten, en meestal alleen met minderjarige kinderen.",
        ],
      },
      {
        title: "Zo vraag je urgentie aan",
        paragraphs: [
          "Je doet de aanvraag bij de gemeente of het regionale woonsysteem. Je betaalt vaak leges van 50 tot 100 euro en moet bewijs aanleveren. De beslissing duurt doorgaans 6 tot 8 weken.",
          "Laat zien dat je zelf al zoekt: inschrijving bij woonsystemen, reacties op vrije sector woningen en meldingen helpen je dossier.",
        ],
      },
      {
        title: "Afgewezen? Dit zijn je alternatieven",
        paragraphs: [
          "Zonder urgentie kun je vaak sneller terecht in de vrije sector, bij particuliere verhuurders of in tijdelijke woonruimte. Bekijk ook de wachttijden per stad.",
        ],
      },
    ],
    faq: [
      { q: "Wanneer heb je recht op urgentie voor een woning?", a: "Bij een acute noodsituatie die je niet zelf kunt oplossen, zoals medische problemen, huiselijk geweld of sloop. Dakloosheid door eigen keuze telt meestal niet." },
      { q: "Krijg ik urgentie bij een scheiding?", a: "In de meeste gemeenten niet meer. Sommige gemeenten geven urgentie als er minderjarige kinderen zijn en je geen andere opvang hebt." },
      { q: "Hoe snel krijg je een woning met urgentie?", a: "Meestal binnen 3 tot 6 maanden. Je mag vaak maar beperkt woningen weigeren." },
      { q: "Wat kost een urgentieaanvraag?", a: "Afhankelijk van de gemeente 0 tot ongeveer 100 euro leges." },
    ],
    listings: { title: "Betaalbaar aanbod zonder wachtlijst", maxPrice: 1250 },
    related: ["/sociale-huur-wachttijd", "/scheiden-geen-woning", "/particulier-huren"],
  },
  {
    path: "/scheiden-geen-woning",
    keyword: "ik wil scheiden maar heb geen woning",
    volume: 1000,
    title: "Scheiden maar geen woning? Je opties in 2026 | Woonaanbod NL",
    description: "Je wilt scheiden maar kunt nergens heen? Eerlijk overzicht: urgentie, birdnesting, tijdelijke woonruimte, inkomenseisen en hoe je snel een huurwoning vindt.",
    h1: "Ik wil scheiden maar heb geen woning",
    intro: "Je bent niet de enige. Elke maand zoeken ruim duizend mensen op deze vraag. Het goede nieuws: er zijn meer opties dan je denkt. Hier staan ze eerlijk op een rij.",
    sections: [
      {
        title: "Optie 1: samen blijven wonen of birdnesting",
        paragraphs: [
          "Veel stellen blijven tijdelijk onder een dak tot er een oplossing is. Bij birdnesting blijven de kinderen in huis en wisselen de ouders elkaar af. Dat geeft rust en tijd om te zoeken.",
        ],
      },
      {
        title: "Optie 2: urgentie aanvragen",
        paragraphs: [
          "In de meeste gemeenten is scheiding alleen geen urgentiegrond meer. Met minderjarige kinderen en zonder opvang maak je soms wel kans. Lees onze uitleg over urgentie aanvragen voordat je leges betaalt.",
        ],
      },
      {
        title: "Optie 3: tijdelijk wonen",
        paragraphs: ["Om de eerste maanden te overbruggen:"],
        bullets: [
          "Gemeubileerd appartement of short stay: direct intrekken.",
          "Vakantiepark of chalet: veel gemeenten staan tijdelijke inschrijving toe na een scheiding.",
          "Antikraak of Leegstandwet: goedkoop, maar onzeker.",
          "Kamer of hospitaverhuur: snel en betaalbaar.",
        ],
      },
      {
        title: "Optie 4: zelf huren in de vrije sector",
        paragraphs: [
          "Met een eigen inkomen is particulier of vrije sector huren vaak de snelste route. Verhuurders vragen meestal 3 tot 4 keer de huur als inkomen. Partneralimentatie telt bij veel verhuurders mee, en een garantsteller kan het verschil maken.",
          "Een studio of appartement met 1 slaapkamer is het makkelijkst te vinden. Zet een woonmelding aan, zodat je nieuw aanbod direct ziet.",
        ],
      },
      {
        title: "Koophuis en hypotheek",
        paragraphs: [
          "Heb je samen een koophuis, dan kun je de partner uitkopen, de hypotheek overnemen of het huis verkopen. Laat je adviseren door een mediator of hypotheekadviseur voordat je een nieuwe woning huurt.",
        ],
      },
    ],
    faq: [
      { q: "Krijg ik voorrang op een huurwoning bij een scheiding?", a: "Meestal niet. Alleen sommige gemeenten geven urgentie, vaak alleen bij minderjarige kinderen en als je geen andere opvang hebt." },
      { q: "Waar kan ik wonen direct na mijn scheiding?", a: "Tijdelijk bij familie, in een gemeubileerd appartement, op een vakantiepark of in een kamer. Daarna in de vrije sector of particuliere huur." },
      { q: "Telt alimentatie mee als inkomen bij huren?", a: "Bij veel verhuurders wel, mits het vastligt in een convenant of rechterlijke uitspraak." },
      { q: "Mag ik in de woning blijven tijdens de scheiding?", a: "Ja, tot er afspraken zijn of de rechter beslist. Bij een huurwoning kan de rechter bepalen wie de huur voortzet." },
    ],
    listings: { title: "Studio's en kleine woningen", maxPrice: 1500 },
    related: ["/urgentie-aanvragen", "/tijdelijke-woonruimte", "/woonmelding"],
  },
  {
    path: "/gemeubileerd-huren",
    keyword: "gemeubileerd huren",
    volume: 720,
    title: "Gemeubileerd huren: direct intrekken | Woonaanbod NL",
    description: "Gemeubileerd een appartement of studio huren? Bekijk actueel aanbod, wat gemeubileerd en gestoffeerd betekent en hoeveel extra je mag betalen.",
    h1: "Gemeubileerd huren",
    intro: "Een gemeubileerde woning is ideaal als je snel moet verhuizen of tijdelijk ergens woont. Je neemt alleen je koffer mee. Hieronder het nieuwste aanbod en de regels.",
    sections: [
      {
        title: "Gemeubileerd, gestoffeerd of kaal?",
        paragraphs: ["De verschillen kort uitgelegd:"],
        bullets: [
          "Kaal: geen vloer, gordijnen of meubels.",
          "Gestoffeerd: vloer, gordijnen en verlichting aanwezig.",
          "Gemeubileerd: ook meubels, vaak keukenspullen en soms beddengoed.",
        ],
      },
      {
        title: "Wat mag de meubilering kosten?",
        paragraphs: [
          "De verhuurder mag een vergoeding vragen voor meubels, maar die moet redelijk zijn. Is de woning gereguleerd, dan kun je de vergoeding laten toetsen door de Huurcommissie.",
        ],
      },
    ],
    faq: [
      { q: "Wat betekent gemeubileerd huren?", a: "Je huurt een woning inclusief meubels en inrichting, zodat je direct kunt intrekken." },
      { q: "Is gemeubileerd huren duurder?", a: "Meestal wel. De meubelvergoeding komt bovenop de kale huur." },
    ],
    listings: { title: "Gemeubileerde woningen", textMatch: "gemeubileerd" },
    related: ["/tijdelijke-woonruimte", "/expat-housing", "/particulier-huren"],
  },
  {
    path: "/antikraak-wonen",
    keyword: "antikraak wonen",
    volume: 2400,
    title: "Antikraak wonen: kosten, rechten en alternatieven | Woonaanbod NL",
    description: "Wat is antikraak wonen, wat kost het en welke rechten heb je? Eerlijke uitleg over voor- en nadelen, plus betaalbare huuralternatieven zonder wachtlijst.",
    h1: "Antikraak wonen: goedkoop maar onzeker",
    intro: "Antikraak lijkt een slimme manier om goedkoop te wonen. Maar je bent geen huurder en kunt binnen een paar weken op straat staan. Lees eerst wat het inhoudt.",
    sections: [
      {
        title: "Hoe werkt antikraak?",
        paragraphs: [
          "Een leegstandbeheerder laat je in een leeg pand wonen om kraken en verloedering te voorkomen. Je betaalt een gebruikersvergoeding, vaak 150 tot 400 euro per maand, en tekent een bruikleenovereenkomst.",
        ],
      },
      {
        title: "Voordelen en nadelen",
        paragraphs: ["Een eerlijke vergelijking:"],
        bullets: [
          "Voordeel: lage kosten en snel beschikbaar.",
          "Nadeel: opzegtermijn van vaak maar 28 dagen.",
          "Nadeel: geen huurbescherming en geen huurtoeslag.",
          "Nadeel: strenge regels over bezoek, huisdieren en afwezigheid.",
        ],
      },
      {
        title: "Alternatief: tijdelijk huren via de Leegstandwet",
        paragraphs: [
          "Met een Leegstandwet-vergunning huur je wel echt, met een minimale opzegtermijn van drie maanden. Ook gewone studio's en kamers in de vrije sector zijn vaak betaalbaarder dan je denkt.",
        ],
      },
    ],
    faq: [
      { q: "Wat kost antikraak wonen?", a: "Meestal tussen de 150 en 400 euro per maand aan gebruikersvergoeding, plus vaste lasten." },
      { q: "Heb ik huurbescherming bij antikraak?", a: "Nee. Je hebt een bruikleenovereenkomst, geen huurcontract. De opzegtermijn is vaak 28 dagen." },
      { q: "Mag ik me inschrijven op een antikraakadres?", a: "Ja, inschrijven bij de gemeente is verplicht als je er woont." },
    ],
    listings: { title: "Betaalbare huurwoningen als alternatief", maxPrice: 1000 },
    related: ["/tijdelijke-woonruimte", "/particulier-huren", "/sociale-huur-wachttijd"],
  },
  {
    path: "/permanent-wonen-recreatiewoning",
    keyword: "permanent wonen recreatiewoning",
    volume: 1600,
    title: "Permanent wonen in een recreatiewoning: mag het? | Woonaanbod NL",
    description: "Mag je permanent wonen in een vakantiewoning of chalet? Regels per gemeente, persoonsgebonden beschikking, risico's en actueel aanbod vakantiehuizen.",
    h1: "Permanent wonen in een recreatiewoning",
    intro: "Een chalet of vakantiewoning is vaak goedkoper en sneller beschikbaar dan een gewone woning. Maar permanent wonen is lang niet overal toegestaan. Zo zit het.",
    sections: [
      {
        title: "Wat zegt de wet?",
        paragraphs: [
          "Het bestemmingsplan bepaalt of je er mag wonen. Op de meeste vakantieparken is permanente bewoning verboden. Gemeenten handhaven wisselend: sommige gedogen, andere leggen dwangsommen op.",
        ],
      },
      {
        title: "Wanneer mag het wel?",
        paragraphs: ["Er zijn drie routes:"],
        bullets: [
          "Persoonsgebonden beschikking: een persoonlijke toestemming, vaak voor oudere bewoners.",
          "Omzetting: sommige gemeenten zetten parken om naar woonbestemming.",
          "Tijdelijke toestemming: bij scheiding of woningnood staan gemeenten soms tijdelijke bewoning toe.",
        ],
      },
      {
        title: "Check dit voordat je huurt of koopt",
        paragraphs: [
          "Vraag bij de gemeente na wat het bestemmingsplan zegt en of je je kunt inschrijven. Zonder inschrijving krijg je problemen met toeslagen, verzekeringen en post.",
        ],
      },
    ],
    faq: [
      { q: "Mag ik permanent op een vakantiepark wonen?", a: "Alleen als het bestemmingsplan dat toestaat of als je een persoonsgebonden beschikking hebt. Vraag het altijd na bij de gemeente." },
      { q: "Kan ik me inschrijven in een recreatiewoning?", a: "De gemeente moet je inschrijven op je werkelijke woonadres, maar dat betekent niet dat wonen daar is toegestaan." },
    ],
    listings: { title: "Vakantiehuizen en chalets", propertyType: "vakantiehuis" },
    related: ["/tijdelijke-woonruimte", "/antikraak-wonen", "/scheiden-geen-woning"],
  },
];

export const guideByPath = (path: string) => GUIDE_PAGES.find((g) => g.path === path);
