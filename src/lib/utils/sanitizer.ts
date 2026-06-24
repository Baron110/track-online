// Terms that must NEVER appear in user-facing output
const BLOCKED_TERMS = [
  // Marketplaces
  "aliexpress", "amazon", "shein", "temu", "wish", "ebay", "shopee",
  "lazada", "jd.com", "taobao", "tmall", "pinduoduo", "dhgate",
  // Couriers to hide
  "cainiao", "yanwen", "yun express", "4px", "epacket", "cnexps",
  "cj packet", "cj dropshipping", "cj logistics", "speedx",
  "dhl", "fedex", "ups", "usps", "royal mail", "hermes", "evri",
  "dpd", "gls", "tnt", "aramex", "sfexpress", "sf express",
  "china post", "hongkong post", "singapore post",
  "deutsche post", "japan post", "india post",
  "australia post", "canada post", "new zealand post",
  // Supplier/merchant terms
  "seller", "merchant", "vendor", "supplier",
  "dropship", "mktp", "amzl", "amz", "cjdropship",
];

// Common non-English phrases → English
const TRANSLATIONS: { pattern: RegExp; english: string }[] = [
  { pattern: /in transito|spedizione.*in transito/i, english: "Package in transit" },
  { pattern: /consegnato|consegna.*effettuata/i, english: "Package delivered successfully" },
  { pattern: /in consegna|tentativo.*consegna/i, english: "Package out for delivery" },
  { pattern: /sdoganamento|dogana/i, english: "Package processing through customs" },
  { pattern: /partito|partenza/i, english: "Package departed facility" },
  { pattern: /arrivato|arrivo/i, english: "Package arrived at facility" },
  { pattern: /preso in carico|accettato/i, english: "Package picked up from sender" },
  { pattern: /etiqueta.*creada|etiqueta.*generada/i, english: "Shipment label created" },
  { pattern: /en tr[aá]nsito/i, english: "Package in transit" },
  { pattern: /entregado/i, english: "Package delivered successfully" },
  { pattern: /im transit|in zustellung/i, english: "Package in transit" },
  { pattern: /zugestellt/i, english: "Package delivered successfully" },
  { pattern: /en cours de livraison/i, english: "Package out for delivery" },
  { pattern: /livr[eé]/i, english: "Package delivered successfully" },
];
  let result = text;
  for (const term of BLOCKED_TERMS) {
    result = result.replace(new RegExp(term, "gi"), "").trim();
  }
  return result.replace(/\s+/g, " ").trim();
}

function hasBlocked(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_TERMS.some((t) => lower.includes(t));
}

// Normalize carrier note prefix — keep the actual message
function normalizeCarrierNote(text: string): string {
  // "Carrier note: Outbound in sorting center" → "Outbound in sorting center"
  return text
    .replace(/^carrier\s*note\s*:\s*/i, "")
    .replace(/^carrier\s*update\s*:\s*/i, "")
    .trim();
}

export function sanitizeDescription(raw: string): string {
  if (!raw) return "Package status updated";

  // Check for non-English and translate
  for (const { pattern, english } of TRANSLATIONS) {
    if (pattern.test(raw)) return english;
  }

  // Strip blocked terms first
  let cleaned = hasBlocked(raw) ? stripBlocked(raw) : raw;

  // Normalize carrier note prefix
  cleaned = normalizeCarrierNote(cleaned);

  if (!cleaned) return "Package status updated";

  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function sanitizeLocation(raw: string): string {
  if (!raw) return "";
  if (!hasBlocked(raw)) return raw.trim();

  // Strip blocked terms from location but keep place names
  const parts = raw.split(",").map((p) => p.trim());
  const clean = parts.filter((p) => !BLOCKED_TERMS.some((t) => p.toLowerCase().includes(t)));
  return clean.join(", ").trim();
}

export function sanitizeFacilityName(raw: string): string {
  if (!raw) return "";
  if (!hasBlocked(raw)) return raw.trim();
  return "Logistics Facility";
}