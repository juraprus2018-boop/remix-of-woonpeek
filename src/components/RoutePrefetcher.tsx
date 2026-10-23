import { useEffect } from "react";

/**
 * Prefetcht de chunks van de meest-bezochte routes tijdens browser idle time.
 * Effect: navigatie van home → zoeken/woning voelt instant aan, zonder de
 * initial LCP te raken (we wachten tot na hydratie + idle).
 */
const RoutePrefetcher = () => {
  useEffect(() => {
    let cancelled = false;
    const prefetch = async () => {
      // Importeer (= prefetch) de chunks. Resultaat wordt niet gebruikt;
      // de browser cachet de module zodat <Suspense> direct kan renderen.
      const routes = [
        () => import("@/pages/Search"),
        () => import("@/pages/PropertyDetail"),
        () => import("@/pages/CityPage"),
        () => import("@/pages/ListingTypePage"),
      ];
      for (const load of routes) {
        if (cancelled) return;
        try { await load(); } catch { /* navigation can retry failed preloads */ }
      }
    };

    const ric =
      (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback;
    // Idle can fire before the current lazy route has downloaded. Give that
    // route priority instead of immediately competing with four other pages.
    const id = window.setTimeout(() => {
      if (typeof ric === "function") ric(() => void prefetch(), { timeout: 4000 });
      else void prefetch();
    }, 4000);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  return null;
};

export default RoutePrefetcher;
