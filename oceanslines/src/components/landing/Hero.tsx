"use client";

import { motion } from "framer-motion";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useT } from "@/i18n";
import { EASE_LUXE, fadeUp, stagger } from "@/lib/motion";
import { GlobeRoutes } from "./GlobeRoutes";
import { PortalButton } from "./PortalButton";

export function Hero() {
  const t = useT();
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

      <div className="container grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <motion.div initial="hidden" animate="visible" variants={stagger(0.14, 0.15)}>
          <motion.div variants={fadeUp} className="text-[26px] sm:text-[34px]">
            <Logo variant="full" />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex items-center gap-4">
            <span className="hairline w-10" />
            <span className="eyebrow text-slate-blue">{t.hero.eyebrow}</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 max-w-[18ch] font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.04] tracking-[-0.015em] text-charcoal"
          >
            {t.hero.titleLead} <em className="text-gold">{t.hero.titleAccent}</em>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-7 max-w-xl text-[17px] leading-relaxed text-slate-blue">
            {t.hero.body}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <PortalButton size="lg" />
            <a
              href="#services"
              className="group inline-flex h-12 items-center gap-2 px-2 text-[15px] text-charcoal/80 transition-colors hover:text-charcoal"
            >
              {t.hero.explore}
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
  const t = useT();
  return (
    <motion.aside
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.45, ease: EASE_LUXE }}
      className="glass relative overflow-hidden rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-slate-blue">{t.hero.routeTitle}</p>
        <p className="font-serif text-sm italic text-gold">{t.hero.routeDirection}</p>
      </div>

      <GlobeRoutes className="-mx-1 mt-1" />

      <ol className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-slate-blue">
        {t.hero.steps.map((step, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden className="text-gold">→</span> : null}
            <span className={i === t.hero.steps.length - 1 ? "font-medium text-charcoal" : undefined}>{step}</span>
          </li>
        ))}
      </ol>
    </motion.aside>
  );
}
