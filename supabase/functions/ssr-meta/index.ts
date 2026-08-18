// Edge function: server-side meta injection for crawlers.
// Fetches the static index.html from the live site, swaps title/description/
// canonical/hreflang/og tags so locale-prefixed routes (/en, /de, /fr) are
// indexed and previewed in the correct language by social/search crawlers
// that don't execute JavaScript.
//
// .htaccess routes bot User-Agents here. The body is unchanged so users with
// JS still get the SPA. We bypass our own rewrite by sending an
// `x-no-prerender` header on the upstream fetch.

const CANONICAL_HOST = "www.woonaanbod-nl.nl";
const ORIGIN = `https://${CANONICAL_HOST}`;
const SUPPORTED = ["nl", "en", "de", "fr"] as const;
type Locale = (typeof SUPPORTED)[number];
const PREFIX = new Set(["en", "de", "fr"]);

const OG_LOCALE: Record<Locale, string> = {
  nl: "nl_NL",
  en: "en_GB",
  de: "de_DE",
  fr: "fr_FR",
};

// Locale-specific copy for the homepage. Deep routes fall back to a
// generic localized version – the SPA still upgrades it client-side.
const META: Record<Locale, { title: string; description: string; ogTitle: string; ogDescription: string }> = {
  nl: {
    title: "Woonaanbod NL – Huurwoningen & Koophuizen in Nederland",
    description:
      "Vind huurwoningen en koophuizen in Eindhoven, Rotterdam, Amsterdam en meer. Woonaanbod NL – het woningplatform voor heel Nederland.",
    ogTitle: "Woonaanbod NL – Huurwoningen & Koophuizen in Nederland",
    ogDescription:
      "Zoek tussen duizenden huurwoningen en koophuizen in heel Nederland. Woonaanbod NL – snel, eenvoudig en betrouwbaar.",
  },
  en: {
    title: "Woonaanbod NL – Rental homes & houses for sale in the Netherlands",
    description:
      "Find rental homes and houses for sale in Eindhoven, Rotterdam, Amsterdam and more. Woonaanbod NL – the housing platform for the entire Netherlands.",
    ogTitle: "Woonaanbod NL – Rental homes & houses for sale in the Netherlands",
    ogDescription:
      "Search thousands of rentals and homes for sale across the Netherlands. Woonaanbod NL – fast, simple and reliable.",
  },
  de: {
    title: "Woonaanbod NL – Mietwohnungen & Häuser zum Kauf in den Niederlanden",
    description:
      "Finden Sie Mietwohnungen und Häuser zum Kauf in Eindhoven, Rotterdam, Amsterdam und mehr. Woonaanbod NL – die Wohnungsplattform für die gesamten Niederlande.",
    ogTitle: "Woonaanbod NL – Mietwohnungen & Häuser zum Kauf in den Niederlanden",
    ogDescription:
      "Tausende Mietwohnungen und Häuser zum Kauf in den Niederlanden. Woonaanbod NL – schnell, einfach und zuverlässig.",
  },
  fr: {
    title: "Woonaanbod NL – Locations & maisons à vendre aux Pays-Bas",
    description:
      "Trouvez des locations et des maisons à vendre à Eindhoven, Rotterdam, Amsterdam et plus encore. Woonaanbod NL – la plateforme immobilière pour tous les Pays-Bas.",
    ogTitle: "Woonaanbod NL – Locations & maisons à vendre aux Pays-Bas",
    ogDescription:
      "Des milliers de locations et de maisons à vendre aux Pays-Bas. Woonaanbod NL – rapide, simple et fiable.",
  },
};

function localeFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1]?.toLowerCase() ?? "";
  return PREFIX.has(seg) ? (seg as Locale) : "nl";
}

function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1]?.toLowerCase() ?? "";
  if (PREFIX.has(seg)) {
    const rest = pathname.slice(seg.length + 1);
    return rest === "" ? "/" : rest;
  }
  return pathname || "/";
}

function withLocale(bare: string, locale: Locale): string {
  const clean = bare.startsWith("/") ? bare : `/${bare}`;
  if (locale === "nl") return clean;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function buildHreflang(bare: string): string {
  const links = SUPPORTED.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN}${withLocale(bare, l)}" />`,
  );
  links.push(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}${withLocale(bare, "nl")}" />`);
  return links.join("\n    ");
}

function slugToCity(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p === "den" || p === "der" || p === "aan" || p === "op" || p === "van" ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ")
    .replace(/\bDen Haag\b/i, "Den Haag");
}

/** Per-route override for high-value SEO pages so Googlebot ziet juiste titel
 *  in initial HTML, niet pas na JS-hydratie. */
function routeMeta(bare: string, locale: Locale): { title: string; description: string; ogTitle: string; ogDescription: string } | null {
  // /huren/{city} of /huurwoningen/{city}
  let m = bare.match(/^\/(?:huren|huurwoningen)\/([a-z0-9-]+)\/?$/i);
  if (m) {
    const city = slugToCity(m[1]);
    const title = locale === "nl"
      ? `Huurwoningen ${city}: huizen & appartementen te huur | Woonaanbod NL`
      : locale === "en"
        ? `Rentals in ${city}: apartments and houses for rent | Woonaanbod NL`
        : locale === "de"
          ? `Mietwohnungen ${city}: Häuser & Wohnungen zur Miete | Woonaanbod NL`
          : `Locations à ${city} : maisons & appartements à louer | Woonaanbod NL`;
    const desc = locale === "nl"
      ? `Actueel aanbod huurwoningen in ${city}. Appartementen, huizen, studio's en kamers, dagelijks bijgewerkt. Gratis huuralert via Woonaanbod NL.`
      : locale === "en"
        ? `Up-to-date rental listings in ${city}. Apartments, houses, studios and rooms, refreshed daily. Free rental alerts on Woonaanbod NL.`
        : locale === "de"
          ? `Aktuelle Mietangebote in ${city}. Wohnungen, Häuser, Studios und Zimmer, täglich aktualisiert. Kostenlose Alerts via Woonaanbod NL.`
          : `Annonces de location à jour à ${city}. Appartements, maisons, studios et chambres, mis à jour quotidiennement. Alertes gratuites via Woonaanbod NL.`;
    return { title, description: desc, ogTitle: title.replace(" | Woonaanbod NL", ""), ogDescription: desc };
  }
  // /kopen/{city}
  m = bare.match(/^\/kopen\/([a-z0-9-]+)\/?$/i);
  if (m) {
    const city = slugToCity(m[1]);
    const title = locale === "nl"
      ? `Koopwoningen ${city}: huizen te koop | Woonaanbod NL`
      : locale === "en"
        ? `Homes for sale in ${city} | Woonaanbod NL`
        : locale === "de"
          ? `Häuser zum Kauf in ${city} | Woonaanbod NL`
          : `Maisons à vendre à ${city} | Woonaanbod NL`;
    const desc = locale === "nl"
      ? `Bekijk actuele koopwoningen in ${city}. Appartementen, eengezinswoningen en villa's, dagelijks bijgewerkt op Woonaanbod NL.`
      : `Browse homes for sale in ${city}, updated daily on Woonaanbod NL.`;
    return { title, description: desc, ogTitle: title.replace(/ \| Woonaanbod NL$/, ""), ogDescription: desc };
  }
  // /stad/{city}
  m = bare.match(/^\/stad\/([a-z0-9-]+)\/?$/i);
  if (m) {
    const city = slugToCity(m[1]);
    const title = locale === "nl"
      ? `Wonen in ${city}: huur & koop overzicht | Woonaanbod NL`
      : locale === "en"
        ? `Living in ${city}: rent & buy overview | Woonaanbod NL`
        : locale === "de"
          ? `Wohnen in ${city}: Miete & Kauf Übersicht | Woonaanbod NL`
          : `Habiter à ${city} : location & achat | Woonaanbod NL`;
    const desc = locale === "nl"
      ? `Compleet woningoverzicht voor ${city}: huur, koop, markt, buurten en dagelijks nieuw aanbod via Woonaanbod NL.`
      : `Complete housing overview for ${city}: rent, buy, market, neighbourhoods and new listings on Woonaanbod NL.`;
    return { title, description: desc, ogTitle: title.replace(/ \| Woonaanbod NL$/, ""), ogDescription: desc };
  }
  return null;
}

/** Build a rich body block (H1 + intro + FAQ) so non-JS crawlers see real
 *  content instead of an empty React shell. Replaces the hero-fallback div. */
function routeBodyContent(bare: string, locale: Locale): { h1: string; intro: string; faqs: Array<{ q: string; a: string }>; breadcrumbs: Array<{ name: string; url: string }> } | null {
  let m = bare.match(/^\/(?:huren|huurwoningen)\/([a-z0-9-]+)\/?$/i);
  if (m) {
    const city = slugToCity(m[1]);
    const slug = m[1].toLowerCase();
    return {
      h1: `Huurwoningen ${city}`,
      intro: `Op deze pagina vind je het actuele aanbod huurwoningen in ${city}. Bekijk appartementen, eengezinswoningen, studio's en kamers te huur in ${city}, dagelijks bijgewerkt. Woonaanbod NL is volledig gratis, je betaalt geen bemiddelingskosten of abonnement. Zet een gratis huuralert aan en ontvang elke ochtend de nieuwste huurwoningen in ${city} per e-mail.`,
      faqs: [
        { q: `Hoeveel huurwoningen zijn er beschikbaar in ${city}?`, a: `Het aanbod verandert dagelijks. Woonaanbod NL toont continu actuele huurwoningen, appartementen, studio's en kamers in ${city} en omliggende plaatsen.` },
        { q: `Wat is de gemiddelde huur in ${city}?`, a: `De gemiddelde huurprijs hangt af van type woning en buurt. Op de stadpagina van ${city} vind je live prijsindicaties per kamer- en oppervlakteklasse.` },
        { q: `Hoe stel ik een huuralert in voor ${city}?`, a: `Ga naar /woonradar, kies ${city} als locatie en stel je maximale huur en aantal kamers in. Je ontvangt dagelijks nieuwe woningen per e-mail, helemaal gratis.` },
        { q: `Kost Woonaanbod NL geld?`, a: `Nee. Zoeken, alerts en woningen plaatsen zijn 100% gratis. Er zijn geen verborgen kosten of abonnementen.` },
      ],
      breadcrumbs: [
        { name: "Home", url: `${ORIGIN}${withLocale("/", locale)}` },
        { name: "Huurwoningen", url: `${ORIGIN}${withLocale("/huurwoningen", locale)}` },
        { name: city, url: `${ORIGIN}${withLocale(`/huren/${slug}`, locale)}` },
      ],
    };
  }
  m = bare.match(/^\/kopen\/([a-z0-9-]+)\/?$/i);
  if (m) {
    const city = slugToCity(m[1]);
    const slug = m[1].toLowerCase();
    return {
      h1: `Koopwoningen ${city}`,
      intro: `Bekijk actuele koopwoningen in ${city}. Eengezinswoningen, appartementen en villa's te koop in ${city} en omgeving, dagelijks bijgewerkt op Woonaanbod NL. Vergelijk prijzen, bekijk kenmerken en neem direct contact op met de aanbieder.`,
      faqs: [
        { q: `Wat zijn de gemiddelde koopprijzen in ${city}?`, a: `De vraagprijzen variëren per buurt en woningtype. Op deze pagina staan actuele prijzen vanaf de goedkoopste tot de duurste koopwoningen in ${city}.` },
        { q: `Hoe bereken ik mijn maximale hypotheek?`, a: `Gebruik onze gratis hypotheekcalculator op /hypotheek-berekenen om te zien hoeveel je kunt lenen op basis van je bruto inkomen.` },
      ],
      breadcrumbs: [
        { name: "Home", url: `${ORIGIN}${withLocale("/", locale)}` },
        { name: "Koopwoningen", url: `${ORIGIN}${withLocale("/koopwoningen", locale)}` },
        { name: city, url: `${ORIGIN}${withLocale(`/kopen/${slug}`, locale)}` },
      ],
    };
  }
  m = bare.match(/^\/stad\/([a-z0-9-]+)\/?$/i);
  if (m) {
    const city = slugToCity(m[1]);
    const slug = m[1].toLowerCase();
    return {
      h1: `Wonen in ${city}`,
      intro: `Compleet woningoverzicht voor ${city}: huurwoningen, koopwoningen, woningmarktdata, buurten en dagelijks nieuw aanbod. Of je nu wilt huren of kopen in ${city}, Woonaanbod NL verzamelt alles op één gratis platform.`,
      faqs: [
        { q: `Is ${city} een goede woonstad?`, a: `${city} biedt diverse buurten, voorzieningen en woningtypes. Op deze pagina vind je een overzicht van huur- en koopaanbod en marktdata.` },
      ],
      breadcrumbs: [
        { name: "Home", url: `${ORIGIN}${withLocale("/", locale)}` },
        { name: "Steden", url: `${ORIGIN}${withLocale("/plekken", locale)}` },
        { name: city, url: `${ORIGIN}${withLocale(`/stad/${slug}`, locale)}` },
      ],
    };
  }
  return null;
}

function buildExtraJsonLd(body: { faqs: Array<{ q: string; a: string }>; breadcrumbs: Array<{ name: string; url: string }> }): string {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: body.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: body.breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.url,
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>\n    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`;
}

function buildBodyBlock(body: { h1: string; intro: string; faqs: Array<{ q: string; a: string }>; breadcrumbs: Array<{ name: string; url: string }> }): string {
  const crumbs = body.breadcrumbs
    .map((b, i) => `<a href="${b.url}">${escapeAttr(b.name)}</a>${i < body.breadcrumbs.length - 1 ? " &rsaquo; " : ""}`)
    .join("");
  const faqHtml = body.faqs
    .map((f) => `<section><h2>${escapeAttr(f.q)}</h2><p>${escapeAttr(f.a)}</p></section>`)
    .join("");
  return `<nav aria-label="Breadcrumb">${crumbs}</nav>
    <article>
      <h1>${escapeAttr(body.h1)}</h1>
      <p>${escapeAttr(body.intro)}</p>
      ${faqHtml}
    </article>`;
}

function injectMeta(html: string, url: URL): string {
  const locale = localeFromPath(url.pathname);
  const bare = stripLocale(url.pathname);
  const canonical = ORIGIN + withLocale(bare, locale);
  const m = routeMeta(bare, locale) ?? META[locale];
  const body = routeBodyContent(bare, locale);

  let out = html;

  // <html lang="..">
  out = out.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${locale}"`);

  // <title>
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(m.title)}</title>`);

  // meta description
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(m.description)}" />`,
  );

  // canonical
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${canonical}" />`,
  );

  // Remove all existing hreflang alternates, then re-insert per current path.
  out = out.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/gi, "");
  out = out.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    (match) => `${match}\n    ${buildHreflang(bare)}`,
  );

  // OG tags
  const ogReplacements: Array<[RegExp, string]> = [
    [/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeAttr(m.ogTitle)}" />`],
    [/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeAttr(m.ogDescription)}" />`],
    [/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`],
    [/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:locale" content="${OG_LOCALE[locale]}" />`],
  ];
  for (const [re, repl] of ogReplacements) out = out.replace(re, repl);

  // Twitter
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(m.ogTitle)}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeAttr(m.ogDescription)}" />`,
  );

  // Per-route enrichment: inject extra JSON-LD (FAQPage + BreadcrumbList) and
  // a real body content block so non-JS crawlers see actual text.
  if (body) {
    // Add JSON-LD right before </head>
    out = out.replace(/<\/head>/i, `    ${buildExtraJsonLd(body)}\n  </head>`);
    // Replace the hero-fallback placeholder inside #root with rich content.
    // Bots see this; the SPA replaces #root on hydration so users see the app.
    out = out.replace(
      /<div id="root">[\s\S]*?<\/div>\s*<script type="module"/i,
      `<div id="root">${buildBodyBlock(body)}</div>\n    <script type="module"`,
    );
  }

  return out;
}

Deno.serve(async (req) => {
  try {
    const reqUrl = new URL(req.url);
    // The original path the crawler hit – passed via ?path= from .htaccess,
    // or fall back to the function's own pathname.
    const targetPath = reqUrl.searchParams.get("path") || "/";
    const pageUrl = new URL(targetPath, ORIGIN);

    const upstream = await fetch(ORIGIN + "/index.html", {
      headers: { "x-no-prerender": "1", "user-agent": "ssr-meta/1.0" },
      redirect: "follow",
    });

    if (!upstream.ok) {
      return new Response(`Upstream ${upstream.status}`, { status: 502 });
    }

    const html = await upstream.text();
    const mutated = injectMeta(html, pageUrl);

    return new Response(mutated, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=600",
        "x-prerendered": "ssr-meta",
      },
    });
  } catch (err) {
    return new Response(`ssr-meta error: ${(err as Error).message}`, { status: 500 });
  }
});
