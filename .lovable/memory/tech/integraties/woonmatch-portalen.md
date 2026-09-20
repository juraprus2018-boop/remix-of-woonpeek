---
name: Woonmatch portalen import
description: Import van 10 corporatieportalen op hetzelfde Zig/Woonmatch-platform als Wooniezie
type: feature
---

Wooniezie draait op het Zig/Woonmatch-platform. Dezelfde JSON-koppeling werkt op tientallen corporatieportalen:
`https://<host>/portal/object/frontend/getallobjects/format/json?configurationKey=rent` (en `=buy` voor koop).
Detailpagina: `https://<host>/aanbod/<urlKey>`.

Actieve portalen (edge function `zig-portal-import`, config in de function + `src/lib/zigPortals.ts`):
Wonen in de Kop, De Woningzoeker, Thuis bij Antares, Klik voor Wonen, Huren Noord-Veluwe,
Oost West Wonen, OFW, Klik voor Kamers, Thuiskompas, SVNK.

Geblokkeerd ("Not allowed" / 500, IP-filter): parteon.nl, woontij.nl, lekstedewonen.nl.

Werking: per portaal batch-lookup op `source_url` (chunks van 200), nieuwe woningen in batches van 50,
`last_checked_at` bijwerken, inactieve woningen die terugkomen weer op actief, en woningen die 3+ dagen
niet meer in de feed staan op 'inactief' (nooit verwijderen). IndexNow-ping voor nieuwe URLs.

Cron: `zig-portal-import-daily`, 03:15 UTC, body `{"portal":"all"}`, x-cron-secret.
Beheer: /admin/scrapers kaart "Woonmatch portalen" (alles of per portaal importeren).
