/** Social crawlers need a public HTTPS URL, never an unchecked image value. */
export function socialImageUrl(value: unknown, origin: string, fallback: string): string {
  const resolve = (input: unknown): string | undefined => {
    if (typeof input !== "string" || !input.trim()) return undefined;
    try {
      const url = new URL(input.trim(), origin);
      if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
      if (url.username || url.password) return undefined;
      url.protocol = "https:";
      return url.href;
    } catch {
      return undefined;
    }
  };
  return resolve(value) || resolve(fallback) || new URL("/favicon.png", origin).href;
}