export { canonicalizeCity } from "./cityAliases.ts";
/** Unknown source types remain unknown; specific types precede generic labels. */
export function mapPropertyType(value: string): "appartement" | "huis" | "studio" | "kamer" | null {
  const t = (value || "").toLowerCase();
  if (t.includes("studio")) return "studio";
  if (/\b(kamer|room)\b/.test(t)) return "kamer";
  if (/appartement|apartment|flat|etage|portiek|maisonn?ette/.test(t)) return "appartement";
  if (/woning|huis|house|eengezins|villa|bungalow/.test(t)) return "huis";
  return null;
}
