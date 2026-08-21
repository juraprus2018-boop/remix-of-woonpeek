---
name: Kleurpalet
description: Huisstijl kleuren Woonaanbod NL: marine primary, secondary blauw, lichtblauw, goud accent
type: design
---

# Kleurpalet (aug 2026)

- Primary / donkerblauw: `#173E63` → hsl 209 62% 24%
- Secondary blauw: `#2F6B9A` → hsl 206 53% 39%
- Lichtblauw (secondary surface): `#EAF2F8` → hsl 206 50% 95%
- Accent / goud: `#E6A23C` → hsl 36 77% 57% (accent-foreground = donkere tekst)
- Lichte achtergrond: `#F7F9FB` → hsl 210 33% 98%
- Donkere tekst: `#17212B` → hsl 210 30% 13%
- Wit: `#FFFFFF`

Regels:
- Goud alleen voor primaire CTA's, actieve nav-links, badges en kleine details. Nooit grote oppervlakken.
- Secundaire buttons: primary blauw met witte tekst.
- Iconen: primary of secondary blauw; goud alleen bij extra nadruk.
- Achtergronden wisselen subtiel tussen wit, `#F7F9FB` en `#EAF2F8`.
- Alles via tokens in `src/index.css` + `tailwind.config.ts` (`brand.blue`, `brand.light`, `brand.gold`). Nooit hardcoded hex in componenten.
