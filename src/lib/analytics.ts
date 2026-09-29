// Google Analytics (GA4). Het meet-ID is een publieke waarde en mag in de code staan.
// Zet hier het ID dat je in Google Analytics ziet staan (begint met G-).
export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID as string | undefined) ||
  (import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined) ||
  "";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let initialized = false;

export const gtag = (...args: unknown[]) => {
  if (!window.dataLayer) window.dataLayer = [];
  window.dataLayer.push(args);
};

export const initAnalytics = () => {
  if (initialized || !GA_MEASUREMENT_ID || typeof document === "undefined") return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });
};

export const trackPageView = (path: string) => {
  if (!initialized) return;
  gtag("event", "page_view", { page_path: path, page_location: window.location.href });
};
