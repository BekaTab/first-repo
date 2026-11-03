"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { AUCTION_LOCATIONS } from "@/data/locations";
import { useT } from "@/i18n";
import { asset } from "@/lib/asset";
import { EASE_LUXE } from "@/lib/motion";
import type { Auction } from "@/types/domain";

/**
 * Logos live in /public/brands. The shipped files are neutral placeholders —
 * drop the official artwork in under the same names (SVG preferred).
 */
const PARTNERS: readonly { auction: Auction; logo: `/${string}` }[] = [
  { auction: "Copart", logo: "/brands/copart.svg" },
  { auction: "IAAI", logo: "/brands/iaai.svg" },
];

/** Facility coverage per auction, straight from the calculator dataset. */
const COVERAGE = Object.fromEntries(
  PARTNERS.map(({ auction }) => {
    const locs = AUCTION_LOCATIONS.filter((l) => l.auction === auction);
    return [auction, { facilities: locs.length, states: new Set(locs.map((l) => l.state)).size }];
  }),
) as Record<Auction, { facilities: number; states: number }>;

export function AuctionPartners() {
  const t = useT();

  return (
    <section aria-labelledby="partners-title" className="overflow-x-clip py-20 sm:py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-gold">{t.partners.eyebrow}</p>
          <h2 id="partners-title" className="mt-4 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight text-charcoal">
            {t.partners.title}
          </h2>
          <p className="mt-4 text-slate-blue">{t.partners.body}</p>
        </Reveal>

        <div className="relative mx-auto mt-14 grid max-w-4xl items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-0">
          <PartnerCard index={0} {...PARTNERS[0]!} />
          <Hub label={t.partners.hub} />
          <PartnerCard index={1} {...PARTNERS[1]!} />
        </div>
      </div>
    </section>
  );
}

function PartnerCard({ auction, logo, index }: { auction: Auction; logo: `/${string}`; index: number }) {
  const t = useT();
  const { facilities, states } = COVERAGE[auction];

  return (
    <motion.div
      initial={{ opacity: 0, x: index === 0 ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.12, ease: EASE_LUXE }}
    >
      {/* Gentle, out-of-phase float. */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 6.5, delay: index * 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.article
          whileHover={{ y: -4 }}
          transition={{ duration: 0.5, ease: EASE_LUXE }}
          className="group relative overflow-hidden rounded-2xl border border-charcoal/[0.07] bg-white/70 px-8 py-9 text-center shadow-soft backdrop-blur-sm transition-shadow duration-700 ease-luxe hover:shadow-lifted"
        >
          {/* Gold light sweep on hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 transition-[left,opacity] duration-1000 ease-luxe group-hover:left-[120%] group-hover:opacity-100"
          />
          <span aria-hidden className="absolute inset-x-8 top-0 h-px origin-center scale-x-0 bg-gold transition-transform duration-700 ease-luxe group-hover:scale-x-100" />

          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public, works in the static export */}
          <img
            src={asset(logo)}
            alt={auction}
            width={240}
            height={64}
            loading="lazy"
            className="mx-auto h-12 w-auto max-w-[200px] object-contain opacity-75 grayscale transition-[filter,opacity,transform] duration-700 ease-luxe group-hover:scale-[1.03] group-hover:opacity-100 group-hover:grayscale-0"
          />
          <div className="mx-auto mt-7 h-px w-12 bg-gold/50" />
          <p className="mt-5 text-sm tabular-nums text-slate-blue">{t.partners.facilities(facilities, states)}</p>
        </motion.article>
      </motion.div>
    </motion.div>
  );
}

/** Centre node: both auctions feed into one Oceans Lines line. */
function Hub({ label }: { label: string }) {
  return (
    <div className="relative hidden h-full w-40 items-center justify-center md:flex" aria-hidden>
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 160 100" preserveAspectRatio="none">
        {[
          "M0 50 L58 50",
          "M160 50 L102 50",
        ].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke="rgb(var(--gold))"
            strokeWidth="1"
            strokeDasharray="3 4"
            fill="none"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5 + i * 0.15, ease: EASE_LUXE }}
          />
        ))}
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.35, ease: EASE_LUXE }}
        className="relative flex flex-col items-center gap-2"
      >
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 bg-cashmere shadow-soft">
          <span className="absolute inset-0 animate-[ol-ring_3.2s_ease-out_infinite] rounded-full border border-gold/40" />
          <LogoMark className="h-6 w-auto" />
        </span>
        <span className="whitespace-nowrap font-serif text-xs italic text-gold">{label}</span>
      </motion.div>
    </div>
  );
}
