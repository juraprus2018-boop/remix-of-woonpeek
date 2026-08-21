---
name: Woningmarkt Data Hub
description: /woningmarkt publiceert eigen first-party marktcijfers (huur per m2, nieuw aanbod, prijsklassen) uit market_stats() met Dataset + FAQPage JSON-LD
type: feature
---

# Woningmarkt Data Hub

Doel: unieke, niet-generieke content voor Google AI-resultaten en LLM's. Geen "10 tips"-artikelen maar eigen woningmarktdata uit het live aanbod.

- Route: `/woningmarkt` (`src/pages/MarketData.tsx`), hook `src/hooks/useMarketStats.ts`, RPC `public.market_stats()`.
- Cijfers: landelijke KPI's + tabellen per stad: huurprijs per m2, nieuw aanbod laatste 7 dagen, huur onder EUR 1.500, koop onder EUR 400.000, gemiddelde/mediane huur- en vraagprijs.
- Filters in de RPC: huur EUR 200-10.000, koop EUR 50.000-5.000.000, m2 tussen 10 en 500, minimum aantal woningen per stad.
- JSON-LD: `Dataset` (met variableMeasured) + `FAQPage` met live cijfers in de antwoorden. Injecteren via `useEffect` in de head.
- Build-time: `marketDataPlugin` in `vite.config.ts` schrijft `public/marktdata.json` (machine-leesbaar, CC BY 4.0, met bronvermelding). Ook vermeld in `public/llms.txt`.
- Links: footer, statische homepage-HTML (prerender-plugin) en sitemap (priority 0.9, daily).

Regel: cijfers altijd presenteren als momentopname van het aanbod, niet als transactieprijsindex, met methode-uitleg en bronvermelding.
