
# Ombouw naar nieuw merk, nieuwe URL-structuur en nieuw ontwerp

Werknaam: **NewBrand** (placeholder, overal centraal vervangbaar via één constants-bestand). Domein: TBD, canonical blijft relatief totdat domein bekend is.

## 1. Merk & inhoud (centraliseren)

- Nieuw bestand `src/lib/brand.ts` met: `BRAND_NAME`, `BRAND_TAGLINE`, `SUPPORT_EMAIL`, `CANONICAL_HOST` (leeg tot domein bekend).
- Alle hardcoded "WoonPeek", "woonpeek.nl", "info@woonpeek.nl" vervangen door imports uit `brand.ts` (codebase-breed: components, edge functions, emails, OG, sitemap, llms.txt, robots, ai-plugin.json).
- `index.html`, `public/robots.txt`, `public/llms.txt`, `public/llms-full.txt`, `public/ai.txt`, `public/.well-known/ai-plugin.json` opnieuw genereren met placeholders.
- `mem://` core memory updaten: brand, canonical, design.

## 2. Meertaligheid (NL default, +EN/DE/FR)

Stack: `react-i18next` + `i18next-browser-languagedetector`. JSON-bestanden per taal in `src/locales/{nl,en,de,fr}/common.json` + per pagina-namespace.

Routing: taal als eerste URL-segment, NL is default zonder prefix (SEO behoudt huidige NL-paden), andere talen krijgen prefix.

```text
/                         -> NL home
/en/                      -> EN home
/de/                      -> DE home
/fr/                      -> FR home
```

`<html lang>` dynamisch via `react-helmet-async`. Per pagina `<link rel="alternate" hreflang="...">` voor alle 4 talen + `x-default` (NL).

## 3. Nieuwe URL-structuur

Vervangt huidige NL-slugs (`/woningen-{stad}`, `/woning/{slug}`, `/huurwoningen/{stad}`, etc.). Nieuwe semantische, taalonafhankelijke segmenten met vertaalde slugs per locale via een `routeMap`:

```text
NL  /huren/{stad}              EN  /en/rent/{city}        DE  /de/mieten/{stadt}       FR  /fr/louer/{ville}
NL  /kopen/{stad}              EN  /en/buy/{city}         DE  /de/kaufen/{stadt}       FR  /fr/acheter/{ville}
NL  /aanbod/{slug}-{id}        EN  /en/listing/{slug}-{id} DE /de/objekt/{slug}-{id}   FR  /fr/annonce/{slug}-{id}
NL  /steden                    EN  /en/cities             DE  /de/staedte              FR  /fr/villes
NL  /steden/{stad}             EN  /en/cities/{city}      DE  /de/staedte/{stadt}      FR  /fr/villes/{ville}
NL  /steden/{stad}/{wijk}      (idem in andere talen)
NL  /blog, /blog/{slug}        EN  /en/blog/{slug}        DE  /de/blog/{slug}          FR  /fr/blog/{slug}
NL  /makelaars, /makelaar/...  EN  /en/agents/...         DE  /de/makler/...           FR  /fr/agents/...
NL  /alerts                    EN  /en/alerts             DE  /de/benachrichtigungen   FR  /fr/alertes
NL  /inloggen, /registreren    EN  /en/login, /signup     DE  /de/anmelden, /registrieren  FR /fr/connexion, /inscription
NL  /admin/*                   (admin blijft NL, geen meertaligheid)
```

- `slug-id` formaat met numeric id achteraan: snelle lookup, slug puur SEO.
- 301-redirects: edge function of `Navigate` component die oude paden (`/woning/...`, `/woningen-...`, `/huurwoningen/...`, `/koopwoningen/...`, `/appartementen/...`, `/kamers/...`, `/studios/...`) mapt naar nieuwe NL-paden.
- Sitemap-generator splitsen per taal (`sitemap-nl.xml`, `sitemap-en.xml`, ...) plus index `sitemap.xml`.

## 4. Modern minimalistisch ontwerp

Vervangt "Scandinavian Calm forest green" volledig.

- Palette tokens in `src/index.css` (HSL):
  - background: bijna-wit (`0 0% 99%`), foreground: bijna-zwart (`220 15% 12%`)
  - primary: monochroom zwart (`220 15% 12%`), accent: één enkele warme accentkleur (bijv. `25 95% 55%`) spaarzaam ingezet
  - muted/borders: subtiele grijzen
- Typografie: één refined sans (bv. `Geist` of `Manrope`), grote letterspacing op labels, ruime regelhoogte. Hero in ultra-large display weight, body in 400.
- Layout: veel witruimte, 12-koloms grid, asymmetrische hero, kaartcomponenten zonder zware schaduwen (1px borders + subtiele hover lift).
- Micro-interactions met `framer-motion`: fade+slide bij section-enter, hover-scale 1.01 op cards, page transitions.
- Iconen: `lucide-react`, stroke 1.5, gelijke grootte 18px in body.
- Dark mode: native via tokens, niet als ornament.
- Componenten die rebrand vereisen: `Header`, `Footer`, `HeroSection`, `PropertyCard`, `SearchFilters`, `TopAlertBar`, `CitySkyline` (waarschijnlijk vervangen door rustiger pattern), alle home-secties, `SEOHead`, alle email-templates.

## 5. SEO & metadata refactor

- `SEOHead` accepteert taalcode, genereert hreflang voor 4 talen automatisch.
- Per-route titles/descriptions vertaald via i18n keys (`seo.home.title`, `seo.city.title`, ...).
- JSON-LD: `Organization` met nieuwe naam, `BreadcrumbList` met vertaalde labels, `RealEstateListing` blijft per woning.
- Robots/sitemap/llms.txt regenereren met nieuwe paden + alle 4 talen.

## 6. Backend & data (geen breaking changes)

- DB-schema blijft. Slugs in `properties` blijven taalonafhankelijk; vertaalde route-segmenten zitten alleen in frontend route-config.
- Edge functions die URLs bouwen (`og-property`, `og-city`, `generate-sitemap`, `google-indexing`, `post-to-facebook`, alert emails) refactoren om `routeMap` + taal te gebruiken.
- Content (titel, beschrijving woningen) blijft in bron-taal NL. Voor EN/DE/FR pages tonen we NL-content met i18n-UI eromheen (vertaling van listings is buiten scope, wordt expliciet vermeld op pagina).

## 7. Faseplan

1. **Fase 1 (foundation)**: brand-constants, design tokens, fonts, basislayout, i18n-setup met NL+EN, language switcher, hreflang.
2. **Fase 2 (routes)**: nieuwe route-config + routeMap, 301-redirects oude paden, sitemap-update.
3. **Fase 3 (UI redesign)**: home, city, property detail, search, header/footer in nieuw ontwerp.
4. **Fase 4 (talen aanvullen)**: DE + FR vertalingen, edge functions taalbewust, OG-images per taal.
5. **Fase 5 (cleanup)**: oude memories opschonen, README, robots/llms herschrijven, QA per taal.

## Open beslissingen (graag bevestigen)

1. **Werknaam**: voorstel `NewBrand` als placeholder; akkoord of liever iets anders (bv. `Habita`, `Nestly`)?
2. **Listings**: blijven inhoudelijk Nederlands op alle 4 talen, of wil je later AI-vertaling per woning toevoegen?
3. **Admin**: NL-only laten (zoals nu) of ook meertalig?
4. **Accent-kleur**: voorstel warme oranje (`hsl(25 95% 55%)`); akkoord of voorkeur (rood, blauw, groen, paars)?
