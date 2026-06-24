"use client";

import { motion } from "framer-motion";

function Bone({ className }: { className: string }) {
  return (
    <motion.div
      className={`bg-surface-container-high rounded-xl ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function TrackingSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left card skeleton */}
      <div className="w-full md:w-3/5">
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/50 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-surface-container-high" />

          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-2">
              <Bone className="h-3 w-28" />
              <Bone className="h-6 w-48" />
            </div>
            <Bone className="h-8 w-24 rounded-full" />
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-surface-container rounded-2xl">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Bone className="h-2 w-16" />
                <Bone className="h-4 w-24" />
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative py-12 px-4">
            <Bone className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 rounded-none" />
            <div className="relative flex justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <Bone className="w-10 h-10 rounded-full" />
                  <Bone className="h-2 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <Bone className="h-16 w-full rounded-2xl mt-6" />
        </div>
      </div>

      {/* Right timeline skeleton */}
      <div className="w-full md:w-2/5 flex flex-col gap-4">
        <Bone className="h-3 w-32 mb-2" />
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20"
          >
            <div className="flex flex-col items-center pt-1">
              <div className="w-2 h-2 rounded-full bg-surface-container-high" />
              {i < 3 && <div className="w-[1px] flex-1 bg-surface-container-high mt-2 min-h-[40px]" />}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <Bone className="h-3 w-36" />
              <Bone className="h-4 w-full" />
              <Bone className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
