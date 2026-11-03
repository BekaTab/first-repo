"use client";

import { motion } from "framer-motion";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { EASE_LUXE, fadeUp, stagger } from "@/lib/motion";
import { PortalButton } from "./PortalButton";

const ROUTE = [
  { stage: "Auction", place: "Copart · IAAI", note: "Inspected, bid and paid on your behalf" },
  { stage: "US port", place: "Newark · Savannah · Houston · Los Angeles", note: "Towed from the yard, loaded and sealed" },
  { stage: "Ocean", place: "Atlantic crossing", note: "Tracked container freight" },
  { stage: "Arrival", place: "Poti, Georgia", note: "Cleared through customs, ready to collect" },
] as const;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-24 pt-32 sm:pb-32 sm:pt-40">
      {/* Atmosphere: warm light + an oversized, barely-there brand mark. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_20%,rgb(var(--gold)/0.18),transparent_70%),radial-gradient(50%_40%_at_10%_90%,rgb(var(--ocean)/0.07),transparent_70%)]"
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: EASE_LUXE }}
        className="pointer-events-none absolute -right-32 top-10 -z-10 hidden w-[560px] [mask-image:radial-gradient(closest-side,black_30%,transparent)] lg:block"
      >
        <LogoMark className="w-full text-navy opacity-[0.05]" />
      </motion.div>

      <div className="container grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <motion.div initial="hidden" animate="visible" variants={stagger(0.14, 0.15)}>
          <motion.div variants={fadeUp} className="text-[26px] sm:text-[34px]">
            <Logo variant="full" />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex items-center gap-4">
            <span className="hairline w-10" />
            <span className="eyebrow text-slate-blue">US auctions · Ocean freight · Georgian customs</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 max-w-[16ch] font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.04] tracking-[-0.015em] text-charcoal"
          >
            Every car, carried <em className="text-gold">with intent.</em>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-7 max-w-xl text-[17px] leading-relaxed text-slate-blue">
            Oceans Lines buys at Copart and IAAI, moves your vehicle across the Atlantic and clears it through
            Georgian customs — one accountable line from the first bid to the final key.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <PortalButton size="lg" />
            <a
              href="#services"
              className="group inline-flex h-12 items-center gap-2 px-2 text-[15px] text-charcoal/80 transition-colors hover:text-charcoal"
            >
              Explore services
              <span className="h-px w-6 bg-gold transition-all duration-500 ease-luxe group-hover:w-10" />
            </a>
          </motion.div>
        </motion.div>

        <RouteCard />
      </div>
    </section>
  );
}

function RouteCard() {
  return (
    <motion.aside
      aria-label="How a car travels with Oceans Lines"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.45, ease: EASE_LUXE }}
      className="glass relative rounded-2xl p-7 sm:p-9"
    >
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-slate-blue">The line</p>
        <p className="font-serif text-sm italic text-gold">USA → Georgia</p>
      </div>

      <ol className="relative mt-8">
        {/* The route line draws itself once. */}
        <svg aria-hidden className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px overflow-visible" preserveAspectRatio="none">
          <motion.line
            x1="0.5"
            x2="0.5"
            y1="0"
            y2="100%"
            stroke="rgb(var(--gold))"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.9, ease: EASE_LUXE }}
          />
        </svg>

        {ROUTE.map((step, i) => (
          <motion.li
            key={step.stage}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 + i * 0.25, ease: EASE_LUXE }}
            className="relative pb-7 pl-9 last:pb-0"
          >
            <span
              aria-hidden
              className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border border-gold bg-cashmere ring-4 ring-cashmere/70"
            />
            <p className="eyebrow text-gold">{step.stage}</p>
            <p className="mt-1.5 font-medium text-charcoal">{step.place}</p>
            <p className="mt-0.5 text-sm text-slate-blue">{step.note}</p>
          </motion.li>
        ))}
      </ol>
    </motion.aside>
  );
}
