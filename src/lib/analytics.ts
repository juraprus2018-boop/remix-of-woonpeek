// Google Analytics (GA4). Het meet-ID is een publieke waarde en mag in de code staan.
// Zet hier het ID dat je in Google Analytics ziet staan (begint met G-).
export const GA_MEASUREMENT_ID = "G-8MWWMFY858";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let initialized = false;

// Google verwerkt alleen het echte `arguments`-object, geen gewone array.
export function gtag(..._args: unknown[]) {
  if (!window.dataLayer) window.dataLayer = [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

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
