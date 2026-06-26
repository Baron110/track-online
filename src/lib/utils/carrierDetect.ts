// Detect carrier code from tracking number format
// Used to hint APIs that can't auto-detect

interface CarrierHint {
  trackingMoreCode: string;
  track17Code?: number;
  name: string;
}

const CARRIER_PATTERNS: { pattern: RegExp; hint: CarrierHint }[] = [
  // Cainiao cross-border
  {
    pattern: /^(CNBR|CNGD|CNSC|CNSD|CNSH|CNBJ|CNCD|CNHZ|CNKM|CNSY|CNWH|CNXA|CNXM|LP|LX|UQ|UP|SY|SF)[0-9A-Z]+/i,
    hint: { trackingMoreCode: "cainiao", name: "Cainiao" },
  },
  // Cainiao international (9C prefix)
  {
    pattern: /^9C[0-9A-Z]+/i,
    hint: { trackingMoreCode: "cainiao", name: "Cainiao" },
  },
  // YT Express
  {
    pattern: /^YT[0-9]{16,}/i,
    hint: { trackingMoreCode: "yto", name: "YTO Express" },
  },
  // SF Express
  {
    pattern: /^SF[0-9]{12,}/i,
    hint: { trackingMoreCode: "sfexpress-international", name: "SF Express" },
  },
  // SPX / Shopee Express
  {
    pattern: /^SPX[A-Z0-9]+/i,
    hint: { trackingMoreCode: "shopee-express", name: "Shopee Express" },
  },
  // JT Express
  {
    pattern: /^JT[0-9]+/i,
    hint: { trackingMoreCode: "jtexpress", name: "J&T Express" },
  },
  // Yanwen
  {
    pattern: /^(YW|UA|UD|UG|UX)[0-9]+/i,
    hint: { trackingMoreCode: "yanwen", name: "Yanwen" },
  },
  // 4PX
  {
    pattern: /^(4PX|FX|FS)[0-9]+/i,
    hint: { trackingMoreCode: "4px", name: "4PX" },
  },
  // UPS
  {
    pattern: /^1Z[0-9A-Z]{16}/i,
    hint: { trackingMoreCode: "ups", name: "UPS" },
  },
  // FedEx
  {
    pattern: /^[0-9]{12}$|^[0-9]{15}$|^[0-9]{20}$/,
    hint: { trackingMoreCode: "fedex", name: "FedEx" },
  },
  // USPS
  {
    pattern: /^(94|93|92|94|95)[0-9]{20}/,
    hint: { trackingMoreCode: "usps", name: "USPS" },
  },
  // Royal Mail
  {
    pattern: /^[A-Z]{2}[0-9]{9}GB$/i,
    hint: { trackingMoreCode: "royal-mail", name: "Royal Mail" },
  },
  // DHL Express
  {
    pattern: /^[0-9]{10}$|^JD[0-9]{18}/,
    hint: { trackingMoreCode: "dhl", name: "DHL" },
  },
];

export function detectCarrier(trackingNumber: string): CarrierHint | null {
  const upper = trackingNumber.toUpperCase().trim();
  for (const { pattern, hint } of CARRIER_PATTERNS) {
    if (pattern.test(upper)) {
      console.log(`[CarrierDetect] Detected: ${hint.name} for ${upper}`);
      return hint;
    }
  }
  return null;
}