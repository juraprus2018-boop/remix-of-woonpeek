const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

const lev = (a: string, b: string) => {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
};

/** Beste plaatsnaam bij een (mogelijk verkeerd gespelde) invoer, of null. */
export const matchCity = (input: string, cities: string[]): string | null => {
  const q = norm(input);
  if (q.length < 2) return null;
  let best: string | null = null;
  let bestScore = Infinity;
  for (const c of cities) {
    const n = norm(c);
    if (n === q) return c;
    const dist = lev(q, n);
    if (dist < bestScore) { bestScore = dist; best = c; }
  }
  const allowed = q.length <= 4 ? 1 : q.length <= 8 ? 2 : 3;
  return bestScore <= allowed ? best : null;
};

/** Suggesties: begint met, bevat, of lijkt op de invoer. */
export const suggestCities = (input: string, cities: string[], limit = 6): string[] => {
  const q = norm(input);
  if (q.length < 2) return [];
  const scored = cities.map((c) => {
    const n = norm(c);
    const score = n.startsWith(q) ? 0 : n.includes(q) ? 1 : lev(q, n.slice(0, q.length)) <= (q.length > 5 ? 2 : 1) ? 2 : 9;
    return { c, score };
  }).filter((x) => x.score < 9);
  return scored.sort((a, b) => a.score - b.score || a.c.length - b.c.length).slice(0, limit).map((x) => x.c);
};
