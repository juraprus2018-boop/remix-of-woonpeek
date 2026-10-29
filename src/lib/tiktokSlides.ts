import JSZip from "jszip";
import { propertyUrl } from "@/lib/propertyUrl";
import { pluralize } from "@/lib/pluralize";

export interface SlideProperty {
  id: string;
  title: string;
  city: string;
  price: number;
  listing_type: string;
  property_type?: string | null;
  surface_area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  energy_label?: string | null;
  street?: string | null;
  house_number?: string | null;
  images: string[];
  slug?: string | null;
  address_slug?: string | null;
  created_at?: string | null;
}

const W = 1080;
const H = 1920; // 9:16

const NAVY = "#173e63";
const NAVY_DEEP = "#0d2640";
const CREAM = "#FFFFFF";
const ACCENT = "#E8A33D";
const FONT = "'Sora', 'Manrope', system-ui, sans-serif";
const PROXY = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/image-proxy?src=`;

function fmtPrice(p: number, listingType: string) {
  const v = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(p);
  return listingType === "huur" ? `${v} per maand` : v;
}

function tryLoad(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Kon afbeelding niet laden: ${src}`));
    img.src = src;
  });
}

// Partner sites block canvas use without CORS, so route through our image proxy first.
async function loadImage(src: string): Promise<HTMLImageElement> {
  try { return await tryLoad(PROXY + encodeURIComponent(src)); } catch { return await tryLoad(src); }
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ratio = Math.max(w / img.width, h / img.height);
  const dw = img.width * ratio, dh = img.height * ratio;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

// Fill the 9:16 frame: blurred copy as backdrop, sharp photo fitted on top (no ugly crops of landscape photos).
function drawPhotoFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  ctx.save();
  ctx.filter = "blur(40px) brightness(0.6)";
  drawCover(ctx, img, -80, -80, W + 160, H + 160);
  ctx.restore();
  const landscape = img.width / img.height > 0.8;
  if (!landscape) { drawCover(ctx, img, 0, 0, W, H); return; }
  const dw = W, dh = (img.height / img.width) * W;
  const y = (H - dh) / 2 - 60;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 60;
  ctx.drawImage(img, 0, y, dw, dh);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg: string, size = 34) {
  ctx.font = `700 ${size}px ${FONT}`;
  const w = ctx.measureText(text).width + size * 1.4;
  const h = size * 2;
  ctx.fillStyle = bg; roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fg; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  ctx.fillText(text, x + size * 0.7, y + h / 2 + 2);
  ctx.textBaseline = "alphabetic";
  return w;
}

function drawBrand(ctx: CanvasRenderingContext2D) {
  ctx.font = `700 38px ${FONT}`;
  ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillText("woonaanbod-nl.nl", W - 58, 118);
  ctx.fillStyle = CREAM; ctx.fillText("woonaanbod-nl.nl", W - 60, 116);
  ctx.textAlign = "left";
}

function shade(ctx: CanvasRenderingContext2D, from: number, alpha: number) {
  const g = ctx.createLinearGradient(0, H * from, 0, H);
  g.addColorStop(0, "rgba(13,38,64,0)"); g.addColorStop(1, `rgba(13,38,64,${alpha})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const t = ctx.createLinearGradient(0, 0, 0, 260);
  t.addColorStop(0, "rgba(0,0,0,0.45)"); t.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = t; ctx.fillRect(0, 0, W, 260);
}

function newCanvas() {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  return c;
}
const toJpeg = (c: HTMLCanvasElement) => new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.9));

function specs(p: SlideProperty) {
  return [p.surface_area ? `${p.surface_area} m²` : null, p.bedrooms != null ? `${p.bedrooms} slpk` : null, p.energy_label ? `Label ${p.energy_label}` : null].filter(Boolean) as string[];
}

// Brand logo drawn on canvas: house icon + "woonaanbod" + orange "-nl.nl".
function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, s = 1) {
  const size = 84 * s;
  ctx.fillStyle = ACCENT; roundRect(ctx, x, y, size, size, 20 * s);
  ctx.fillStyle = NAVY_DEEP;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.2);
  ctx.lineTo(x + size * 0.82, y + size * 0.48);
  ctx.lineTo(x + size * 0.72, y + size * 0.48);
  ctx.lineTo(x + size * 0.72, y + size * 0.8);
  ctx.lineTo(x + size * 0.28, y + size * 0.8);
  ctx.lineTo(x + size * 0.28, y + size * 0.48);
  ctx.lineTo(x + size * 0.18, y + size * 0.48);
  ctx.closePath(); ctx.fill();
  ctx.textBaseline = "middle"; ctx.textAlign = "left";
  ctx.font = `800 ${56 * s}px ${FONT}`;
  ctx.fillStyle = CREAM; ctx.fillText("woonaanbod", x + size + 22 * s, y + size / 2 + 2);
  const w = ctx.measureText("woonaanbod").width;
  ctx.fillStyle = ACCENT; ctx.fillText("-nl.nl", x + size + 22 * s + w, y + size / 2 + 2);
  ctx.textBaseline = "alphabetic";
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…"; }
  return lines;
}

// SLIDE 1: hero — logo bar, photo, solid info panel with name, place and price.
async function slideHero(p: SlideProperty, img: HTMLImageElement | null, total: number): Promise<Blob> {
  const c = newCanvas(); const ctx = c.getContext("2d")!;
  ctx.fillStyle = NAVY_DEEP; ctx.fillRect(0, 0, W, H);
  const TOP = 200, PHOTO_H = 900;
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(0, TOP, W, PHOTO_H); ctx.clip(); drawCover(ctx, img, 0, TOP, W, PHOTO_H); ctx.restore(); }
  else { ctx.fillStyle = NAVY; ctx.fillRect(0, TOP, W, PHOTO_H); }
  drawLogo(ctx, 60, 58);
  pill(ctx, p.listing_type === "huur" ? "NIEUW TE HUUR" : "NIEUW TE KOOP", 60, TOP + 40, ACCENT, NAVY_DEEP, 36);

  // info panel
  const py = TOP + PHOTO_H;
  ctx.fillStyle = NAVY; ctx.fillRect(0, py, W, H - py);
  ctx.fillStyle = ACCENT; ctx.fillRect(0, py, W, 10);
  let y = py + 120;
  ctx.fillStyle = CREAM; ctx.font = `800 70px ${FONT}`;
  for (const line of wrapLines(ctx, p.title || `Woning in ${p.city}`, W - 120, 2)) { ctx.fillText(line, 60, y); y += 84; }
  y += 6;
  const addr = [p.street && `${p.street}${p.house_number ? " " + p.house_number : ""}`, p.city].filter(Boolean).join(", ");
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = `600 46px ${FONT}`;
  ctx.fillText(`📍 ${addr}`, 60, y); y += 130;
  ctx.fillStyle = ACCENT; ctx.font = `800 120px ${FONT}`;
  ctx.fillText(fmtPrice(p.price, p.listing_type), 60, y); y += 50;
  let x = 60;
  for (const s of specs(p)) x += pill(ctx, s, x, y, "rgba(255,255,255,0.14)", CREAM, 38) + 16;
  if (total > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = `600 38px ${FONT}`;
    ctx.fillText(`Swipe voor alle ${total} foto's  →`, 60, H - 80);
  }
  return toJpeg(c);
}

// SLIDE 2..n: each real photo
async function slidePhoto(p: SlideProperty, img: HTMLImageElement, index: number, total: number): Promise<Blob> {
  const c = newCanvas(); const ctx = c.getContext("2d")!;
  drawPhotoFrame(ctx, img);
  shade(ctx, 0.7, 0.9);
  pill(ctx, `${index} / ${total}`, 60, 70, "rgba(13,38,64,0.75)", CREAM, 32);
  drawBrand(ctx);
  ctx.fillStyle = CREAM; ctx.font = `800 64px ${FONT}`;
  ctx.fillText(fmtPrice(p.price, p.listing_type), 60, H - 150);
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = `600 38px ${FONT}`;
  ctx.fillText([p.city, ...specs(p)].join("  ·  "), 60, H - 90);
  return toJpeg(c);
}

// LAST SLIDE: summary + CTA
async function slideOutro(p: SlideProperty, img: HTMLImageElement | null): Promise<Blob> {
  const c = newCanvas(); const ctx = c.getContext("2d")!;
  if (img) { ctx.save(); ctx.filter = "blur(30px) brightness(0.45)"; drawCover(ctx, img, -60, -60, W + 120, H + 120); ctx.restore(); }
  else { ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, H); }
  ctx.fillStyle = "rgba(13,38,64,0.55)"; ctx.fillRect(0, 0, W, H);
  drawBrand(ctx);
  ctx.fillStyle = CREAM; ctx.font = `800 84px ${FONT}`;
  ctx.fillText("In het kort", 70, 330);
  const rows: [string, string][] = [];
  if (p.property_type) rows.push(["Type", p.property_type.replace(/^./, (m) => m.toUpperCase())]);
  rows.push(["Plaats", p.city]);
  if (p.surface_area) rows.push(["Oppervlakte", `${p.surface_area} m²`]);
  if (p.bedrooms != null) rows.push(["Slaapkamers", String(p.bedrooms)]);
  if (p.energy_label) rows.push(["Energielabel", p.energy_label]);
  rows.push(["Prijs", fmtPrice(p.price, p.listing_type)]);
  let y = 420;
  for (const [l, v] of rows) {
    ctx.fillStyle = "rgba(255,255,255,0.1)"; roundRect(ctx, 60, y, W - 120, 120, 28);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = `600 36px ${FONT}`; ctx.textAlign = "left"; ctx.fillText(l, 100, y + 74);
    ctx.fillStyle = CREAM; ctx.font = `800 46px ${FONT}`; ctx.textAlign = "right"; ctx.fillText(v, W - 100, y + 76);
    ctx.textAlign = "left"; y += 140;
  }
  ctx.fillStyle = ACCENT; roundRect(ctx, 60, H - 360, W - 120, 200, 40);
  ctx.fillStyle = NAVY_DEEP; ctx.textAlign = "center";
  ctx.font = `800 58px ${FONT}`; ctx.fillText("Reageer direct", W / 2, H - 260);
  ctx.font = `600 36px ${FONT}`; ctx.fillText("Link naar de woning staat in de caption", W / 2, H - 200);
  ctx.textAlign = "left";
  return toJpeg(c);
}

const MAX_SLIDES = 35;

export async function generateSlides(p: SlideProperty): Promise<Blob[]> {
  const urls = [...new Set((p.images || []).filter((u) => typeof u === "string" && /^https?:\/\//.test(u)))];
  const loaded = (await Promise.all(urls.slice(0, MAX_SLIDES - 1).map((u) => loadImage(u).catch(() => null))))
    .filter((i): i is HTMLImageElement => !!i && i.width >= 300);
  const total = loaded.length;
  const slides: Blob[] = [await slideHero(p, loaded[0] ?? null, total)];
  for (let i = 1; i < loaded.length; i++) slides.push(await slidePhoto(p, loaded[i], i + 1, total));
  slides.push(await slideOutro(p, loaded[0] ?? null));
  return slides;
}

export async function downloadSlidesZip(p: SlideProperty): Promise<void> {
  const slides = await generateSlides(p);
  const zip = new JSZip();
  slides.forEach((blob, i) => {
    zip.file(`slide-${String(i + 1).padStart(2, "0")}.jpg`, blob);
  });
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `woonaanbod-nl-tiktok-${p.slug || p.id}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildTikTokCaption(p: SlideProperty): string {
  const price = fmtPrice(p.price, p.listing_type);
  const huur = p.listing_type === "huur";
  const type = (p.property_type || "woning").toLowerCase();
  const lines = [
    `${huur ? "Te huur" : "Te koop"} in ${p.city}: ${type} voor ${price} 🏡`,
    [p.surface_area ? `📐 ${p.surface_area} m²` : null, p.bedrooms != null ? `🛏️ ${pluralize(p.bedrooms, "slaapkamer", "slaapkamers")}` : null, p.energy_label ? `⚡ Label ${p.energy_label}` : null].filter(Boolean).join(" · "),
    "",
    `👉 Link in bio, of zoek op woonaanbod-nl.nl naar ${p.city}`,
    "💬 Zoek jij ook een woning in " + p.city + "? Laat het weten in de reacties!",
    "",
    buildHashtags(p),
  ];
  return lines.filter((l, i) => l !== "" || lines[i - 1] !== "").join("\n");
}

export function buildHashtags(p: SlideProperty): string {
  const c = p.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const huur = p.listing_type === "huur";
  const t = (p.property_type || "").toLowerCase();
  const typeTag = /kamer|room/.test(t) ? "#kamerhuren" : /studio/.test(t) ? "#studiohuren" : /appartement|apartment/.test(t) ? "#appartementhuren" : /huis|house|woning/.test(t) ? "#huishuren" : null;
  const tags = huur
    ? [`#huurwoning${c}`, `#huren${c}`, `#wonenin${c}`, `#${c}`, "#huurwoning", "#huurwoningen", typeTag, "#woningzoeken", "#woningnood", p.price <= 1000 ? "#betaalbaarwonen" : null, "#woonaanbodnl", "#fyp"]
    : [`#koopwoning${c}`, `#${c}`, "#koopwoning", "#huiskopen", "#woningzoeken", "#woonaanbodnl", "#fyp"];
  return [...new Set(tags.filter(Boolean))].join(" ");
}

// ============= VIDEO (MP4/WebM) =============
const FPS = 30;
const HERO_S = 3, PHOTO_S = 2.2, OUTRO_S = 3, FADE_S = 0.4, MAX_VIDEO_PHOTOS = 12;

function kenBurns(ctx: CanvasRenderingContext2D, img: HTMLImageElement, t: number, dir: number) {
  const z = 1.05 + 0.12 * (dir > 0 ? t : 1 - t);
  const ratio = Math.max(W / img.width, H / img.height) * z;
  const dw = img.width * ratio, dh = img.height * ratio;
  const pan = (dw - W) * (dir > 0 ? 0.5 - 0.2 * t : 0.3 + 0.2 * t);
  ctx.drawImage(img, -pan, (H - dh) / 2, dw, dh);
}

function textShadow(ctx: CanvasRenderingContext2D, on: boolean) {
  ctx.shadowColor = on ? "rgba(0,0,0,0.55)" : "transparent"; ctx.shadowBlur = on ? 18 : 0;
}

function drawFrame(ctx: CanvasRenderingContext2D, p: SlideProperty, imgs: HTMLImageElement[], time: number) {
  const n = imgs.length;
  const photosEnd = HERO_S + Math.max(0, n - 1) * PHOTO_S;
  const price = fmtPrice(p.price, p.listing_type);
  ctx.fillStyle = NAVY_DEEP; ctx.fillRect(0, 0, W, H);
  // which photo
  let idx = 0, local = 0, segLen = HERO_S;
  if (time < HERO_S) { idx = 0; local = time; }
  else if (time < photosEnd) { idx = 1 + Math.floor((time - HERO_S) / PHOTO_S); local = (time - HERO_S) % PHOTO_S; segLen = PHOTO_S; }
  else { idx = 0; local = time - photosEnd; segLen = OUTRO_S; }
  const outro = time >= photosEnd;
  const img = imgs[Math.min(idx, n - 1)];
  if (img) {
    if (outro) { ctx.save(); ctx.filter = "blur(24px) brightness(0.5)"; kenBurns(ctx, img, local / segLen, 1); ctx.restore(); }
    else kenBurns(ctx, img, local / segLen, idx % 2 ? -1 : 1);
    // crossfade from previous
    if (!outro && idx > 0 && local < FADE_S) {
      ctx.globalAlpha = 1 - local / FADE_S; kenBurns(ctx, imgs[idx - 1], 1, (idx - 1) % 2 ? -1 : 1); ctx.globalAlpha = 1;
    }
  }
  if (!outro) shade(ctx, 0.55, 0.92);
  drawLogo(ctx, 60, 70, 0.8);

  if (time < HERO_S) {
    const a = Math.min(1, local / 0.5);
    ctx.globalAlpha = a; textShadow(ctx, true);
    pill(ctx, p.listing_type === "huur" ? "NIEUW TE HUUR" : "NIEUW TE KOOP", 60, H - 760, ACCENT, NAVY_DEEP, 38);
    ctx.fillStyle = CREAM; ctx.font = `800 82px ${FONT}`;
    let y = H - 560;
    for (const line of wrapLines(ctx, `${(p.property_type || "Woning").replace(/^./, (m) => m.toUpperCase())} in ${p.city}`, W - 120, 2)) { ctx.fillText(line, 60, y); y += 96; }
    ctx.fillStyle = ACCENT; ctx.font = `800 120px ${FONT}`; ctx.fillText(price, 60, y + 60);
    ctx.fillStyle = CREAM; ctx.font = `600 44px ${FONT}`; ctx.fillText(specs(p).join("  ·  "), 60, y + 150);
    textShadow(ctx, false); ctx.globalAlpha = 1;
  } else if (!outro) {
    textShadow(ctx, true);
    pill(ctx, `${idx + 1} / ${n}`, W - 220, 190, "rgba(13,38,64,0.75)", CREAM, 32);
    ctx.fillStyle = CREAM; ctx.font = `800 76px ${FONT}`; ctx.fillText(price, 60, H - 260);
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = `600 42px ${FONT}`; ctx.fillText([p.city, ...specs(p)].join("  ·  "), 60, H - 190);
    textShadow(ctx, false);
  } else {
    const a = Math.min(1, local / 0.4); ctx.globalAlpha = a;
    ctx.fillStyle = CREAM; ctx.textAlign = "center"; ctx.font = `800 80px ${FONT}`;
    ctx.fillText(p.city, W / 2, 720);
    ctx.fillStyle = ACCENT; ctx.font = `800 110px ${FONT}`; ctx.fillText(price, W / 2, 860);
    ctx.fillStyle = CREAM; ctx.font = `600 46px ${FONT}`; ctx.fillText(specs(p).join("  ·  "), W / 2, 950);
    ctx.fillStyle = ACCENT; roundRect(ctx, 90, 1160, W - 180, 220, 44);
    ctx.fillStyle = NAVY_DEEP; ctx.font = `800 62px ${FONT}`; ctx.fillText("Bekijk & reageer", W / 2, 1258);
    ctx.font = `600 40px ${FONT}`; ctx.fillText("Link in bio · woonaanbod-nl.nl", W / 2, 1325);
    ctx.textAlign = "left"; ctx.globalAlpha = 1;
  }
  // progress bar
  const total = photosEnd + OUTRO_S;
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(0, H - 12, W, 12);
  ctx.fillStyle = ACCENT; ctx.fillRect(0, H - 12, W * Math.min(1, time / total), 12);
}

export async function generateVideo(p: SlideProperty, onProgress?: (f: number) => void, audioFile?: File | null): Promise<{ blob: Blob; ext: string }> {
  await document.fonts?.load(`800 80px Sora`).catch(() => {});
  const urls = [...new Set((p.images || []).filter((u) => typeof u === "string" && /^https?:\/\//.test(u)))];
  const imgs = (await Promise.all(urls.slice(0, MAX_VIDEO_PHOTOS).map((u) => loadImage(u).catch(() => null))))
    .filter((i): i is HTMLImageElement => !!i && i.width >= 300);
  if (!imgs.length) throw new Error("Geen bruikbare foto's gevonden");
  const c = newCanvas(); const ctx = c.getContext("2d")!;
  const total = HERO_S + (imgs.length - 1) * PHOTO_S + OUTRO_S;
  const types = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
  const mime = types.find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";
  const stream = c.captureStream(FPS);
  let actx: AudioContext | null = null;
  if (audioFile) {
    actx = new AudioContext();
    const buf = await actx.decodeAudioData(await audioFile.arrayBuffer());
    const src = actx.createBufferSource(); src.buffer = buf;
    const gain = actx.createGain();
    gain.gain.setValueAtTime(1, actx.currentTime + Math.max(0, total - 1.5));
    gain.gain.linearRampToValueAtTime(0, actx.currentTime + total);
    const dest = actx.createMediaStreamDestination();
    src.connect(gain).connect(dest); src.start();
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  }
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((r) => (rec.onstop = () => r()));
  drawFrame(ctx, p, imgs, 0);
  rec.start(250);
  const t0 = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      drawFrame(ctx, p, imgs, Math.min(t, total));
      onProgress?.(Math.min(1, t / total));
      if (t >= total) resolve(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop(); await done; actx?.close();
  return { blob: new Blob(chunks, { type: mime.split(";")[0] }), ext: mime.startsWith("video/mp4") ? "mp4" : "webm" };
}

export function videoFileName(p: SlideProperty, ext: string) {
  const parts = ["woonaanbod", p.city, p.street, p.house_number].filter(Boolean).join("-");
  return `${parts.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.${ext}`;
}

// Bewaar gemaakte video's in de browser zodat ze na verversen blijven.
const DB = "tiktok-videos";
function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("v");
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
export async function saveVideo(id: string, blob: Blob, ext: string) {
  const d = await db();
  await new Promise((res, rej) => { const t = d.transaction("v", "readwrite"); t.objectStore("v").put({ blob, ext }, id); t.oncomplete = res; t.onerror = rej; });
}
export async function loadAllVideos(): Promise<Record<string, { blob: Blob; ext: string }>> {
  const d = await db();
  return new Promise((res) => {
    const out: Record<string, { blob: Blob; ext: string }> = {};
    const r = d.transaction("v").objectStore("v").openCursor();
    r.onsuccess = () => { const c = r.result; if (c) { out[String(c.key)] = c.value; c.continue(); } else res(out); };
    r.onerror = () => res(out);
  });
}
