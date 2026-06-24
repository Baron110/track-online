"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";

interface SearchBarProps {
  onSearch: (trackingNumber: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSearch(value.trim());
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-3 p-2 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30"
      >
        <div className="flex-1 flex items-center px-4 gap-3">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter Tracking Number"
            className="w-full bg-transparent border-none focus:ring-0 font-body-base py-4 text-on-background placeholder:text-outline/60 outline-none"
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />
          {value && !isLoading && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="material-symbols-outlined text-outline hover:text-on-surface transition-colors text-[18px]"
            >
              close
            </button>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isLoading || !value.trim()}
          className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-caps text-label-caps uppercase hover:bg-secondary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
              Locating...
            </>
          ) : (
            "Track Package"
          )}
        </motion.button>
      </form>

      {/* Supported carriers */}
      <div className="mt-6 flex flex-wrap justify-center gap-6 opacity-60">
        {["UPS Global", "FedEx Express", "DHL Solutions", "Royal Mail"].map((name) => (
          <div key={name} className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">done</span>
            <span className="text-body-sm font-body-sm">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}