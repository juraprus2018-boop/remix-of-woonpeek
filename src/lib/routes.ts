/**
 * Canonieke URL-structuur voor Woonaanbod NL. Bewust hiërarchisch (slash-based),
 * geen flat dash-style URLs zoals `/woningen-amsterdam`.
 *
 * Wijzig hier 1x om de URL-structuur sitewide te updaten.
 */

import { cityToSlug } from "@/lib/cities";

/** Statische canonieke paden. */
export const ROUTES = {
  home: "/",
  // Zoek + ontdek
  search: "/woning-zoeken",
  map: "/op-kaart",
  newToday: "/vandaag",
  alert: "/woonradar",
  // Account
  login: "/login",
  register: "/aanmelden",
  profile: "/account",
  messages: "/chat",
  favorites: "/opgeslagen",
  myListings: "/mijn-aanbod",
  postStart: "/plaatsen-start",
  postCreate: "/aanbod-toevoegen",
  alerts: "/radarmeldingen",
  // Content
  faq: "/vragen",
  about: "/over",
  cities: "/plekken",
  // Tools
  budget: "/budgetcheck",
  quiz: "/woonkompas",
  energy: "/energie",
  marketData: "/woningmarkt",
  // B2B
  partner: "/samenwerken",
  // Legal
  terms: "/voorwaarden",
  privacy: "/privacy",
  disclaimer: "/disclaimer",
  notFound: "/niet-gevonden",
} as const;

/** Dynamische path-builders. Gebruik deze i.p.v. template-strings. */
export const paths = {
  property: (slug: string) => `/aanbod/${slug}`,
  propertyEdit: (id: string) => `/aanbod/${id}/bewerken`,
  city: (city: string) => `/stad/${cityToSlug(city)}`,
  newTodayCity: (city: string) => `/vandaag/${cityToSlug(city)}`,
  rent: (city?: string, filter?: string) =>
    `/huurwoningen${city ? `/${cityToSlug(city)}` : ""}${filter ? `/${filter}` : ""}`,
  buy: (city?: string, filter?: string) =>
    `/koopwoningen${city ? `/${cityToSlug(city)}` : ""}${filter ? `/${filter}` : ""}`,
  apartment: (city?: string, filter?: string) =>
    `/appartement-huren${city ? `/${cityToSlug(city)}` : ""}${filter ? `/${filter}` : ""}`,
  house: (city?: string, filter?: string) =>
    `/huis-huren${city ? `/${cityToSlug(city)}` : ""}${filter ? `/${filter}` : ""}`,
  studio: (city?: string, filter?: string) =>
    `/studio-huren${city ? `/${cityToSlug(city)}` : ""}${filter ? `/${filter}` : ""}`,
  room: (city?: string, filter?: string) =>
    `/kamer-huren${city ? `/${cityToSlug(city)}` : ""}${filter ? `/${filter}` : ""}`,
  generic: (city: string, filter: string) => `/aanbod-in/${cityToSlug(city)}/${filter}`,
  neighborhood: (city: string, nb: string) =>
    `/buurt/${cityToSlug(city)}/${cityToSlug(nb)}`,
  rentMonitor: (city: string) => `/markt/${cityToSlug(city)}`,
  postcode: (postcode: string) => `/postcode/${postcode}`,
  budgetRent: (budget: number | string, city: string) =>
    `/budget-huur/${budget}/${cityToSlug(city)}`,
  budgetBuy: (budget: number | string, city: string) =>
    `/budget-koop/${budget}/${cityToSlug(city)}`,
  income: (income: number | string, city: string) =>
    `/inkomen/${income}/${cityToSlug(city)}`,
  cityGuide: (city: string) => `/stadsgids/${cityToSlug(city)}`,
  cheapest: (city: string) => `/toplijst/${cityToSlug(city)}/goedkoop-huur`,
  largest: (city: string) => `/toplijst/${cityToSlug(city)}/grootste-huur`,
  bestNeighborhoods: (city: string) => `/toplijst/${cityToSlug(city)}/buurten`,
  cityCompare: (a: string, b: string) =>
    `/duel/${cityToSlug(a)}-vs-${cityToSlug(b)}`,
  alertUnsubscribe: (token: string) => `/radarmeldingen/uit/${token}`,
};

/**
 * Old → new redirect map. Geconsumeerd door App.tsx om elke oude
 * flat-style URL hard naar de nieuwe canonieke variant te sturen.
 *
 * Routes mét params gebruiken React Router's `:param` syntax; de redirect
 * preserveert ze via een wildcard `Navigate` (zie App.tsx).
 */
export const LEGACY_REDIRECTS: Array<{ from: string; to: string }> = [
  // Statisch
  { from: "/zoeken", to: ROUTES.search },
  { from: "/verkennen", to: ROUTES.map },
  { from: "/kaart", to: ROUTES.map },
  { from: "/nieuw-aanbod", to: ROUTES.newToday },
  { from: "/dagelijkse-alert", to: ROUTES.alert },
  { from: "/inloggen", to: ROUTES.login },
  { from: "/registreren", to: ROUTES.register },
  { from: "/profiel", to: ROUTES.profile },
  { from: "/berichten", to: ROUTES.messages },
  { from: "/favorieten", to: ROUTES.favorites },
  { from: "/mijn-woningen", to: ROUTES.myListings },
  { from: "/woning-plaatsen", to: ROUTES.postStart },
  { from: "/plaatsen", to: ROUTES.postCreate },
  { from: "/zoekalerts", to: ROUTES.alerts },
  { from: "/veelgestelde-vragen", to: ROUTES.faq },
  { from: "/over-woonaanbod-nl", to: ROUTES.about },
  { from: "/steden", to: ROUTES.cities },
  { from: "/budget-tool", to: ROUTES.budget },
  { from: "/woonquiz", to: ROUTES.quiz },
  { from: "/energie-vergelijken", to: ROUTES.energy },
  { from: "/samenwerking", to: ROUTES.partner },
  { from: "/huren", to: "/huurwoningen" },
  { from: "/kopen", to: "/koopwoningen" },
  { from: "/appartement", to: "/appartement-huren" },
  { from: "/appartementen", to: "/appartement-huren" },
  { from: "/huis", to: "/huis-huren" },
  { from: "/huizen", to: "/huis-huren" },
  { from: "/studio", to: "/studio-huren" },
  { from: "/studios", to: "/studio-huren" },
  { from: "/kamer", to: "/kamer-huren" },
  { from: "/kamers", to: "/kamer-huren" },
  // Met param(s) — wildcard, server-side onmogelijk maar redirect via component
  { from: "/woning/:slug", to: "/aanbod/:slug" },
  { from: "/woning/:id/bewerken", to: "/aanbod/:id/bewerken" },
  { from: "/nieuw-aanbod/:city", to: "/vandaag/:city" },
  { from: "/huren/:city", to: "/huurwoningen/:city" },
  { from: "/huren/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/kopen/:city", to: "/koopwoningen/:city" },
  { from: "/kopen/:city/:filter", to: "/koopwoningen/:city/:filter" },
  { from: "/appartement/:city", to: "/appartement-huren/:city" },
  { from: "/appartement/:city/:filter", to: "/appartement-huren/:city/:filter" },
  { from: "/appartementen/:city", to: "/appartement-huren/:city" },
  { from: "/appartementen/:city/:filter", to: "/appartement-huren/:city/:filter" },
  { from: "/huis/:city", to: "/huis-huren/:city" },
  { from: "/huis/:city/:filter", to: "/huis-huren/:city/:filter" },
  { from: "/huizen/:city", to: "/huis-huren/:city" },
  { from: "/huizen/:city/:filter", to: "/huis-huren/:city/:filter" },
  { from: "/studio/:city", to: "/studio-huren/:city" },
  { from: "/studio/:city/:filter", to: "/studio-huren/:city/:filter" },
  { from: "/studios/:city", to: "/studio-huren/:city" },
  { from: "/studios/:city/:filter", to: "/studio-huren/:city/:filter" },
  { from: "/kamer/:city", to: "/kamer-huren/:city" },
  { from: "/kamer/:city/:filter", to: "/kamer-huren/:city/:filter" },
  { from: "/kamers/:city", to: "/kamer-huren/:city" },
  { from: "/kamers/:city/:filter", to: "/kamer-huren/:city/:filter" },
  { from: "/woningen/:city/:filter", to: "/aanbod-in/:city/:filter" },
  { from: "/wijk/:city/:neighborhood", to: "/buurt/:city/:neighborhood" },
  { from: "/huurprijzen/:city", to: "/markt/:city" },
  { from: "/verhuizen-naar-:city", to: "/stadsgids/:city" },
  { from: "/goedkoopste-huurwoningen/:city", to: "/toplijst/:city/goedkoop-huur" },
  { from: "/grootste-huurwoningen/:city", to: "/toplijst/:city/grootste-huur" },
  { from: "/beste-buurten/:city", to: "/toplijst/:city/buurten" },
  { from: "/vergelijk/:city1-vs-:city2", to: "/duel/:city1-vs-:city2" },
  { from: "/alerts/afmelden/:token", to: "/radarmeldingen/uit/:token" },
  { from: "/woningen-postcode-:postcode", to: "/postcode/:postcode" },
  { from: "/huurwoningen-onder-:budget-:city", to: "/budget-huur/:budget/:city" },
  { from: "/koopwoningen-onder-:budget-:city", to: "/budget-koop/:budget/:city" },
  { from: "/huur-bij-inkomen-:income-:city", to: "/inkomen/:income/:city" },
];
