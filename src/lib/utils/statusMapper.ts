import { TrackingStatus } from "@/lib/types/tracking";

// 17TRACK status codes → our internal status
const STATUS_MAP: Record<number, TrackingStatus> = {
  0: "pending",        // Not Found
  10: "pending",       // In Shipping Info Received
  20: "in_transit",    // In Transit
  25: "in_transit",    // Expired (treat as in transit for display)
  30: "in_transit",    // Pickup Available
  35: "out_for_delivery", // Out for Delivery
  40: "delivered",     // Delivered
  50: "exception",     // Undelivered
  60: "exception",     // Exception
  65: "expired",       // Expired
};

const STATUS_LABELS: Record<TrackingStatus, string> = {
  pending: "Label Created",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  exception: "Delivery Exception",
  expired: "Shipment Expired",
  not_found: "Not Found",
};

export function mapStatusCode(code: number): TrackingStatus {
  return STATUS_MAP[code] ?? "not_found";
}

export function getStatusLabel(status: TrackingStatus): string {
  return STATUS_LABELS[status];
}

// Progress step index (0-4) for the progress bar
export function getProgressStep(status: TrackingStatus): number {
  const steps: Record<TrackingStatus, number> = {
    pending: 0,
    in_transit: 2,
    out_for_delivery: 3,
    delivered: 4,
    exception: 2,
    expired: 1,
    not_found: 0,
  };
  return steps[status] ?? 0;
}
