/**
 * 50 long-tail SEO landingspagina's, verspreid over de top NL steden.
 *
 * Elke entry voedt één route: /gids/:slug  (zie src/pages/LongtailLanding.tsx).
 * Pagina's combineren rijke unieke content (h1 + intro + 2-3 secties + FAQ)
 * met een live gefilterde aanbod-grid, zodat ze waarde leveren voor de
 * bezoeker én rich snippets oogsten (FAQPage + ItemList JSON-LD).
 *
 * Houd content uniek per entry: vermijd copy-paste tussen steden.
 */

import type { Database } from "@/integrations/supabase/types";

type PropertyType = Database["public"]["Enums"]["property_type"];
type ListingType = Database["public"]["Enums"]["listing_type"];

export interface LongtailFAQ {
  q: string;
  a: string;
}

export interface LongtailSection {
  h2: string;
  body: string;
}

export interface LongtailPage {
  slug: string;
  city: string;          // weergavenaam, bv. "Amsterdam"
  citySlug: string;      // bv. "amsterdam"
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: LongtailSection[];
  faq: LongtailFAQ[];
  filters: {
    propertyType?: PropertyType;
    listingType?: ListingType;
    maxPrice?: number;
    minPrice?: number;
    minBedrooms?: number;
    textMatch?: string;
  };
  /** Slugs van gerelateerde long-tail pagina's (interne linking). */
  related?: string[];
}

const c = (citySlug: string, city: string) => ({ citySlug, city });

export const LONGTAIL_PAGES: LongtailPage[] = [
  // ── Amsterdam (5)
  {
    slug: "huurwoning-amsterdam-met-balkon",
    ...c("amsterdam", "Amsterdam"),
    h1: "Huurwoning in Amsterdam met balkon",
    metaTitle: "Huurwoning Amsterdam met balkon | actueel aanbod",
    metaDescription: "Vind huurwoningen in Amsterdam met een eigen balkon. Filter op buurt, prijs en oppervlakte. Dagelijks vers aanbod van particulieren en makelaars.",
    intro: "Een eigen balkon in Amsterdam is goud waard. We bundelen hier huurwoningen waarbij expliciet een balkon, dakterras of loggia hoort, zodat je niet door honderden advertenties hoeft te ploegen.",
    sections: [
      { h2: "Waar vind je balkons in Amsterdam?", body: "De meeste huurwoningen met balkon zitten in Oost (Watergraafsmeer, Indische Buurt), West (Bos en Lommer, Westerpark) en Nieuw-West. In de grachtengordel is een balkon zeldzaam, maar dakterrassen komen wel voor in dakappartementen." },
      { h2: "Wat betaal je gemiddeld?", body: "Een tweekamerappartement met balkon ligt in 2026 tussen €1.650 en €2.400 per maand, afhankelijk van buurt en oppervlakte. Buiten de ring rond Amstelveen of Diemen vind je het vanaf €1.350." },
      { h2: "Snel reageren is alles", body: "Populaire balkonwoningen in Amsterdam worden binnen 48 uur verhuurd. Zet een Woonradar aan en krijg per e-mail of WhatsApp meteen bericht wanneer nieuw aanbod live komt." },
    ],
    faq: [
      { q: "Hoeveel huurwoningen met balkon zijn er gemiddeld in Amsterdam?", a: "Op een doorsnee weekdag staan er 60 tot 120 verhuuradvertenties met balkon online. In het weekend daalt dat tijdelijk." },
      { q: "Is een dakterras hetzelfde als een balkon?", a: "Juridisch niet: een dakterras is doorgaans privé buitenruimte met een grotere oppervlakte. Voor SEO en filtering behandelen wij ze als gelijkwaardig." },
      { q: "Kan ik filteren op balkon-oriëntatie?", a: "Nog niet automatisch, maar in de woningomschrijving zie je vaak 'zuid' of 'westgericht'. Filter eerst op buurt, daarna lees je snel door de teksten." },
    ],
    filters: { listingType: "huur", textMatch: "balkon" },
    related: ["huurwoning-amsterdam-met-tuin", "gemeubileerd-huren-amsterdam", "starterswoning-amsterdam"],
  },
  {
    slug: "huurwoning-amsterdam-met-tuin",
    ...c("amsterdam", "Amsterdam"),
    h1: "Huurwoning in Amsterdam met tuin",
    metaTitle: "Huurwoning Amsterdam met tuin | benedenwoningen & eengezinshuizen",
    metaDescription: "Huurwoning met eigen tuin in Amsterdam: benedenhuizen in Oost, West en Noord. Bekijk dagelijks bijgewerkt aanbod inclusief grootte en prijs.",
    intro: "Een tuin in Amsterdam huren betekent meestal: een benedenhuis in Oost, West of Noord. We verzamelen het complete aanbod waarbij een tuin, plaats of patio bij de woning hoort.",
    sections: [
      { h2: "Buurten met de meeste tuinwoningen", body: "Watergraafsmeer, Betondorp, Tuindorp Nieuwendam en de Spaarndammerbuurt staan bekend om hun benedenhuizen met tuin. Nieuw-West heeft de grootste tuinen voor het geld." },
      { h2: "Huurprijzen 2026", body: "Reken op €2.100 tot €3.200 per maand voor een driekamerwoning met tuin binnen de ring, en €1.700 tot €2.400 in Noord of Nieuw-West." },
      { h2: "Tips bij bezichtiging", body: "Vraag altijd of de tuin op het zuiden ligt, of er een schuur is, en wie verantwoordelijk is voor onderhoud van bomen en schutting. Dat staat zelden in de advertentie." },
    ],
    faq: [
      { q: "Mag ik in een huurtuin een schuurtje plaatsen?", a: "Alleen met schriftelijke toestemming van de verhuurder en als het binnen de welstandsregels van de gemeente Amsterdam past." },
      { q: "Is een gemeenschappelijke binnentuin ook 'tuin'?", a: "Nee, in onze filtering rekenen we alleen privé buitenruimte als tuin. Gedeelde tuinen vermelden we apart in de omschrijving." },
      { q: "Hoe vaak komt er een tuinwoning beschikbaar?", a: "Gemiddeld 8 tot 15 nieuwe aanbiedingen per week. Een Woonradar voorkomt dat je iets mist." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-amsterdam-met-balkon", "eengezinswoning-amstelveen-huren"],
  },
  {
    slug: "gemeubileerd-huren-amsterdam",
    ...c("amsterdam", "Amsterdam"),
    h1: "Gemeubileerd huren in Amsterdam",
    metaTitle: "Gemeubileerde huurwoning Amsterdam | expat & kort verblijf",
    metaDescription: "Gemeubileerde huurwoningen in Amsterdam, ideaal voor expats en kort verblijf. Direct intrekken, all-in prijzen en flexibele looptijden.",
    intro: "Gemeubileerd huren in Amsterdam is populair bij expats, internationale studenten en mensen tussen twee koopwoningen in. Je trekt direct in en betaalt vaak all-in voor gas, water en internet.",
    sections: [
      { h2: "Wat valt onder 'gemeubileerd'?", body: "Volledig gemeubileerd betekent: bedden, bank, eettafel, witgoed én kookgerei. 'Gestoffeerd' is slechts vloer + gordijnen. Lees de advertentie altijd kritisch." },
      { h2: "Typische huurperiodes", body: "Veel verhuurders bieden contracten van 6 of 12 maanden. Verblijven onder 6 maanden vallen onder short-stay en vereisen een vergunning van de gemeente." },
      { h2: "Wat kost het?", body: "Gemeubileerd ligt structureel 15-25% boven kale huur. Een tweekamerappartement gemeubileerd zit doorgaans tussen €2.300 en €3.400 all-in." },
    ],
    faq: [
      { q: "Mag de verhuurder een vergoeding vragen voor het meubilair?", a: "Ja, maar deze 'roerende zaken' moeten gespecificeerd op de huurovereenkomst staan, anders telt het niet mee in de huurtoets." },
      { q: "Geldt huurbescherming ook bij gemeubileerde verhuur?", a: "Vanaf 1 juli 2024 is huurbescherming de standaard. Tijdelijke contracten zijn beperkt tot specifieke uitzonderingen." },
      { q: "Kan ik gemeubileerd huren met huurtoeslag?", a: "Bij vrije sector zelden, omdat de huurprijs boven de toeslaggrens ligt. Bij sociale huur kan het, mits de kale huur onder €879,66 (2026) blijft." },
    ],
    filters: { listingType: "huur", textMatch: "gemeubileerd" },
    related: ["expat-rental-amsterdam", "kort-verblijf-amsterdam"],
  },
  {
    slug: "expat-rental-amsterdam",
    ...c("amsterdam", "Amsterdam"),
    h1: "Expat rentals in Amsterdam",
    metaTitle: "Expat rentals Amsterdam | English-friendly apartments",
    metaDescription: "Curated expat rentals in Amsterdam: English-speaking landlords, furnished apartments, 12-month leases and prime neighbourhoods.",
    intro: "Looking for an expat-friendly rental in Amsterdam? We've filtered furnished and unfurnished apartments where landlords accept international tenants, BSN-pending applications and English-only correspondence.",
    sections: [
      { h2: "Best neighbourhoods for expats", body: "De Pijp, Oud-Zuid, Oud-West and Houthavens dominate the expat market thanks to walkable streets, international schools and a 15-minute commute to the Zuidas." },
      { h2: "Documents you'll typically need", body: "Passport, employment contract, three recent payslips, and either a BSN or proof you've registered for one. A Dutch landlord will often ask for an income equal to 3-4× the monthly rent." },
      { h2: "Realistic budgets", body: "Studios start around €1.500/month, one-bedrooms from €1.900 and family-sized three-bedrooms easily pass €3.500. Furnished adds 15-25%." },
    ],
    faq: [
      { q: "Can I rent without a BSN number?", a: "Yes, many private landlords accept a copy of your work contract and a 'BSN pending' confirmation from the gemeente." },
      { q: "Are utilities included?", a: "Often: gas, water, electricity and internet may be bundled into one 'all-in' price. Always ask for a breakdown to avoid surprises." },
      { q: "What's the notice period?", a: "Standard Dutch law is one full calendar month for tenants. Verify in your contract since some short-stay or diplomatic clauses differ." },
    ],
    filters: { listingType: "huur", textMatch: "expat" },
    related: ["gemeubileerd-huren-amsterdam", "expat-rental-the-hague"],
  },
  {
    slug: "starterswoning-amsterdam",
    ...c("amsterdam", "Amsterdam"),
    h1: "Starterswoning kopen in Amsterdam",
    metaTitle: "Starterswoning Amsterdam | onder €400.000 kopen",
    metaDescription: "Vind een starterswoning in Amsterdam: koopwoningen onder €400.000, geschikt voor de NHG-grens en starters zonder eigen geld.",
    intro: "Een starterswoning in Amsterdam vinden is uitdagend, maar niet onmogelijk. We tonen alle koopaanbiedingen onder de NHG-grens van €435.000 (2026), zodat je binnen budget en zonder eigen geld kunt kopen.",
    sections: [
      { h2: "Waar starters wél kans maken", body: "Noord (Banne, Buiksloterham), Nieuw-West (Slotervaart, Geuzenveld) en Zuidoost (Bijlmer, Gaasperdam) bieden nog studio's en kleine tweekamerwoningen onder de €400.000." },
      { h2: "Wat is de NHG-grens in 2026?", body: "De NHG-grens ligt op €435.000. Tot dat bedrag krijg je vaak een rentekorting én ben je beschermd bij gedwongen verkoop." },
      { h2: "Schenkingsvrijstelling en jubelton", body: "De 'jubelton' (eenmalig €100.000 belastingvrij) is in 2024 afgeschaft. Je kunt nog wél jaarlijks €6.633 (2026) belastingvrij ontvangen van ouders, eventueel via een hypotheekaflossing." },
    ],
    faq: [
      { q: "Kan ik met €40.000 bruto alleen kopen in Amsterdam?", a: "Bij 4,5% rente leen je ongeveer €185.000. Onvoldoende voor Amsterdam zonder eigen geld of partnerinkomen. Combineer met een hogere DTI of partner." },
      { q: "Wat is een erfpachtcanon?", a: "In Amsterdam staat 80% van de grond op erfpacht. Je betaalt periodiek canon aan de gemeente, of koopt deze eeuwigdurend af. Tel deze kosten altijd op bij je maandlasten." },
      { q: "Hoeveel onder de vraagprijs bieden?", a: "In Amsterdam wordt momenteel 8-12% boven de vraagprijs geboden bij starterswoningen. Realisme over de markt is cruciaal." },
    ],
    filters: { listingType: "koop", maxPrice: 435000 },
    related: ["huis-kopen-onder-300000-groningen", "betaalbaar-huren-amsterdam"],
  },

  // ── Rotterdam (5)
  {
    slug: "betaalbaar-huren-rotterdam",
    ...c("rotterdam", "Rotterdam"),
    h1: "Betaalbaar huren in Rotterdam onder €1.250",
    metaTitle: "Betaalbare huurwoning Rotterdam | onder €1.250 per maand",
    metaDescription: "Huurwoning Rotterdam onder €1.250: studio's, appartementen en kamers in Zuid, West en Charlois. Dagelijks aangevuld aanbod.",
    intro: "Rotterdam is een van de weinige grote steden waar je nog onder €1.250 kale huur kunt wonen. We verzamelen het volledige aanbod, inclusief sociale huur dat tijdelijk in vrije sector wordt aangeboden.",
    sections: [
      { h2: "Beste buurten onder dit budget", body: "Charlois, Feijenoord, Carnisse en Hoogvliet bieden ruime tweekamerappartementen onder €1.000. In Delfshaven en Noord vind je het rond de €1.200." },
      { h2: "Studio's vs. appartementen", body: "Onder €900 zijn het vrijwel altijd studio's van 25-40 m². Tussen €900 en €1.250 verschuif je naar volwaardige tweekamerwoningen tot 65 m²." },
      { h2: "Let op servicekosten", body: "Een advertentie van €950 kan met €120 servicekosten ineens €1.070 worden. Vraag altijd de specificatie op vóór bezichtiging." },
    ],
    faq: [
      { q: "Krijg ik huurtoeslag bij €1.200 huur?", a: "Nee, de toeslaggrens ligt op €879,66 (2026). Boven die grens vervalt het recht op huurtoeslag volledig." },
      { q: "Zijn er sociale huurwoningen in Rotterdam onder €700?", a: "Ja, via Woonnet Rijnmond. De wachttijd is gemiddeld 6-8 jaar voor reguliere woningzoekenden." },
      { q: "Wat is het verschil met particuliere verhuur?", a: "Particuliere verhuurders mogen de WWS-puntentelling toepassen, maar mogen sinds 2024 in de gereguleerde middenhuur niet meer dan ~€1.157 vragen voor woningen onder 186 punten." },
    ],
    filters: { listingType: "huur", maxPrice: 1250 },
    related: ["huurwoning-rotterdam-met-tuin", "starterswoning-rotterdam"],
  },
  {
    slug: "huurwoning-rotterdam-met-tuin",
    ...c("rotterdam", "Rotterdam"),
    h1: "Huurwoning Rotterdam met tuin",
    metaTitle: "Huurwoning Rotterdam met tuin | eengezinshuizen",
    metaDescription: "Eengezinswoningen en benedenhuizen in Rotterdam met privé tuin. Filter op buurt, oppervlakte en prijs.",
    intro: "Een tuin in Rotterdam is realistischer dan in Amsterdam. Vooral in Hillegersberg, Schiebroek en Prins Alexander vind je benedenhuizen en kleine eengezinswoningen met privé buitenruimte.",
    sections: [
      { h2: "Wijken met tuinwoningen", body: "Hillegersberg-Schiebroek heeft de grootste tuinen, Prins Alexander de meeste eengezinshuurwoningen, en Kralingen-West biedt benedenhuizen rond de €1.600." },
      { h2: "Prijsranges 2026", body: "€1.450 tot €1.900 voor een driekamerwoning met tuin in de buitenwijken, en €1.900 tot €2.700 in Kralingen of het Lage Land." },
      { h2: "Onderhoudsverantwoordelijkheid", body: "Klein tuinonderhoud (gras, snoeien tot 2,5 meter) is voor de huurder. Bomen, schuttingen en grote ingrepen zijn voor de verhuurder." },
    ],
    faq: [
      { q: "Mag ik een trampoline neerzetten in een huurtuin?", a: "Vrijwel altijd ja, mits hij niet groter is dan 3 meter doorsnede en de buren geen overlast hebben. Check de huisregels." },
      { q: "Krijg ik korting als ik de tuin onderhoud?", a: "Sommige particuliere verhuurders bieden €25-€50 per maand korting in ruil voor onderhoud. Niet standaard, dus expliciet vragen." },
      { q: "Wat is de gemiddelde tuingrootte?", a: "In Rotterdam gemiddeld 35-60 m², beduidend ruimer dan in Amsterdam waar 15-25 m² normaal is." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["betaalbaar-huren-rotterdam", "starterswoning-rotterdam"],
  },
  {
    slug: "starterswoning-rotterdam",
    ...c("rotterdam", "Rotterdam"),
    h1: "Starterswoning kopen in Rotterdam",
    metaTitle: "Starterswoning Rotterdam | onder €300.000 kopen",
    metaDescription: "Starterswoningen in Rotterdam onder €300.000: appartementen in Zuid, Noord en Delfshaven. Inclusief NHG-grens en hypotheektips.",
    intro: "Rotterdam blijft de meest betaalbare grote stad om als starter een woning te kopen. Onder de €300.000 vind je nog volwaardige tweekamerappartementen, vooral op Zuid.",
    sections: [
      { h2: "Beste startersbuurten", body: "Tarwewijk, Bloemhof, Carnisse en het Oude Westen bieden veel aanbod. Voor wat meer comfort betaal je in Noord (Provenierswijk, Blijdorp) zo'n €270.000-€320.000." },
      { h2: "Stijgingstempo", body: "Prijzen stijgen in Rotterdam dit jaar ~5%, langzamer dan Amsterdam (~8%). Goed moment om in te stappen voor wie geduld heeft." },
      { h2: "Bijkomende kosten", body: "Reken altijd op 5-6% k.k. (kosten koper): overdrachtsbelasting valt onder de starters-vrijstelling tot €525.000 in 2026, mits jonger dan 35." },
    ],
    faq: [
      { q: "Kom ik in aanmerking voor de starters-vrijstelling?", a: "Ja als je jonger bent dan 35, de woning zelf bewoont en de aankoopprijs onder €525.000 ligt. Je betaalt dan 0% overdrachtsbelasting." },
      { q: "Hoe hoog is de WOZ in Rotterdam?", a: "Voor starterswoningen tussen de €180.000 en €280.000. De OZB is ~0,135% per jaar." },
      { q: "Is een NHG-hypotheek slim?", a: "Bijna altijd, omdat je rentekorting krijgt (~0,2-0,3%) en bescherming bij gedwongen verkoop." },
    ],
    filters: { listingType: "koop", maxPrice: 300000 },
    related: ["betaalbaar-huren-rotterdam", "starterswoning-amsterdam"],
  },
  {
    slug: "loft-huren-rotterdam",
    ...c("rotterdam", "Rotterdam"),
    h1: "Loft huren in Rotterdam",
    metaTitle: "Loft huren Rotterdam | industriële appartementen",
    metaDescription: "Industriële lofts huren in Rotterdam: hoge plafonds, open ruimtes en stoere architectuur in Katendrecht, Delfshaven en Kop van Zuid.",
    intro: "Rotterdam is dé loft-stad van Nederland. Voormalige pakhuizen, scheepswerven en kantoorpanden zijn omgetoverd tot ruime, lichte lofts met karakter.",
    sections: [
      { h2: "Top loft-locaties", body: "Katendrecht (Fenix Lofts), Kop van Zuid (Wilhelminapier), Delfshaven (oude jeneverstokerijen) en het Schieveen-gebied." },
      { h2: "Wat maakt een woning een loft?", body: "Plafondhoogte minimaal 3,5 m, open plattegrond zonder dragende binnenmuren, en bij voorkeur originele industriële elementen (stalen liggers, betonnen vloeren)." },
      { h2: "Prijspeil", body: "Lofts huren in Rotterdam start rond €1.700 voor 70 m², met topstukken op de Wilhelminapier tot €3.500 voor 150 m²." },
    ],
    faq: [
      { q: "Zijn lofts duurder dan reguliere appartementen?", a: "Per m² vergelijkbaar, maar lofts zijn vaak groter (90-160 m²), dus absolute huur ligt hoger." },
      { q: "Hoe zit het met verwarmingskosten in een loft?", a: "Hoge plafonds = meer volume om te verwarmen. Reken op 15-25% hogere stookkosten dan een vergelijkbaar appartement." },
      { q: "Mag ik wanden plaatsen in een loft?", a: "Doorgaans niet zonder schriftelijke toestemming, omdat het de karakteristiek van de woning aantast." },
    ],
    filters: { listingType: "huur", textMatch: "loft" },
    related: ["betaalbaar-huren-rotterdam"],
  },
  {
    slug: "penthouse-rotterdam-kopen",
    ...c("rotterdam", "Rotterdam"),
    h1: "Penthouse kopen in Rotterdam",
    metaTitle: "Penthouse Rotterdam kopen | luxe appartementen met skyline view",
    metaDescription: "Luxe penthouses in Rotterdam: dakappartementen met terras, skyline view en privé lift. Vanaf €750.000 tot €3 miljoen.",
    intro: "Rotterdam heeft de meest indrukwekkende penthouse-markt van Nederland. Wie boven de stad wil wonen met uitzicht op Maas, Erasmusbrug en skyline, vindt hier het hoogste aanbod.",
    sections: [
      { h2: "Iconische gebouwen", body: "De Rotterdam, Maastoren, New Orleans, Calypso en Boston & Seattle bieden bewoonde penthouses met dakterrassen tot 200 m²." },
      { h2: "Wat krijg je voor je geld?", body: "€750.000 levert een 80-100 m² penthouse in Capelse buitenrand. Voor €1,5-2 mln een 140-180 m² appartement met skyline view en privé lift." },
      { h2: "VvE en servicekosten", body: "In luxe complexen liggen servicekosten tussen €300 en €700 per maand: lift, concierge, fitness, zwembad en glasbewassing." },
    ],
    faq: [
      { q: "Is een penthouse altijd op de bovenste etage?", a: "Strikt genomen ja: een penthouse beslaat de gehele bovenste verdieping. 'Sub-penthouse' is de verdieping daaronder." },
      { q: "Hoe zit het met windhinder?", a: "Op grote hoogte (>50 m) kan windhinder op het terras flink zijn. Vraag naar windschermen of glazen balustrades." },
      { q: "Hypotheek voor een penthouse?", a: "Vrijwel altijd zonder NHG, omdat je ver boven de €435.000 grens zit. Reken op strengere acceptatie en hogere rente." },
    ],
    filters: { listingType: "koop", minPrice: 750000 },
    related: ["loft-huren-rotterdam"],
  },

  // ── Utrecht (4)
  {
    slug: "studentenkamer-utrecht",
    ...c("utrecht", "Utrecht"),
    h1: "Studentenkamer in Utrecht",
    metaTitle: "Studentenkamer Utrecht | kamers in alle wijken",
    metaDescription: "Vind een studentenkamer in Utrecht. Kamers in De Uithof, binnenstad, Tuindorp en Lombok. Inclusief huurprijzen en aanmeldtips.",
    intro: "Utrecht heeft 70.000 studenten en een chronisch krappe kamermarkt. We bundelen alle studentenkamers, hospitakamers en kleine studio's onder de €750.",
    sections: [
      { h2: "Wijken voor studenten", body: "De Uithof voor wie wil fietsen naar college, Tuindorp en Wittevrouwen voor sfeervolle straten, Lombok en Kanaleneiland voor het laagste budget." },
      { h2: "Hoe vind je een kamer?", body: "Naast SSH (sociale studentenhuisvesting) zijn DUWO, Kamernet en particuliere verhuurders de belangrijkste bronnen. Begin minimaal 3 maanden voor je studiestart." },
      { h2: "Wat kost een kamer?", body: "Hospitakamer: €450-€600 incl. Studio: €700-€950. Sociale studentenkamer via SSH: €380-€500, maar met wachttijden." },
    ],
    faq: [
      { q: "Mag ik me inschrijven op het adres?", a: "Ja, dat moet zelfs binnen 5 dagen. Sommige verhuurders verbieden inschrijving om huurtoeslag te vermijden, dat is illegaal." },
      { q: "Heb ik recht op huurtoeslag?", a: "Alleen bij onzelfstandige woonruimte met eigen voordeur (zelfstandig). Pure studentenkamers vallen er meestal buiten." },
      { q: "Hoe werkt een hospita-relatie?", a: "Je huurt van de hoofdbewoner. Er is geen volledige huurbescherming gedurende de eerste 9 maanden (proefperiode)." },
    ],
    filters: { listingType: "huur", propertyType: "kamer", maxPrice: 750 },
    related: ["studentenkamer-groningen", "studentenkamer-nijmegen", "betaalbaar-huren-utrecht"],
  },
  {
    slug: "betaalbaar-huren-utrecht",
    ...c("utrecht", "Utrecht"),
    h1: "Betaalbaar huren in Utrecht onder €1.300",
    metaTitle: "Betaalbare huurwoning Utrecht | onder €1.300 per maand",
    metaDescription: "Huurwoning Utrecht onder €1.300: studio's en appartementen in Kanaleneiland, Overvecht, Zuilen en Hoograven. Dagelijks aangevuld.",
    intro: "In Utrecht is huren onder €1.300 een uitdaging maar zeker haalbaar in Overvecht, Kanaleneiland en Zuilen. We tonen het complete onafhankelijke aanbod.",
    sections: [
      { h2: "Beste buurten qua prijs-kwaliteit", body: "Overvecht (€950-€1.150 voor 60 m²), Kanaleneiland (€1.000-€1.250), Zuilen (€1.100-€1.300) en Hoograven (€1.150-€1.300)." },
      { h2: "Wat krijg je voor €1.300?", body: "Een gerenoveerd tweekamerappartement van 55-70 m², doorgaans gestoffeerd, met lift en eigen badkamer." },
      { h2: "Servicekosten check", body: "Reken bij appartementscomplexen met €60-€140 servicekosten bovenop de kale huur, voor lift, glasbewassing en VvE-bijdragen." },
    ],
    faq: [
      { q: "Welke buurten worden vermeden door huurders?", a: "Sommige hoekjes van Kanaleneiland en Overvecht hebben slechtere reputaties. Bezichtig altijd ook 's avonds." },
      { q: "Komt dit aanbod ook van Funda?", a: "Nee, wij aggregeren onder andere Pararius, Kamernet, particuliere advertenties en lokale makelaars. Funda focust op koop." },
      { q: "Hoe snel verhuren betaalbare woningen?", a: "In Utrecht binnen 48-72 uur. Reageer dezelfde dag, met motivatie en inkomensbewijs in de bijlage." },
    ],
    filters: { listingType: "huur", maxPrice: 1300 },
    related: ["studentenkamer-utrecht", "starterswoning-utrecht"],
  },
  {
    slug: "starterswoning-utrecht",
    ...c("utrecht", "Utrecht"),
    h1: "Starterswoning kopen in Utrecht",
    metaTitle: "Starterswoning Utrecht | onder €375.000 kopen",
    metaDescription: "Starterswoningen in Utrecht onder €375.000: appartementen in Kanaleneiland, Overvecht en Leidsche Rijn. Inclusief NHG-tips.",
    intro: "Utrecht is na Amsterdam de duurste stad voor starters. Onder €375.000 vind je vooral kleinere appartementen in Overvecht, Kanaleneiland en delen van Leidsche Rijn.",
    sections: [
      { h2: "Realistische buurten", body: "Overvecht (€275.000-€340.000 voor 60 m²), Kanaleneiland (€290.000-€360.000), Leidsche Rijn (€340.000-€420.000) en Lunetten (€330.000-€400.000)." },
      { h2: "Erfpacht of eigendom?", body: "Utrecht heeft beperkt erfpacht, vooral in de binnenstad. Vraag altijd het kadaster-uittreksel op." },
      { h2: "Overbieden in Utrecht", body: "Gemiddeld wordt 6-10% boven vraagprijs geboden, met uitschieters tot 18% bij populaire buurten als Wittevrouwen en Tuindorp." },
    ],
    faq: [
      { q: "Mag ik een tweede hypotheek op een starterswoning?", a: "Pas na 2-3 jaar eigen bewoning en bij significante waardestijging. NHG-hypotheken hebben strengere regels." },
      { q: "Hoe lang duurt een aankoopproces?", a: "Van eerste bezichtiging tot sleuteloverdracht: gemiddeld 8-12 weken in Utrecht." },
      { q: "Is energielabel C een dealbreaker?", a: "Nee, maar reken op €15.000-€25.000 verduurzamingskosten in de eerste 5 jaar." },
    ],
    filters: { listingType: "koop", maxPrice: 375000 },
    related: ["betaalbaar-huren-utrecht", "starterswoning-amsterdam"],
  },
  {
    slug: "huurwoning-utrecht-met-balkon",
    ...c("utrecht", "Utrecht"),
    h1: "Huurwoning Utrecht met balkon",
    metaTitle: "Huurwoning Utrecht met balkon | appartementen met buitenruimte",
    metaDescription: "Appartementen huren in Utrecht met balkon of dakterras. Buurten, prijzen en realtime aanbod.",
    intro: "Een balkon is in Utrecht standaarder dan in Amsterdam dankzij ruime jaren-'70 wijken. We tonen alle huuradvertenties waarbij een balkon of dakterras wordt benoemd.",
    sections: [
      { h2: "Beste wijken voor balkonwoningen", body: "Leidsche Rijn (vrijwel elke nieuwbouw heeft balkon), Kanaleneiland-Noord en Tuindorp-Oost." },
      { h2: "Oriëntatie en uitzicht", body: "Veel jaren-'70 portiekflats hebben zuidwest-georiënteerde balkons. Vraag bij bezichtiging naar privacy ten opzichte van overburen." },
      { h2: "Wat te verwachten qua prijs", body: "Vanaf €1.200 voor 55 m² met klein balkon, tot €1.900 voor een 85 m² appartement met dakterras in Leidsche Rijn." },
    ],
    faq: [
      { q: "Mag ik op het balkon barbecueën?", a: "Volgens APV Utrecht alleen elektrisch of gasbarbecue, geen kolen. Houtskool levert klachten op." },
      { q: "Telt een Frans balkon ook?", a: "Nee, in onze filtering moet er sprake zijn van een betreedbaar balkon met minimaal 1 m² oppervlak." },
      { q: "Mag ik plantenbakken aan de balkonrand hangen?", a: "Alleen aan de binnenzijde van de balustrade, vanwege valgevaar." },
    ],
    filters: { listingType: "huur", textMatch: "balkon" },
    related: ["betaalbaar-huren-utrecht", "huurwoning-amsterdam-met-balkon"],
  },

  // ── Den Haag (4)
  {
    slug: "huurwoning-den-haag-met-tuin",
    ...c("den-haag", "Den Haag"),
    h1: "Huurwoning Den Haag met tuin",
    metaTitle: "Huurwoning Den Haag met tuin | benedenhuizen & gezinswoningen",
    metaDescription: "Huurwoningen met tuin in Den Haag: Bezuidenhout, Loosduinen, Mariahoeve en Ypenburg. Eengezinshuizen en benedenhuizen.",
    intro: "Den Haag heeft per saldo meer tuinwoningen dan Amsterdam of Utrecht. Vooral Bezuidenhout, Mariahoeve, Loosduinen en Ypenburg bieden eengezinswoningen met privé tuin onder €2.000.",
    sections: [
      { h2: "Wijken op een rij", body: "Loosduinen en Ypenburg: ruime tuinen, eengezinshuizen. Bezuidenhout en Statenkwartier: kleinere stadstuinen bij benedenhuizen. Mariahoeve: prijs/kwaliteit kampioen." },
      { h2: "Prijspeil 2026", body: "€1.500-€1.900 voor een 75-90 m² benedenhuis met tuin, €2.000-€2.700 voor een gerenoveerde eengezinswoning met diepe tuin." },
      { h2: "Internationale instituten", body: "Werk je bij het ICC, ICJ of OPCW? Vraag bij de werkgever naar een huurtoeslag via de Diplomatic Card." },
    ],
    faq: [
      { q: "Hoe groot is een gemiddelde Haagse stadstuin?", a: "40-80 m² in vooroorlogse buurten, 60-150 m² in naoorlogse wijken zoals Loosduinen." },
      { q: "Mag ik een schuur bouwen?", a: "Vergunningsvrij tot 30 m² en max. 3 meter hoog, mits achter de woning. Toestemming verhuurder is verplicht." },
      { q: "Krijg ik korting bij langere huurperiode?", a: "Soms 2-5% bij contracten van 24+ maanden, vooral bij particuliere verhuurders." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-amsterdam-met-tuin", "expat-rental-the-hague"],
  },
  {
    slug: "expat-rental-the-hague",
    ...c("den-haag", "Den Haag"),
    h1: "Expat rentals in The Hague",
    metaTitle: "Expat rentals The Hague | furnished apartments diplomatic district",
    metaDescription: "Expat-friendly rentals in The Hague near international institutions. Furnished apartments in Statenkwartier, Benoordenhout and Zorgvliet.",
    intro: "The Hague hosts 200+ international organisations. Our expat-friendly listings focus on furnished apartments near Statenkwartier, Benoordenhout and the ICC zone.",
    sections: [
      { h2: "Top neighbourhoods", body: "Statenkwartier (close to Peace Palace), Benoordenhout (family-friendly, near American School), Zorgvliet (walking distance to ministries) and Scheveningen for sea views." },
      { h2: "Schools nearby", body: "American School of The Hague (Wassenaar), British School in The Netherlands (Voorschoten), Lycée Français Vincent van Gogh, and the European School (Bezuidenhout)." },
      { h2: "Diplomatic clauses", body: "Many landlords offer a 'diplomatic clause' allowing early termination on official posting. Always negotiate explicitly." },
    ],
    faq: [
      { q: "Are tax-friendly rentals available?", a: "Yes, under the 30% ruling you can deduct part of the rent. Discuss with your tax adviser." },
      { q: "Is parking included?", a: "Often yes in Benoordenhout (driveways), rarely in Statenkwartier (street parking by permit)." },
      { q: "How early to start searching?", a: "8-12 weeks before arrival. Premium furnished units in Benoordenhout book months ahead." },
    ],
    filters: { listingType: "huur", textMatch: "expat" },
    related: ["expat-rental-amsterdam", "huurwoning-den-haag-met-tuin"],
  },
  {
    slug: "huren-scheveningen-zeezicht",
    ...c("den-haag", "Den Haag"),
    h1: "Huren in Scheveningen met zeezicht",
    metaTitle: "Huurwoning Scheveningen met zeezicht | appartementen aan zee",
    metaDescription: "Appartementen met zeezicht huren in Scheveningen en Kijkduin. Strandnabij wonen met balkon op de Noordzee.",
    intro: "Scheveningen biedt het meeste zeezicht-aanbod in Nederland. We tonen appartementen waarbij expliciet zicht op zee of duinen wordt vermeld.",
    sections: [
      { h2: "Beste complexen voor zeezicht", body: "Boulevard Bankaplein, Zwarte Pad, Kurhaus-omgeving en het Schevenings Havenkwartier. Hogere etages = beter uitzicht." },
      { h2: "Wind en zout", body: "Houd rekening met meer sleet door zout en wind. Vraag naar gevelmaterialen en kozijnonderhoud." },
      { h2: "Prijspeil", body: "€1.700-€2.400 voor een 60-80 m² appartement op de zesde+ etage met direct zeezicht, €1.300-€1.700 voor side-views of lagere etages." },
    ],
    faq: [
      { q: "Mag ik het appartement onderverhuren in zomermaanden?", a: "Vrijwel nooit zonder schriftelijke toestemming. Den Haag pakt illegale verhuur fors aan." },
      { q: "Hoe vies wordt het balkon?", a: "Zand en zout neerslag is aanzienlijk. Reken op wekelijks schoonspoelen in zomer." },
      { q: "Is er parkeerprobleem in Scheveningen?", a: "Ja, op piekdagen. Een eigen parkeerplaats in het complex (€85-€150/mnd) is sterk aanbevolen." },
    ],
    filters: { listingType: "huur", textMatch: "zee" },
    related: ["expat-rental-the-hague"],
  },
  {
    slug: "starterswoning-den-haag",
    ...c("den-haag", "Den Haag"),
    h1: "Starterswoning kopen in Den Haag",
    metaTitle: "Starterswoning Den Haag | onder €350.000 kopen",
    metaDescription: "Starterswoningen in Den Haag onder €350.000: appartementen in Laak, Schilderswijk, Transvaal en Moerwijk.",
    intro: "Den Haag biedt nog steeds startersvriendelijke koopwoningen, vooral in Laak, Moerwijk en Transvaal. Onder €350.000 vind je gerenoveerde tweekamerappartementen.",
    sections: [
      { h2: "Buurten met startersaanbod", body: "Laak (€250-310k), Transvaal (€240-300k), Schilderswijk (€220-290k) en Moerwijk (€260-320k)." },
      { h2: "VvE-controle", body: "Veel oudere portiekflats in Den Haag hebben slapende VvE's. Controleer of er een meerjarenonderhoudsplan (MJOP) is en wat de reserves zijn." },
      { h2: "Funderingsrisico", body: "Delen van Scheveningen, Laak en Bezuidenhout hebben houten paalfunderingen. Vraag een funderingsrapport op bij twijfel." },
    ],
    faq: [
      { q: "Wat is de starters-vrijstelling overdrachtsbelasting?", a: "0% overdrachtsbelasting voor kopers onder 35 jaar, koopprijs tot €525.000 (2026), bij eigen bewoning." },
      { q: "Hoeveel onder de vraagprijs bieden?", a: "In Den Haag wordt gemiddeld 4-9% boven vraagprijs geboden. In Moerwijk en Transvaal soms 12%+." },
      { q: "Kan ik kopen zonder eigen geld?", a: "Tot NHG-grens (€435.000) en 100% LTV ja, mits inkomen volstaat. Bijkomende kosten (5-6% k.k.) moet je wel uit eigen middelen betalen." },
    ],
    filters: { listingType: "koop", maxPrice: 350000 },
    related: ["starterswoning-rotterdam", "starterswoning-utrecht"],
  },

  // ── Eindhoven (3)
  {
    slug: "expat-rental-eindhoven",
    ...c("eindhoven", "Eindhoven"),
    h1: "Expat rentals in Eindhoven",
    metaTitle: "Expat rentals Eindhoven | ASML & High Tech Campus",
    metaDescription: "Expat-friendly rentals in Eindhoven near ASML, High Tech Campus and Brainport. Furnished apartments in Strijp, Tongelre and Stratum.",
    intro: "Eindhoven hosts ASML, Philips and 5.000+ tech expats annually. Our listings focus on furnished apartments within 20 minutes of the High Tech Campus and Veldhoven (ASML HQ).",
    sections: [
      { h2: "Best areas for tech expats", body: "Strijp-S (former Philips terrain, hippest area), Tongelre (family-friendly), Stratum (near city centre), and Waalre/Veldhoven for those working at ASML." },
      { h2: "Public transport", body: "Eindhoven has solid bus connections but no metro. Many expats commute by car or e-bike to the campus." },
      { h2: "Indicative budgets", body: "Studio: €1.100-€1.400 furnished. One-bedroom: €1.500-€1.900. Family villa near Veldhoven: €2.500-€3.800." },
    ],
    faq: [
      { q: "Is the 30% ruling accepted by landlords?", a: "Yes, but landlords typically still ask for 3x gross salary including the tax benefit." },
      { q: "Are short-stay options available?", a: "Yes, especially in Strijp-S and near Eindhoven Airport. Look for serviced apartments (3-12 months)." },
      { q: "What about international schools?", a: "International School Eindhoven (Strijp) and Regional International School (Eersel) are the main options." },
    ],
    filters: { listingType: "huur", textMatch: "expat" },
    related: ["expat-rental-amsterdam", "expat-rental-the-hague"],
  },
  {
    slug: "huurwoning-eindhoven-met-balkon",
    ...c("eindhoven", "Eindhoven"),
    h1: "Huurwoning Eindhoven met balkon",
    metaTitle: "Huurwoning Eindhoven met balkon | appartementen met buitenruimte",
    metaDescription: "Appartementen huren in Eindhoven met balkon of dakterras. Strijp, Tongelre, Woensel en Centrum.",
    intro: "Eindhoven heeft door zijn naoorlogse stadsplanning veel huurwoningen met balkon. We tonen het volledige aanbod, van Strijp tot Woensel.",
    sections: [
      { h2: "Beste wijken", body: "Strijp-S (nieuwe lofts met dakterras), Woensel-Zuid (jaren-'60 balkons), en het centrum (kleinere balkons in nieuwbouw torens)." },
      { h2: "Indicatie huurprijzen", body: "€1.050-€1.350 voor 55-70 m² met balkon, €1.500+ voor nieuwbouw in Strijp-S." },
      { h2: "Combinatie met parkeerplaats", body: "In Strijp-S zit een parkeerplaats vaak inbegrepen (€60-€90/mnd extra)." },
    ],
    faq: [
      { q: "Zijn er huurwoningen met dakterras?", a: "Ja, vooral in nieuwbouw zoals Trudo Toren, Strijp-T en de Witte Dame." },
      { q: "Hoe vol zijn de wachtlijsten?", a: "Particulier: 24-72 uur reactietijd vereist. Sociaal (Wooniezie regio): 4-7 jaar wachttijd." },
      { q: "Is een hospita-balkon ook telbaar?", a: "Alleen als het exclusief bij de gehuurde kamer hoort." },
    ],
    filters: { listingType: "huur", textMatch: "balkon" },
    related: ["expat-rental-eindhoven"],
  },
  {
    slug: "starterswoning-eindhoven",
    ...c("eindhoven", "Eindhoven"),
    h1: "Starterswoning kopen in Eindhoven",
    metaTitle: "Starterswoning Eindhoven | onder €325.000 kopen",
    metaDescription: "Starterswoningen in Eindhoven onder €325.000. Appartementen en kleine eengezinshuizen in Woensel, Tongelre en Stratum.",
    intro: "Eindhoven is dankzij Brainport hard gegroeid, waardoor starters het lastiger hebben. Onder €325.000 vind je nog tweekamerappartementen en kleine tussenwoningen in Woensel en Tongelre.",
    sections: [
      { h2: "Realistische buurten", body: "Woensel (€240-310k), Tongelre (€260-325k), Stratum (€270-325k) en delen van Strijp (€280-325k)." },
      { h2: "Brainport effect", body: "Met de groei van ASML stijgen prijzen in Eindhoven sneller dan landelijk gemiddeld (~7% per jaar vs ~4% NL)." },
      { h2: "VvE-fonds", body: "Controleer bij appartementen of de VvE actief is en onderhoudsreserves heeft. Stilliggende VvE's = financiële risico's." },
    ],
    faq: [
      { q: "Krijg ik een hypotheek met ASML-contract?", a: "Tijdelijke ASML-contracten worden door de meeste banken geaccepteerd als 'perspectiefverklaring' is bijgevoegd." },
      { q: "Hoe zit het met overbieden?", a: "Eindhoven kent overbiedingen van 5-12%, vergelijkbaar met Rotterdam." },
      { q: "Is een hypotheekadviseur nodig?", a: "Sterk aanbevolen, vooral bij internationale inkomens of 30% ruling." },
    ],
    filters: { listingType: "koop", maxPrice: 325000 },
    related: ["starterswoning-utrecht", "expat-rental-eindhoven"],
  },

  // ── Groningen (3)
  {
    slug: "studentenkamer-groningen",
    ...c("groningen", "Groningen"),
    h1: "Studentenkamer in Groningen",
    metaTitle: "Studentenkamer Groningen | RUG & Hanzehogeschool",
    metaDescription: "Studentenkamers in Groningen: Schildersbuurt, Korrewegwijk, Paddepoel. Vanaf €400 per maand inclusief.",
    intro: "Met 65.000 studenten heeft Groningen de hoogste studentendichtheid van Nederland. We bundelen alle kamers onder €700, inclusief hospita's en SSH-aanbod.",
    sections: [
      { h2: "Studentenwijken", body: "Schildersbuurt (bij UMCG), Korrewegwijk (gezellig, betaalbaar), Paddepoel (jaren-'60 flats) en de Binnenstad (duurder maar centraal)." },
      { h2: "Huurprijzen", body: "Hospita: €350-€500 incl. Onzelfstandige kamer: €400-€600. Studio: €600-€850. SSH: €380-€480 met wachttijd." },
      { h2: "Aankomstmoment", body: "September is piekdrukte. Wie in juli al zoekt heeft meer kans. Internationale studenten kunnen via ESN Groningen huisvesting krijgen." },
    ],
    faq: [
      { q: "Mag ik me uitschrijven uit mijn ouderlijk huis?", a: "Verplicht, binnen 5 dagen na verhuizing. Belangrijk voor studiefinanciering en huurtoeslag." },
      { q: "Is huren in Hoogkerk slim?", a: "Goedkoper (€400-€500), maar 15-20 minuten fietsen naar de Rijksuniversiteit. Veel studenten kiezen er toch voor." },
      { q: "Hoeveel kost gemiddeld een huurcontract?", a: "Borg meestal 1-2 maanden, geen makelaarscourtage (verboden sinds 2023)." },
    ],
    filters: { listingType: "huur", propertyType: "kamer", maxPrice: 700 },
    related: ["studentenkamer-utrecht", "studentenkamer-nijmegen"],
  },
  {
    slug: "huis-kopen-onder-300000-groningen",
    ...c("groningen", "Groningen"),
    h1: "Huis kopen onder €300.000 in Groningen",
    metaTitle: "Huis kopen Groningen onder €300.000 | starters en investeerders",
    metaDescription: "Koopwoningen in Groningen onder €300.000. Tussenwoningen, hoekhuizen en appartementen in Paddepoel, Beijum en Selwerd.",
    intro: "Groningen is een van de laatste universiteitssteden waar je nog onder €300.000 een eengezinswoning kunt kopen. Vooral in Beijum, Paddepoel en Lewenborg.",
    sections: [
      { h2: "Welke wijken?", body: "Beijum (€220-285k voor tussenwoning), Paddepoel (€200-275k voor appartement), Lewenborg (€235-295k) en Selwerd (€210-280k)." },
      { h2: "Aardbevingsschade", body: "Buiten het stedelijk gebied (richting Loppersum, Ten Boer) speelt aardbevingsschade. In de stad Groningen zelf zelden een issue, maar vraag altijd het bouwkundig rapport." },
      { h2: "Verhuurpotentieel", body: "Groningen heeft een sterke studentenmarkt. Verhuur is mogelijk maar vergunningen onder 'Wet goed verhuurderschap' worden vanaf 2024 strenger gehandhaafd." },
    ],
    faq: [
      { q: "Kan ik nog onder NHG kopen in Groningen?", a: "Ja, de meeste startersaanbod valt onder de €435.000 NHG-grens." },
      { q: "Wat is de OZB?", a: "Groningen heeft een OZB van ongeveer 0,11% (2026). Op €275.000 woz is dat ~€300 per jaar." },
      { q: "Hoeveel kost een bouwkundige keuring?", a: "€400-€650 voor een complete keuring inclusief rapport. Vrijwel altijd de moeite waard." },
    ],
    filters: { listingType: "koop", maxPrice: 300000 },
    related: ["studentenkamer-groningen", "starterswoning-rotterdam"],
  },
  {
    slug: "betaalbaar-huren-groningen",
    ...c("groningen", "Groningen"),
    h1: "Betaalbaar huren in Groningen onder €1.000",
    metaTitle: "Betaalbare huurwoning Groningen | onder €1.000 per maand",
    metaDescription: "Huurwoningen in Groningen onder €1.000: studio's en kleine appartementen in alle wijken. Dagelijks vers aanbod.",
    intro: "In Groningen is huren onder €1.000 nog goed mogelijk, mits je flexibel bent in wijk en woningtype. Studio's en kleine tweekamerappartementen overheersen in dit segment.",
    sections: [
      { h2: "Wijken voor dit budget", body: "Korrewegwijk, Paddepoel, Selwerd en delen van Vinkhuizen vallen vrijwel allemaal onder €1.000." },
      { h2: "Studio of appartement?", body: "Onder €750 vrijwel altijd studio's (20-40 m²). Tussen €750 en €1.000: 40-55 m² met aparte slaap." },
      { h2: "Inschrijving", body: "Bij sociale verhuur (Patrimonium, Lefier) is langere wachttijd. Particulier is sneller maar duurder." },
    ],
    faq: [
      { q: "Is huurtoeslag mogelijk?", a: "Ja, tot een huur van €879,66 (2026) en mits je inkomen onder de grens valt (~€34.000 alleenstaand)." },
      { q: "Wat is een 'campuscontract'?", a: "Een huurcontract gekoppeld aan studentschap. Je moet ingeschreven blijven, anders kan de verhuurder opzeggen." },
      { q: "Hoe lang duurt het zoeken?", a: "In Groningen meestal 2-6 weken voor budgetwoningen, mits je dagelijks reageert." },
    ],
    filters: { listingType: "huur", maxPrice: 1000 },
    related: ["studentenkamer-groningen", "huis-kopen-onder-300000-groningen"],
  },

  // ── Nijmegen (2)
  {
    slug: "studentenkamer-nijmegen",
    ...c("nijmegen", "Nijmegen"),
    h1: "Studentenkamer in Nijmegen",
    metaTitle: "Studentenkamer Nijmegen | Radboud & HAN",
    metaDescription: "Studentenkamers in Nijmegen: Hunnerberg, Bottendaal, Goffert. Voor Radboud- en HAN-studenten.",
    intro: "Nijmegen huisvest 40.000 studenten van Radboud en HAN. We bundelen alle kamers, studio's en hospita's in een overzicht.",
    sections: [
      { h2: "Studentenbuurten", body: "Bottendaal (hipste buurt), Hunnerberg (dichtbij Radboud), Goffert (sportvelden, ruim), en het Stadscentrum." },
      { h2: "Wat kost een kamer?", body: "Hospita €380-€500. Onzelfstandige kamer €400-€575. Studio €625-€825." },
      { h2: "SSHN", body: "Stichting Studentenhuisvesting Nijmegen biedt 7.500 kamers. Inschrijven 1+ jaar vooraf voor de beste kans." },
    ],
    faq: [
      { q: "Welke wijk is sociaal het levendigst?", a: "Bottendaal en Hunnerberg, dankzij studenten- en bar-cultuur rond Van Broeckhuysenstraat." },
      { q: "Mag ik onderverhuren in zomerstop?", a: "Alleen met schriftelijke toestemming. Veel verhuurders sturen vanaf juli zelf vakantiehuurders." },
      { q: "Hoe ver wonen studenten van de Radboud?", a: "Gemiddeld 8-12 minuten fietsen. Op Heyendaal-campus kun je vrijwel niet wonen (geen woningen)." },
    ],
    filters: { listingType: "huur", propertyType: "kamer", maxPrice: 750 },
    related: ["studentenkamer-utrecht", "studentenkamer-groningen"],
  },
  {
    slug: "huurwoning-nijmegen-met-tuin",
    ...c("nijmegen", "Nijmegen"),
    h1: "Huurwoning Nijmegen met tuin",
    metaTitle: "Huurwoning Nijmegen met tuin | benedenhuizen Nijmegen-Oost",
    metaDescription: "Eengezinshuizen en benedenhuizen in Nijmegen met privé tuin. Hees, Brakkenstein, Hunnerberg en Lent.",
    intro: "Nijmegen heeft door zijn glooiende landschap en groene wijken veel huurwoningen met tuin. We tonen ze gefilterd op privé buitenruimte.",
    sections: [
      { h2: "Beste tuinbuurten", body: "Brakkenstein (rustige villa-wijk), Hees (jaren-'30 huizen), Hunnerberg (heuvelachtig) en Lent (overzijde Waal, nieuwere wijk)." },
      { h2: "Indicatie prijs", body: "€1.350-€1.700 voor 75-100 m² benedenhuis met tuin, €1.700-€2.300 voor eengezinswoning in Brakkenstein." },
      { h2: "Heuvels en kelders", body: "Veel huizen in Nijmegen-Oost hebben halfondergrondse kelders. Vraag naar vochtproblematiek bij bezichtiging." },
    ],
    faq: [
      { q: "Hoe vaak komt er een tuinwoning vrij?", a: "Particulier circa 8-15 per week, met name in september en juni (overgangsmomenten studenten/professionals)." },
      { q: "Mag ik in de tuin een pergola bouwen?", a: "Onder 30 m² en lager dan 3 meter vaak vergunningsvrij, maar verhuurder moet akkoord geven." },
      { q: "Heeft Lent dezelfde prijspeil?", a: "Iets lager dan Nijmegen-Oost, maar met snelle verbinding via de stadsbrug Oversteek." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["studentenkamer-nijmegen", "huurwoning-arnhem-met-balkon"],
  },

  // ── Arnhem, Tilburg, Breda, Haarlem, Leiden, Maastricht, Almere etc.
  {
    slug: "huurwoning-arnhem-met-balkon",
    ...c("arnhem", "Arnhem"),
    h1: "Huurwoning Arnhem met balkon",
    metaTitle: "Huurwoning Arnhem met balkon | aanbod centrum & rand",
    metaDescription: "Huurwoning Arnhem met balkon: appartementen in Centrum, Spijkerkwartier, Velperweg en Presikhaaf.",
    intro: "Arnhem combineert betaalbare huren met goede buitenruimte. Veel jaren-'70 flats hebben volwaardige balkons van 4-6 m².",
    sections: [
      { h2: "Buurten", body: "Centrum, Spijkerkwartier (hipster), Velperweg (rustig) en Presikhaaf (laagste prijs per m²)." },
      { h2: "Prijspeil 2026", body: "€950-€1.250 voor 55-70 m² met balkon. €1.250-€1.500 voor nieuwbouw met dakterras." },
      { h2: "Tip", body: "Arnhem heeft veel jaren-'30 portiekflats met aan beide kanten balkon (voor en achter). Zeldzaam in andere steden." },
    ],
    faq: [
      { q: "Kun je in Arnhem onder €1.000 huren?", a: "Ja, in Presikhaaf en Klarendal regelmatig studio's tot tweekamerappartementen onder €1.000." },
      { q: "Hoe is openbaar vervoer?", a: "Trolleybussen door de hele stad, station Arnhem Centraal verbindt met de hele Randstad." },
      { q: "Mag ik op balkon roken?", a: "In huurovereenkomst kan een verbod staan, maar standaard niet verboden." },
    ],
    filters: { listingType: "huur", textMatch: "balkon" },
    related: ["betaalbaar-huren-arnhem"],
  },
  {
    slug: "betaalbaar-huren-arnhem",
    ...c("arnhem", "Arnhem"),
    h1: "Betaalbaar huren in Arnhem onder €1.100",
    metaTitle: "Betaalbare huurwoning Arnhem | onder €1.100 per maand",
    metaDescription: "Huurwoning Arnhem onder €1.100: appartementen en studio's in Presikhaaf, Klarendal en Geitenkamp.",
    intro: "Arnhem is een van de meest betaalbare middelgrote steden. Onder €1.100 vind je nog ruime tweekamerappartementen, vooral in Presikhaaf en Klarendal.",
    sections: [
      { h2: "Wijken op een rij", body: "Presikhaaf (laagste prijzen), Klarendal (creatief, opkomend), Geitenkamp (jaren-'20 architectuur), Malburgen (ruime jaren-'70 flats)." },
      { h2: "Wat krijg je voor het geld?", body: "Vanaf €750 een studio van 25 m². Vanaf €950 een tweekamerappartement van 55 m². Tot €1.100 zelfs 70 m² in Presikhaaf." },
      { h2: "Verhuurmix", body: "Vivare en Volkshuisvesting zijn de grootste woningcorporaties. Particulier vind je vooral in Klarendal en Centrum." },
    ],
    faq: [
      { q: "Krijg ik huurtoeslag in Arnhem?", a: "Bij kale huur tot €879,66 (2026) ja, mits inkomen onder de grens." },
      { q: "Hoe lang is de wachttijd sociaal?", a: "Bij Vivare gemiddeld 4-6 jaar voor regulier woningzoekenden." },
      { q: "Is er veel particulier aanbod?", a: "Beperkt, vooral in centrum en Klarendal. Meeste betaalbare aanbod komt van corporaties." },
    ],
    filters: { listingType: "huur", maxPrice: 1100 },
    related: ["huurwoning-arnhem-met-balkon"],
  },
  {
    slug: "studentenkamer-tilburg",
    ...c("tilburg", "Tilburg"),
    h1: "Studentenkamer in Tilburg",
    metaTitle: "Studentenkamer Tilburg | Tilburg University & Fontys",
    metaDescription: "Studentenkamers Tilburg: Centrum, Korvel, Oud-Noord. Voor TiU- en Fontys-studenten.",
    intro: "Tilburg heeft 35.000 studenten en een ontspannen kamermarkt vergeleken met Amsterdam of Utrecht. We bundelen het aanbod onder €650.",
    sections: [
      { h2: "Studentenwijken", body: "Centrum, Korvel (bij de Universiteit van Tilburg), Oud-Noord (creatieve buurt) en Berkel-Enschot voor Fontys-studenten." },
      { h2: "Prijspeil", body: "Hospita €350-€450. Onzelfstandige kamer €400-€550. Studio €550-€750." },
      { h2: "WonenBreburg", body: "De grootste corporatie voor studentenhuisvesting in Tilburg. Inschrijven loont, ook al woon je in een andere stad." },
    ],
    faq: [
      { q: "Is Berkel-Enschot ver van het centrum?", a: "Circa 8 minuten met de bus, 15 fietsen. Veel Fontys-studenten wonen er." },
      { q: "Heeft Tilburg een TilburgsAcademisch Studententeam (TST)?", a: "Tilburg University biedt internationale studenten huisvesting via University Housing, vooral op Talent Square." },
      { q: "Mag ik huren zonder garantsteller?", a: "Sociaal wel, particulier vaak niet onder 23 jaar." },
    ],
    filters: { listingType: "huur", propertyType: "kamer", maxPrice: 650 },
    related: ["studentenkamer-nijmegen", "studentenkamer-groningen"],
  },
  {
    slug: "huurwoning-breda-met-tuin",
    ...c("breda", "Breda"),
    h1: "Huurwoning Breda met tuin",
    metaTitle: "Huurwoning Breda met tuin | benedenhuizen Ginneken & Princenhage",
    metaDescription: "Huurwoning Breda met privé tuin: benedenhuizen in Ginneken, Princenhage en Boeimeer.",
    intro: "Breda biedt veel tuinwoningen in de zuidelijke wijken Ginneken, Boeimeer en Princenhage. We tonen het complete huuraanbod met privé buitenruimte.",
    sections: [
      { h2: "Beste buurten", body: "Ginneken (chic), Boeimeer (gezinsvriendelijk), Princenhage (dorps karakter) en Heusdenhout (jaren-'60 met tuin)." },
      { h2: "Prijspeil", body: "€1.350-€1.750 voor 80-100 m² benedenhuis, €1.800-€2.400 voor een eengezinshuis." },
      { h2: "Brabants karakter", body: "Veel Bredase tuinen hebben terrasoverkappingen, ideaal voor het milde Brabantse klimaat." },
    ],
    faq: [
      { q: "Mag ik kippen houden?", a: "Tot 6 kippen meestal vergunningsvrij in Breda, maar verhuurder moet akkoord geven." },
      { q: "Komen tuinwoningen vaak vrij?", a: "Beperkt: gemiddeld 5-10 per week in heel Breda." },
      { q: "Onderhoudsverantwoordelijkheid?", a: "Klein onderhoud (gras, snoeien) voor huurder. Bomen, hekken voor verhuurder." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["betaalbaar-huren-breda"],
  },
  {
    slug: "betaalbaar-huren-breda",
    ...c("breda", "Breda"),
    h1: "Betaalbaar huren in Breda onder €1.200",
    metaTitle: "Betaalbare huurwoning Breda | onder €1.200 per maand",
    metaDescription: "Huurwoning Breda onder €1.200: appartementen in Hoge Vucht, Haagse Beemden en Brabantpark.",
    intro: "Breda biedt onder €1.200 nog steeds redelijk veel aanbod, vooral in Hoge Vucht, Haagse Beemden en Brabantpark.",
    sections: [
      { h2: "Wijken voor budget", body: "Hoge Vucht (laagste prijzen), Haagse Beemden (ruime jaren-'80 flats), Brabantpark (centraal) en Princenhage-Oost." },
      { h2: "Wat krijg je?", body: "€900-€1.100 voor 55-70 m² appartement, €1.100-€1.200 voor 70-85 m² in renovatie." },
      { h2: "AlleeWonen en WonenBreburg", body: "De grootste corporaties in Breda. Voor sociaal aanbod direct daar inschrijven." },
    ],
    faq: [
      { q: "Wat is Hoge Vucht?", a: "Een jaren-'70 wijk in Breda-Noord, betaalbaar maar met gemengde reputatie. Bezichtig altijd ook 's avonds." },
      { q: "Is parkeren inbegrepen?", a: "Bij corporatieflats vaak op straat (vergunningstuk), bij nieuwbouw inpandig (€40-€80/mnd)." },
      { q: "Wachttijden sociaal?", a: "Gemiddeld 5-7 jaar bij Klik voor Wonen." },
    ],
    filters: { listingType: "huur", maxPrice: 1200 },
    related: ["huurwoning-breda-met-tuin"],
  },
  {
    slug: "huurwoning-haarlem-met-tuin",
    ...c("haarlem", "Haarlem"),
    h1: "Huurwoning Haarlem met tuin",
    metaTitle: "Huurwoning Haarlem met tuin | benedenhuizen jaren-'30",
    metaDescription: "Benedenhuizen en eengezinswoningen in Haarlem met privé tuin. Schoten, Vondelkwartier, Haarlem-Noord.",
    intro: "Haarlem is gezegend met talloze jaren-'30 benedenhuizen die een privé tuin hebben. We bundelen het complete aanbod.",
    sections: [
      { h2: "Tuinbuurten", body: "Vondelkwartier, Schoten, Bos en Vaart, en delen van Haarlem-Noord (Sinneveld) hebben de meeste tuinwoningen." },
      { h2: "Prijspeil 2026", body: "€1.700-€2.300 voor benedenhuis met tuin van 30-60 m². €2.400-€3.300 voor eengezinswoning in Bos en Vaart." },
      { h2: "Concurrentie", body: "Haarlem trekt veel Amsterdammers. Tuinwoningen worden binnen 24 uur weggeplukt. Snel reageren is essentieel." },
    ],
    faq: [
      { q: "Krijg ik een betere kans met partner?", a: "Ja, twee inkomens en lange contracten geven voorkeur." },
      { q: "Wat is de looptijd standaard?", a: "Particulier vaak 12 maanden, soms onbepaalde tijd door huurbescherming vanaf juli 2024." },
      { q: "Is een hond toegestaan?", a: "Bij benedenhuizen met tuin vaker ja dan bij appartementen. Vermeld het in je motivatiebrief." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-amsterdam-met-tuin", "betaalbaar-huren-haarlem"],
  },
  {
    slug: "betaalbaar-huren-haarlem",
    ...c("haarlem", "Haarlem"),
    h1: "Betaalbaar huren in Haarlem onder €1.500",
    metaTitle: "Betaalbare huurwoning Haarlem | onder €1.500 per maand",
    metaDescription: "Huurwoning Haarlem onder €1.500: appartementen in Schalkwijk, Parkwijk en Haarlem-Oost.",
    intro: "Haarlem is duur, maar onder €1.500 vind je nog tweekamerappartementen, vooral in Schalkwijk en Haarlem-Oost.",
    sections: [
      { h2: "Wijken", body: "Schalkwijk (laagste prijzen, ruim opgezet), Parkwijk, Haarlem-Oost en Boerhaavewijk." },
      { h2: "Prijs/oppervlak", body: "€1.250-€1.500 voor 55-75 m². Lift en balkon vrijwel altijd inbegrepen." },
      { h2: "OV-bereikbaarheid", body: "Vanaf Schalkwijk binnen 15 minuten op Haarlem Centraal, en 35 minuten op Amsterdam." },
    ],
    faq: [
      { q: "Komen tweekamerappartementen vaak vrij?", a: "Gemiddeld 30-50 per week binnen heel Haarlem." },
      { q: "Wat is Pré Wonen?", a: "De grootste corporatie in Haarlem. Voor sociaal direct inschrijven." },
      { q: "Hoe duur is parkeren?", a: "Centrum: €4-€5 per uur. Buurten: parkeervergunning €60-€150 per jaar." },
    ],
    filters: { listingType: "huur", maxPrice: 1500 },
    related: ["huurwoning-haarlem-met-tuin"],
  },
  {
    slug: "studentenwoning-leiden",
    ...c("leiden", "Leiden"),
    h1: "Studentenwoning in Leiden",
    metaTitle: "Studentenwoning Leiden | Universiteit Leiden",
    metaDescription: "Studentenkamers en studio's in Leiden voor studenten van Universiteit Leiden en Hogeschool Leiden.",
    intro: "Leiden is de oudste studentenstad van Nederland. We bundelen het aanbod voor de 30.000 studenten, met kamers vanaf €450.",
    sections: [
      { h2: "Studentenwijken", body: "Centrum (duur, sfeervol), De Kooi, Noord-West (betaalbaar) en Stationsbuurt (handig voor forenzen)." },
      { h2: "Prijspeil", body: "Hospita €450-€575. Kamer €500-€650. Studio €700-€950." },
      { h2: "DUWO", body: "Grootste studentenhuisvester in Leiden met 4.000 eenheden. Inschrijven vroeg, eerstejaars krijgen vaak voorrang via Quaestus." },
    ],
    faq: [
      { q: "Is een kamer in Leiden duurder dan Den Haag?", a: "Gemiddeld 5-10% hoger, omdat de markt smaller en exclusiever is." },
      { q: "Hoe bereik ik mijn faculteit?", a: "Veel faculteiten zijn in Leiden-Centrum, op fietsafstand van studentenwijken." },
      { q: "Kan ik later op de avond rondlopen?", a: "Leiden is een veilige stad. Centrum en De Kooi 's nachts levendig." },
    ],
    filters: { listingType: "huur", propertyType: "kamer", maxPrice: 750 },
    related: ["studentenkamer-utrecht", "studentenkamer-groningen"],
  },
  {
    slug: "huurwoning-maastricht-met-tuin",
    ...c("maastricht", "Maastricht"),
    h1: "Huurwoning Maastricht met tuin",
    metaTitle: "Huurwoning Maastricht met tuin | benedenhuizen Wyck & Heugem",
    metaDescription: "Huurwoning Maastricht met tuin: Wyck, Heugem, Sint Pieter en Daalhof.",
    intro: "Maastricht is heuvelachtig en biedt verrassend veel tuinwoningen, vooral in Heugem, Daalhof en delen van Wyck.",
    sections: [
      { h2: "Beste buurten", body: "Wyck (centraal met stadstuintjes), Heugem (ruime tuinen), Sint Pieter (heuvelflanken), en Daalhof (gezinswijk)." },
      { h2: "Prijspeil", body: "€1.250-€1.700 voor 75-100 m² benedenhuis. €1.700-€2.400 voor eengezinswoning in Sint Pieter." },
      { h2: "Tweetalige verhuur", body: "Veel Maastrichtse verhuurders spreken Frans, Duits of Engels, dankzij de Universiteit Maastricht (50% internationale studenten)." },
    ],
    faq: [
      { q: "Hoe groot zijn Maastrichtse stadstuinen?", a: "In Wyck en Stadscentrum 15-40 m². In Heugem en Sint Pieter 60-120 m²." },
      { q: "Mag ik wijn maken in eigen tuin?", a: "Voor eigen consumptie ja, commercieel niet. Maastricht heeft een aantal stadswijngaarden." },
      { q: "Hoe duur is parkeren bij tuinwoningen?", a: "In Wyck en Centrum €130-€180/jr vergunning. In Heugem vaak gratis op eigen oprit." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["betaalbaar-huren-maastricht"],
  },
  {
    slug: "betaalbaar-huren-maastricht",
    ...c("maastricht", "Maastricht"),
    h1: "Betaalbaar huren in Maastricht onder €1.150",
    metaTitle: "Betaalbare huurwoning Maastricht | onder €1.150 per maand",
    metaDescription: "Huurwoning Maastricht onder €1.150: studio's en appartementen in Caberg, Malberg en Daalhof.",
    intro: "Maastricht heeft hogere studentendichtheid dan menigeen denkt. Onder €1.150 zit je vaak in Caberg, Malberg of Pottenberg.",
    sections: [
      { h2: "Wijken", body: "Caberg, Malberg, Pottenberg en delen van Daalhof leveren huur onder €1.150." },
      { h2: "Wat krijg je?", body: "€800-€950 voor 35-55 m² studio. €1.000-€1.150 voor 55-70 m² tweekamerappartement." },
      { h2: "Internationale concurrentie", body: "Universiteit Maastricht trekt 22.000 internationale studenten. Veel particuliere verhuurders vragen Engels-talige bezichtigingen." },
    ],
    faq: [
      { q: "Is er een verschil met België qua huurregels?", a: "Ja, in NL geldt huurbescherming, in BE veel beperkter. Veel grensbewoners moeten wennen aan NL-regels." },
      { q: "Mag ik me hier inschrijven met BE-paspoort?", a: "Ja, EU-burgers krijgen direct BSN en kunnen inschrijven." },
      { q: "Hoeveel wisselen huurders?", a: "Vanwege studentenmarkt: hoog verloop in september/januari." },
    ],
    filters: { listingType: "huur", maxPrice: 1150 },
    related: ["huurwoning-maastricht-met-tuin"],
  },
  {
    slug: "huurwoning-almere-met-tuin",
    ...c("almere", "Almere"),
    h1: "Huurwoning Almere met tuin",
    metaTitle: "Huurwoning Almere met tuin | eengezinshuizen",
    metaDescription: "Huurwoning Almere met tuin: ruime eengezinswoningen in Almere Stad, Buiten en Poort.",
    intro: "Almere is dé tuinstad van Nederland. Vrijwel elke eengezinswoning heeft een achtertuin van minimaal 40 m². We tonen het complete huuraanbod.",
    sections: [
      { h2: "Beste tuinwijken", body: "Almere-Stad (gemengd), Almere-Buiten (groen en ruim), Almere-Poort (nieuwbouw met grote tuinen) en Almere-Haven (water + tuin combi)." },
      { h2: "Prijspeil 2026", body: "€1.450-€1.900 voor een eengezinswoning met 50-90 m² tuin. €1.900-€2.500 voor vrijstaand of half-vrijstaand in Almere-Poort." },
      { h2: "Forenzen naar Amsterdam", body: "Trein Almere → Amsterdam Centraal in 22 minuten. Bus en auto eveneens snel." },
    ],
    faq: [
      { q: "Is Almere goedkoper dan Lelystad?", a: "Almere is iets duurder dankzij betere OV-verbinding met Amsterdam." },
      { q: "Mag ik in de tuin een caravan parkeren?", a: "Volgens APV Almere alleen op privégrond en max. 3 maanden per jaar zichtbaar vanaf openbare weg." },
      { q: "Hoeveel woningcorporaties zijn er?", a: "Ymere en GoedeStede zijn de twee grootste in Almere." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-amsterdam-met-tuin"],
  },
  {
    slug: "starterswoning-almere",
    ...c("almere", "Almere"),
    h1: "Starterswoning kopen in Almere",
    metaTitle: "Starterswoning Almere | onder €350.000 kopen",
    metaDescription: "Starterswoningen in Almere onder €350.000: tussenwoningen en appartementen in alle stadsdelen.",
    intro: "Almere is de meest startersvriendelijke stad rondom Amsterdam. Onder €350.000 vind je nog steeds tussenwoningen met tuin.",
    sections: [
      { h2: "Buurten met startersaanbod", body: "Almere-Stad, Almere-Buiten en delen van Almere-Haven hebben veel woningen onder de NHG-grens." },
      { h2: "Indicatie prijzen", body: "€275-325k voor tussenwoning met tuin. €240-300k voor appartement met balkon. Erfpacht meestal afgekocht." },
      { h2: "Toekomstige waarde", body: "Almere groeit, met nieuwe metro-achtige verbindingen gepland (Almere Pampus). Waardegroei verwachting boven landelijk gemiddelde." },
    ],
    faq: [
      { q: "Geldt de starters-vrijstelling?", a: "Ja, onder 35 jaar en aankoopprijs onder €525.000 betaal je 0% overdrachtsbelasting." },
      { q: "Hoe zit het met paalrot?", a: "Almere staat op zandgrond, dus minder paalrotproblemen dan Amsterdam of Rotterdam." },
      { q: "Is Almere-Poort een goede investering?", a: "Ja, met de nieuwe Floriade-locatie en nieuwbouw stijgen prijzen sneller." },
    ],
    filters: { listingType: "koop", maxPrice: 350000 },
    related: ["huurwoning-almere-met-tuin", "starterswoning-amsterdam"],
  },
  {
    slug: "huurwoning-zwolle-met-tuin",
    ...c("zwolle", "Zwolle"),
    h1: "Huurwoning Zwolle met tuin",
    metaTitle: "Huurwoning Zwolle met tuin | eengezinshuizen Stadshagen",
    metaDescription: "Huurwoning Zwolle met tuin: Stadshagen, Aa-landen en Zwolle-Zuid.",
    intro: "Zwolle is een van de snelst groeiende middelgrote steden. Met name Stadshagen biedt huurwoningen met ruime tuinen.",
    sections: [
      { h2: "Beste wijken", body: "Stadshagen (nieuwbouw, ruime kavels), Aa-landen (jaren-'70), Zwolle-Zuid en Berkum." },
      { h2: "Prijspeil", body: "€1.300-€1.700 voor 80-100 m² eengezinswoning met tuin." },
      { h2: "Treinverbinding", body: "Zwolle Centraal is knooppunt: 1u00 Amsterdam, 1u20 Utrecht, 0u35 Groningen." },
    ],
    faq: [
      { q: "Hoe lang duurt zoeken?", a: "Particulier 3-6 weken, sociaal 4-6 jaar wachttijd." },
      { q: "Krijg ik korting bij langere huurperiode?", a: "Soms 2-3% bij contracten van 24+ maanden." },
      { q: "Mag ik bedrijf vanaf huis voeren?", a: "Tot 30% van de woonoppervlakte vergunningsvrij in Zwolle." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-almere-met-tuin"],
  },
  {
    slug: "huurwoning-amersfoort-met-balkon",
    ...c("amersfoort", "Amersfoort"),
    h1: "Huurwoning Amersfoort met balkon",
    metaTitle: "Huurwoning Amersfoort met balkon | appartementen centrum",
    metaDescription: "Huurwoning Amersfoort met balkon: Centrum, Vathorst, Schothorst.",
    intro: "Amersfoort heeft uitstekende treinverbindingen en groeiende huurmarkt. Veel woningen hebben balkon, vooral in nieuwbouw Vathorst.",
    sections: [
      { h2: "Wijken", body: "Centrum (historisch, kleinere balkons), Vathorst (nieuwbouw met ruime balkons), Schothorst (jaren-'70 flats)." },
      { h2: "Prijspeil 2026", body: "€1.100-€1.500 voor 55-75 m² appartement met balkon." },
      { h2: "Forenzen", body: "Amersfoort Centraal: 35 min Amsterdam, 25 min Utrecht. Aantrekkelijk voor randstadwerkers met meer ruimte voor geld." },
    ],
    faq: [
      { q: "Is Vathorst groen?", a: "Ja, ruim opgezet met veel parken en waterpartijen. Familievriendelijk." },
      { q: "Hoe duur is parkeren in centrum?", a: "Bewonersvergunning €120/jr. Bezoek €3-€4/uur." },
      { q: "Is er glasvezel?", a: "In vrijwel heel Amersfoort, ook in oudere wijken." },
    ],
    filters: { listingType: "huur", textMatch: "balkon" },
    related: ["huurwoning-utrecht-met-balkon"],
  },
  {
    slug: "betaalbaar-huren-zaanstad",
    ...c("zaanstad", "Zaanstad"),
    h1: "Betaalbaar huren in Zaanstad onder €1.250",
    metaTitle: "Betaalbare huurwoning Zaanstad | onder €1.250 per maand",
    metaDescription: "Huurwoning Zaanstad onder €1.250: Zaandam, Krommenie, Wormerveer.",
    intro: "Zaanstad biedt een alternatief voor het dure Amsterdam, met goede NS-verbinding (16 min naar Amsterdam Centraal).",
    sections: [
      { h2: "Wijken", body: "Zaandam-Centrum, Krommenie, Wormerveer, Assendelft." },
      { h2: "Prijspeil", body: "€950-€1.250 voor 55-70 m² tweekamerappartement. €1.250+ voor eengezinswoningen." },
      { h2: "Forensen", body: "Zaandam → Amsterdam in 16 min. Krommenie → Amsterdam in 26 min." },
    ],
    faq: [
      { q: "Hoe is de bereikbaarheid?", a: "Uitstekend: NS, A8 en A7 op fietsafstand." },
      { q: "Is Zaandam veilig?", a: "Vergelijkbaar met andere middelgrote NL-steden. Centrum is gerenoveerd en levendig." },
      { q: "Welke corporaties?", a: "Parteon, Rochdale en ZVH zijn actief in Zaanstad." },
    ],
    filters: { listingType: "huur", maxPrice: 1250 },
    related: ["betaalbaar-huren-amsterdam"],
  },
  {
    slug: "huurwoning-leeuwarden-met-tuin",
    ...c("leeuwarden", "Leeuwarden"),
    h1: "Huurwoning Leeuwarden met tuin",
    metaTitle: "Huurwoning Leeuwarden met tuin | eengezinshuizen",
    metaDescription: "Huurwoning Leeuwarden met privé tuin in Aldlân, Camminghaburen en Bilgaard.",
    intro: "Leeuwarden biedt zeer betaalbare tuinwoningen. Vrijwel elke eengezinswoning heeft een achtertuin.",
    sections: [
      { h2: "Wijken", body: "Aldlân, Camminghaburen, Bilgaard en Huizum-West." },
      { h2: "Prijspeil", body: "€950-€1.350 voor eengezinswoning met tuin van 50-100 m²." },
      { h2: "Friese taal", body: "Veel makelaars communiceren in Nederlands én Frysk. Tweetalige advertenties zijn niet ongewoon." },
    ],
    faq: [
      { q: "Hoe duur is leven in Leeuwarden?", a: "Levensonderhoud 15-20% lager dan in de Randstad." },
      { q: "Is er werk?", a: "Provinciehoofdstad met overheidsdiensten, MCL-ziekenhuis en NHL Stenden hogeschool." },
      { q: "Mag ik schapen houden?", a: "Buiten bebouwde kom vaak ja, binnen alleen met vergunning." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-groningen-met-tuin"],
  },
  {
    slug: "betaalbaar-huren-enschede",
    ...c("enschede", "Enschede"),
    h1: "Betaalbaar huren in Enschede onder €1.000",
    metaTitle: "Betaalbare huurwoning Enschede | onder €1.000 per maand",
    metaDescription: "Huurwoning Enschede onder €1.000: appartementen in Stadsveld, Wesselerbrink en Glanerbrug.",
    intro: "Enschede heeft een van de meest betaalbare huurmarkten van Nederland. Onder €1.000 zit je vrijwel altijd in een tweekamerappartement.",
    sections: [
      { h2: "Wijken", body: "Stadsveld, Wesselerbrink, Pathmos en Glanerbrug." },
      { h2: "Prijspeil", body: "€700-€900 voor 50-65 m². €900-€1.000 voor 70+ m²." },
      { h2: "UT-studenten", body: "Met Universiteit Twente trekt Enschede 15.000 studenten. Veel kamer-aanbod in Stadsveld en Roombeek." },
    ],
    faq: [
      { q: "Hoe is de werkgelegenheid?", a: "Sterk in technologie (Demcon, Thales), zorg en onderwijs." },
      { q: "Wat kost parkeren?", a: "Bewonersvergunning €50-€100/jr, beduidend goedkoper dan de Randstad." },
      { q: "Wachttijd sociaal?", a: "3-5 jaar bij Domijn, De Woonplaats en Ons Huis." },
    ],
    filters: { listingType: "huur", maxPrice: 1000 },
    related: ["betaalbaar-huren-arnhem"],
  },
  {
    slug: "studentenkamer-delft",
    ...c("delft", "Delft"),
    h1: "Studentenkamer in Delft",
    metaTitle: "Studentenkamer Delft | TU Delft",
    metaDescription: "Studentenkamers in Delft voor TU-studenten: Wippolder, Voorhof, Buitenhof.",
    intro: "Delft huisvest 27.000 TU-studenten. Wij bundelen kamers in Wippolder, Voorhof en Tanthof.",
    sections: [
      { h2: "Wijken", body: "Wippolder (naast TU-campus), Voorhof, Buitenhof en Tanthof." },
      { h2: "Prijspeil", body: "Hospita €450-€575. Kamer €475-€650. Studio €700-€950." },
      { h2: "DUWO", body: "DUWO Delft heeft 7.000 eenheden. Inschrijven vroeg loont." },
    ],
    faq: [
      { q: "Hoe ver is Wippolder van TU Delft?", a: "5-10 minuten fietsen, vandaar de populariteit." },
      { q: "Is een internationaal contract mogelijk?", a: "Ja, DUWO biedt specifiek aanbod voor internationale TU-studenten." },
      { q: "Verschil met Den Haag huren?", a: "Delft is iets duurder per m² maar dichter bij de TU." },
    ],
    filters: { listingType: "huur", propertyType: "kamer", maxPrice: 750 },
    related: ["studentenwoning-leiden", "studentenkamer-utrecht"],
  },
  {
    slug: "huurwoning-amstelveen",
    ...c("amstelveen", "Amstelveen"),
    h1: "Huurwoning in Amstelveen",
    metaTitle: "Huurwoning Amstelveen | expats & families",
    metaDescription: "Huurwoning Amstelveen: appartementen en eengezinshuizen, vooral populair bij internationale gezinnen.",
    intro: "Amstelveen is het hart van internationaal Nederland, met grote Japanse en Indiase gemeenschappen. Wij tonen het huuraanbod voor expats en gezinnen.",
    sections: [
      { h2: "Beste wijken", body: "Westwijk (internationaal), Patrimoniumlaan, Buitenveldert-Oost (Amsterdam grens) en Bovenkerk." },
      { h2: "Prijspeil", body: "€1.500-€2.200 voor 70-95 m² appartement. €2.500-€3.800 voor eengezinswoning." },
      { h2: "Internationale scholen", body: "International School of Amsterdam, Japanse school, en Amity International dichtbij." },
    ],
    faq: [
      { q: "Hoe ver is centrum Amsterdam?", a: "Met tram 25: 15-20 min naar Zuidas, 30 min naar Centraal." },
      { q: "Is parkeren een probleem?", a: "Veel woningen hebben eigen parkeerplaats of garage." },
      { q: "Welke corporaties?", a: "Eigen Haard is dominant." },
    ],
    filters: { listingType: "huur" },
    related: ["expat-rental-amsterdam"],
  },
  {
    slug: "huurwoning-rijswijk",
    ...c("rijswijk", "Rijswijk"),
    h1: "Huurwoning in Rijswijk",
    metaTitle: "Huurwoning Rijswijk | tussen Den Haag en Delft",
    metaDescription: "Huurwoning Rijswijk: appartementen en eengezinshuizen tussen Den Haag en Delft.",
    intro: "Rijswijk ligt strategisch tussen Den Haag en Delft. Aantrekkelijk voor wie in beide steden werkt of studeert.",
    sections: [
      { h2: "Wijken", body: "Oud Rijswijk (historisch), Steenvoorde (jaren-'70), Strijp en Sion." },
      { h2: "Prijspeil", body: "€1.150-€1.550 voor 55-75 m² appartement." },
      { h2: "Tramverbinding", body: "Tram 17: Rijswijk → Den Haag Centraal in 12 min." },
    ],
    faq: [
      { q: "Is Rijswijk dichtbij Forum Rotterdam?", a: "Met NS via Den Haag binnen 35 min in Rotterdam." },
      { q: "Hoeveel kost parkeren?", a: "€80-€120 vergunning per jaar." },
      { q: "Wat is Sion?", a: "Een groot nieuwbouwproject in Rijswijk, vrijwel allemaal nieuwbouwflats." },
    ],
    filters: { listingType: "huur" },
    related: ["expat-rental-the-hague", "studentenkamer-delft"],
  },
  {
    slug: "huurwoning-zoetermeer",
    ...c("zoetermeer", "Zoetermeer"),
    h1: "Huurwoning in Zoetermeer",
    metaTitle: "Huurwoning Zoetermeer | betaalbaar dichtbij Den Haag",
    metaDescription: "Huurwoning Zoetermeer: ruime appartementen en eengezinshuizen, dichtbij Den Haag.",
    intro: "Zoetermeer biedt ruime woningen voor relatief beperkte huren. Aantrekkelijk voor families die in Den Haag werken.",
    sections: [
      { h2: "Wijken", body: "Buytenwegh, Meerzicht, Rokkeveen, Oosterheem." },
      { h2: "Prijspeil", body: "€1.100-€1.450 voor 65-85 m² appartement. €1.500-€1.900 voor eengezinswoning." },
      { h2: "RandstadRail", body: "Lijn 3/4 verbindt Zoetermeer met Den Haag CS in 18-25 min." },
    ],
    faq: [
      { q: "Is Zoetermeer kindvriendelijk?", a: "Ja, opgezet als planstad in jaren-'60 met veel groen en scholen." },
      { q: "Hoeveel scholen?", a: "70+ basisscholen, 12 middelbare scholen." },
      { q: "Welke woningcorporaties?", a: "Vidomes, De Goede Woning en Vestia." },
    ],
    filters: { listingType: "huur" },
    related: ["expat-rental-the-hague"],
  },
  {
    slug: "huurwoning-apeldoorn-met-tuin",
    ...c("apeldoorn", "Apeldoorn"),
    h1: "Huurwoning Apeldoorn met tuin",
    metaTitle: "Huurwoning Apeldoorn met tuin | eengezinshuizen Apeldoorn",
    metaDescription: "Huurwoning Apeldoorn met tuin: gezinswoningen in De Maten, Zevenhuizen en Osseveld.",
    intro: "Apeldoorn, gelegen aan de Veluwe, biedt veel huurwoningen met ruime tuinen voor een schappelijke prijs.",
    sections: [
      { h2: "Wijken", body: "De Maten, Zevenhuizen, Osseveld, Zuid-Apeldoorn." },
      { h2: "Prijspeil", body: "€1.250-€1.650 voor eengezinswoning met 50-100 m² tuin." },
      { h2: "Veluwe", body: "Wandel- en fietsmogelijkheden in de Veluwe maken Apeldoorn populair onder buitenmensen." },
    ],
    faq: [
      { q: "Hoe is de werkgelegenheid?", a: "Centrum Belastingdienst, ICT-bedrijven, en zorg dominant." },
      { q: "Is Apeldoorn dichtbij Amsterdam?", a: "70 min met de trein. Te ver voor dagelijks forenzen." },
      { q: "Wachttijd sociaal?", a: "3-5 jaar bij De Goede Woning, Ons Huis en Sprengenland." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-zwolle-met-tuin"],
  },
  {
    slug: "huurwoning-deventer-met-tuin",
    ...c("deventer", "Deventer"),
    h1: "Huurwoning Deventer met tuin",
    metaTitle: "Huurwoning Deventer met tuin | Vijfhoek, Borgele, Colmschate",
    metaDescription: "Huurwoning Deventer met tuin: ruime gezinswoningen, betaalbaar.",
    intro: "Deventer is een charmante Hanzestad aan de IJssel met veel groene wijken en betaalbare tuinwoningen.",
    sections: [
      { h2: "Wijken", body: "Vijfhoek (centrum), Borgele, Colmschate, Voorstad-Oost." },
      { h2: "Prijspeil", body: "€1.100-€1.500 voor eengezinshuis met tuin." },
      { h2: "IJsselzicht", body: "Wijken aan de IJssel-kant zijn 10-15% duurder vanwege uitzicht." },
    ],
    faq: [
      { q: "Hoe is bereikbaarheid?", a: "NS naar Zwolle (15 min), Apeldoorn (10 min), Arnhem (45 min)." },
      { q: "Komen tuinwoningen vaak vrij?", a: "Gemiddeld 8-15 per week in heel Deventer." },
      { q: "Mag ik schuttingen plaatsen?", a: "Achter de woning tot 2 meter vergunningsvrij." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-zwolle-met-tuin", "huurwoning-apeldoorn-met-tuin"],
  },
  {
    slug: "huurwoning-hilversum",
    ...c("hilversum", "Hilversum"),
    h1: "Huurwoning in Hilversum",
    metaTitle: "Huurwoning Hilversum | mediastad bossen",
    metaDescription: "Huurwoning Hilversum: appartementen en villa's in mediastad omringd door bossen.",
    intro: "Hilversum is dé mediastad van Nederland en biedt mooie huurwoningen in groene wijken.",
    sections: [
      { h2: "Wijken", body: "Centrum, Trompenberg, Hilversumse Meent, Kerkelanden." },
      { h2: "Prijspeil", body: "€1.350-€1.900 voor 65-90 m² appartement. €2.200+ voor villa's." },
      { h2: "Forenzen", body: "Hilversum → Amsterdam Zuid 22 min. Hilversum → Utrecht 18 min." },
    ],
    faq: [
      { q: "Is Hilversum bosrijk?", a: "Ja, omringd door Spanderswoud, Goois Natuurreservaat. Wandelparadijs." },
      { q: "Veel mediabedrijven?", a: "NPO, RTL, Talpa, MTV zitten allen in/rondom Hilversum." },
      { q: "Welke corporaties?", a: "Dudok Wonen en de Alliantie." },
    ],
    filters: { listingType: "huur" },
    related: ["huurwoning-amersfoort-met-balkon"],
  },
  {
    slug: "huurwoning-groningen-met-tuin",
    ...c("groningen", "Groningen"),
    h1: "Huurwoning Groningen met tuin",
    metaTitle: "Huurwoning Groningen met tuin | eengezinshuizen Helpman & Vinkhuizen",
    metaDescription: "Huurwoning Groningen met tuin: Helpman, Vinkhuizen en Beijum.",
    intro: "Groningen biedt verrassend veel tuinwoningen, vooral in Helpman en Beijum.",
    sections: [
      { h2: "Wijken", body: "Helpman (chic), Vinkhuizen (ruim), Beijum (jaren-'80), Lewenborg." },
      { h2: "Prijspeil", body: "€1.250-€1.650 voor 80-100 m² eengezinswoning met tuin." },
      { h2: "Universiteitsstad", body: "Met RUG en UMCG dichtbij vaak gewild door promovendi en docenten." },
    ],
    faq: [
      { q: "Krijg ik huurtoeslag?", a: "Bij kale huur tot €879,66 en inkomen onder grens ja." },
      { q: "Hoe lang duurt zoeken?", a: "Particulier 2-6 weken, sociaal 4-7 jaar." },
      { q: "Welke corporaties?", a: "Nijestee, Lefier en Patrimonium dominant." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["studentenkamer-groningen", "betaalbaar-huren-groningen"],
  },
  {
    slug: "eengezinswoning-amstelveen-huren",
    ...c("amstelveen", "Amstelveen"),
    h1: "Eengezinswoning huren in Amstelveen",
    metaTitle: "Eengezinswoning Amstelveen huren | families, internationale scholen",
    metaDescription: "Eengezinswoningen in Amstelveen met tuin, vooral populair bij internationale gezinnen.",
    intro: "Amstelveen is dé eengezinswoning-stad voor expats rondom Amsterdam. Veel huizen met tuin, garage en internationale-school in de buurt.",
    sections: [
      { h2: "Wijken voor gezinnen", body: "Westwijk (internationaal), Bovenkerk (rustig), Patrimoniumlaan en Keizer Karelpark." },
      { h2: "Prijspeil", body: "€2.700-€4.500 voor 110-180 m² eengezinswoning met tuin." },
      { h2: "Internationale scholen", body: "International School of Amsterdam, Amity, Japanse school binnen 10 km." },
    ],
    faq: [
      { q: "Is parkeren inbegrepen?", a: "Vrijwel altijd eigen oprit of garage." },
      { q: "Welke metro lijnen?", a: "Lijn 51 (Amstelveen Westwijk → Centraal Station) is cruciaal." },
      { q: "Hoe lang duurt aanmelden internationale school?", a: "International School of Amsterdam heeft 6-12 maanden wachttijd." },
    ],
    filters: { listingType: "huur", propertyType: "huis" },
    related: ["huurwoning-amstelveen", "expat-rental-amsterdam"],
  },
  {
    slug: "huurwoning-dordrecht-met-tuin",
    ...c("dordrecht", "Dordrecht"),
    h1: "Huurwoning Dordrecht met tuin",
    metaTitle: "Huurwoning Dordrecht met tuin | oudste stad Holland",
    metaDescription: "Huurwoning Dordrecht met tuin: Crabbehof, Sterrenburg en Wielwijk.",
    intro: "Dordrecht is de oudste stad van Holland en biedt charmante tuinwoningen voor onder de Randstadprijs.",
    sections: [
      { h2: "Wijken", body: "Crabbehof, Sterrenburg, Wielwijk, Dubbeldam." },
      { h2: "Prijspeil", body: "€1.150-€1.450 voor eengezinswoning met tuin." },
      { h2: "Eilandkarakter", body: "Dordrecht ligt op een eiland, omsloten door rivieren. Veel water, natuur en historie." },
    ],
    faq: [
      { q: "Hoe ver is Rotterdam?", a: "NS naar Rotterdam Centraal in 17 min." },
      { q: "Is Dordrecht hoogwater-gevoelig?", a: "Goed beschermd door Maeslantkering en dijken. Verzekering wel verstandig." },
      { q: "Welke corporaties?", a: "Trivire en Woonbron." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-rotterdam-met-tuin"],
  },
  {
    slug: "huurwoning-alkmaar-met-tuin",
    ...c("alkmaar", "Alkmaar"),
    h1: "Huurwoning Alkmaar met tuin",
    metaTitle: "Huurwoning Alkmaar met tuin | Noord-Holland",
    metaDescription: "Huurwoning Alkmaar met tuin: De Hoef, Overdie, Daalmeer.",
    intro: "Alkmaar combineert historische binnenstad met moderne wijken die volop tuinwoningen bieden.",
    sections: [
      { h2: "Wijken", body: "De Hoef, Overdie, Daalmeer, Huiswaard." },
      { h2: "Prijspeil", body: "€1.250-€1.600 voor eengezinswoning met tuin." },
      { h2: "Kaasstad", body: "Naast huurmarkt bekend om kaasmarkt, AZ-stadion en grachten." },
    ],
    faq: [
      { q: "Hoe is bereikbaarheid Amsterdam?", a: "Trein 35 min naar Amsterdam Centraal." },
      { q: "Veel scholen?", a: "Goed onderwijsaanbod, inclusief Murmellius Gymnasium." },
      { q: "Welke corporaties?", a: "Woonwaard en Van Alckmaer." },
    ],
    filters: { listingType: "huur", textMatch: "tuin" },
    related: ["huurwoning-haarlem-met-tuin"],
  },
  {
    slug: "huurwoning-helmond",
    ...c("helmond", "Helmond"),
    h1: "Huurwoning in Helmond",
    metaTitle: "Huurwoning Helmond | betaalbaar dichtbij Eindhoven",
    metaDescription: "Huurwoning Helmond: betaalbaar alternatief voor Eindhoven, met goede OV-verbinding.",
    intro: "Helmond is het betaalbare alternatief voor Eindhoven en aangetrokken door professionals die bij ASML of Brainport werken.",
    sections: [
      { h2: "Wijken", body: "Brouwhuis, Brandevoort (nieuwbouw, populair), Helmond-West, Mierlo-Hout." },
      { h2: "Prijspeil", body: "€950-€1.300 voor 65-85 m² appartement of klein eengezinshuis." },
      { h2: "Brandevoort", body: "Stedenbouwkundig hoogstandje: jaren-'30 architectuur in nieuwbouw, veel families." },
    ],
    faq: [
      { q: "Hoe ver is ASML?", a: "20-30 min met auto naar Veldhoven. Trein Helmond-Eindhoven 12 min." },
      { q: "Is Brandevoort duurder?", a: "Ja, 10-20% boven gemiddeld Helmond, maar populair." },
      { q: "Welke corporaties?", a: "Volksbelang Helmond, Wocom en woCom." },
    ],
    filters: { listingType: "huur" },
    related: ["expat-rental-eindhoven"],
  },
];

export const findLongtailPage = (slug: string): LongtailPage | undefined =>
  LONGTAIL_PAGES.find((p) => p.slug === slug);
