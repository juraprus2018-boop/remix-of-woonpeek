import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, CANONICAL_URL, type Locale } from "@/lib/brand";
import { stripLocale, withLocale, getLocaleFromPath } from "@/lib/locale";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}


const setMeta = (property: string, content: string) => {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

/** Replace all hreflang alternates so they always reflect the current page. */
const setHreflangAlternates = (pathname: string) => {
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.parentElement?.removeChild(el));
  const bare = stripLocale(pathname);
  const base = CANONICAL_URL || "";
  SUPPORTED_LOCALES.forEach((lng) => {
    const path = withLocale(bare, lng as Locale);
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", lng);
    link.setAttribute("href", base + path);
    document.head.appendChild(link);
  });
  // x-default → Dutch (primary market)
  const xDefault = document.createElement("link");
  xDefault.setAttribute("rel", "alternate");
  xDefault.setAttribute("hreflang", "x-default");
  xDefault.setAttribute("href", base + withLocale(bare, DEFAULT_LOCALE));
  document.head.appendChild(xDefault);
};

/** Inject (or replace) a JSON-LD script tag identified by a stable id. */
const setJsonLd = (id: string, data: unknown) => {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const SEOHead = ({ title, description, canonical, ogImage, ogType = "website", noindex }: SEOHeadProps) => {
  const location = useLocation();

  useEffect(() => {
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);

    // Robots: noindex when requested, otherwise ensure default index,follow
    let robotsEl = document.querySelector('meta[name="robots"]');
    if (!robotsEl) {
      robotsEl = document.createElement("meta");
      robotsEl.setAttribute("name", "robots");
      document.head.appendChild(robotsEl);
    }
    robotsEl.setAttribute("content", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    // Canonical: prefix with current locale so each language has its own canonical.
    const locale = getLocaleFromPath(location.pathname);
    const baseUrl = CANONICAL_URL || "";
    const bareSource = canonical ? stripLocale(canonical) : stripLocale(location.pathname);
    const resolvedCanonical = baseUrl + withLocale(bareSource, locale);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", resolvedCanonical);

    setHreflangAlternates(location.pathname);

    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:type", ogType);
    setMeta("og:locale", locale === "nl" ? "nl_NL" : locale === "en" ? "en_GB" : locale === "de" ? "de_DE" : "fr_FR");
    if (resolvedCanonical) setMeta("og:url", resolvedCanonical);
    if (ogImage) setMeta("og:image", ogImage);
    setMeta("og:site_name", "Huurbaasje");

    setMeta("twitter:card", ogImage ? "summary_large_image" : "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (ogImage) setMeta("twitter:image", ogImage);

    // Auto WebPage JSON-LD tied to Organization + WebSite on every route.
    if (!noindex) {
      const orgId = `${baseUrl || "https://www.huurbaasje.nl"}/#organization`;
      const siteId = `${baseUrl || "https://www.huurbaasje.nl"}/#website`;
      setJsonLd("seo-jsonld-webpage", {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${resolvedCanonical}#webpage`,
        url: resolvedCanonical,
        name: title,
        description,
        inLanguage: locale === "nl" ? "nl-NL" : locale === "en" ? "en-GB" : locale === "de" ? "de-DE" : "fr-FR",
        isPartOf: { "@id": siteId },
        about: { "@id": orgId },
        publisher: { "@id": orgId },
        ...(ogImage ? { primaryImageOfPage: { "@type": "ImageObject", url: ogImage } } : {}),
        potentialAction: { "@type": "ReadAction", target: [resolvedCanonical] },
      });
    }
  }, [title, description, canonical, ogImage, ogType, noindex, location.pathname]);


  return null;
};

export default SEOHead;
