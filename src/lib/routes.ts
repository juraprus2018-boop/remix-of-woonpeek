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
  alert: "/woonmelding",
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
  cities: "/woonaanbod-per-stad",
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
    city ? `/huurwoningen/${cityToSlug(city)}/appartement` : "/appartement-huren",
  house: (city?: string, filter?: string) =>
    city ? `/huurwoningen/${cityToSlug(city)}/huis` : "/huis-huren",
  studio: (city?: string, filter?: string) =>
    city ? `/huurwoningen/${cityToSlug(city)}/studio` : "/studio-huren",
  room: (city?: string, filter?: string) =>
    city ? `/huurwoningen/${cityToSlug(city)}/kamer` : "/kamer-huren",
  generic: (city: string, filter: string) => `/huurwoningen/${cityToSlug(city)}/${filter}`,
  neighborhood: (city: string, nb: string) =>
    `/buurt/${cityToSlug(city)}/${cityToSlug(nb)}`,
  rentMonitor: (city: string) => `/markt/${cityToSlug(city)}`,
  postcode: (postcode: string) => `/postcode/${postcode}`,
  budgetRent: (budget: number | string, city: string) =>
    `/huurwoningen/${cityToSlug(city)}/onder-${budget}`,
  budgetBuy: (budget: number | string, city: string) =>
    `/koopwoningen/${cityToSlug(city)}/onder-${budget}`,
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
  { from: "/plekken", to: ROUTES.cities },
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
  { from: "/appartement/:city", to: "/huurwoningen/:city/appartement" },
  { from: "/appartement/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/appartementen/:city", to: "/huurwoningen/:city/appartement" },
  { from: "/appartementen/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/huis/:city", to: "/huurwoningen/:city/huis" },
  { from: "/huis/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/huizen/:city", to: "/huurwoningen/:city/huis" },
  { from: "/huizen/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/studio/:city", to: "/huurwoningen/:city/studio" },
  { from: "/studio/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/studios/:city", to: "/huurwoningen/:city/studio" },
  { from: "/studios/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/kamer/:city", to: "/huurwoningen/:city/kamer" },
  { from: "/kamer/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/kamers/:city", to: "/huurwoningen/:city/kamer" },
  { from: "/kamers/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/woningen/:city/:filter", to: "/huurwoningen/:city/:filter" },
  // Samengevoegd in één structuur (/huurwoningen/{stad}/{filter})
  { from: "/appartement-huren/:city", to: "/huurwoningen/:city/appartement" },
  { from: "/appartement-huren/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/huis-huren/:city", to: "/huurwoningen/:city/huis" },
  { from: "/huis-huren/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/studio-huren/:city", to: "/huurwoningen/:city/studio" },
  { from: "/studio-huren/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/kamer-huren/:city", to: "/huurwoningen/:city/kamer" },
  { from: "/kamer-huren/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/aanbod-in/:city/:filter", to: "/huurwoningen/:city/:filter" },
  { from: "/budget-huur/:budget/:city", to: "/huurwoningen/:city/onder-:budget" },
  { from: "/budget-koop/:budget/:city", to: "/koopwoningen/:city/onder-:budget" },
  { from: "/wijk/:city/:neighborhood", to: "/buurt/:city/:neighborhood" },
  { from: "/huurprijzen/:city", to: "/markt/:city" },
  { from: "/verhuizen-naar-:city", to: "/stadsgids/:city" },
  { from: "/goedkoopste-huurwoningen/:city", to: "/toplijst/:city/goedkoop-huur" },
  { from: "/grootste-huurwoningen/:city", to: "/toplijst/:city/grootste-huur" },
  { from: "/beste-buurten/:city", to: "/toplijst/:city/buurten" },
  { from: "/vergelijk/:city1-vs-:city2", to: "/duel/:city1-vs-:city2" },
  { from: "/alerts/afmelden/:token", to: "/radarmeldingen/uit/:token" },
  { from: "/woningen-postcode-:postcode", to: "/postcode/:postcode" },
  { from: "/huurwoningen-onder-:budget-:city", to: "/huurwoningen/:city/onder-:budget" },
  { from: "/koopwoningen-onder-:budget-:city", to: "/koopwoningen/:city/onder-:budget" },
  { from: "/huur-bij-inkomen-:income-:city", to: "/inkomen/:income/:city" },
];
