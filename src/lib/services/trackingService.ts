import { TrackingResult, TrackingEvent, TrackingStatus } from "@/lib/types/tracking";
import { registerTracking, getTracking } from "@/lib/api/track17Client";
import { getTrackingMore } from "@/lib/api/trackingMoreClient";
import { sanitizeDescription, sanitizeLocation } from "@/lib/utils/sanitizer";
import { detectCarrier } from "@/lib/utils/carrierDetect";

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

// ─── 17TRACK event builder ──────────────────────────────────────────────────
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
  }).filter((e) => e.description !== "" && e.timestamp !== "");
}

// ─── TrackingMore event builder ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTMEvents(raw: any): TrackingEvent[] {
  // V4 GET response: full history in origin_info.trackinfo + destination_info.trackinfo
  const originEvents = raw?.origin_info?.trackinfo ?? [];
  const destEvents = raw?.destination_info?.trackinfo ?? [];
  const allEvents = [...originEvents, ...destEvents];

  console.log("[TM Events] origin:", originEvents.length, "dest:", destEvents.length);

  if (allEvents.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return allEvents.map((e: any) => {
    const rawDesc = e.tracking_detail ?? e.checkpoint_delivery_status ?? "";
    const rawLoc = e.location ?? e.checkpoint_location ?? "";
    const loc = sanitizeLocation(rawLoc);
    const parts = loc.split(",").map((p: string) => p.trim()).filter(Boolean);
    return {
      timestamp: e.checkpoint_date ?? "",
      description: sanitizeDescription(rawDesc),
      location: loc,
      city: parts[0] ?? "",
      country: parts[parts.length - 1] ?? "",
      status: mapStatus(e.checkpoint_delivery_status ?? ""),
    };
  })
  .filter((e: TrackingEvent) => e.description !== "" && e.timestamp !== "")
  .sort((a: TrackingEvent, b: TrackingEvent) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ─── Build result from 17TRACK ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function build17Result(raw: any, events: TrackingEvent[], trackingNumber: string): TrackingResult {
  const trackInfo = raw.track_info;
  const status = mapStatus(trackInfo?.latest_status?.status ?? "InfoReceived");
  const originCode = trackInfo?.shipping_info?.shipper_address?.country ?? "";
  const destCode = trackInfo?.shipping_info?.recipient_address?.country ?? "";
  const estFrom = trackInfo?.time_metrics?.estimated_delivery_date?.from ?? null;
  const estTo = trackInfo?.time_metrics?.estimated_delivery_date?.to ?? null;
  const daysInTransit = trackInfo?.time_metrics?.days_of_transit_done > 0
    ? trackInfo.time_metrics.days_of_transit_done : calcDaysInTransit(events);
  const currentLocation = sanitizeLocation(trackInfo?.latest_event?.location ?? "") || events[0]?.location || parseCountry(destCode);

  return {
    trackingNumber,
    status,
    statusLabel: getStatusLabel(status),
    origin: parseCountry(originCode),
    destination: parseCountry(destCode),
    estimatedDelivery: parseEstimatedDelivery(estTo ?? estFrom),
    daysInTransit,
    currentLocation,
    events,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Build result from TrackingMore ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTMResult(raw: any, events: TrackingEvent[], trackingNumber: string): TrackingResult {
  const status = mapStatus(raw?.delivery_status ?? raw?.status ?? "pending");
  const origin = parseCountry(raw?.origin_country ?? "");
  const destination = parseCountry(raw?.destination_country ?? "");
  const daysInTransit = raw?.days_of_transit ? Number(raw.days_of_transit) : calcDaysInTransit(events);
  const currentLocation = sanitizeLocation(raw?.latest_event_info ?? events[0]?.location ?? destination);

  return {
    trackingNumber,
    status,
    statusLabel: getStatusLabel(status),
    origin,
    destination,
    estimatedDelivery: parseEstimatedDelivery(raw?.expected_delivery ?? null),
    daysInTransit,
    currentLocation,
    events,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Merge: pick best origin + destination from both APIs ───────────────────
function mergeMetadata(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw17: any, events17: TrackingEvent[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawTM: any, eventsTM: TrackingEvent[],
  trackingNumber: string,
  winnerEvents: TrackingEvent[]
): TrackingResult {
  // Use 17TRACK for status + route (more reliable)
  const trackInfo = raw17?.track_info;
  const status = mapStatus(trackInfo?.latest_status?.status ?? rawTM?.delivery_status ?? "pending");
  
  // Origin: prefer 17TRACK, fallback to TM
  const originCode = trackInfo?.shipping_info?.shipper_address?.country ?? "";
  const origin = parseCountry(originCode) || parseCountry(rawTM?.origin_country ?? "");
  
  // Destination: prefer 17TRACK, fallback to TM
  const destCode = trackInfo?.shipping_info?.recipient_address?.country ?? "";
  const destination = parseCountry(destCode) || parseCountry(rawTM?.destination_country ?? "");

  // Estimated delivery: TM tends to be more accurate
  const estDelivery = parseEstimatedDelivery(rawTM?.expected_delivery ?? trackInfo?.time_metrics?.estimated_delivery_date?.to ?? null);

  // Days in transit
  const daysInTransit = trackInfo?.time_metrics?.days_of_transit_done > 0
    ? trackInfo.time_metrics.days_of_transit_done
    : rawTM?.days_of_transit
    ? Number(rawTM.days_of_transit)
    : calcDaysInTransit(winnerEvents);

  // Current location from latest event
  const currentLocation =
    sanitizeLocation(trackInfo?.latest_event?.location ?? "") ||
    sanitizeLocation(rawTM?.latest_event_info ?? "") ||
    winnerEvents[0]?.location ||
    destination;

  return {
    trackingNumber,
    status,
    statusLabel: getStatusLabel(status),
    origin,
    destination,
    estimatedDelivery: estDelivery,
    daysInTransit,
    currentLocation,
    events: winnerEvents,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Main resolver ───────────────────────────────────────────────────────────
export async function resolveTracking(trackingNumber: string): Promise<TrackingResult | null> {
  const clean = trackingNumber.trim().toUpperCase();

  // Detect carrier for better API accuracy
  const carrierHint = detectCarrier(clean);
  console.log(`[Resolver] Tracking: ${clean} | Carrier hint: ${carrierHint?.name ?? "unknown"}`);

  // Run both APIs in parallel for speed
  const [raw17, rawTM] = await Promise.allSettled([
    (async () => {
      await registerTracking(clean);
      await new Promise((r) => setTimeout(r, 1000));
      return await getTracking(clean);
    })(),
    process.env.TRACKINGMORE_API_KEY
      ? getTrackingMore(clean, carrierHint?.trackingMoreCode)
      : Promise.resolve(null),
  ]);

  const data17 = raw17.status === "fulfilled" ? raw17.value : null;
  const dataTM = rawTM.status === "fulfilled" ? rawTM.value : null;

  const events17 = data17 ? build17Events(data17) : [];
  const eventsTM = dataTM ? buildTMEvents(dataTM) : [];

  console.log(`[Resolver] 17TRACK: ${events17.length} events | TrackingMore: ${eventsTM.length} events`);

  // If neither returned anything useful
  if (!data17 && !dataTM) return null;
  if (events17.length === 0 && eventsTM.length === 0) {
    if (data17) return build17Result(data17, [], clean);
    return null;
  }

  // Pick winner: whichever has MORE events
  const winnerEvents = eventsTM.length >= events17.length ? eventsTM : events17;
  console.log(`[Resolver] Winner: ${eventsTM.length >= events17.length ? "TrackingMore" : "17TRACK"} with ${winnerEvents.length} events`);

  // If we have both, merge metadata from both for best accuracy
  if (data17 && dataTM) {
    return mergeMetadata(data17, events17, dataTM, eventsTM, clean, winnerEvents);
  }

  // Only one available
  if (data17) return build17Result(data17, events17, clean);
  if (dataTM) return buildTMResult(dataTM, eventsTM, clean);

  return null;
}