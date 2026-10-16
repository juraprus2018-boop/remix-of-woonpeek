import { useEffect, useState } from "react";

export interface WoonmatchProfile {
  maxBudget?: number;
  minRooms?: number;
  propertyType?: string; // appartement | huis | studio | kamer | ""
  city?: string;
}

const KEY = "woonmatch-profile-v1";
const EVENT = "woonmatch-change";

export function loadWoonmatch(): WoonmatchProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WoonmatchProfile) : null;
  } catch {
    return null;
  }
}

export function saveWoonmatch(p: WoonmatchProfile | null) {
  try {
    if (p) localStorage.setItem(KEY, JSON.stringify(p));
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function useWoonmatch() {
  const [profile, setProfile] = useState<WoonmatchProfile | null>(() =>
    typeof window === "undefined" ? null : loadWoonmatch()
  );
  useEffect(() => {
    const sync = () => setProfile(loadWoonmatch());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return profile;
}

interface MatchInput {
  price: number;
  bedrooms?: number | null;
  property_type?: string | null;
  city?: string | null;
}

/** Score 0-100 based only on the visitor's own preferences. Returns null when no profile. */
export function woonmatchScore(p: WoonmatchProfile | null, w: MatchInput): number | null {
  if (!p) return null;
  const parts: { weight: number; score: number }[] = [];

  if (p.maxBudget && p.maxBudget > 0 && w.price > 0) {
    const ratio = w.price / p.maxBudget;
    const s = ratio <= 1 ? 1 : ratio >= 1.3 ? 0 : 1 - (ratio - 1) / 0.3;
    parts.push({ weight: 50, score: s });
  }
  if (p.minRooms && p.minRooms > 0) {
    const r = w.bedrooms ?? 0;
    const s = r >= p.minRooms ? 1 : r === p.minRooms - 1 ? 0.5 : 0;
    parts.push({ weight: 25, score: s });
  }
  if (p.propertyType) {
    parts.push({ weight: 15, score: w.property_type === p.propertyType ? 1 : 0 });
  }
  if (p.city) {
    const same = (w.city || "").toLowerCase().trim() === p.city.toLowerCase().trim();
    parts.push({ weight: 10, score: same ? 1 : 0.3 });
  }
  if (!parts.length) return null;
  const total = parts.reduce((a, b) => a + b.weight, 0);
  const got = parts.reduce((a, b) => a + b.weight * b.score, 0);
  return Math.round((got / total) * 100);
}
