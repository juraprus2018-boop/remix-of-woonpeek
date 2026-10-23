// Outbound fetch guard: only public http(s) destinations, re-checked on every redirect.
const PRIVATE_V4 = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^192\.0\.0\./, /^198\.1[89]\./, /^2(2[4-9]|[3-5]\d)\./,
];
const isPrivateIp = (ip: string) => {
  const v = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (/^\d+\.\d+\.\d+\.\d+$/.test(v)) return PRIVATE_V4.some((r) => r.test(v));
  if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7));
  return v === "::" || v === "::1" || /^f[cd]/.test(v) || /^fe[89ab]/.test(v) || /^ff/.test(v);
};

export async function assertPublicUrl(raw: string | URL): Promise<URL> {
  const url = new URL(raw.toString());
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only http(s) allowed");
  if (url.username || url.password) throw new Error("Credentials not allowed");
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
    throw new Error("Host not allowed");
  }
  if (/^[\d.]+$/.test(host) || host.includes(":")) {
    if (isPrivateIp(host)) throw new Error("Host not allowed");
    return url;
  }
  const addrs: string[] = [];
  for (const type of ["A", "AAAA"] as const) {
    try { addrs.push(...(await Deno.resolveDns(host, type))); } catch { /* ignore */ }
  }
  if (!addrs.length) throw new Error("Host could not be resolved");
  if (addrs.some(isPrivateIp)) throw new Error("Host not allowed");
  return url;
}

export async function safeFetch(raw: string | URL, init: RequestInit = {}, maxRedirects = 5): Promise<Response> {
  let url = await assertPublicUrl(raw);
  for (let i = 0; i <= maxRedirects; i++) {
    const res = await fetch(url.toString(), { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      await res.body?.cancel();
      url = await assertPublicUrl(new URL(res.headers.get("location")!, url));
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects");
}
