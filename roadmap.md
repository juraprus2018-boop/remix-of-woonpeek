# Kaartpagina
- [x] SEO-buildherstel: manifest alleen naar dist, taal-woningkopieën beperkt, 34 tests geslaagd en automatische build OK. Lokale postbuild-uitvoer: 16.482 sitemapbestanden en zeven gevraagde routes gecontroleerd; homepage lokaal aangevuld voor controle, geen handmatige volledige Vite-productiebuild uitgevoerd. Niet gepubliceerd.
- [ ] Statische index/noindex-bestanden en sitemapdrempels afronden vanuit één snapshot, stadsaliassen samenvoegen, llms.txt en tests controleren; niet publiceren of deployen.
- [x] Plaatskopieën en alle /stad-gidsen uitgesloten in generatorbron en gedeelde postbuild-repair; public/dist XML gecontroleerd zonder deze paden. Noindex en canonical bij 6 actieve huurwoningen gecontroleerd op Eindhoven en Swalmen; 25 tests geslaagd. 219 huurprerenderbestanden behouden, Eindhoven toont echte woningen. Niet gepubliceerd of gedeployed; live wijzigingen wachten op publicatie.
- [x] Huurstad-noindex tijdens laden gecorrigeerd; Eindhoven met vertraagde query gecontroleerd. Huurprijs-index gebruikt complete exact-stadsbron; 0-sample met €1.743 gereproduceerd en afgeschermd (geen prijzen, geen grafiekpunt, noindex).
- [x] Sitemapgeneratorbron en public/dist XML gecorrigeerd: geen inkomen, alleen nl/x-default, 219 huurhubs en filters vanaf 6 actieve woningen; hubs krijgen datum van dezelfde HTML-snapshot. Geen extra index.html-paden; geen publicatie of function-deploy, live XML dus nog ongewijzigd.
- [x] llms.txt top 15 huursteden uit dezelfde snapshot toegevoegd; aantallen, gemiddelden, steekproeven, datum en canonicals gecontroleerd. 17 tests geslaagd; React gecontroleerd zonder runtimefouten. Bestaande postbuild behouden.
- [x] Postbuild voor crawlbare huur-stadshubs toegevoegd; 219 bestanden uit 15.751 actieve huuradvertenties lokaal gegenereerd met huidige live-productieshell (geen handmatige Vite-build). Eindhoven-title, eigen canonical, één H1, 10 echte links en behouden SPA-script gecontroleerd; 12 tests en React/no-JavaScript-controle geslaagd. Sitemap ongewijzigd; niet gepubliceerd en hosting na publicatie nog niet geverifieerd.
- [x] Budgetoverdracht hersteld; tien tests geslaagd en echte Amsterdam-resultaten tussen €750 en €1.000 bevestigd, ook na verversen. Niet gepubliceerd.
- [x] Facebook-woninglinks vervangen door bestaande affiliate-links in berichten, video's en groepskopieën; 14 tests geslaagd, inclusief echte Huurzone-feedlink met media-ID 418821, postfunctie uitgerold. Geen nieuw Facebook-bericht geplaatst; groepskopie niet via account getest omdat eigen accountcontrole geen passende gebruiker vond. Bestaande Facebook-berichten blijven ongewijzigd.
- [x] Open SEO-melding gecontroleerd: woningtype gelijkgetrokken, absolute HTTPS-afbeeldingen gedeeld gevalideerd, dubbele Twitter-tags verwijderd; acht tests en echte woningpagina geslaagd, previewfuncties gedeployed.
- [ ] Unieke deelvoorbeelden voor alle niet-JavaScript-crawlers. Blokker: huidige hosting serveert dezelfde SPA-HTML op alle routes; bestaande .htaccess-regels worden niet uitgevoerd. Volledige serverweergave vereist een afzonderlijke template-upgrade; samengestelde SEO-melding blijft open.
- [x] Aanbieders per ronde afwisselen (Huurwoningen.nl, Huurzone.nl, RentHunter, overige) en alle partnerbanners willekeurig tonen; elf tests geslaagd, zoekpagina en unieke vervolgpagina gecontroleerd; niet gepubliceerd.
- [x] Zoekpagina-laadvertraging onderzocht: niet blijvend reproduceerbaar; kaartuitstel en vertraagde sequentiële prefetch toegevoegd. Eerste resultaten, Den Haag, kaart en woningopening gecontroleerd; niet gepubliceerd.
- [x] Alleen Huurwoningen.nl-wisselbanners tonen, hun woningen eerst zetten en inlog-/accountpartnerlinks aanpassen: vijf tests geslaagd, echte accountklik gecontroleerd en databasevolgorde bevestigd; niet gepubliceerd.
- [x] Kaartverzoeken samenvoegen en snelheid controleren: één kaartverzoek in plaats van vijftien; filters en sorteren hergebruiken kaartgegevens; 20.646 markers zonder oude limiet; tests en browsercontrole geslaagd.
- [x] Oud Renthunter-aanbod inactief maken en directe CSV dagelijks importeren met Nederlandse titels en verwijzingslinks.
- [x] Renthunter-import en woningpagina controleren: 9.846 actieve directe woningen, geen oude actieve links, zes tests geslaagd en echte verwijzingsknop gecontroleerd.
- [x] Bestaande Facebook-video gepubliceerd: Facebook bevestigt ready, complete en published; Reel-link beschikbaar.
- [x] Dagelijkse videostatus en bescherming tegen dubbele posts toevoegen; twee controles per dag ingesteld.
- [ ] Dagelijkse videoproductie activeren. Blokker: huidige Shotstack-sleutel wordt door Production API geweigerd; productietoegang en eventuele kosten vereisen akkoord.
- [x] Belangrijkste stadspagina’s verrijken met actuele huurdata, geverifieerde lokale informatie en aanbodlinks.
- [x] Cijfers, aanbodlinks en weergave van stadspagina’s testen zonder te publiceren.
- [x] Nieuw uitgebreid blogartikel en perspublicatie maken met gecontroleerde aanbodcijfers en beeld.
- [x] Beide publicaties opslaan en via de website controleren.
- [x] Laadstatus tonen totdat de benodigde resultaten beschikbaar zijn.
- [x] Plaatsen beperken tot kaartgebied of postcodestraal.
- [x] Bronnen zonder aanbod verbergen en de werking controleren.

# Nieuwe huisstijl
- [x] Aangeleverde logo's, favicon en app-iconen verwerken.
- [x] Kleuren en Sora toepassen zonder pagina-indeling of functionaliteit te wijzigen.
- [x] Website en logo's controleren; niet publiceren.

# Woningmails
- [x] Eigen huisstijl, originele onderwerpregels en compacte woningselectie toepassen.
- [x] Afmeldlinks behouden, voorbeeld controleren en mailfunctie bijwerken.- [x] Relatieve publicatielabels (Vandaag online, reageer snel)
- [x] Reageer-urgentie op woningpagina
- [ ] Internet & TV vergelijker (wacht op Daisycon-code)
- [x] SEO huurtoeslag/vrije sector pagina's
