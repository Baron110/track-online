"use client";

import { motion } from "framer-motion";
import { TrackingStatus } from "@/lib/types/tracking";
import { getProgressStep } from "@/lib/utils/statusMapper";

interface ProgressBarProps {
  status: TrackingStatus;
}

const STEPS = [
  { label: "Confirmed", icon: "check_circle", filled: true },
  { label: "Shipped", icon: "inventory_2", filled: true },
  { label: "In Transit", icon: "local_shipping", filled: false },
  { label: "Out for Delivery", icon: "home_pin", filled: false },
  { label: "Delivered", icon: "check_box", filled: false },
];

export function ProgressBar({ status }: ProgressBarProps) {
  const currentStep = getProgressStep(status);
  const progressPercent = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div className="relative py-12 px-4">
      {/* Background rail */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-high -translate-y-1/2" />

      {/* Animated progress fill */}
      <motion.div
        className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2"
        style={{
          background: "linear-gradient(135deg, #316bf3 0%, #0051d5 100%)",
        }}
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
            <div key={step.label} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`
                  ${isActive ? "w-12 h-12 shadow-xl ring-8 ring-secondary-container/10" : "w-10 h-10"}
                  rounded-full flex items-center justify-center mb-3 z-10 transition-all duration-300
                  ${isComplete || isActive
                    ? "text-on-primary"
                    : "bg-surface-container-highest text-outline opacity-40"
                  }
                `}
                style={
                  isComplete || isActive
                    ? { background: "linear-gradient(135deg, #316bf3 0%, #0051d5 100%)" }
                    : {}
                }
              >
                <span
                  className={`material-symbols-outlined ${isActive ? "text-[24px] animate-pulse" : "text-[20px]"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {step.icon}
                </span>
              </motion.div>

              <span
                className={`font-label-caps text-label-caps ${
                  isActive
                    ? "text-secondary font-bold"
                    : isFuture
                    ? "text-on-surface opacity-40"
                    : "text-on-surface"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
