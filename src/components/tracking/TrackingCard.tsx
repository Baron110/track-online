"use client";

import { motion } from "framer-motion";
import { TrackingResult } from "@/lib/types/tracking";
import { ProgressBar } from "./ProgressBar";
import { Timeline } from "./Timeline";

interface TrackingCardProps {
  data: TrackingResult;
  onReset: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  in_transit: "text-secondary bg-secondary-container/10",
  out_for_delivery: "text-on-tertiary-container bg-on-tertiary-container/10",
  delivered: "text-green-600 bg-green-50",
  exception: "text-error bg-error-container/30",
  pending: "text-outline bg-surface-container",
  expired: "text-outline bg-surface-container",
  not_found: "text-outline bg-surface-container",
};

export function TrackingCard({ data, onReset }: TrackingCardProps) {
  const statusColor = STATUS_COLORS[data.status] ?? STATUS_COLORS.pending;
  const isPulsing = data.status === "in_transit" || data.status === "out_for_delivery";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col md:flex-row gap-6"
    >
      {/* Left: Main Card */}
      <div className="w-full md:w-3/5">
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/50 overflow-hidden relative">
          {/* Status rail */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{
              background:
                data.status === "delivered"
                  ? "#16a34a"
                  : data.status === "exception"
                  ? "#ba1a1a"
                  : "linear-gradient(135deg, #316bf3 0%, #0051d5 100%)",
            }}
          />

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
            <div>
              <h3 className="font-mono-label text-mono-label text-outline mb-1 uppercase tracking-widest">
                Tracking Number
              </h3>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md">{data.trackingNumber}</h2>
                <button
                  onClick={() => navigator.clipboard?.writeText(data.trackingNumber)}
                  className="material-symbols-outlined text-outline hover:text-primary cursor-pointer transition-colors text-[20px]"
                  title="Copy tracking number"
                >
                  content_copy
                </button>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase flex items-center gap-2 ${statusColor}`}>
              {isPulsing && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
              )}
              {data.statusLabel}
            </div>
          </div>

          {/* Key info row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-surface-container rounded-2xl">
            <div>
              <p className="font-mono-label text-mono-label text-outline uppercase tracking-wider mb-1">Route</p>
              <p className="font-body-sm text-body-sm font-semibold text-on-background">
                {data.origin} → {data.destination}
              </p>
            </div>
            {data.estimatedDelivery && (
              <div className="col-span-2">
                <p className="font-mono-label text-mono-label text-outline uppercase tracking-wider mb-1">Est. Delivery</p>
                <p className="font-body-sm text-body-sm font-semibold text-on-background">
                  {data.estimatedDelivery}
                </p>
              </div>
            )}
            {data.daysInTransit !== null && (
              <div>
                <p className="font-mono-label text-mono-label text-outline uppercase tracking-wider mb-1">In Transit</p>
                <p className="font-body-sm text-body-sm font-semibold text-on-background">
                  {data.daysInTransit}d
                </p>
              </div>
            )}
          </div>

          {/* Progress */}
          <ProgressBar status={data.status} />

          {/* Current location */}
          {data.currentLocation && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">location_on</span>
              <div>
                <p className="font-mono-label text-mono-label text-outline uppercase tracking-wider mb-0.5">
                  Current Location
                </p>
                <p className="font-body-sm text-body-sm font-semibold text-on-background">
                  {data.currentLocation}
                </p>
              </div>
            </div>
          )}

          {/* Last updated */}
          <p className="mt-4 font-mono-label text-mono-label text-outline/50 text-right">
            Updated {new Date(data.lastUpdated).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Right: Timeline */}
      <div className="w-full md:w-2/5 flex flex-col gap-4">
        <Timeline events={data.events} />

        <button
          onClick={onReset}
          className="mt-2 text-center py-3 font-label-caps text-label-caps text-secondary uppercase hover:underline"
        >
          Track Another Package
        </button>
      </div>
    </motion.div>
  );
}