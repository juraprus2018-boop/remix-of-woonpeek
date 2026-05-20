/**
 * Curated set of free Unsplash interieur/woning foto's.
 * Wordt deterministisch gekozen per property-id zodat dezelfde woning
 * altijd dezelfde foto krijgt (geen flicker tussen renders).
 */
const STOCK_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=70&auto=format&fit=crop",
];

/** Simpele deterministische hash op een string. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Geef een stockfoto terug voor een woning zonder eigen afbeeldingen.
 * Hetzelfde id geeft altijd dezelfde foto.
 */
export function getStockPropertyImage(seed: string | undefined | null): string {
  const idx = seed ? hashString(seed) % STOCK_PROPERTY_IMAGES.length : 0;
  return STOCK_PROPERTY_IMAGES[idx];
}
