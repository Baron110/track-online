"use client";

import { motion } from "framer-motion";

interface ErrorStateProps {
  message: string;
  code?: string;
  onRetry: () => void;
}

const ERROR_ICONS: Record<string, string> = {
  NOT_FOUND: "search_off",
  RATE_LIMITED: "timer",
  INVALID_INPUT: "error_outline",
  NETWORK_ERROR: "wifi_off",
  SERVER_ERROR: "cloud_off",
};

const ERROR_HINTS: Record<string, string> = {
  NOT_FOUND: "Double-check the number and try again. New shipments can take up to 24 hours to appear.",
  RATE_LIMITED: "You've made too many requests. Please wait a minute before trying again.",
  INVALID_INPUT: "Tracking numbers are typically 10–30 characters. Check for typos.",
  NETWORK_ERROR: "Check your internet connection and try again.",
  SERVER_ERROR: "Our tracking service is temporarily unavailable. Please try again shortly.",
};

export function ErrorState({ message, code, onRetry }: ErrorStateProps) {
  const icon = ERROR_ICONS[code ?? ""] ?? "error_outline";
  const hint = ERROR_HINTS[code ?? ""] ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="bg-surface-container-lowest rounded-3xl p-10 border border-outline-variant/50 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-error-container/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-[32px]">{icon}</span>
        </div>

        <div>
          <h3 className="font-headline-md text-headline-md text-on-background mb-2">
            {message}
          </h3>
          {hint && (
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              {hint}
            </p>
          )}
        </div>

        <button
          onClick={onRetry}
          className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-caps text-label-caps uppercase hover:bg-secondary transition-colors duration-300"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  );
}
