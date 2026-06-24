const BLOCKED_TERMS = [
  "aliexpress", "amazon", "shein", "temu", "wish", "ebay", "shopee",
  "lazada", "jd.com", "taobao", "tmall", "pinduoduo", "dhgate",
  "cainiao", "yanwen", "yun express", "4px", "epacket", "cnexps",
  "cj packet", "cj dropshipping", "cj logistics",
  "dhl", "fedex", "ups", "usps", "royal mail", "hermes", "evri",
  "dpd", "gls", "tnt", "aramex", "sfexpress", "sf express",
  "china post", "hongkong post", "singapore post", "correos",
  "poste italiane", "la poste", "bpost", "postnl", "post nl",
  "deutsch post", "deutsche post", "japan post", "india post",
  "australia post", "canada post", "new zealand post", "speedx",
  "seller", "merchant", "vendor", "supplier",
  "dropship", "mktp", "amzl", "amz", "ali", "cjdropship",
];

const EVENT_MAP: { keywords: string[]; replacement: string }[] = [
  { keywords: ["label created", "label printed", "order created", "electronic info"], replacement: "Shipment information received, label created" },
  { keywords: ["picked up", "pickup", "collected", "handed over", "accepted"], replacement: "Package picked up from sender" },
  { keywords: ["origin", "departure scan", "departed facility", "left facility", "dispatched from"], replacement: "Package departed from origin facility" },
  { keywords: ["arrived", "arrival", "received at", "inbound"], replacement: "Package arrived at transit facility" },
  { keywords: ["in transit", "on the way", "en route", "forwarded"], replacement: "Package in transit" },
  { keywords: ["customs", "clearance", "cleared customs", "import", "export"], replacement: "Package cleared customs" },
  { keywords: ["out for delivery", "with courier", "on vehicle"], replacement: "Package out for delivery" },
  { keywords: ["delivered", "delivery successful", "delivered to"], replacement: "Package delivered successfully" },
  { keywords: ["transfer", "transferred", "handed to", "passed to"], replacement: "Package transferred to next carrier facility" },
  { keywords: ["processed", "processing", "sorting", "sorted"], replacement: "Package processed at facility" },
  { keywords: ["exception", "failed", "delay", "issue", "attempt"], replacement: "Delivery attempt made, package held at facility" },
  { keywords: ["departed country", "left country", "export scan"], replacement: "Package departed origin country" },
  { keywords: ["arrived country", "entered country", "import scan", "destination country"], replacement: "Package arrived in destination country" },
];

export function sanitizeDescription(raw: string): string {
  if (!raw) return "Package status updated";
  const lower = raw.toLowerCase();
  const hasBlocked = BLOCKED_TERMS.some((term) => lower.includes(term));
  if (hasBlocked) return mapToGeneric(lower);
  return mapToGeneric(lower) ?? normalizeDescription(raw);
}

function mapToGeneric(lower: string): string {
  for (const { keywords, replacement } of EVENT_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return replacement;
  }
  return "Package status updated";
}

function normalizeDescription(raw: string): string {
  return raw.charAt(0).toUpperCase() + raw.slice(1).trim();
}

export function sanitizeLocation(raw: string): string {
  if (!raw) return "";
  const lower = raw.toLowerCase();
  const hasBlocked = BLOCKED_TERMS.some((term) => lower.includes(term));
  if (hasBlocked) {
    const parts = raw.split(",").map((p) => p.trim());
    const cleanParts = parts.filter((p) => !BLOCKED_TERMS.some((term) => p.toLowerCase().includes(term)));
    return cleanParts.join(", ") || "";
  }
  return raw.trim();
}

export function sanitizeFacilityName(raw: string): string {
  if (!raw) return "";
  const lower = raw.toLowerCase();
  const hasBlocked = BLOCKED_TERMS.some((term) => lower.includes(term));
  if (hasBlocked) return "Logistics Facility";
  return raw.trim();
}