"use client";

import { motion } from "framer-motion";
import { TrackingEvent } from "@/lib/types/tracking";

interface TimelineProps {
  events: TrackingEvent[];
}

function formatTimestamp(raw: string): { date: string; time: string } {
  try {
    const d = new Date(raw);
    const date = d.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    }).toUpperCase();
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    return { date, time };
  } catch {
    return { date: raw, time: "" };
  }
}

export function Timeline({ events }: TimelineProps) {
  if (!events.length) return null;

  return (
    <div className="flex flex-col gap-0">
      <h4 className="font-label-caps text-label-caps text-outline-variant uppercase tracking-widest px-2 mb-4">
        Shipment History
      </h4>

      {events.map((event, i) => {
        const { date, time } = formatTimestamp(event.timestamp);
        const isLatest = i === 0;

        return (
          <motion.div
            key={`${event.timestamp}-${i}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className={`flex gap-4 p-5 rounded-2xl border transition-all mb-2 ${
              isLatest
                ? "bg-surface-container-highest/20 border-outline-variant/30 hover:border-secondary/30"
                : "bg-surface-container-lowest border-outline-variant/20 opacity-70"
            }`}
          >
            <div className="flex flex-col items-center pt-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLatest ? "bg-secondary" : "bg-outline-variant"}`} />
              {i < events.length - 1 && (
                <div className="w-[1px] flex-1 bg-outline-variant/30 mt-2" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`font-mono-label text-mono-label mb-1 ${isLatest ? "text-secondary" : "text-outline"}`}>
                {date}{time && <span className="mx-1">•</span>}{time}
              </p>
              <p className="font-body-base text-body-base font-semibold text-on-background leading-snug">
                {event.description}
              </p>
              {event.location && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {event.location}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}