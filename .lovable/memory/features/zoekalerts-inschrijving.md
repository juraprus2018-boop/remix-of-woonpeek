---
name: Woningmelding (één alert-product)
description: Eén alert-product: gratis melding bij nieuw aanbod per zoekopdracht, alleen e-mail, geen account
type: feature
---

# Woningmelding

Er is **één** alert-product op de hele site. Belofte overal identiek:
"Nieuwe woning gevonden? Ontvang direct een gratis melding."

- Nooit spreken over "wekelijkse alert", "elke maandag" of "dagelijkse alert".
- Nooit communiceren dat een account nodig is. Alleen e-mailadres.
- Flow: zoeken -> filters instellen -> knop "Ontvang nieuw aanbod voor deze zoekopdracht" -> e-mail invullen.
- Component: `src/components/alerts/SearchAlertCTA.tsx` (gebruikt op /woning-zoeken en woningtype/stad-pagina's).
- Backend: `daily-alert-subscribe` slaat filters op in `daily_alert_subscribers`
  (city optioneel, listing_type, property_type, min_price, max_price, min_rooms, search_label, filter_key).
  Unieke combinatie is (email, filter_key), dus meerdere zoekopdrachten per e-mailadres.
- Verzending: `check-search-alerts` filtert per abonnee op die kolommen; cron job 5 loopt elk uur (20 * * * *).
- `/woonradar` blijft de landingspagina van dit ene product; `/radarmeldingen` is enkel beheer voor ingelogde gebruikers.
