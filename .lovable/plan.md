# Plan: Volledige reset + SEO overhaul

## Deel 1 — "Reset alles" knop

**Locatie:** `/admin` dashboard (bovenaan, rood, met dubbele bevestiging).

**Nieuwe edge function `admin-nuke-reset`** (aparte functie, niet de bestaande `admin-reset` uitbreiden — die blijft voor gedeeltelijke resets):

Verwijdert in de juiste volgorde (FK's respecteren):
1. `properties` (ALLES: actief, inactief, verlopen, verhuurd, verkocht)
2. `scraped_properties` + `scraper_logs` + reset `scrapers.properties_found = 0`
3. `blog_posts` (alle)
4. `facebook_group_posts` + `tiktok_posts`
5. `search_queries` + `page_views` + `google_rank_tracking` + `google_indexing_log`
6. `makelaar_leads` + `daily_alert_subscribers` + `search_alerts`
7. `chat_messages` + `conversations` + `neighborhood_reviews` + `property_comments`
8. `favorites` + `missing_cities_log` + `daisycon_clicks` + `admin_sent_emails`

**Behoudt:** `profiles`, `user_roles`, `site_settings`, `ad_slots`, `city_guides`, `city_realtors`, `cbs_stats_cache`, `livability_cache`, `translations_cache`, `extra_cities`, `facebook_groups`, `scrapers` (structuur), `daisycon_feeds`/`_tokens`, storage buckets.

**Frontend:** rode "Reset alles" knop met modal die vereist dat gebruiker het woord `RESET` typt.

## Deel 2 — SEO overhaul

### 2a. Titels & meta descriptions (keyword-first, NL)
Herschrijf per pagina-type met formule `[keyword] [stad/filter] | Huurbaasje`:
- `CityPage` → `Huurwoningen in {Stad} | {N} beschikbaar - Huurbaasje`
- `ListingTypePage` (huren/kopen) → `Huurwoningen {Stad} {Filter} | Direct beschikbaar`
- `PropertyTypeCityPage` (appartement/huis/studio/kamer) → `{Type} huren in {Stad} | {N} woningen`
- `NeighborhoodPage` → `Huurwoningen {Buurt} {Stad} | Actueel aanbod`
- `PropertyDetail` → `{Type} huren aan {Straat}, {Stad} | €{prijs}/mnd`
- `BestOfCityPage`, `BudgetLandingPage`, `IncomeLandingPage`, `PostcodePage`, `NewListingsCity`, `CityGuidePage`, `HuurprijsMonitor` — allemaal met "huurwoningen" + stad in titel.

Meta descriptions: 140-160 chars, actiegericht ("Bekijk {N} huurwoningen in {stad}. Direct contact met verhuurder…").

### 2b. URL slug opschoning
Huidige rare slugs → keyword-rijk (met 301 redirects vanaf oude):
- `/toplijst/:city/goedkoop-huur` → `/goedkoopste-huurwoningen/:city`
- `/toplijst/:city/grootste-huur` → `/grootste-huurwoningen/:city`
- `/toplijst/:city/buurten` → `/beste-buurten-huurwoningen/:city`
- `/aanbod-in/:city/:filter` → `/huurwoningen-:city/:filter`
- `/aanbod/:slug` → behouden (property slugs zijn al goed)
- `/stad/:city` → `/huurwoningen/:city` (belangrijkste — hoofdkeyword in URL)
- `/vandaag/:city` → `/nieuwe-huurwoningen/:city`
- `/markt/:city` → `/huurprijzen-:city`
- `/budget-huur/:budget/:city` → `/huurwoningen-onder-:budget-:city`
- `/inkomen/:income/:city` → `/huurwoningen-inkomen-:income-:city`
- `/buurt/:city/:nb` → `/huurwoningen-:city-:nb`

Beide routes blijven werken via `LEGACY_REDIRECTS`; nieuwe is canonical.

### 2c. JSON-LD uitbreiding
- `RealEstateListing` schema per PropertyDetail (met price, address, geo, image, availability)
- `ItemList` op alle listing-pagina's (CityPage, PropertyTypeCityPage, etc.)
- `Place` + `AggregateOffer` op CityPage (gemiddelde huurprijs range)
- `FAQPage` uitbreiden naar meer landingspagina's
- `LocalBusiness` (RealEstateAgent) sitewide

### 2d. Interne linking + sitemap
- CityPage: bottom-section met links naar alle sub-pagina's van die stad (huren/kopen/appartement/kamer/budget/buurten/toplijsten)
- PropertyDetail: "Meer huurwoningen in {stad}" + "Vergelijkbare woningen in {buurt}"
- Footer: top-10 steden linken naar nieuwe URL-structuur
- `generate-sitemap` edge function: priority 0.9 voor stad-hoofdpagina's, 0.8 voor filters, 0.6 voor toplijsten, weekly changefreq
- Robots.txt: expliciet nieuwe URL-patronen toestaan; oude legacy paden blokkeren (Disallow) om duplicate content te voorkomen na 301's zijn geïndexeerd

### 2e. Extra indexatie-boost
- HTML `<h1>` per pagina bevat exact het hoofdkeyword
- Alt-teksten op images: `{type} te huur in {stad}` i.p.v. leeg
- Prerender-check: bevestig dat React Helmet tags in de HTML komen (evt. via ssr-meta edge function die al bestaat)

## Volgorde uitvoering
1. Migration: nuke-reset edge function + deploy
2. Admin-knop toevoegen
3. Routes toevoegen in `App.tsx` (nieuwe paden werken naast oude)
4. `paths.ts` / `routes.ts` updaten zodat interne links de nieuwe URL genereren
5. `SEOHead` calls per pagina herschrijven
6. JSON-LD componenten uitbreiden
7. Sitemap edge function updaten
8. Robots.txt aanpassen
9. Gebruiker: sitemap opnieuw indienen in Google Search Console + "Vraag om indexering" voor top-10 pagina's

## Technisch
- Reset function: `verify_jwt=false` in config, controleert admin-rol via `has_role` RPC met JWT uit Authorization header (zoals huidige `admin-reset`)
- Redirects: `<Route path="OLD" element={<Navigate to="NEW" replace />} />` naast nieuwe routes
- Alle SEO-teksten hardcoded in NL (default locale), i18n keys voor EN/DE/FR later

## Impact
- Reset knop is destructief maar reversibel is niet nodig (user wil clean slate)
- URL-migratie: bestaande Google-indexatie behoudt waarde via 301 redirects
- Verwachte indexatietijd: 2-6 weken na sitemap-resubmit + Search Console inspect

Bevestig en ik voer alles in één keer uit.
