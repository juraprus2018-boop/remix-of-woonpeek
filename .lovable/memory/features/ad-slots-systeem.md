---
name: ad-slots-systeem
description: Advertentieplekken tonen automatisch Daisycon-banners van aangesloten aanbieders (AdSense is verwijderd)
type: feature
---
AdSense is uit. `AdSlot` toont nu automatisch Daisycon-banners uit tabel `daisycon_banners` (volledig automatisch, geen handmatige goedkeuring, op verzoek gebruiker).

- Sync: edge function `daisycon-banners-sync` leest `/publishers/{id}/material/ads?media_id=...` (alleen type image/*, programma via `si=` in click_url), cron `daisycon-banners-daily` 05:00 UTC. Niet meer aangeboden banners worden inactief.
- Plaatsing: homepage, stadspagina en zoekresultaten bovenaan en na de zesde woning (brede 970/728x90, mobiel 320x100/50). Woningdetail gebruikt de sidebar (300x250/336x280/250x250). Huurwoningen.nl is standaard de voorkeursaanbieder; op woningdetails gaat de bron van die woning voor wanneer daarvoor een passend formaat bestaat.
- Klik-subid: `ws=woonaanbod-banner`.
