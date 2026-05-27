// Edge function: server-side meta injection for crawlers.
// Fetches the static index.html from the live site, swaps title/description/
// canonical/hreflang/og tags so locale-prefixed routes (/en, /de, /fr) are
// indexed and previewed in the correct language by social/search crawlers
// that don't execute JavaScript.
//
// .htaccess routes bot User-Agents here. The body is unchanged so users with
// JS still get the SPA. We bypass our own rewrite by sending an
// `x-no-prerender` header on the upstream fetch.

const CANONICAL_HOST = "www.huurbaasje.nl";
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
    title: "Huurbaasje – Huurwoningen & Koophuizen in Nederland",
    description:
      "Vind huurwoningen en koophuizen in Eindhoven, Rotterdam, Amsterdam en meer. Huurbaasje – het woningplatform voor heel Nederland.",
    ogTitle: "Huurbaasje – Huurwoningen & Koophuizen in Nederland",
    ogDescription:
      "Zoek tussen duizenden huurwoningen en koophuizen in heel Nederland. Huurbaasje – snel, eenvoudig en betrouwbaar.",
  },
  en: {
    title: "Huurbaasje – Rental homes & houses for sale in the Netherlands",
    description:
      "Find rental homes and houses for sale in Eindhoven, Rotterdam, Amsterdam and more. Huurbaasje – the housing platform for the entire Netherlands.",
    ogTitle: "Huurbaasje – Rental homes & houses for sale in the Netherlands",
    ogDescription:
      "Search thousands of rentals and homes for sale across the Netherlands. Huurbaasje – fast, simple and reliable.",
  },
  de: {
    title: "Huurbaasje – Mietwohnungen & Häuser zum Kauf in den Niederlanden",
    description:
      "Finden Sie Mietwohnungen und Häuser zum Kauf in Eindhoven, Rotterdam, Amsterdam und mehr. Huurbaasje – die Wohnungsplattform für die gesamten Niederlande.",
    ogTitle: "Huurbaasje – Mietwohnungen & Häuser zum Kauf in den Niederlanden",
    ogDescription:
      "Tausende Mietwohnungen und Häuser zum Kauf in den Niederlanden. Huurbaasje – schnell, einfach und zuverlässig.",
  },
  fr: {
    title: "Huurbaasje – Locations & maisons à vendre aux Pays-Bas",
    description:
      "Trouvez des locations et des maisons à vendre à Eindhoven, Rotterdam, Amsterdam et plus encore. Huurbaasje – la plateforme immobilière pour tous les Pays-Bas.",
    ogTitle: "Huurbaasje – Locations & maisons à vendre aux Pays-Bas",
    ogDescription:
      "Des milliers de locations et de maisons à vendre aux Pays-Bas. Huurbaasje – rapide, simple et fiable.",
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

function injectMeta(html: string, url: URL): string {
  const locale = localeFromPath(url.pathname);
  const bare = stripLocale(url.pathname);
  const canonical = ORIGIN + withLocale(bare, locale);
  const m = META[locale];

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
