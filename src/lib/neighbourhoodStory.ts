export type Distances = Record<string, number | null | undefined>;

export function formatKm(km: number) {
  if (km < 1) return `${Math.round((km * 1000) / 50) * 50 || 50} meter`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

export function travelHint(km: number) {
  if (km <= 1.2) return `${Math.max(1, Math.round((km * 1000) / 80))} minuten lopen`;
  if (km <= 7) return `${Math.max(2, Math.round((km * 1000) / 250))} minuten fietsen`;
  return `${Math.max(5, Math.round((km / 50) * 60))} minuten met de auto`;
}

const has = (d: Distances, k: string): d is Distances & Record<string, number> =>
  typeof d[k] === "number";
const at = (d: Distances, k: string) => `${formatKm(d[k] as number)} (${travelHint(d[k] as number)})`;

export interface StoryBlock { key: string; title: string; text: string }

/** Turns CBS neighbourhood distances into readable Dutch paragraphs. */
export function buildNeighbourhoodStory(d: Distances, street: string, city: string): StoryBlock[] {
  const where = street ? `aan de ${street} in ${city}` : `in ${city}`;
  const blocks: StoryBlock[] = [];

  if (has(d, "supermarket") || has(d, "shop")) {
    const parts: string[] = [];
    if (has(d, "supermarket")) {
      const close = (d.supermarket as number) <= 1;
      parts.push(`${close ? "Boodschappen doen is hier makkelijk: de" : "De"} dichtstbijzijnde grote supermarkt ligt op ${at(d, "supermarket")}.`);
    }
    if (has(d, "shop")) parts.push(`Voor vers brood of iets van de slager ben je ${formatKm(d.shop as number)} onderweg.`);
    blocks.push({ key: "shop", title: "Boodschappen doen", text: `Woon je ${where}? ${parts.join(" ")}` });
  }

  if (has(d, "train") || has(d, "highway") || has(d, "hub")) {
    const parts: string[] = [];
    if (has(d, "train")) parts.push(`Reis je met het openbaar vervoer, dan ligt het treinstation op ${at(d, "train")}.`);
    if (has(d, "hub")) parts.push(`Een groot overstapstation voor snelle verbindingen door het land bereik je na ${formatKm(d.hub as number)}.`);
    if (has(d, "highway")) parts.push(`Met de auto zit je na ${formatKm(d.highway as number)} op de snelweg.`);
    blocks.push({ key: "travel", title: "Reizen en bereikbaarheid", text: parts.join(" ") });
  }

  if (has(d, "daycare") || has(d, "primary") || has(d, "secondary") || has(d, "afterschool")) {
    const near = has(d, "primary") && (d.primary as number) <= 1;
    const parts: string[] = [near ? "Heb je kinderen? Dan zit je hier goed." : "Heb je kinderen?"];
    if (has(d, "daycare")) parts.push(`Het kinderdagverblijf ligt op ${at(d, "daycare")}.`);
    if (has(d, "afterschool")) parts.push(`Buitenschoolse opvang vind je op ${formatKm(d.afterschool as number)}.`);
    if (has(d, "primary")) parts.push(`De basisschool is ${at(d, "primary")} verderop.`);
    if (has(d, "secondary")) parts.push(`Voor de middelbare school fietsen ze ${formatKm(d.secondary as number)}.`);
    blocks.push({ key: "kids", title: "Wonen met kinderen", text: parts.join(" ") });
  }

  if (has(d, "doctor") || has(d, "pharmacy") || has(d, "hospital")) {
    const parts: string[] = [];
    if (has(d, "doctor")) parts.push(`De huisarts zit op ${at(d, "doctor")}.`);
    if (has(d, "pharmacy")) parts.push(`De apotheek ligt op ${formatKm(d.pharmacy as number)}.`);
    if (has(d, "hospital")) parts.push(`Het dichtstbijzijnde ziekenhuis is ${formatKm(d.hospital as number)} rijden.`);
    blocks.push({ key: "care", title: "Zorg dichtbij", text: parts.join(" ") });
  }

  if (has(d, "park") || has(d, "sport") || has(d, "restaurant") || has(d, "library")) {
    const parts: string[] = [];
    if (has(d, "park")) parts.push(`Even naar buiten? Het park ligt op ${at(d, "park")}.`);
    if (has(d, "sport")) parts.push(`Sporten kan op ${formatKm(d.sport as number)} bij het sportterrein.`);
    if (has(d, "restaurant")) parts.push(`Uit eten ga je op ${formatKm(d.restaurant as number)}.`);
    if (has(d, "library")) parts.push(`De bibliotheek ligt op ${formatKm(d.library as number)}.`);
    blocks.push({ key: "free", title: "Vrije tijd", text: parts.join(" ") });
  }

  return blocks;
}

export interface FaqItem { question: string; answer: string }

/** Neighbourhood FAQ items based on the same distances. */
export function buildNeighbourhoodFaq(d: Distances, address: string, city: string): FaqItem[] {
  const out: FaqItem[] = [];
  if (has(d, "supermarket")) {
    out.push({
      question: `Hoe ver is de supermarkt vanaf ${address} in ${city}?`,
      answer: `De dichtstbijzijnde grote supermarkt ligt op gemiddeld ${at(d, "supermarket")}.${has(d, "shop") ? ` Een bakker of buurtwinkel vind je op ${formatKm(d.shop as number)}.` : ""}`,
    });
  }
  if (has(d, "train") || has(d, "highway")) {
    out.push({
      question: `Hoe ver is het treinstation vanaf ${address}?`,
      answer: [
        has(d, "train") ? `Het dichtstbijzijnde treinstation ligt op ${at(d, "train")}.` : "",
        has(d, "highway") ? `De oprit van de snelweg ligt op ${formatKm(d.highway as number)}.` : "",
      ].filter(Boolean).join(" "),
    });
  }
  if (has(d, "primary") || has(d, "daycare")) {
    out.push({
      question: `Welke scholen en kinderopvang liggen in de buurt van ${address}?`,
      answer: [
        has(d, "daycare") ? `Het kinderdagverblijf ligt op ${formatKm(d.daycare as number)}.` : "",
        has(d, "primary") ? `De basisschool ligt op ${formatKm(d.primary as number)}.` : "",
        has(d, "secondary") ? `De middelbare school ligt op ${formatKm(d.secondary as number)}.` : "",
      ].filter(Boolean).join(" "),
    });
  }
  if (has(d, "doctor")) {
    out.push({
      question: `Hoe ver is de huisarts vanaf ${address}?`,
      answer: `De huisarts zit op ${at(d, "doctor")}.${has(d, "pharmacy") ? ` De apotheek ligt op ${formatKm(d.pharmacy as number)}.` : ""}`,
    });
  }
  return out.map((f) => ({ ...f, answer: `${f.answer} Bron: CBS, gemiddelde afstand over de weg voor de buurt.` }));
}
