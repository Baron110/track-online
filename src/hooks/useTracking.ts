import { useState, useCallback } from "react";
import { TrackingResult } from "@/lib/types/tracking";

type TrackingState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; data: TrackingResult }
  | { phase: "error"; message: string; code?: string };

export function useTracking() {
  const [state, setState] = useState<TrackingState>({ phase: "idle" });

  const track = useCallback(async (trackingNumber: string) => {
    const clean = trackingNumber.trim();
    if (!clean) return;

    setState({ phase: "loading" });

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(clean)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setState({
          phase: "error",
          message: json.error ?? "Something went wrong. Please try again.",
          code: json.code,
        });
        return;
      }

      setState({ phase: "success", data: json.data });
    } catch {
      setState({
        phase: "error",
        message: "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  return { state, track, reset };
}
