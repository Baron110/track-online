import { TrackingResult, TrackingEvent, TrackingStatus } from "@/lib/types/tracking";
import { registerTracking, getTracking } from "@/lib/api/track17Client";
import { getTrackingMore } from "@/lib/api/trackingMoreClient";
import { sanitizeDescription, sanitizeLocation } from "@/lib/utils/sanitizer";

function parseCountry(code: string): string {
  const map: Record<string, string> = {
    CN: "China", US: "United States", GB: "United Kingdom",
    DE: "Germany", FR: "France", NL: "Netherlands",
    SG: "Singapore", HK: "Hong Kong", JP: "Japan",
    AU: "Australia", CA: "Canada", IT: "Italy",
    ES: "Spain", BR: "Brazil", IN: "India",
    KR: "South Korea", PL: "Poland", BE: "Belgium",
    SE: "Sweden", NO: "Norway", DK: "Denmark",
    FI: "Finland", CH: "Switzerland", AT: "Austria",
    PT: "Portugal", MX: "Mexico", ZA: "South Africa",
    NG: "Nigeria", GH: "Ghana", KE: "Kenya",
    AE: "UAE", SA: "Saudi Arabia", TR: "Turkey",
    RU: "Russia", UA: "Ukraine", TH: "Thailand",
    MY: "Malaysia", ID: "Indonesia", PH: "Philippines",
    VN: "Vietnam", TW: "Taiwan", NZ: "New Zealand",
  };
  return map[code?.toUpperCase()] ?? code ?? "";
}

function mapStatus(raw: string): TrackingStatus {
  const s = raw?.toLowerCase() ?? "";
  if (s === "delivered") return "delivered";
  if (s.includes("outfordelivery") || s.includes("out_for_delivery") || s === "pickup") return "out_for_delivery";
  if (s.includes("intransit") || s.includes("in_transit") || s === "transit" || s.includes("departure") || s.includes("arrival")) return "in_transit";
  if (s.includes("pickedup") || s.includes("picked_up")) return "in_transit";
  if (s === "undelivered" || s.includes("exception") || s.includes("failed")) return "exception";
  if (s === "expired") return "expired";
  if (s.includes("inforeceived") || s.includes("info_received") || s === "pending" || s === "inforeceived") return "pending";
  return "pending";
}

function getStatusLabel(status: TrackingStatus): string {
  const labels: Record<TrackingStatus, string> = {
    pending: "Label Created", in_transit: "In Transit",
    out_for_delivery: "Out for Delivery", delivered: "Delivered",
    exception: "Delivery Exception", expired: "Shipment Expired",
    not_found: "Not Found",
  };
  return labels[status];
}

function calcDaysInTransit(events: TrackingEvent[]): number | null {
  if (events.length < 2) return null;
  const first = new Date(events[events.length - 1].timestamp);
  const last = new Date(events[0].timestamp);
  const diff = Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

function parseEstimatedDelivery(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const date = new Date(raw);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  } catch { return null; }
}

// ─── 17TRACK event builder ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function build17Events(raw: any): TrackingEvent[] {
  const providers = raw?.track_info?.tracking?.providers ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allEvents: any[] = [];
  for (const provider of providers) {
    for (const event of provider.events ?? []) allEvents.push(event);
  }
  allEvents.sort((a, b) => new Date(b.time_utc ?? 0).getTime() - new Date(a.time_utc ?? 0).getTime());

  return allEvents.map((e) => {
    const loc = sanitizeLocation(e.location ?? "");
    const parts = loc.split(",").map((p: string) => p.trim()).filter(Boolean);
    return {
      timestamp: e.time_iso ?? e.time_utc ?? "",
      description: sanitizeDescription(e.description ?? ""),
      location: loc,
      city: parts[0] ?? "",
      country: parts[parts.length - 1] ?? "",
      status: mapStatus(e.stage ?? ""),
    };
  }).filter((e) => e.description !== "");
}

// ─── TrackingMore event builder ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTMEvents(raw: any): TrackingEvent[] {
  const checkpoints = raw?.origin_info?.trackinfo ?? raw?.destination_info?.trackinfo ?? [];
  // Merge origin + destination trackinfo
  const originEvents = raw?.origin_info?.trackinfo ?? [];
  const destEvents = raw?.destination_info?.trackinfo ?? [];
  const allEvents = [...originEvents, ...destEvents];

  if (allEvents.length === 0 && checkpoints.length === 0) return [];

  const events = allEvents.length > 0 ? allEvents : checkpoints;

  return events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e: any) => {
      const loc = sanitizeLocation(e.location ?? e.checkpoint_location ?? "");
      const parts = loc.split(",").map((p: string) => p.trim()).filter(Boolean);
      return {
        timestamp: e.checkpoint_date ?? e.tracking_update_time ?? "",
        description: sanitizeDescription(e.checkpoint_delivery_status ?? e.tracking_detail ?? ""),
        location: loc,
        city: parts[0] ?? "",
        country: parts[parts.length - 1] ?? "",
        status: mapStatus(e.checkpoint_delivery_status ?? ""),
      };
    })
    .filter((e: TrackingEvent) => e.description !== "")
    .sort((a: TrackingEvent, b: TrackingEvent) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

// ─── Quality check ────────────────────────────────────────────────────────────
function isGoodResult(events: TrackingEvent[]): boolean {
  // Good = at least 2 events AND at least one has a location
  return events.length >= 2 && events.some((e) => e.location.trim() !== "");
}

// ─── Build result from 17TRACK data ──────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function build17Result(raw: any, events: TrackingEvent[], trackingNumber: string): TrackingResult {
  const trackInfo = raw.track_info;
  const latestStatusRaw = trackInfo?.latest_status?.status ?? "InfoReceived";
  const status = mapStatus(latestStatusRaw);
  const originCode = trackInfo?.shipping_info?.shipper_address?.country ?? "";
  const destCode = trackInfo?.shipping_info?.recipient_address?.country ?? "";
  const estFrom = trackInfo?.time_metrics?.estimated_delivery_date?.from ?? null;
  const estTo = trackInfo?.time_metrics?.estimated_delivery_date?.to ?? null;
  const estimatedDelivery = parseEstimatedDelivery(estTo ?? estFrom);
  const daysInTransit = trackInfo?.time_metrics?.days_of_transit_done > 0
    ? trackInfo.time_metrics.days_of_transit_done
    : calcDaysInTransit(events);
  const currentLocation = sanitizeLocation(trackInfo?.latest_event?.location ?? "") || events[0]?.location || parseCountry(destCode);

  return {
    trackingNumber,
    status,
    statusLabel: getStatusLabel(status),
    origin: parseCountry(originCode),
    destination: parseCountry(destCode),
    estimatedDelivery,
    daysInTransit,
    currentLocation,
    events,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Build result from TrackingMore data ─────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTMResult(raw: any, events: TrackingEvent[], trackingNumber: string): TrackingResult {
  const status = mapStatus(raw?.delivery_status ?? raw?.status ?? "pending");
  const origin = parseCountry(raw?.origin_country ?? raw?.shipper_address?.country ?? "");
  const destination = parseCountry(raw?.destination_country ?? raw?.recipient_address?.country ?? "");
  const estimatedDelivery = parseEstimatedDelivery(raw?.expected_delivery ?? null);
  const daysInTransit = raw?.days_of_transit ? Number(raw.days_of_transit) : calcDaysInTransit(events);
  const currentLocation = sanitizeLocation(raw?.latest_event_info ?? events[0]?.location ?? destination);

  return {
    trackingNumber,
    status,
    statusLabel: getStatusLabel(status),
    origin,
    destination,
    estimatedDelivery,
    daysInTransit,
    currentLocation,
    events,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Main resolver ────────────────────────────────────────────────────────────
export async function resolveTracking(trackingNumber: string): Promise<TrackingResult | null> {
  const clean = trackingNumber.trim().toUpperCase();

  // ── Try 17TRACK first ──
  let raw17: unknown = null;
  let events17: TrackingEvent[] = [];

  try {
    await registerTracking(clean);
    await new Promise((r) => setTimeout(r, 1000));
    raw17 = await getTracking(clean);
    if (raw17) events17 = build17Events(raw17);
  } catch (err) {
    console.error("[17TRACK] failed:", err);
  }

  // If 17TRACK gave us good data, use it
  if (raw17 && isGoodResult(events17)) {
    console.log("[Resolver] Using 17TRACK data");
    return build17Result(raw17, events17, clean);
  }

  // ── Fallback to TrackingMore ──
  let rawTM: unknown = null;
  let eventsTM: TrackingEvent[] = [];

  if (process.env.TRACKINGMORE_API_KEY) {
    try {
      rawTM = await getTrackingMore(clean);
      if (rawTM) eventsTM = buildTMEvents(rawTM);
    } catch (err) {
      console.error("[TrackingMore] failed:", err);
    }

    if (rawTM && isGoodResult(eventsTM)) {
      console.log("[Resolver] Using TrackingMore data");
      return buildTMResult(rawTM, eventsTM, clean);
    }
  }

  // ── Return whatever we have (prefer 17TRACK) ──
  if (raw17) {
    console.log("[Resolver] Using 17TRACK (partial data)");
    return build17Result(raw17, events17, clean);
  }
  if (rawTM) {
    console.log("[Resolver] Using TrackingMore (partial data)");
    return buildTMResult(rawTM, eventsTM, clean);
  }

  return null;
}