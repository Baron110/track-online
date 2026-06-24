export type TrackingStatus =
  | "pending"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "expired"
  | "not_found";

export interface TrackingEvent {
  timestamp: string;
  description: string;
  location: string;
  city: string;
  country: string;
  status: TrackingStatus;
}

export interface TrackingResult {
  trackingNumber: string;
  status: TrackingStatus;
  statusLabel: string;
  origin: string;
  destination: string;
  estimatedDelivery: string | null;
  daysInTransit: number | null;
  currentLocation: string;
  events: TrackingEvent[];
  lastUpdated: string;
}

export interface TrackingApiResponse {
  success: boolean;
  data?: TrackingResult;
  error?: string;
  code?: string;
}

export interface Raw17TrackEvent {
  a: string; // timestamp
  z: string; // description
  l?: string; // location
}

export interface Raw17TrackData {
  track: {
    e: number; // status code
    w1?: {
      b?: string; // origin country
      c?: string; // destination country
      d?: string; // estimated delivery
      z?: Raw17TrackEvent[]; // events
    };
  };
  number: string;
}
