import JSZip from "jszip";
import { propertyUrl } from "@/lib/propertyUrl";

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
  return listingType === "huur" ? `${v} /mnd` : v;
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

// SLIDE 1: hero
async function slideHero(p: SlideProperty, img: HTMLImageElement | null, total: number): Promise<Blob> {
  const c = newCanvas(); const ctx = c.getContext("2d")!;
  if (img) drawCover(ctx, img, 0, 0, W, H); else { ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, H); }
  shade(ctx, 0.35, 0.95);
  pill(ctx, p.listing_type === "huur" ? "NIEUW TE HUUR" : "NIEUW TE KOOP", 60, 70, ACCENT, NAVY_DEEP);
  drawBrand(ctx);

  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = `600 44px ${FONT}`;
  ctx.fillText(`${(p.property_type ?? "woning").replace(/^./, (m) => m.toUpperCase())} in`, 60, H - 560);
  ctx.fillStyle = CREAM; ctx.font = `800 120px ${FONT}`;
  ctx.fillText(p.city, 60, H - 430);
  ctx.fillStyle = ACCENT; ctx.font = `800 96px ${FONT}`;
  ctx.fillText(fmtPrice(p.price, p.listing_type), 60, H - 310);
  let x = 60;
  for (const s of specs(p)) x += pill(ctx, s, x, H - 250, "rgba(255,255,255,0.16)", CREAM, 36) + 16;
  if (total > 1) { ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.font = `600 34px ${FONT}`; ctx.fillText(`Swipe voor alle ${total} foto's  →`, 60, H - 90); }
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
  const type = p.listing_type === "huur" ? "Te huur" : "Te koop";
  const url = `${propertyUrl(p)}?utm_source=tiktok&utm_medium=social&utm_campaign=tiktok-dashboard`;
  const lines = [
    `🏡 ${type} in ${p.city}`,
    `💰 ${price}${p.surface_area ? ` · ${p.surface_area} m²` : ""}${p.bedrooms != null ? ` · ${p.bedrooms} slpk` : ""}`,
    "",
    `👉 Bekijk de woning en reageer direct: ${url}`,
    "",
    buildHashtags(p),
  ];
  return lines.join("\n");
}

export function buildHashtags(p: SlideProperty): string {
  const citySlug = p.city.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tags = [
    "#woonaanbodnl",
    "#woningnederland",
    p.listing_type === "huur" ? "#huurwoning" : "#koopwoning",
    p.listing_type === "huur" ? "#tehuur" : "#tekoop",
    `#${citySlug}`,
    `#wonenin${citySlug}`,
    "#nieuweaanbod",
    "#nederland",
    "#huurmarkt",
    "#vastgoed",
    "#dreamhome",
    "#fyp",
  ];
  return tags.join(" ");
}