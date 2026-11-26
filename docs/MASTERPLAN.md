# Woonaanbod NL 2.0: audit en implementatieplan

Bijgewerkt: 26 november 2026. Bron: aangeleverd masterplan 2.0 en controle van de werkelijke code, database en lokale server-HTML. Dit document beschrijft de bestaande situatie; alleen expliciet als geverifieerd gemarkeerde onderdelen zijn getest.

## 1. Uitgangspunten

- Bestaande functionaliteit, accounts, productiedata, URLs, affiliatebestemmingen en huisstijl blijven behouden.
- TanStack Start blijft de architectuur. Geen nieuwe router of parallelle applicatie.
- Geen verzonnen woningkenmerken, statistieken, conversies, beoordelingen of urgentie.
- Geen destructieve migraties of grote URL-migraties zonder aparte toestemming.
- Eerst P0 stabiliseren en meten, daarna P1 omzet, P2 organisch bereik, P3 retentie en P4 onderscheid.
- Elke fase wordt bijgewerkt met bestanden, migraties, tests, open punten en acceptatiecriteria.

## 2. Bestaande architectuur en inventaris

### Applicatie

- TanStack Start, React 19, Tailwind CSS 4 en Cloudflare/workerd als serverruntime.
- 431 routebestanden zijn gelezen: 126 Nederlandse niet-API-routebestanden, 303 lokale varianten onder `/en`, `/de` en `/fr`, plus 2 publieke API-routes.
- 132 componenten, 13 bestanden met geautomatiseerde tests en 50 bestaande backendfuncties.
- Serverrendering levert op de gecontroleerde homepage, zoekpagina, woningoverzicht, stadspagina, woningdetail, woningmarkt, blog, pers en tools volledige HTML met hoofdinhoud.
- Er zijn geen `createServerFn`-implementaties; bestaande backendlogica gebruikt directe datadtoegang met RLS en bestaande backendfuncties. Nieuwe app-interne serverlogica moet de TanStack-richtlijnen volgen.
- Browser-only kaarten en PDF-verwerking worden client-side geladen.

### Routefamilies die al bestaan

- Aanbod: homepage, zoeken, kaart, huur/koop, steden, filters, postcodes, buurten, woningtypes en detailpagina's.
- Account: registreren, inloggen, account, favorieten, eigen woningen, zoekalerts, profiel en berichten.
- Makelaars: acquisitie, overzicht, detail, claim, portal, onboarding en feedkoppeling.
- Content: blog, gidsen, verhuispagina's, vergelijkingen, pers en perspublicaties.
- Data: woningmarkt, markt onderwerpen, huurprijsindex, heatmaps en stadscijfers.
- Tools: budgetcheck, huurprijscheck, borg terugvorderen, contractcheck, hypotheek, verhuiskosten en woonlasten op woningpagina's.
- Beheer: woningen, gebruikers, feeds, makelaars, leads, alerts, reacties, blog, pers, social, advertenties, verkeer, ranking en instellingen.
- API: geocoding en nabije voorzieningen via server-side proxies met fallbackbronnen.

### Metadata en URL's

- 15 routebestanden hebben een eigen `head()` en 14 een eigen loader; 77 pagina's/componenten hergebruiken `SEOHead` met React-hoisted tags.
- Alle 12 canonieke woningdetailroutes prefetchen woningdata en maken servermetadata met `propertySeo`.
- Huurhubs en filters delen de actieve-huurdata en metadata uit `citySeoHead`.
- De root bevat alleen sitewide metadata. Oude woning- en stadspaden gebruiken bestaande redirectlogica.
- Sitemaps worden tijdens de build gemaakt uit actieve canonieke woningen, opgesplitst per plaats; alleen stadshubs en filters met voldoende aanbod worden opgenomen.
- Geverifieerd met volledige data: 17.945 actieve woning-URL's in 891 plaatsbestanden, 760 stad/filter-URL's, geen gegenereerde `lastmod`-fallbacks en geldige XML binnen de protocolgrenzen.
- De vaste paginasitemap behoudt bestaande datums waarvan de bron niet vaststaat; de afgeschermde `/plaatsen-start` is verwijderd.

### Database en bestaande entiteiten

Bestaande tabellen dekken onder meer:

- Aanbod en historie: `properties`, `scraped_properties`, `rent_index_snapshots`.
- Gebruikers: `profiles`, `user_roles`, `favorites`, `search_alerts`, `daily_alert_subscribers`.
- Interactie: `property_comments`, `property_reports`, `neighborhood_reviews`, `conversations`, `chat_messages`.
- Makelaars: `agencies`, `agency_claim_requests`, `agency_events`, `makelaar_leads`.
- Affiliate: `daisycon_feeds`, `daisycon_banners`, `daisycon_clicks`, `ad_slots`.
- Content en pers: `blog_posts`, `city_guides`, `press_releases` en publicatielogs.
- Analytics en SEO: `page_views`, `search_queries`, `google_indexing_log`, `google_rank_tracking` en traffic-rollups.
- Marktdata en caches: CBS, livability, voorzieningen en vertalingen.

Belangrijke bestaande databasefuncties: deduplicatie/deactivatie, marktstatistieken, stadstellingen, zoekregistratie, alert- en makelaarfuncties, roltool `has_role`, adres-slugs en cronverificatie.

### Affiliate en analytics

- Bestaande Daisycon-feeds, banners, widgets en uitgaande partnerlinks blijven behouden.
- `daisycon_clicks` registreert woningklikken; woonlasten-links gebruiken een vergelijkbare best-effort registratie.
- Google Analytics wacht op cookie-toestemming; noodzakelijke functionele gegevens en commerciële klikken moeten apart en transparant blijven.
- Commerciële links gebruiken op meerdere plekken `sponsored`; volledige dekking en consistente attributie zijn een P0-controlepunt.
- Er is geen volledige conversie-, commissie- of omzetbron aangetoond. Dashboards mogen daarom geen omzet of conversieratio's verzinnen.

### Geplande taken

Actieve taken bestaan voor feeds, deactivatie, deduplicatie, alerts, favorieten, blogs, stadsgidsen, pers, Search Console, indexering, Facebook, Instagram via Facebook-publicatie, TikTok, geocoding en maandelijkse huurindexsnapshots. `rollup-traffic-hourly` is uitgeschakeld.

Risico: `generate-sitemap-daily` roept nog dagelijks de oude generator aan, terwijl de openbare sitemaps bij de build worden geschreven. Deze taak werkt de statische bestanden niet bij en is kandidaat voor opruiming nadat de publicatieflow is bevestigd.

## 3. P0-bevindingen

| Bevinding | Status | Bewijs / actie |
|---|---|---|
| Homepage, zoeken, overzicht, stad, detail, markt, blog, pers en tools hebben server-HTML | Completed and verified | Lokale HTTP-controle: HTML 86-199 KB, hoofdinhoud aanwezig |
| Gecontroleerde pagina's hebben één titel, H1 en canonical | Completed and verified | Elf representatieve routes in de eerste HTML gecontroleerd |
| Onbekende pagina gaf HTTP 200 met noindex | Completed and verified | Catch-all, stadvalidatie en `/niet-gevonden` geven nu 404; geldige stad/detail blijven 200 |
| Actieve sitemap bevatte veel oude stadspaden en één grote woninglijst | Completed and verified | Buildgenerator per plaats, oude paden verwijderd, 897 XML-bestanden gevalideerd |
| Nieuwe sitemapstructuur staat nog niet op het live domein | Blocked by external dependency | Publicatie is nog niet uitgevoerd |
| Alle affiliateposities hebben dezelfde attributie en disclosure | Requires improvement | Code-audit en kliktests afronden vóór wijzigingen |
| Omzet- en conversiedashboard met echte transacties | Blocked by external dependency | Geen volledige conversie-API/postbackbron aangetoond |
| Alle 431 routes zijn statisch geïnventariseerd | Completed and verified | Bestand, route, head, loader en API-classificatie gelezen |
| Volledige HTTP-controle van alle dynamische en beveiligde routes | Requires improvement | Representatieve openbare routes getest; account/admin vereisen sessies |

## 4. Prioritaire backlog

Statussen: **Already implemented**, **Requires improvement**, **Missing**, **Blocked by external dependency**, **Completed and verified**.

### P0: bestaande bedrijfsvoering beschermen

1. **Completed and verified**: architectuur, routebestanden, databaseschema en geplande taken inventariseren.
2. **Completed and verified**: representatieve server-HTML, metadata, canonicals en sitemapgeneratie controleren.
3. **Requires improvement**: echte 404/410-statussen en soft 404's; geen wijziging aan bestaande waardevolle URLs zonder analyse.
4. **Requires improvement**: affiliateklikken, bestemmingen, sponsored-links en toestemming end-to-end verifiëren.
5. **Requires improvement**: defecte interne links, mobiele kernflows, toegankelijkheid en laadgedrag meten.
6. **Requires improvement**: publicatiecontrole van sitemaps en gewijzigde servermetadata op het eigen domein.

### P1: omzetgroei

1. **Requires improvement**: bestaand beheer uitbreiden met echte klik- en partnerstatistieken; conversievelden pas tonen met een echte bron.
2. **Already implemented / Requires improvement**: woningfeiten, prijsanalyse, vergelijkbare woningen, voorzieningen en totale maandlasten bestaan; kwaliteit en steekproeven verbeteren.
3. **Already implemented**: totale-maandlastencalculator op woningpagina's; aannames en klikmeting toetsen.
4. **Missing**: persoonlijk verhuisdashboard met eigen taken en datum.
5. **Requires improvement**: contextuele commerciële aanbiedingen zonder generieke advertentie-overload.

### P2: organische groei

1. **Requires improvement**: programmatic SEO-kwaliteitsgrenzen en interne links uitbreiden zonder dunne pagina's.
2. **Already implemented / Requires improvement**: stadsdata en marktdata bestaan; deduplicatie en steekproefcommunicatie versterken.
3. **Already implemented / Requires improvement**: perscentrum en publicaties bestaan; downloads en embeds toevoegen.
4. **Missing**: lichte, toegankelijke embeddable charts op gepubliceerde datasets.
5. **Requires improvement**: historische trends op echte snapshots, met methodologieversies.

### P3: retentie

1. **Already implemented / Requires improvement**: account, favorieten en alerts bestaan; één overzichtelijk persoonlijk dashboard samenstellen.
2. **Already implemented / Requires improvement**: prijs- en statusmeldingen bestaan deels; dubbele mails en frequentievoorkeuren verbeteren.
3. **Missing**: handmatige reactiestatussen en bezichtigingen met agenda-export.
4. **Missing**: optioneel huurdersprofiel zonder gevoelige documenten of automatische doorgifte.
5. **Missing**: gebruikersgestuurde actie `Ik heb een woning gevonden` die alerts pauzeert en verhuizing optioneel start.

### P4: onderscheid

1. **Missing**: natuurlijke-taalzoekopdracht naar bestaande gevalideerde filters, met kostenlimieten en niet-AI-fallback.
2. **Requires improvement**: bestaande deduplicatie uitbreiden met betrouwbare matchscores; onzekere matches nooit automatisch samenvoegen.
3. **Missing**: volledige prijs- en levenscyclusgeschiedenis.
4. **Already implemented / Requires improvement**: buurtvoorzieningen, reistijd en Woonmatch bestaan; datakwaliteit en gewichten verbeteren.
5. **Missing**: privacybewust experimentenraamwerk zonder SEO-duplicaten of flicker.

## 5. Mogelijke databasewijzigingen na P0

Geen schema wijzigen tijdens de inventarisatie. Eerst bestaande tabellen hergebruiken.

| Behoefte | Eerste keuze | Complexiteit / afhankelijkheid |
|---|---|---|
| Reacties en bezichtigingen | Nieuwe gebruikersgebonden tabellen alleen als bestaande accountdata onvoldoende is | Gemiddeld; RLS, verwijdering en privacy |
| Verhuizing | Gebruikersprofiel plus eigen taken, geen gevoelige documenten | Gemiddeld; datumlogica en toestemming |
| Notatievoorkeuren | Bestaande alerts uitbreiden waar mogelijk | Gemiddeld; mailverwerking en afmelden |
| Prijshistorie | Alleen echte gewijzigde waarden opslaan | Hoog; importjobs en opslagkosten |
| Canonical deduplicatie | Bestaande deactivatie behouden, matchscores toevoegen | Hoog; geen automatische onzekere merges |
| Affiliateconversies | Alleen na echte postback/API | Geblokkeerd door externe integratie |
| Marktgeschiedenis | Bestaande snapshots uitbreiden | Gemiddeld-hoog; methodologie en opslag |
| Experimenten | Eerst zonder database prototypen via vaste toekenning | Hoog; metingen, consent en stabiliteit |

## 6. Acceptatiecriteria per fase

- **Fase 0/P0**: geen regressie in openbare HTML, accounts, affiliatebestemmingen of bestaande URLs; echte foutstatussen; geldige sitemaps; reproduceerbare tests; geen nieuwe tabellen zonder bewezen behoefte.
- **P1**: elke omzet- of klikgrafiek heeft een aantoonbare bron; woning- en kostencijfers tonen steekproef en aannames; commerciële links zijn gelabeld.
- **P2**: alleen unieke, bruikbare en indexeerbare pagina's; datasets vermelden dekking, periode en methode; geen automatische publicatie zonder validatie.
- **P3**: gebruikers beheren eigen gegevens, alerts en verhuizing; autorisatie wordt server-side afgedwongen; verwijderen en afmelden werken.
- **P4**: AI verzint geen filters of woningen; onbekende wensen blijven expliciet onbekend; gewone zoekfunctie blijft zonder AI werken.

## 7. Verificatie en verslaglegging

Bij elke implementatiefase worden toegevoegd: gewijzigde bestanden, migraties, architectuurkeuzes, tests, browsercontrole, resterende beperkingen en de volgende hoogste waardestap. Niet-geteste of niet-gepubliceerde onderdelen worden niet als live of volledig gepresenteerd.

### Uitgevoerde eerste P0-herstelset op 26 november

- **Completed and verified**: onbekende catch-all- en ongeldige stadspaden geven HTTP 404 in NL, EN, DE en FR; bestaande legacy-redirect blijft voorafgaan aan de 404.
- **Completed and verified**: de woninginteressekaart gebruikt alleen echte totale `views_count`; gesimuleerde kijkers, dagweergaven, reacties en urgentie zijn verwijderd.
- **Completed and verified**: canonieke woning-URL's en sitemaps delen nu dezelfde plaatsaliasnormalisatie voor onder meer Den Haag en Den Bosch.
- **Code hersteld, deployment open**: alertverwerking vereist scheduler, service-role of beheerder; mislukte aflevering of checkpoint-update behoudt opnieuw verwerkbare alerts.
- **Code hersteld, deployment open**: de afbeeldingsproxy volgt redirects niet langer automatisch.
- **Completed and verified**: eigen `page_views`-registratie is uit de trackingflow verwijderd; browser met alleen noodzakelijke cookies verstuurde nul pageviewrequests, affiliatekliksessies en consent-gated Google Analytics blijven behouden.

### Open P0-risico's uit de drie code-audits

- Woninglookup alleen op slug kan bij gelijke adressen een woning uit een andere stad of het verkeerde listingtype kiezen; ontbrekende woningen en backendfouten moeten route-level respectievelijk 404 en een serverfout worden.
- `SEOHead` kan route-eigen canonical/robots na hydration overschrijven; dit vraagt een voor/na-hydration-test en één duidelijke metadata-eigenaar.
- Externe energiewidgets laden scripts zonder gebruikersactivatie; toestemming en downstream opslag moeten in de browser worden vastgesteld voordat gedrag verandert.
- Woonlastenklikken gebruiken een eigen REST-flow en interne of netwerkmarketingbestemmingen; geen bestemming stil wijzigen, maar events en labels eerst harmoniseren.
- Externe afbeeldingen adverteren srcset-varianten zonder echte transformatie; prestatie- en payloadmeting blijft open.
- Resultatencaps, niet-unieke pagineringsvolgorde, accountwisselcaches en beheerstatistieken boven bestaande limieten vereisen afzonderlijke regressietests.
- De oude dagelijkse sitemapcron en niet-gedeployede backendwijzigingen zijn expliciet geen bewezen live verbetering.

### Huidige verificatie

- Gerichte tests voor sitemaps, stadsgrenzen, woningfeiten en echte interesse: 18 tests geslaagd.
- Alle gegenereerde sitemaps gevalideerd met echte actieve data.
- HTTP-matrix: vier soorten niet-bestaande paden geven 404; geldige stad en woningdetail geven 200.
- Buildstatus na de laatste wijzigingen: OK.
- Browsercontrole woningdetail en noodzakelijke cookies: geen misleidende claims, database-pageviews of browserfouten.
- Sessie- en beveiligde beheercontroles plus live publicatie/backenddeployments: nog open.
