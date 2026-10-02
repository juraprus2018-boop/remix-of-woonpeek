/**
 * Auto-link city names and keywords in blog HTML content
 * to relevant internal pages for SEO benefit.
 */

const CITY_LINKS: Record<string, string> = {
  Amsterdam: "/huurwoningen/amsterdam",
  Rotterdam: "/huurwoningen/rotterdam",
  Utrecht: "/huurwoningen/utrecht",
  "Den Haag": "/huurwoningen/den-haag",
  Eindhoven: "/huurwoningen/eindhoven",
  Groningen: "/huurwoningen/groningen",
  Tilburg: "/huurwoningen/tilburg",
  Almere: "/huurwoningen/almere",
  Breda: "/huurwoningen/breda",
  Nijmegen: "/huurwoningen/nijmegen",
  Arnhem: "/huurwoningen/arnhem",
  Haarlem: "/huurwoningen/haarlem",
  Amersfoort: "/huurwoningen/amersfoort",
  Leiden: "/huurwoningen/leiden",
  Maastricht: "/huurwoningen/maastricht",
  Delft: "/huurwoningen/delft",
  Deventer: "/huurwoningen/deventer",
  Leeuwarden: "/huurwoningen/leeuwarden",
  Zwolle: "/huurwoningen/zwolle",
  Enschede: "/huurwoningen/enschede",
  Apeldoorn: "/huurwoningen/apeldoorn",
  Hilversum: "/huurwoningen/hilversum",
  Dordrecht: "/huurwoningen/dordrecht",
  Zaandam: "/huurwoningen/zaandam",
  Zoetermeer: "/huurwoningen/zoetermeer",
  "Den Bosch": "/huurwoningen/den-bosch",
  Roosendaal: "/huurwoningen/roosendaal",
  Alkmaar: "/huurwoningen/alkmaar",
};

const KEYWORD_LINKS: Record<string, string> = {
  huurwoningen: "/huurwoningen",
  koopwoningen: "/koopwoningen",
  appartementen: "/appartement-huren",
  "dagelijkse alert": "/dagelijkse-alert",
  woningalert: "/dagelijkse-alert",
  "nieuw aanbod": "/vandaag",
  "woningen zoeken": "/zoeken",
  "woning zoeken": "/zoeken",
  huurwoning: "/huurwoningen",
  koopwoning: "/koopwoningen",
  kamers: "/kamer-huren",
  "studio huren": "/studio-huren",
  "huis kopen": "/koopwoningen",
  "huis huren": "/huurwoningen",
  woningmarkt: "/blog",
  "budget tool": "/budgetcheck",
  huurprijsmonitor: "/woningmarkt",
};

/**
 * Adds internal links to blog HTML content.
 * Only links the first occurrence of each term.
 * Skips content already inside <a>, <h1>-<h6>, or <script> tags.
 */
export function addBlogAutoLinks(html: string): string {
  let result = html;
  const linkedTerms = new Set<string>();

  // Combined map: cities + keywords
  const allLinks = { ...KEYWORD_LINKS, ...CITY_LINKS };

  for (const [term, href] of Object.entries(allLinks)) {
    if (linkedTerms.has(term)) continue;

    // Match the term only when NOT inside an existing tag attribute or anchor
    const regex = new RegExp(
      `(?<![<\\/a-zA-Z"=])\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b(?![^<]*<\\/a>)(?![^<]*>)`,
      "i"
    );

    const match = result.match(regex);
    if (match && match.index !== undefined) {
      const before = result.slice(0, match.index);
      const after = result.slice(match.index + match[0].length);
      // Don't link if we're inside an HTML tag or anchor
      const lastOpenTag = before.lastIndexOf("<");
      const lastCloseTag = before.lastIndexOf(">");
      if (lastOpenTag > lastCloseTag) continue; // inside a tag

      result = `${before}<a href="https://www.woonaanbod-nl.nl${href}" title="${term} op Woonaanbod NL">${match[0]}</a>${after}`;
      linkedTerms.add(term);
    }
  }

  return result;
}
