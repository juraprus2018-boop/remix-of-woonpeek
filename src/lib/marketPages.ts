import type { CityRow, MarketStats, MarketStatsExtra } from "@/hooks/useMarketStats";
import { euro, num, monthLabel, longDate } from "@/lib/marketFormat";

export interface MarketColumn {
  label: string;
  format: (row: CityRow) => string;
  align?: "right";
}

export interface MarketTable {
  title: string;
  rowLabel: string;
  linkRows: boolean;
  rows: (s?: MarketStats, e?: MarketStatsExtra) => CityRow[];
  columns: MarketColumn[];
  note?: string;
}

export interface MarketKpi {
  label: string;
  value: string;
  sub?: string;
}

export interface MarketTopic {
  slug: string;
  h1: (period: string) => string;
  navLabel: string;
  metaTitle: (period: string) => string;
  metaDescription: (period: string) => string;
  intro: string[];
  keywords: string[];
  kpis: (s?: MarketStats, e?: MarketStatsExtra) => MarketKpi[];
  tables: MarketTable[];
  faq: (s?: MarketStats, e?: MarketStatsExtra) => { q: string; a: string }[];
  method: string[];
}

const top = (rows: CityRow[] | undefined, k = 5) =>
  (rows || []).slice(0, k).map((r) => `${r.city} (${num(r.n)})`).join(", ");

const CITY_COL_PRICE: MarketColumn[] = [
  { label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
  { label: "Mediaan", format: (r) => euro(r.median_price), align: "right" },
  { label: "Woningen", format: (r) => num(r.n), align: "right" },
];

const METHOD_BASE = [
  "Alle cijfers op deze pagina worden op het moment van opvragen berekend uit het volledige actieve woningaanbod op Woonaanbod NL. We rekenen met de gevraagde huur- of vraagprijs zoals de aanbieder die heeft opgegeven.",
  "Om invoerfouten en uitschieters te filteren nemen we huurprijzen tussen € 200 en € 10.000 per maand mee en koopprijzen tussen € 50.000 en € 5.000.000. Voor prijs per m² gebruiken we alleen woningen met een woonoppervlak tussen 10 en 500 m².",
  "Dit is een momentopname van het aanbod, geen transactieprijsindex: het gaat om wat er nu wordt gevraagd, niet om wat er uiteindelijk is betaald. Plaatsen met te weinig woningen voor een betrouwbaar gemiddelde laten we weg.",
  "Overnemen van deze cijfers mag, met bronvermelding en een link naar deze pagina.",
];

export const MARKET_TOPICS: MarketTopic[] = [
  {
    slug: "huurprijzen-nederland",
    navLabel: "Huurprijzen Nederland",
    h1: (p) => `Huurprijzen Nederland, ${p}`,
    metaTitle: (p) => `Huurprijzen Nederland ${p}: gemiddelde huur & prijs per m²`,
    metaDescription: (p) =>
      `Gemiddelde huurprijs in Nederland (${p}) uit het live aanbod van Woonaanbod NL: maandhuur, mediaan, huur per m² en de duurste en goedkoopste steden.`,
    keywords: ["huurprijzen nederland", "gemiddelde huurprijs", "huurprijs per m2"],
    intro: [
      "Wat kost huren in Nederland op dit moment? Deze pagina laat de landelijke huurprijzen zien zoals ze vandaag in het aanbod staan: de gemiddelde maandhuur, de mediaan (het middelste bedrag, minder vervuild door dure uitschieters) en de huurprijs per vierkante meter.",
      "Prijs per m² is de eerlijkste vergelijking tussen steden. Een studio van 30 m² voor € 900 is per meter veel duurder dan een appartement van 80 m² voor € 1.600.",
    ],
    kpis: (s) => {
      const n = s?.national;
      return [
        { label: "Gemiddelde maandhuur", value: euro(n?.rent_avg), sub: `mediaan ${euro(n?.rent_median)}` },
        { label: "Huurprijs per m²", value: euro(n?.rent_per_m2, 2), sub: "per maand, heel Nederland" },
        { label: "Actieve huurwoningen", value: num(n?.rent_total), sub: `${num(n?.new_7d)} nieuw deze week` },
        { label: "Onder € 1.500 per maand", value: num(n?.rent_under_1500), sub: "beschikbaar in het huidige aanbod" },
      ];
    },
    tables: [
      {
        title: "Duurste steden per m² (huur)",
        rowLabel: "Plaats",
        linkRows: true,
        rows: (s) => s?.rent_per_m2_cities || [],
        columns: [
          { label: "Per m²", format: (r) => euro(r.per_m2, 2), align: "right" },
          { label: "Gem. huur", format: (r) => euro(r.avg_price), align: "right" },
          { label: "Gem. m²", format: (r) => num(r.avg_area), align: "right" },
          { label: "Woningen", format: (r) => num(r.n), align: "right" },
        ],
      },
    ],
    faq: (s) => {
      const n = s?.national;
      if (!n) return [];
      return [
        {
          q: "Wat is de gemiddelde huurprijs in Nederland?",
          a: `De gemiddelde gevraagde maandhuur in het actieve aanbod van Woonaanbod NL is ${euro(n.rent_avg)}, met een mediaan van ${euro(n.rent_median)}. Gemeten over ${num(n.rent_total)} huurwoningen.`,
        },
        {
          q: "Wat is de gemiddelde huurprijs per m² in Nederland?",
          a: `Gemiddeld ${euro(n.rent_per_m2, 2)} per m² per maand, gerekend over huurwoningen met een bekend woonoppervlak tussen 10 en 500 m².`,
        },
      ];
    },
    method: METHOD_BASE,
  },
  {
    slug: "huurprijzen-per-gemeente",
    navLabel: "Huurprijzen per gemeente",
    h1: (p) => `Huurprijzen per gemeente, ${p}`,
    metaTitle: (p) => `Huurprijzen per gemeente ${p} | gemiddelde huur per stad`,
    metaDescription: (p) =>
      `Gemiddelde en mediane huurprijs per gemeente (${p}), plus de laagste huur die nu beschikbaar is. Live berekend uit het huuraanbod van Woonaanbod NL.`,
    keywords: ["huurprijzen per gemeente", "gemiddelde huur per stad"],
    intro: [
      "Per gemeente de gemiddelde en mediane maandhuur in het huidige aanbod, plus de laagste huurprijs die er op dit moment beschikbaar is. Zo zie je niet alleen wat gemiddeld gevraagd wordt, maar ook of er nog iets goedkoops tussen zit.",
      "Wijkt het gemiddelde sterk af van de mediaan? Dan trekt een klein aantal zeer dure woningen het beeld omhoog.",
    ],
    kpis: (s, e) => [
      { label: "Gemeenten met huuraanbod", value: num((e?.rent_count_cities || []).length), sub: "in deze ranglijst" },
      { label: "Gemiddelde maandhuur (NL)", value: euro(s?.national?.rent_avg), sub: `mediaan ${euro(s?.national?.rent_median)}` },
      { label: "Actieve huurwoningen", value: num(s?.national?.rent_total), sub: "basis voor deze cijfers" },
    ],
    tables: [
      {
        title: "Huurprijzen per gemeente",
        rowLabel: "Gemeente",
        linkRows: true,
        rows: (_s, e) => e?.rent_count_cities || [],
        columns: [
          { label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
          { label: "Mediaan", format: (r) => euro(r.median_price), align: "right" },
          { label: "Vanaf", format: (r) => euro(r.min_price), align: "right" },
          { label: "Aanbod", format: (r) => num(r.n), align: "right" },
        ],
      },
    ],
    faq: (_s, e) => {
      const rows = e?.rent_count_cities || [];
      if (!rows.length) return [];
      const cheapest = [...rows].sort((a, b) => (a.avg_price || 0) - (b.avg_price || 0))[0];
      const priciest = [...rows].sort((a, b) => (b.avg_price || 0) - (a.avg_price || 0))[0];
      return [
        {
          q: "In welke gemeente is de gemiddelde huur het hoogst?",
          a: `Van de gemeenten met voldoende aanbod is ${priciest.city} de duurste: gemiddeld ${euro(priciest.avg_price)} per maand over ${num(priciest.n)} huurwoningen.`,
        },
        {
          q: "In welke gemeente is de gemiddelde huur het laagst?",
          a: `${cheapest.city} heeft de laagste gemiddelde huur in deze lijst: ${euro(cheapest.avg_price)} per maand, vanaf ${euro(cheapest.min_price)}.`,
        },
      ];
    },
    method: METHOD_BASE,
  },
  {
    slug: "koopprijzen-per-gemeente",
    navLabel: "Koopprijzen per gemeente",
    h1: (p) => `Koopprijzen per gemeente, ${p}`,
    metaTitle: (p) => `Koopprijzen per gemeente ${p} | gemiddelde vraagprijs`,
    metaDescription: (p) =>
      `Gemiddelde en mediane vraagprijs van koopwoningen per gemeente (${p}), inclusief laagste vraagprijs. Eigen data van Woonaanbod NL.`,
    keywords: ["koopprijzen per gemeente", "gemiddelde vraagprijs woning"],
    intro: [
      "De gemiddelde en mediane vraagprijs van koopwoningen per gemeente in het actuele aanbod. De mediaan is minder gevoelig voor een enkele villa of penthouse en geeft daarom een realistischer beeld van de middenmarkt.",
      "Let op: dit zijn vraagprijzen, geen transactieprijzen. Wat er uiteindelijk betaald wordt kan hoger of lager uitvallen.",
    ],
    kpis: (s, e) => [
      { label: "Gemiddelde vraagprijs (NL)", value: euro(s?.national?.buy_avg), sub: `mediaan ${euro(s?.national?.buy_median)}` },
      { label: "Vraagprijs per m²", value: euro(s?.national?.buy_per_m2), sub: "gemiddeld over Nederland" },
      { label: "Koopwoningen in aanbod", value: num(s?.national?.buy_total), sub: `${num((e?.buy_count_cities || []).length)} gemeenten` },
    ],
    tables: [
      {
        title: "Koopprijzen per gemeente",
        rowLabel: "Gemeente",
        linkRows: true,
        rows: (_s, e) => e?.buy_count_cities || [],
        columns: [
          { label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
          { label: "Mediaan", format: (r) => euro(r.median_price), align: "right" },
          { label: "Vanaf", format: (r) => euro(r.min_price), align: "right" },
          { label: "Aanbod", format: (r) => num(r.n), align: "right" },
        ],
      },
    ],
    faq: (s, e) => {
      const rows = e?.buy_count_cities || [];
      if (!rows.length) return [];
      return [
        {
          q: "Wat is de gemiddelde vraagprijs van een koopwoning in Nederland?",
          a: `In het huidige aanbod van Woonaanbod NL is de gemiddelde vraagprijs ${euro(s?.national?.buy_avg)}, met een mediaan van ${euro(s?.national?.buy_median)}.`,
        },
        {
          q: "Welke gemeenten hebben het grootste koopaanbod?",
          a: `${top(rows, 5)} staan bovenaan qua aantal koopwoningen in het huidige aanbod.`,
        },
      ];
    },
    method: METHOD_BASE,
  },
  {
    slug: "nieuw-woningaanbod-per-week",
    navLabel: "Nieuw woningaanbod per week",
    h1: (p) => `Nieuw woningaanbod per week, ${p}`,
    metaTitle: (p) => `Nieuw woningaanbod per week ${p} | huur en koop`,
    metaDescription: (p) =>
      `Hoeveel woningen kwamen er per week nieuw op de markt (${p})? Weekcijfers voor huur en koop plus de gemeenten met het meeste nieuwe aanbod.`,
    keywords: ["nieuw woningaanbod", "nieuwe huurwoningen per week"],
    intro: [
      "Doorstroom zegt vaak meer dan voorraad. Deze pagina toont hoeveel woningen er per week nieuw op Woonaanbod NL verschijnen, uitgesplitst naar huur en koop, plus in welke gemeenten die nieuwe woningen terechtkomen.",
      "Reageer je op een huurwoning? Dan is snelheid belangrijker dan volume: hoe hoger het aantal nieuwe woningen per week, hoe groter je kans.",
    ],
    kpis: (s) => [
      { label: "Nieuw deze week", value: num(s?.national?.new_7d), sub: "laatste 7 dagen" },
      { label: "Nieuw afgelopen 30 dagen", value: num(s?.national?.new_30d), sub: "huur en koop samen" },
      { label: "Totaal actief aanbod", value: num(s?.national?.total), sub: `${num(s?.national?.rent_total)} huur · ${num(s?.national?.buy_total)} koop` },
    ],
    tables: [
      {
        title: "Nieuw aanbod per week (laatste 12 weken)",
        rowLabel: "Week vanaf",
        linkRows: false,
        rows: (_s, e) => (e?.new_per_week || []).map((r) => ({ ...r, city: longDate(r.week_start || new Date()) })),
        columns: [
          { label: "Totaal", format: (r) => num(r.n), align: "right" },
          { label: "Huur", format: (r) => num(r.rent_n), align: "right" },
          { label: "Koop", format: (r) => num(r.buy_n), align: "right" },
          { label: "Gem. huur", format: (r) => euro(r.avg_rent), align: "right" },
        ],
        note: "Weken worden geteld vanaf maandag. De lopende week is nog niet volledig.",
      },
      {
        title: "Gemeenten met het meeste nieuwe aanbod (7 dagen)",
        rowLabel: "Gemeente",
        linkRows: true,
        rows: (s) => s?.new_this_week_cities || [],
        columns: [
          { label: "Nieuw", format: (r) => num(r.n), align: "right" },
          { label: "Gem. prijs", format: (r) => euro(r.avg_price), align: "right" },
        ],
      },
    ],
    faq: (s) => {
      if (!s?.national) return [];
      return [
        {
          q: "Hoeveel woningen komen er per week nieuw op de markt?",
          a: `De afgelopen 7 dagen kwamen er ${num(s.national.new_7d)} woningen nieuw in het aanbod van Woonaanbod NL, en ${num(s.national.new_30d)} in de afgelopen 30 dagen.`,
        },
        {
          q: "Welke gemeenten hebben deze week het meeste nieuwe aanbod?",
          a: `${top(s.new_this_week_cities, 5)} hebben deze week het meeste nieuwe aanbod.`,
        },
      ];
    },
    method: METHOD_BASE,
  },
  {
    slug: "meeste-huurwoningen-per-stad",
    navLabel: "Meeste huurwoningen per stad",
    h1: (p) => `Steden met de meeste huurwoningen, ${p}`,
    metaTitle: (p) => `Meeste huurwoningen per stad ${p} | ranglijst aanbod`,
    metaDescription: (p) =>
      `Welke steden hebben het grootste huuraanbod (${p})? Ranglijst per stad met aantal huurwoningen, gemiddelde huur en laagste huurprijs.`,
    keywords: ["meeste huurwoningen", "huuraanbod per stad"],
    intro: [
      "Waar staan op dit moment de meeste huurwoningen? Deze ranglijst zet steden op volgorde van het aantal actieve huurwoningen, met de gemiddelde huur en de laagste beschikbare huurprijs erbij.",
      "Veel aanbod betekent meestal meer kans, maar ook meer concurrentie in de grote studentensteden.",
    ],
    kpis: (s, e) => {
      const rows = e?.rent_count_cities || [];
      return [
        { label: "Stad met grootste aanbod", value: rows[0]?.city || "—", sub: rows[0] ? `${num(rows[0].n)} huurwoningen` : undefined },
        { label: "Actieve huurwoningen (NL)", value: num(s?.national?.rent_total), sub: `verdeeld over ${num(rows.length)} plaatsen in deze lijst` },
        { label: "Nieuw deze week", value: num(s?.national?.new_7d), sub: "huur en koop samen" },
      ];
    },
    tables: [
      {
        title: "Huuraanbod per stad",
        rowLabel: "Stad",
        linkRows: true,
        rows: (_s, e) => e?.rent_count_cities || [],
        columns: [
          { label: "Huurwoningen", format: (r) => num(r.n), align: "right" },
          { label: "Gem. huur", format: (r) => euro(r.avg_price), align: "right" },
          { label: "Vanaf", format: (r) => euro(r.min_price), align: "right" },
        ],
      },
    ],
    faq: (_s, e) => {
      const rows = e?.rent_count_cities || [];
      if (!rows.length) return [];
      return [
        {
          q: "Welke stad heeft de meeste huurwoningen?",
          a: `${rows[0].city} staat bovenaan met ${num(rows[0].n)} actieve huurwoningen, gemiddeld ${euro(rows[0].avg_price)} per maand.`,
        },
        {
          q: "Welke steden hebben het grootste huuraanbod?",
          a: `${top(rows, 8)} hebben op dit moment het grootste huuraanbod op Woonaanbod NL.`,
        },
      ];
    },
    method: METHOD_BASE,
  },
  {
    slug: "betaalbaarste-steden-voor-huurders",
    navLabel: "Betaalbaarste steden voor huurders",
    h1: (p) => `Betaalbaarste steden voor huurders, ${p}`,
    metaTitle: (p) => `Betaalbaarste steden om te huren ${p} | goedkoopste huur`,
    metaDescription: (p) =>
      `De goedkoopste steden om te huren (${p}): laagste gemiddelde maandhuur, huur per m² en het aantal beschikbare woningen per stad.`,
    keywords: ["goedkoopste steden huren", "betaalbaar huren nederland"],
    intro: [
      "Deze ranglijst zet steden op volgorde van de laagste gemiddelde maandhuur in het huidige aanbod. Alleen steden met minimaal 5 actieve huurwoningen doen mee, zodat één goedkope kamer de lijst niet verstoort.",
      "Kijk ook naar de kolom per m²: een lage maandhuur kan simpelweg betekenen dat het aanbod uit kleine studio's en kamers bestaat.",
    ],
    kpis: (s, e) => {
      const rows = e?.cheapest_rent_cities || [];
      return [
        { label: "Goedkoopste stad", value: rows[0]?.city || "—", sub: rows[0] ? `gemiddeld ${euro(rows[0].avg_price)} per maand` : undefined },
        { label: "Gemiddelde huur (NL)", value: euro(s?.national?.rent_avg), sub: "landelijk gemiddelde als vergelijking" },
        { label: "Onder € 1.500", value: num(s?.national?.rent_under_1500), sub: "huurwoningen in heel Nederland" },
      ];
    },
    tables: [
      {
        title: "Laagste gemiddelde huur per stad",
        rowLabel: "Stad",
        linkRows: true,
        rows: (_s, e) => e?.cheapest_rent_cities || [],
        columns: [
          { label: "Gem. huur", format: (r) => euro(r.avg_price), align: "right" },
          { label: "Vanaf", format: (r) => euro(r.min_price), align: "right" },
          { label: "Per m²", format: (r) => euro(r.per_m2, 2), align: "right" },
          { label: "Gem. m²", format: (r) => num(r.avg_area), align: "right" },
          { label: "Aanbod", format: (r) => num(r.n), align: "right" },
        ],
      },
    ],
    faq: (_s, e) => {
      const rows = e?.cheapest_rent_cities || [];
      if (!rows.length) return [];
      return [
        {
          q: "Wat is de goedkoopste stad om te huren in Nederland?",
          a: `In het huidige aanbod is ${rows[0].city} het goedkoopst: gemiddeld ${euro(rows[0].avg_price)} per maand over ${num(rows[0].n)} huurwoningen, vanaf ${euro(rows[0].min_price)}.`,
        },
        {
          q: "Welke steden zijn betaalbaar voor huurders?",
          a: `${top(rows, 8)} hebben de laagste gemiddelde huur van de steden met voldoende aanbod.`,
        },
      ];
    },
    method: [
      ...METHOD_BASE.slice(0, 2),
      "Voor deze ranglijst nemen we alleen steden mee met minimaal 5 actieve huurwoningen. De sortering gebeurt op gemiddelde maandhuur, niet op prijs per m².",
      METHOD_BASE[3],
    ],
  },
  {
    slug: "huurwoningen-onder-1500-euro",
    navLabel: "Woningen onder € 1.500",
    h1: (p) => `Huurwoningen onder € 1.500 per maand, ${p}`,
    metaTitle: (p) => `Huurwoningen onder € 1.500 ${p} | aanbod per stad`,
    metaDescription: (p) =>
      `Hoeveel huurwoningen onder € 1.500 per maand zijn er nu beschikbaar (${p})? Aantallen per stad, laagste huurprijs en directe links naar het aanbod.`,
    keywords: ["huurwoning onder 1500", "goedkope huurwoningen"],
    intro: [
      "Voor veel huishoudens is € 1.500 per maand de bovengrens. Deze pagina laat zien hoeveel huurwoningen daar landelijk onder blijven en in welke steden je ze vindt.",
      "Per stad zie je het aantal woningen, de laagste huurprijs en het gemiddelde binnen dit segment.",
    ],
    kpis: (s, e) => [
      { label: "Huurwoningen onder € 1.500", value: num(s?.national?.rent_under_1500), sub: `van ${num(s?.national?.rent_total)} huurwoningen totaal` },
      {
        label: "Aandeel van het huuraanbod",
        value:
          s?.national?.rent_total
            ? `${Math.round((s.national.rent_under_1500 / s.national.rent_total) * 100)}%`
            : "—",
        sub: "valt binnen dit budget",
      },
      { label: "Steden met aanbod", value: num((e ? s?.rent_under_1500_cities?.length : s?.rent_under_1500_cities?.length) || 0), sub: "in deze ranglijst" },
    ],
    tables: [
      {
        title: "Huurwoningen tot € 1.500 per maand",
        rowLabel: "Stad",
        linkRows: true,
        rows: (s) => s?.rent_under_1500_cities || [],
        columns: [
          { label: "Aanbod", format: (r) => num(r.n), align: "right" },
          { label: "Vanaf", format: (r) => euro(r.min_price), align: "right" },
          { label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
        ],
      },
    ],
    faq: (s) => {
      if (!s?.national) return [];
      return [
        {
          q: "Hoeveel huurwoningen onder € 1.500 zijn er beschikbaar?",
          a: `Op dit moment staan er ${num(s.national.rent_under_1500)} huurwoningen met een maandhuur tot € 1.500 in het aanbod van Woonaanbod NL.`,
        },
        {
          q: "Waar vind je de meeste huurwoningen onder € 1.500?",
          a: `${top(s.rent_under_1500_cities, 5)} hebben het grootste aanbod binnen dit budget.`,
        },
      ];
    },
    method: METHOD_BASE,
  },
  {
    slug: "koopwoningen-onder-400000-euro",
    navLabel: "Woningen onder € 400.000",
    h1: (p) => `Koopwoningen onder € 400.000, ${p}`,
    metaTitle: (p) => `Koopwoningen onder € 400.000 ${p} | aanbod per gemeente`,
    metaDescription: (p) =>
      `Hoeveel koopwoningen onder € 400.000 staan er te koop (${p})? Aantallen per gemeente, laagste vraagprijs en gemiddelde prijs binnen dit budget.`,
    keywords: ["koopwoning onder 400.000", "starterswoning kopen"],
    intro: [
      "Het budget van veel starters ligt rond de vier ton. Deze pagina laat zien hoeveel koopwoningen binnen dat budget vallen en in welke gemeenten ze staan.",
      "Naast het aantal woningen zie je de laagste vraagprijs en het gemiddelde binnen dit segment per gemeente.",
    ],
    kpis: (s) => [
      { label: "Koopwoningen onder € 400.000", value: num(s?.national?.buy_under_400k), sub: `van ${num(s?.national?.buy_total)} koopwoningen totaal` },
      {
        label: "Aandeel van het koopaanbod",
        value:
          s?.national?.buy_total
            ? `${Math.round((s.national.buy_under_400k / s.national.buy_total) * 100)}%`
            : "—",
        sub: "past binnen dit budget",
      },
      { label: "Gemiddelde vraagprijs (NL)", value: euro(s?.national?.buy_avg), sub: `mediaan ${euro(s?.national?.buy_median)}` },
    ],
    tables: [
      {
        title: "Koopwoningen tot € 400.000",
        rowLabel: "Gemeente",
        linkRows: true,
        rows: (s) => s?.buy_under_400k_cities || [],
        columns: [
          { label: "Aanbod", format: (r) => num(r.n), align: "right" },
          { label: "Vanaf", format: (r) => euro(r.min_price), align: "right" },
          { label: "Gemiddeld", format: (r) => euro(r.avg_price), align: "right" },
        ],
      },
    ],
    faq: (s) => {
      if (!s?.national) return [];
      return [
        {
          q: "Hoeveel koopwoningen onder € 400.000 staan er momenteel te koop?",
          a: `Er staan nu ${num(s.national.buy_under_400k)} koopwoningen onder € 400.000 in het aanbod van Woonaanbod NL, verdeeld over ${num((s.buy_under_400k_cities || []).length)} gemeenten.`,
        },
        {
          q: "Waar vind je de meeste koopwoningen onder € 400.000?",
          a: `${top(s.buy_under_400k_cities, 5)} hebben het grootste aanbod binnen dit budget.`,
        },
      ];
    },
    method: METHOD_BASE,
  },
  {
    slug: "nieuwbouw-per-provincie",
    navLabel: "Nieuwbouw per provincie",
    h1: (p) => `Nieuwbouw per provincie, ${p}`,
    metaTitle: (p) => `Nieuwbouw per provincie ${p} | recent gebouwde woningen`,
    metaDescription: (p) =>
      `Nieuwbouw en recent opgeleverde woningen per provincie (${p}), plus het totale woningaanbod per provincie. Eigen data van Woonaanbod NL.`,
    keywords: ["nieuwbouw per provincie", "nieuwbouwwoningen aanbod"],
    intro: [
      "Nieuwbouw betekent hier: woningen in het aanbod met een bouwjaar van de afgelopen vijf jaar. Dat is een praktische maatstaf voor hoeveel recent opgeleverde woningen daadwerkelijk op de markt komen.",
      "Daaronder staat het totale aanbod per provincie, zodat je nieuwbouw kunt afzetten tegen de omvang van de markt.",
    ],
    kpis: (_s, e) => {
      const nb = e?.newbuild_provinces || [];
      const total = nb.reduce((sum, r) => sum + Number(r.n || 0), 0);
      return [
        { label: "Recente nieuwbouw in aanbod", value: num(total), sub: "bouwjaar laatste 5 jaar" },
        { label: "Provincie met meeste nieuwbouw", value: nb[0]?.city || "—", sub: nb[0] ? `${num(nb[0].n)} woningen` : "nog geen nieuwbouw in het aanbod" },
        { label: "Provincies met aanbod", value: num((e?.provinces_all || []).length), sub: "huur en koop samen" },
      ];
    },
    tables: [
      {
        title: "Nieuwbouw (bouwjaar laatste 5 jaar) per provincie",
        rowLabel: "Provincie",
        linkRows: false,
        rows: (_s, e) => e?.newbuild_provinces || [],
        columns: [
          { label: "Nieuwbouw", format: (r) => num(r.n), align: "right" },
          { label: "Huur", format: (r) => num(r.rent_n), align: "right" },
          { label: "Koop", format: (r) => num(r.buy_n), align: "right" },
          { label: "Gem. prijs", format: (r) => euro(r.avg_price), align: "right" },
        ],
        note: "Alleen woningen met een ingevuld bouwjaar kunnen worden meegeteld. Ontbreekt het bouwjaar bij een aanbieder, dan valt de woning buiten deze telling.",
      },
      {
        title: "Totaal woningaanbod per provincie",
        rowLabel: "Provincie",
        linkRows: false,
        rows: (_s, e) => e?.provinces_all || [],
        columns: [
          { label: "Aanbod", format: (r) => num(r.n), align: "right" },
          { label: "Gem. prijs", format: (r) => euro(r.avg_price), align: "right" },
        ],
      },
    ],
    faq: (_s, e) => {
      const nb = e?.newbuild_provinces || [];
      const all = e?.provinces_all || [];
      const out = [];
      if (nb.length) {
        out.push({
          q: "In welke provincie staat de meeste nieuwbouw in het aanbod?",
          a: `${nb[0].city} met ${num(nb[0].n)} recent gebouwde woningen (bouwjaar laatste 5 jaar) in het huidige aanbod van Woonaanbod NL.`,
        });
      }
      if (all.length) {
        out.push({
          q: "Welke provincie heeft het grootste woningaanbod?",
          a: `${all[0].city} heeft met ${num(all[0].n)} woningen het grootste actieve aanbod, gevolgd door ${top(all.slice(1), 3)}.`,
        });
      }
      return out;
    },
    method: [
      "Provincie wordt bepaald aan de hand van de postcode van de woning (eerste twee cijfers). Bij gemeenten op een provinciegrens kan die indeling in een enkel geval afwijken.",
      "Nieuwbouw = woningen in het aanbod met een bouwjaar gelijk aan of later dan het huidige jaar min vijf. Woningen zonder ingevuld bouwjaar blijven buiten de telling.",
      ...METHOD_BASE.slice(2),
    ],
  },
];

export const getMarketTopic = (slug?: string) => MARKET_TOPICS.find((t) => t.slug === slug);

export const marketTopicPath = (slug: string) => `/woningmarkt/${slug}`;

/** Voor de hub en de sitemap. */
export const MARKET_TOPIC_SLUGS = MARKET_TOPICS.map((t) => t.slug);

export const currentPeriodLabel = (generatedAt?: string) => monthLabel(generatedAt);
