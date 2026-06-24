"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTracking } from "@/hooks/useTracking";
import { SearchBar } from "@/components/tracking/SearchBar";
import { TrackingCard } from "@/components/tracking/TrackingCard";
import { TrackingSkeleton } from "@/components/tracking/TrackingSkeleton";
import { ErrorState } from "@/components/tracking/ErrorState";

export default function HomePage() {
  const { state, track, reset } = useTracking();
  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleSearch(trackingNumber: string) {
    await track(trackingNumber);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }

  const isLoading = state.phase === "loading";
  const showResults = state.phase !== "idle";

  return (
    <>
      {/* ── HEADER ── */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm backdrop-saturate-150 transition-all duration-300">
        <nav className="flex justify-between items-center h-16 md:h-20 px-4 md:px-16 max-w-[1280px] mx-auto">
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline gap-0">
              <span className="font-black text-[20px] md:text-[26px] text-on-background tracking-tight">QUIN-</span>
              <span className="font-black text-[20px] md:text-[26px] text-secondary tracking-tight">TRACK</span>
            </div>
            <span className="text-[8px] md:text-[9px] font-bold tracking-[0.2em] text-secondary uppercase border-t border-secondary/40 pt-0.5 mt-0.5">Global Logistics</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-secondary font-bold border-b-2 border-secondary pb-1 text-xs uppercase tracking-widest" href="#">Home</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-xs uppercase tracking-widest" href="#">Track</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-xs uppercase tracking-widest" href="#">Features</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-xs uppercase tracking-widest" href="#">Support</a>
          </div>
          <button className="bg-primary text-on-primary px-4 md:px-6 py-2 rounded-xl text-xs uppercase tracking-widest font-semibold hover:opacity-90 active:scale-95 transition-all">
            Track Now
          </button>
        </nav>
      </header>

      <main className="pt-16 md:pt-20">
        {/* ── HERO ── */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 md:py-24">

          {/* Floating background cards — hidden on mobile, pushed down on desktop */}
          <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
            {/* Left card — moved lower so it doesn't overlap search */}
            <div
              className="absolute top-[55%] left-[4%] glass-card p-5 rounded-2xl shadow-xl w-56 animate-float opacity-40"
              style={{ animationDelay: "0s" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
                <span className="text-[11px] font-semibold text-secondary tracking-widest uppercase">In Transit</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-2/3" />
              </div>
              <p className="mt-2 text-[12px] text-on-surface-variant opacity-60">Arriving Tuesday</p>
            </div>

            {/* Right card — moved lower */}
            <div
              className="absolute top-[50%] right-[4%] glass-card p-5 rounded-2xl shadow-xl w-56 animate-float opacity-40"
              style={{ animationDelay: "2s" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">package_2</span>
                <span className="text-[11px] font-semibold text-on-tertiary-container tracking-widest uppercase">Delivered</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-on-tertiary-container w-full" />
              </div>
              <p className="mt-2 text-[12px] text-on-surface-variant opacity-60">Signature Required</p>
            </div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 w-full max-w-4xl px-4 md:px-8 text-center">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-[11px] uppercase tracking-widest font-semibold mb-6"
            >
              Enterprise Logistics Redefined
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[32px] md:text-[48px] font-bold text-on-background mb-4 md:mb-6 leading-tight tracking-tight"
            >
              Track Any Package{" "}
              <br className="hidden md:block" />
              <span className="text-secondary">Worldwide</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[15px] md:text-[16px] text-on-surface-variant max-w-xl mx-auto mb-10 md:mb-12 leading-relaxed px-2"
            >
              Precise real-time shipment intelligence. Integrated with over 2,500 carriers globally for total visibility.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </motion.div>
          </div>
        </section>

        {/* ── RESULTS ── */}
        <AnimatePresence>
          {showResults && (
            <motion.section
              ref={resultsRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="py-8 md:py-12 bg-surface-container-low/50"
            >
              <div className="max-w-[1280px] mx-auto px-4 md:px-16">
                {state.phase === "loading" && <TrackingSkeleton />}
                {state.phase === "success" && <TrackingCard data={state.data} onReset={reset} />}
                {state.phase === "error" && (
                  <ErrorState message={state.message} code={state.code} onRetry={reset} />
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── FEATURES ── */}
        <section className="py-16 md:py-24 bg-surface-container-lowest">
          <div className="max-w-[1280px] mx-auto px-4 md:px-16">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-[28px] md:text-[48px] font-bold mb-4 tracking-tight">Engineered for Visibility</h2>
              <p className="text-[15px] text-on-surface-variant max-w-xl mx-auto">
                Modern tools built for high-frequency tracking and total package lifecycle management.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "public", title: "Global Coverage", desc: "Integrated with over 2,500 local and international carriers for borderless tracking." },
                { icon: "notifications_active", title: "Real-Time Updates", desc: "Instant status push notifications ensuring you never miss a delivery milestone." },
                { icon: "verified_user", title: "Secure Tracking", desc: "Enterprise-grade encryption protecting your personal shipment data and locations." },
                { icon: "bolt", title: "Fast Search", desc: "Proprietary search engine that finds results across carrier networks in milliseconds." },
              ].map((f) => (
                <div key={f.title} className="group p-6 md:p-8 rounded-3xl bg-surface transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-outline-variant/30">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-5 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined text-[28px]">{f.icon}</span>
                  </div>
                  <h4 className="text-[18px] font-semibold mb-2 tracking-tight">{f.title}</h4>
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST ── */}
        <section className="py-16 md:py-24 bg-on-background text-background overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "40px 40px" }}
            />
          </div>
          <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16 text-center">
            <h2 className="text-[28px] md:text-[48px] font-bold mb-10 md:mb-16 tracking-tight">Trusted Worldwide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-4xl mx-auto">
              <div className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-[40px] md:text-[48px] font-bold mb-2 text-secondary">2,500+</div>
                <div className="text-[11px] uppercase tracking-widest text-outline-variant font-semibold">Supported Carriers</div>
                <p className="mt-3 text-[13px] opacity-60 leading-relaxed">From global giants to hyper-local last-mile delivery services.</p>
              </div>
              <div className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-[40px] md:text-[48px] font-bold mb-2 text-secondary">150M+</div>
                <div className="text-[11px] uppercase tracking-widest text-outline-variant font-semibold">Packages Tracked</div>
                <p className="mt-3 text-[13px] opacity-60 leading-relaxed">Processing millions of status updates daily in over 190 countries.</p>
              </div>
            </div>
            <div className="mt-14 md:mt-20 flex flex-wrap justify-center gap-8 md:gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              {["UPS", "FedEx", "DHL", "USPS", "DPD", "ARAMEX"].map((c) => (
                <span key={c} className="text-[20px] md:text-[24px] font-bold">{c}</span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full py-12 md:py-8 bg-on-background border-t border-outline/10 text-background">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4 md:px-16 max-w-[1280px] mx-auto mb-10 md:mb-16">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex flex-col leading-none mb-4">
              <div className="flex items-baseline gap-0">
                <span className="font-black text-[22px] text-background tracking-tight">QUIN-</span>
                <span className="font-black text-[22px] text-secondary tracking-tight">TRACK</span>
              </div>
              <span className="text-[8px] font-bold tracking-[0.2em] text-secondary uppercase border-t border-secondary/40 pt-0.5 mt-0.5">Global Logistics</span>
            </div>
            <p className="text-[13px] text-outline-variant max-w-xs leading-relaxed">
              Redefining shipment intelligence for the digital age. Precision tracking for every parcel, everywhere.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-[11px] uppercase tracking-widest text-secondary font-semibold">Solutions</h5>
            {["Tracking", "Enterprise", "API Docs"].map((l) => (
              <a key={l} className="text-outline-variant hover:text-background transition-colors text-[13px]" href="#">{l}</a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-[11px] uppercase tracking-widest text-secondary font-semibold">Company</h5>
            {["Privacy Policy", "Terms of Service", "Support"].map((l) => (
              <a key={l} className="text-outline-variant hover:text-background transition-colors text-[13px]" href="#">{l}</a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-[11px] uppercase tracking-widest text-secondary font-semibold">Stay Updated</h5>
            <div className="relative">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary text-background placeholder:text-outline-variant"
                placeholder="Email address"
                type="email"
              />
              <button className="absolute right-2 top-2 material-symbols-outlined bg-secondary text-on-secondary p-1 rounded-lg text-[18px]">
                arrow_forward
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-16 max-w-[1280px] mx-auto border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-outline-variant text-center md:text-left">© 2025 QUIN-TRACK. Precision Logistics for the Modern Era.</p>
          <div className="flex gap-6">
            {["public", "alternate_email", "share"].map((i) => (
              <span key={i} className="material-symbols-outlined text-outline-variant hover:text-secondary cursor-pointer">{i}</span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}