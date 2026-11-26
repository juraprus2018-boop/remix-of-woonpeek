import { useEffect, useMemo, Suspense, type ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  redirect,
  useRouter,
  useRouterState,
  Link,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { I18nextProvider } from "react-i18next";

import appCss from "../styles.css?url";
import i18n from "@/lib/i18n";
import { getLocaleFromPath } from "@/lib/locale";
import { resolveLegacyRedirect } from "@/lib/legacyRedirects";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import LocaleSync from "@/components/LocaleSync";
import AutoTranslator from "@/components/AutoTranslator";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import CookieConsent from "@/components/CookieConsent";
import NotFound from "@/pages/NotFound";
import { usePageTracking } from "@/hooks/usePageTracking";

const SITE = "https://www.woonaanbod-nl.nl";
const SOCIAL_IMAGE = `${SITE}/__l5e/assets-v1/eccc510f-e568-4c8e-8034-7e47e01786fd/woonaanbod-social.png`;
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap";

const jsonLd = (data: unknown) => ({ type: "application/ld+json", children: JSON.stringify(data) });

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  name: "Woonaanbod NL",
  alternateName: ["Woonaanbod NL", "woonaanbod-nl.nl"],
  url: SITE,
  description: "Woningplatform voor huur- en koopwoningen in Nederland",
  inLanguage: ["nl-NL", "en-GB", "de-DE", "fr-FR"],
  publisher: { "@id": `${SITE}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE}/zoeken?locatie={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "Woonaanbod NL",
  url: SITE,
  logo: `${SITE}/favicon.png`,
  image: SOCIAL_IMAGE,
  description: "Gratis woningplatform voor huur- en koopwoningen in heel Nederland.",
  email: "info@woonaanbod-nl.nl",
  areaServed: { "@type": "Country", name: "Netherlands" },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@woonaanbod-nl.nl",
    contactType: "customer support",
    availableLanguage: ["Dutch", "English", "German", "French"],
  },
  sameAs: [
    "https://www.facebook.com/profile.php?id=61593864421175",
    "https://www.instagram.com/woonaanbodnl",
    "https://www.linkedin.com/company/woonaanbod-nl/",
    "https://www.tiktok.com/@woonaanbod",
    "https://x.com/woonaanbodnl",
  ],
};
const WEBAPP_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE}/#webapp`,
  name: "Woonaanbod NL",
  url: SITE,
  applicationCategory: "RealEstateApplication",
  operatingSystem: "Web",
  inLanguage: ["nl-NL", "en-GB", "de-DE", "fr-FR"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    description: "Gratis zoeken, gratis dagelijkse alerts, gratis woning plaatsen",
  },
  featureList: [
    "Dagelijks bijgewerkt huur- en koopaanbod",
    "Gratis e-mail alerts",
    "Zoeken op stad, postcode, prijs en kamers",
    "Interactieve kaart",
    "Inkomensgebaseerde huurmaximumcheck",
    "Hypotheek- en budgetcalculator",
  ],
};
const SERVICE_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE}/#service`,
  serviceType: "Woningplatform en woningzoekservice",
  provider: { "@id": `${SITE}/#organization` },
  areaServed: { "@type": "Country", name: "Nederland" },
  audience: { "@type": "Audience", audienceType: "Woningzoekers en verhuurders in Nederland" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Woningaanbod Nederland",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Huurwoningen zoeken" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Koopwoningen zoeken" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Dagelijkse woningalerts" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Woning plaatsen voor verhuurders" } },
    ],
  },
};

// Forceer www-variant (was an inline script in index.html).
const WWW_REDIRECT = `(function(){var h=window.location.hostname;if(h==="woonaanbod-nl.nl"){window.location.replace("https://www.woonaanbod-nl.nl"+window.location.pathname+window.location.search+window.location.hash);}})();`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }): void => {
    const search = location.searchStr ?? "";
    const target = resolveLegacyRedirect(location.pathname, search);
    if (target) {
      throw redirect({ href: target, replace: true, statusCode: 301 });
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Woonaanbod NL – Huurwoningen & Koophuizen in Nederland" },
      {
        name: "description",
        content:
          "Vind huurwoningen en koophuizen in Eindhoven, Rotterdam, Amsterdam en meer. Woonaanbod NL – het woningplatform voor heel Nederland.",
      },
      { name: "author", content: "Woonaanbod NL" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#14213D" },
      { property: "og:title", content: "Woonaanbod NL – Huurwoningen & Koophuizen in Nederland" },
      {
        property: "og:description",
        content:
          "Zoek tussen duizenden huurwoningen en koophuizen in heel Nederland. Woonaanbod NL – snel, eenvoudig en betrouwbaar.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SOCIAL_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "nl_NL" },
      { property: "og:site_name", content: "Woonaanbod NL" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Woonaanbod NL – Huurwoningen & Koophuizen" },
      {
        name: "twitter:description",
        content: "Vind jouw droomwoning op Woonaanbod NL. Huurwoningen en koophuizen in heel Nederland.",
      },
      { name: "twitter:image", content: SOCIAL_IMAGE },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://kppotnzwhxkflceiscto.supabase.co", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://images.weserv.nl", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONT_CSS },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/favicon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "help", type: "text/plain", href: "/llms.txt", title: "LLM-friendly site description" },
      { rel: "help", type: "text/plain", href: "/llms-full.txt", title: "LLM-friendly full site description" },
      { rel: "alternate", type: "text/plain", href: "/ai.txt", title: "AI information" },
      { rel: "alternate", type: "application/json", href: "/.well-known/ai-plugin.json", title: "AI plugin manifest" },
    ],
    scripts: [
      { children: WWW_REDIRECT },
      jsonLd(WEBSITE_LD),
      jsonLd(ORGANIZATION_LD),
      jsonLd(WEBAPP_LD),
      jsonLd(SERVICE_LD),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <html lang={getLocaleFromPath(pathname)} data-brand="woonaanbod-nl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Laden" />
  </div>
);

const RouterSideEffects = () => {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <LocaleSync />
      <AutoTranslator />
      <RoutePrefetcher />
    </>
  );
};

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const locale = getLocaleFromPath(pathname);
  // Server: one i18n instance per render so concurrent requests never share a language.
  const i18nInstance = useMemo(() => {
    if (typeof window !== "undefined") return i18n;
    const clone = i18n.cloneInstance({ lng: locale });
    void clone.changeLanguage(locale);
    return clone;
  }, [locale]);

  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18nInstance}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <RouterSideEffects />
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
              <CookieConsent />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}

function RootError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">This page didn't load</h1>
        <p className="text-muted-foreground">Er ging iets mis bij het laden van deze pagina. Probeer het opnieuw.</p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <Link to="/" className="rounded-lg border border-border px-4 py-2 text-foreground">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
