import { lazy, Suspense, useEffect, useState, type ComponentProps, type ComponentType, type ReactNode } from "react";

/** True only after the first client render, so browser-only UI never runs during SSR. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Lazy-loads a browser-only component (e.g. Leaflet maps) after hydration.
 * The module is never imported on the server, so libraries that touch `window`
 * at import time cannot break server rendering.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clientOnlyLazy<T extends ComponentType<any>>(load: () => Promise<{ default: T }>, fallback: ReactNode = null) {
  const Lazy = lazy(load);
  const ClientOnly = (props: ComponentProps<T>) => {
    const mounted = useMounted();
    if (!mounted) return <>{fallback}</>;
    return (
      <Suspense fallback={fallback}>
        <Lazy {...props} />
      </Suspense>
    );
  };
  return ClientOnly;
}
