import { LEGACY_REDIRECTS } from "@/lib/routes";

/**
 * Old URL → new URL resolution, run server-side in the root route's beforeLoad
 * so old links get a real 301 instead of a client-side jump.
 */

/** Old compound SEO URLs (e.g. /verhuizen-naar-eindhoven) that carry params inside one segment. */
const LEGACY_PREFIX_REDIRECTS: Array<{ prefix: string; build: (rest: string) => string | null }> = [
  { prefix: "verhuizen-naar-", build: (rest) => (rest ? `/stadsgids/${rest}` : null) },
  { prefix: "woningen-postcode-", build: (rest) => (rest ? `/postcode/${rest}` : null) },
  {
    prefix: "huurwoningen-onder-",
    build: (rest) => {
      const i = rest.indexOf("-");
      return i > 0 ? `/huurwoningen/${rest.slice(i + 1)}/onder-${rest.slice(0, i)}` : null;
    },
  },
  {
    prefix: "koopwoningen-onder-",
    build: (rest) => {
      const i = rest.indexOf("-");
      return i > 0 ? `/koopwoningen/${rest.slice(i + 1)}/onder-${rest.slice(0, i)}` : null;
    },
  },
  {
    prefix: "huur-bij-inkomen-",
    build: (rest) => {
      const i = rest.indexOf("-");
      return i > 0 ? `/inkomen/${rest.slice(0, i)}/${rest.slice(i + 1)}` : null;
    },
  },
  { prefix: "vergelijk/", build: (rest) => (rest.includes("-vs-") ? `/duel/${rest}` : null) },
];

const splitLocale = (pathname: string) => {
  const path = pathname.replace(/\/+$/, "") || "/";
  const m = path.match(/^\/(en|de|fr)(?=\/|$)/);
  const localePrefix = m ? m[0] : "";
  return { localePrefix, bare: path.slice(localePrefix.length) || "/" };
};

export const resolveLegacyPrefixPath = (pathname: string, search: string): string | null => {
  const { localePrefix, bare } = splitLocale(pathname);
  const rel = bare.replace(/^\//, "");
  for (const { prefix, build } of LEGACY_PREFIX_REDIRECTS) {
    if (rel.startsWith(prefix)) {
      const target = build(rel.slice(prefix.length));
      if (target) return `${localePrefix}${target}${search}`;
    }
  }
  return null;
};

/** Matches a react-router style pattern where params are whole segments. */
const matchPattern = (pattern: string, path: string): Record<string, string> | null => {
  const ps = pattern.split("/").filter(Boolean);
  const xs = path.split("/").filter(Boolean);
  if (ps.length !== xs.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i] as string;
    const x = xs[i] as string;
    if (p.startsWith(":") && !p.slice(1).includes(":")) params[p.slice(1)] = decodeURIComponent(x);
    else if (p !== x) return null;
  }
  return params;
};

const EXTRA: Array<{ from: string; to: string }> = [{ from: "/vinden", to: "/woning-zoeken" }];

/** Returns the new href for an old URL, or null when the path is current. */
export const resolveLegacyRedirect = (pathname: string, search: string): string | null => {
  const { localePrefix, bare } = splitLocale(pathname);
  for (const { from, to } of [...EXTRA, ...LEGACY_REDIRECTS]) {
    const params = matchPattern(from, bare);
    if (!params) continue;
    const resolved = to.replace(/:([a-zA-Z0-9_]+)/g, (_, key: string) => params[key] ?? "");
    return `${localePrefix}${resolved}${search}`;
  }
  return resolveLegacyPrefixPath(pathname, search);
};

/** Old single-segment city URLs: /woningen-amsterdam → /huurwoningen/amsterdam, /amsterdam → /stad/amsterdam. */
export const resolveLegacyCityPath = (city: string, localePrefix: string, search: string): string => {
  if (!city) return `${localePrefix}/woonaanbod-per-stad`;
  if (city.startsWith("woningen-")) return `${localePrefix}/huurwoningen/${city.slice("woningen-".length)}${search}`;
  return `${localePrefix}/stad/${city}${search}`;
};
