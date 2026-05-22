import { useEffect } from "react";

/**
 * Prefetcht de chunks van de meest-bezochte routes tijdens browser idle time.
 * Effect: navigatie van home → zoeken/woning voelt instant aan, zonder de
 * initial LCP te raken (we wachten tot na hydratie + idle).
 */
const RoutePrefetcher = () => {
  useEffect(() => {
    const prefetch = () => {
      // Importeer (= prefetch) de chunks. Resultaat wordt niet gebruikt;
      // de browser cachet de module zodat <Suspense> direct kan renderen.
      void import("@/pages/Search");
      void import("@/pages/PropertyDetail");
      void import("@/pages/CityPage");
      void import("@/pages/ListingTypePage");
    };

    const ric =
      (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback;
    if (typeof ric === "function") {
      ric(prefetch, { timeout: 4000 });
    } else {
      const id = window.setTimeout(prefetch, 2500);
      return () => window.clearTimeout(id);
    }
  }, []);

  return null;
};

export default RoutePrefetcher;
