// Privacybewust experimentenraamwerk: vaste toekenning per bezoeker zonder database.
// Server-HTML toont altijd de controlevariant (geen SEO-duplicaten); de variant
// wordt pas na hydration gekozen. Metingen gaan alleen naar GA, dat zelf op toestemming wacht.
import { gtag } from "./analytics";

export interface Experiment {
  key: string;
  variants: readonly string[]; // eerste = controle
  active: boolean;
}

export const EXPERIMENTS = {
  homepage_search_cta: { key: "homepage_search_cta", variants: ["control", "zoek_nu"], active: false },
} as const satisfies Record<string, Experiment>;

const STORAGE_KEY = "wa_exp_id";

/** FNV-1a hash: deterministisch, geen randomness per render. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function assignVariant(exp: Experiment, visitorId: string): string {
  if (!exp.active || exp.variants.length === 0) return exp.variants[0] ?? "control";
  const idx = hashString(`${exp.key}:${visitorId}`) % exp.variants.length;
  return exp.variants[idx] ?? exp.variants[0] ?? "control";
}

export function getVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function trackExperiment(exp: Experiment, variant: string, event: "exposure" | "conversion") {
  if (typeof window === "undefined" || !exp.active) return;
  gtag("event", `experiment_${event}`, { experiment: exp.key, variant });
}
