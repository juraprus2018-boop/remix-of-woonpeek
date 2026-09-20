/**
 * Woonruimteportalen die op hetzelfde Zig/Woonmatch-platform draaien als Wooniezie
 * en daardoor via dezelfde koppeling geïmporteerd kunnen worden.
 */
export interface ZigPortal {
  key: string;
  name: string;
  host: string;
}

export const ZIG_PORTALS: ZigPortal[] = [
  { key: "wonenindekop", name: "Wonen in de Kop", host: "https://www.wonenindekop.nl" },
  { key: "dewoningzoeker", name: "De Woningzoeker", host: "https://www.dewoningzoeker.nl" },
  { key: "antares", name: "Thuis bij Antares", host: "https://wonen.thuisbijantares.nl" },
  { key: "klikvoorwonen", name: "Klik voor Wonen", host: "https://www.klikvoorwonen.nl" },
  { key: "hurennoordveluwe", name: "Huren Noord-Veluwe", host: "https://www.hurennoordveluwe.nl" },
  { key: "oostwestwonen", name: "Oost West Wonen", host: "https://woningzoeken.oostwestwonen.nl" },
  { key: "ofw", name: "OFW", host: "https://woningzoeken.ofw.nl" },
  { key: "klikvoorkamers", name: "Klik voor Kamers", host: "https://www.klikvoorkamers.nl" },
  { key: "thuiskompas", name: "Thuiskompas", host: "https://www.thuiskompas.nl" },
  { key: "svnk", name: "SVNK", host: "https://www.svnk.nl" },
];

export const ZIG_PORTAL_NAMES = ZIG_PORTALS.map((p) => p.name);
