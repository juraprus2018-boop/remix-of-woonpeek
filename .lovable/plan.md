# Makelaar Portal v1 (gratis)

Flow: **Aanmelden → bedrijfsprofiel → feed koppelen → klaar.**

## 1. Funnel-pagina `/voor-makelaars`
- Grote kop: "Plaats je woningaanbod gratis op Woonaanbod NL" + knop "Plaats je woningaanbod gratis".
- Live cijfers uit de database (aantal actieve woningen, steden, bezoekers per maand) in plaats van een vaste "11.000+".
- Voordelen: gratis koppeling, automatische dagelijkse synchronisatie, extra bereik, geen abonnement.
- Uitleg in 3 stappen, ondersteunde koppelingen, FAQ, en een link vanaf `/samenwerken`, footer en het menu.

## 2. Aanmelden en profiel
- Makelaar maakt een account (e-mail + wachtwoord, gewoon het bestaande inloggen) en vult daarna een wizard in: kantoornaam, plaats, website, telefoon, e-mail, omschrijving, logo-upload.
- Profiel staat direct live; jij kunt in admin een makelaar verbergen als er misbruik is.

## 3. Feed koppelen
- Keuze: **XML-feed URL**, **JSON-feed URL**, **Realworks-export (XML)** of **handmatig toevoegen**.
- Knop "Test feed": haalt de feed op en toont hoeveel woningen herkend zijn plus 3 voorbeelden, voordat hij wordt opgeslagen.
- Bestaande feed-import wordt uitgebreid: draait dagelijks voor alle gekoppelde makelaars, koppelt woningen aan de makelaar, zet verdwenen woningen op inactief (nooit verwijderen), en meldt nieuwe woningen bij Google/Bing.
- Realworks heeft een eigen exportformaat; v1 ondersteunt hun standaard XML-export via URL. Een directe Realworks-API-koppeling vereist een partnerovereenkomst met Realworks en valt buiten v1.

## 4. Publieke makelaarpagina `/makelaars/{naam}`
- Logo, omschrijving, plaats, website (met klikmeting), contact en actueel aanbod in de vaste woningkaarten.
- Overzicht `/makelaars` met alle aangesloten makelaars. Rijke resultaten (RealEstateAgent) voor Google, opgenomen in de sitemap.
- Woningpagina's van een aangesloten makelaar tonen "Aangeboden door [makelaar]" met link naar het profiel.
- De bestaande `/makelaar/{naam}` (Google-gegevens van makelaars per stad) blijft; aangesloten makelaars krijgen voorrang.

## 5. Dashboard `/makelaar-portal`
- Kaarten: actieve woningen, vertoningen (30 dagen), clicks naar de makelaar, reacties/leads, feedstatus (laatste sync, aantal, fouten).
- Woningenlijst met toevoegen (bestaande 4-staps wizard), bewerken en "offline halen" (inactief).
- Bedrijfsprofiel bewerken, feed wijzigen en opnieuw testen.

## 6. Admin
- Lijst van aangesloten makelaars met feedstatus, aantal woningen, verbergen/tonen.

## Technische details
- Nieuwe tabellen: `agencies` (profiel, slug, owner_user_id, feed_type, feed_url, feed status/velden, is_visible), `agency_events` (view/click/lead per agency + property). GRANTs + RLS: eigenaar beheert eigen agency; publiek leest zichtbare agencies; events via een beveiligde functie insert-only.
- `properties.agency_id` (nullable) om aanbod aan een makelaar te koppelen; RLS laat eigenaar eigen woningen beheren.
- Rol `makelaar` niet in profiles maar via eigendom van `agencies` (owner_user_id), dus geen extra rolrechten nodig.
- Logo's in bestaande `property-images` bucket onder `agencies/{user_id}/`.
- Edge functions: `agency-feed-test` (ophalen + parsen, alleen eigenaar), `agency-feed-import` (dagelijkse cron, XML/JSON/Realworks-parser, insert met fallback, IndexNow).
- Vertoningen = paginaweergaven van makelaarprofiel + woningdetail; clicks = website/telefoon/"bekijk bij makelaar"; leads = bestaande reactie-/contactformulieren op hun woningen.
- Routes `/voor-makelaars`, `/makelaars`, `/makelaars/:slug`, `/makelaar-portal`; `/samenwerken` linkt naar de funnel.

## Vragen vooraf
- Moet een nieuwe makelaar direct live staan (standaard in dit plan), of wil je elke aanmelding eerst zelf goedkeuren?
