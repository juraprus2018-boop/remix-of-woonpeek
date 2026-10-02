# SEO-structuur opschonen: één URL per zoekintentie

## Wat er nu misgaat
- Dezelfde vraag ("huurwoningen Amsterdam") heeft meerdere pagina's: `/huurwoningen/amsterdam`, `/stad/amsterdam`, `/woningen-amsterdam` (oude link in blogs), `/en/huren/amsterdam` (oud pad met taalprefix).
- Typepagina's dubbelen met filterpagina's: `/appartement-huren/amsterdam` vs. `/huurwoningen/amsterdam/appartement`, `/budget-huur/1500/amsterdam` vs. `/huurwoningen/amsterdam/onder-1500`, plus `/aanbod-in/...`.
- Oude URL's worden alleen in de browser doorgestuurd; Google ziet daar een normale pagina (geen echte 301), dus duplicaten blijven bestaan.
- Stadspagina toont "1603 huurwoningen" naast "0 totaal aanbod": twee tellingen uit verschillende queries, waarvan één faalt/te vroeg rendert.
- Elke filtercombinatie is indexeerbaar, ook met 0-3 woningen.

## Doelarchitectuur
```text
/huurwoningen/                         landelijk
/huurwoningen/{stad}/                  hoofdpagina per stad (canoniek)
/huurwoningen/{stad}/{type}/           appartement | huis | studio | kamer
/huurwoningen/{stad}/onder-{prijs}/    1000 | 1250 | 1500 | 2000
/huurwoningen/{stad}/{n}-slaapkamers/  1 | 2 | 3
/koopwoningen/... zelfde patroon
/stad/{stad}/  -> blijft stadsgids/overzicht (markt, buurten), niet "aanbod"
```
Taalversies: `/en/huurwoningen/{stad}/` enz. (zelfde slug, alleen prefix), hreflang onderling.

## Stappen
1. **Redirect-tabel** in `src/lib/routes.ts` uitbreiden: `/appartement-huren/:city[/...]`, `/huis-huren`, `/studio-huren`, `/kamer-huren`, `/budget-huur/:b/:city`, `/aanbod-in/:city/:f`, `/woningen-:city`, `/huren/:city` (ook met `/en|de|fr`) naar de nieuwe paden.
2. **Echte 301's voor Google**: dezelfde tabel genereren naar server-side regels (`public/.htaccess`) en in de `ssr-meta` functie voor crawlers, zodat bots een 301 krijgen i.p.v. een kopie.
3. **Eén filtercomponent**: `FilteredLandingPage` herkent `{type}`, `onder-{prijs}`, `{n}-slaapkamers`; onbekende filters -> 404/redirect naar stadspagina.
4. **Indexeerbaarheidsregel**: filterpagina alleen `index` als er minimaal 6 actieve woningen zijn en het filter op de whitelist staat; anders `noindex,follow` + canonical naar `/huurwoningen/{stad}/`. Combinaties (type + prijs) nooit indexeren.
5. **Canonicals**: trailing slash consequent (kiezen: met slash, zoals je voorstel), lowercase, zonder querystrings; `/stad/{stad}` krijgt eigen intentie (gids) en linkt naar `/huurwoningen/{stad}/`.
6. **Tellingfix**: stadspagina gebruikt één telbron; "0" nooit tonen (volgens bestaande regel lege staat verbergen).
7. **Interne links**: blog-autolinks, footer, mega-menu, PopularCities, sitemap en Google-indexing omzetten naar nieuwe paden.
8. **Sitemap**: alleen indexeerbare URL's (stap 4); oude paden eruit.

## Technische details
- Bestanden: `routes.ts`, `App.tsx`, `FilteredLandingPage.tsx`, `PropertyTypeCityPage.tsx` (wordt redirect), `BudgetLandingPage.tsx` (redirect voor huur/koop-budget), `CityPage.tsx`, `SEOHead.tsx` (trailing slash), `blogAutoLinks.ts`, `generate-sitemap`, `ssr-meta`, `google-indexing`, `.htaccess`.
- Drempel (6 woningen) en prijs-/slaapkamerwhitelist komen in één config in `routes.ts`.
- Publicatie op Lovable-hosting negeert `.htaccess`; daarom draagt `ssr-meta` de 301's voor crawlers. Bezoekers krijgen client-redirect.
- Inkomen-, postcode-, buurt- en toplijstpagina's blijven ongemoeid (andere intentie).

## Vragen vooraf
- Trailing slash: met (`/amsterdam/`) zoals jouw voorbeeld? Standaard in dit plan: ja.
- Mag `/stad/{stad}` blijven als stadsgids, of ook samenvoegen naar `/huurwoningen/{stad}/`? Standaard: blijven als gids.
