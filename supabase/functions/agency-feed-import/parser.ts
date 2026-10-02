// Gedeeld met makelaar-feed-import (gekopieerde parser).
export function stripHtml(text: string | null | undefined): string | null {
  if (!text) return null;
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapPropertyType(typeStr: string): "appartement" | "huis" | "studio" | "kamer" {
  const t = (typeStr || "").toLowerCase();
  if (t.includes("appartement") || t.includes("flat") || t.includes("etage")) return "appartement";
  if (t.includes("studio")) return "studio";
  if (t.includes("kamer") || t.includes("room")) return "kamer";
  if (t.includes("woning") || t.includes("huis") || t.includes("maisonette") || t.includes("eengezins") || t.includes("villa") || t.includes("tussenwoning") || t.includes("hoekwoning")) return "huis";
  return "appartement";
}

export function mapListingType(typeStr: string): "huur" | "koop" {
  const t = (typeStr || "").toLowerCase();
  if (t.includes("koop") || t.includes("buy") || t.includes("sale") || t.includes("te koop")) return "koop";
  return "huur";
}

export function parseEnergyLabel(label: string | null | undefined): string | null {
  if (!label) return null;
  const clean = label.toUpperCase().trim();
  const valid = ["A++", "A+", "A", "B", "C", "D", "E", "F", "G"];
  if (valid.includes(clean)) return clean;
  if (clean.includes("A++")) return "A++";
  if (clean.includes("A+")) return "A+";
  for (const v of valid) {
    if (clean.includes(v)) return v;
  }
  return null;
}

export interface XmlProperty {
  title?: string;
  street?: string;
  house_number?: string;
  city?: string;
  postal_code?: string;
  price?: number;
  listing_type?: string;
  property_type?: string;
  surface_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  energy_label?: string;
  build_year?: number;
  latitude?: number;
  longitude?: number;
  images?: string[];
  source_url?: string;
  description?: string;
  neighborhood?: string;
}

// Parse XML feed - handles common Dutch real estate XML formats (Pararius, Realworks, etc.)
export function parseXmlFeed(xmlText: string): XmlProperty[] {
  const properties: XmlProperty[] = [];

  // Try to find property items - support various tag names
  const itemPatterns = [
    /<(?:property|object|woning|item|listing|dwelling|pand)[\s>]([\s\S]*?)<\/(?:property|object|woning|item|listing|dwelling|pand)>/gi,
  ];

  let items: string[] = [];
  for (const pattern of itemPatterns) {
    const matches = xmlText.matchAll(pattern);
    for (const m of matches) {
      items.push(m[0]);
    }
    if (items.length > 0) break;
  }

  if (items.length === 0) {
    console.log("No property items found in XML, trying root-level parsing...");
    // Maybe it's a flat structure
    items = [xmlText];
  }

  for (const itemXml of items) {
    const prop: XmlProperty = {};

    // Helper to extract text from XML tag
    const getTag = (names: string[]): string | null => {
      for (const name of names) {
        const re = new RegExp(`<${name}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${name}>`, "i");
        const match = itemXml.match(re);
        if (match) return match[1].trim();

        const re2 = new RegExp(`<${name}[^>]*>([^<]*)<\\/${name}>`, "i");
        const match2 = itemXml.match(re2);
        if (match2) return match2[1].trim();
      }
      return null;
    };

    const getNum = (names: string[]): number | null => {
      const val = getTag(names);
      if (!val) return null;
      const n = parseFloat(val.replace(/[^0-9.,]/g, "").replace(",", "."));
      return isNaN(n) ? null : n;
    };

    // Extract fields - support many naming variants
    prop.title = getTag(["title", "titel", "naam", "name", "adres", "address"]);
    prop.street = getTag(["street", "straat", "streetname", "straatnaam"]);
    prop.house_number = getTag(["housenumber", "house_number", "huisnummer", "number", "nummer"]);
    prop.city = getTag(["city", "stad", "plaats", "woonplaats", "town", "municipality"]);
    prop.postal_code = getTag(["postalcode", "postal_code", "postcode", "zipcode", "zip"]);
    prop.price = getNum(["price", "prijs", "huurprijs", "koopprijs", "rent", "askingprice", "asking_price"]);
    prop.surface_area = getNum(["surface", "surface_area", "oppervlakte", "area", "woonoppervlakte", "living_area", "livingarea"]);
    prop.bedrooms = getNum(["bedrooms", "slaapkamers", "aantalSlaapkamers", "bedroom_count"]);
    prop.bathrooms = getNum(["bathrooms", "badkamers", "aantalBadkamers", "bathroom_count"]);
    prop.build_year = getNum(["buildyear", "build_year", "bouwjaar", "constructionyear", "construction_year"]);
    prop.latitude = getNum(["latitude", "lat", "breedtegraad"]);
    prop.longitude = getNum(["longitude", "lon", "lng", "lengtegraad"]);
    prop.neighborhood = getTag(["neighborhood", "wijk", "buurt", "district"]);

    const listingTypeStr = getTag(["listingtype", "listing_type", "transactietype", "type", "soort", "koophuur", "rent_buy"]);
    if (listingTypeStr) prop.listing_type = listingTypeStr;

    const propTypeStr = getTag(["propertytype", "property_type", "woningtype", "objecttype", "dwelling_type", "categorie"]);
    if (propTypeStr) prop.property_type = propTypeStr;

    const energyStr = getTag(["energylabel", "energy_label", "energielabel", "energy"]);
    if (energyStr) prop.energy_label = energyStr;

    const descStr = getTag(["description", "beschrijving", "omschrijving", "tekst", "text"]);
    if (descStr) prop.description = descStr;

    prop.source_url = getTag(["url", "link", "detailurl", "detail_url", "pageurl", "page_url", "deeplink"]);

    // Images
    const images: string[] = [];
    // Pattern 1: <image>url</image> or <photo>url</photo>
    const imgPatterns = [
      /<(?:image|photo|foto|picture|media|img)[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\]<\s]+)(?:\]\]>)?<\/(?:image|photo|foto|picture|media|img)>/gi,
      /<(?:image|photo|foto)_?\d*[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\]<\s]+)(?:\]\]>)?<\/(?:image|photo|foto)_?\d*>/gi,
    ];
    for (const pattern of imgPatterns) {
      const matches = itemXml.matchAll(pattern);
      for (const m of matches) {
        if (m[1] && !images.includes(m[1])) images.push(m[1]);
      }
    }
    // Pattern 2: <images><url>...</url></images>
    const imgBlockMatch = itemXml.match(/<(?:images|photos|fotos|media)[^>]*>([\s\S]*?)<\/(?:images|photos|fotos|media)>/i);
    if (imgBlockMatch) {
      const urlMatches = imgBlockMatch[1].matchAll(/<(?:url|src|path)[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\]<\s]+)(?:\]\]>)?<\/(?:url|src|path)>/gi);
      for (const m of urlMatches) {
        if (m[1] && !images.includes(m[1])) images.push(m[1]);
      }
    }
    if (images.length > 0) prop.images = images;

    // Skip if we don't have minimum data
    if (!prop.city && !prop.street && !prop.source_url) continue;

    properties.push(prop);
  }

  return properties;
}
