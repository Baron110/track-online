"use client";

import { motion } from "framer-motion";
import { TrackingStatus } from "@/lib/types/tracking";
import { getProgressStep } from "@/lib/utils/statusMapper";

interface ProgressBarProps {
  status: TrackingStatus;
}

const STEPS = [
  { label: "Confirmed", shortLabel: "Done", icon: "check_circle" },
  { label: "Shipped", shortLabel: "Shipped", icon: "inventory_2" },
  { label: "In Transit", shortLabel: "Transit", icon: "local_shipping" },
  { label: "Out for Delivery", shortLabel: "Delivery", icon: "home_pin" },
  { label: "Delivered", shortLabel: "Done", icon: "check_box" },
];

export function ProgressBar({ status }: ProgressBarProps) {
  const currentStep = getProgressStep(status);
  const progressPercent = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div className="relative py-10 px-2">
      {/* Background rail */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-high -translate-y-1/2" />

      {/* Animated progress fill */}
      <motion.div
        className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2"
        style={{ background: "linear-gradient(135deg, #316bf3 0%, #0051d5 100%)" }}
        initial={{ width: "0%" }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isComplete = i < currentStep;
          const isFuture = i > currentStep;

          return (
            <div key={step.label} className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`
                  ${isActive ? "w-10 h-10 md:w-12 md:h-12 shadow-xl ring-4 md:ring-8 ring-secondary/10" : "w-8 h-8 md:w-10 md:h-10"}
                  rounded-full flex items-center justify-center z-10 transition-all duration-300
                  ${isComplete || isActive ? "text-on-primary" : "bg-surface-container-highest text-outline opacity-40"}
                `}
                style={
                  isComplete || isActive
                    ? { background: "linear-gradient(135deg, #316bf3 0%, #0051d5 100%)" }
                    : {}
                }
              >
                <span
                  className={`material-symbols-outlined ${isActive ? "text-[18px] md:text-[22px] animate-pulse" : "text-[16px] md:text-[18px]"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {step.icon}
                </span>
              </motion.div>

              {/* Label — short on mobile, full on desktop */}
              <span className={`text-center leading-tight ${
                isActive ? "text-secondary font-bold" : isFuture ? "text-on-surface opacity-40" : "text-on-surface"
              }`}>
                <span className="block md:hidden text-[9px] font-semibold uppercase tracking-wide">
                  {step.shortLabel}
                </span>
                <span className="hidden md:block text-[11px] font-semibold uppercase tracking-wide">
                  {step.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}