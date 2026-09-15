# Plan: blog-automatisering weer aan de praat

## Wat ik heb gecontroleerd

- De automatische taak bestaat en staat aan: hij draait elke 3 dagen om 05:00 UTC en is de laatste keer op 13 september gestart (alle starts sinds augustus zijn gelukt).
- De blogtabel is nu helemaal leeg: 0 artikelen, ook geen concepten. Dus de taak start wel, maar er komt geen artikel uit (of alles is bij de grote reset weggegooid).
- Waarom het artikel niet wordt aangemaakt is nog niet bewezen: de logboeken van de generator zijn niet meer beschikbaar. Mogelijke oorzaken: de AI-sleutel ontbreekt, de AI gaf geen geldig antwoord, of er werd geen beheerder als auteur gevonden.

Eerste stap van de uitvoering is dus meten, niet gokken.

## Stap 1 — Handmatig testen en de echte oorzaak vaststellen

De generator één keer handmatig starten en het volledige antwoord bekijken. Daarmee weten we precies welke van de bovenstaande oorzaken speelt, en die los ik dan op.

## Stap 2 — Zichtbaar maken in de beheeromgeving

Op de blogpagina in het beheer komt:
- Een knop "Nu artikel genereren", zodat je nooit meer hoeft te wachten op de automatische ronde.
- Een klein statusblok: wanneer de laatste automatische ronde liep, of die lukte, en bij een fout de reden in gewone taal.

## Stap 3 — Robuuster maken

- Mislukt de AI-aanvraag, dan opnieuw proberen (paar keer, met pauze) in plaats van stil stoppen.
- Elke ronde wegschrijven in een logboekje, zodat een stille mislukking niet meer onopgemerkt blijft.
- Auteur: als er geen beheerder gevonden wordt, terugvallen op de hoofdbeheerder in plaats van afbreken.

## Stap 4 — Inhaalronde

Direct 2 tot 3 artikelen laten genereren zodat de blog niet leeg staat, en daarna loopt het ritme van elke 3 dagen weer normaal door.

## Technisch

- Cron-taak `generate-blog-post-3days` (`0 5 */3 * *`) blijft ongewijzigd; alleen de functie zelf wordt aangepast.
- Nieuwe tabel `blog_generation_log` (tijdstip, status, foutmelding, slug) met RLS: alleen admins lezen, `service_role` schrijft, plus GRANTs.
- Retry met exponentiële backoff rond de AI Gateway-call; auteur-fallback op de admin-rol uit `user_roles`.
- Beheerknop roept de functie aan via `supabase.functions.invoke` met de sessie-JWT (`requireAdmin` blijft gelden).

## Wat dit oplevert

Een blog die zichzelf elke 3 dagen vult, met een knop om zelf een artikel te maken en duidelijke terugkoppeling wanneer iets misgaat.
