// Signed, short-lived OAuth state so only flows started by an admin can store TikTok tokens.
const enc = new TextEncoder();
const MAX_AGE_MS = 15 * 60 * 1000;

async function hmac(data: string): Promise<string> {
  const secret = Deno.env.get("TIKTOK_CLIENT_SECRET");
  if (!secret) throw new Error("TIKTOK_CLIENT_SECRET missing");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signState(subject: string): Promise<string> {
  const payload = `${Date.now()}.${crypto.randomUUID()}.${subject.replace(/\./g, "")}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyState(state: string | null): Promise<boolean> {
  if (!state) return false;
  const idx = state.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = state.slice(0, idx), sig = state.slice(idx + 1);
  const ts = Number(payload.split(".")[0]);
  if (!Number.isFinite(ts) || Date.now() - ts > MAX_AGE_MS || ts > Date.now() + 60_000) return false;
  let expected: string;
  try { expected = await hmac(payload); } catch { return false; }
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
