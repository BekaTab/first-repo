"use client";

import { motion } from "framer-motion";
import { FileCheck2, Gavel, Ship, type LucideIcon } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { EASE_LUXE } from "@/lib/motion";

interface Service {
  icon: LucideIcon;
  title: string;
  summary: string;
  points: readonly string[];
}

const SERVICES: readonly Service[] = [
  {
    icon: Gavel,
    title: "Auction buying",
    summary: "Access to Copart and IAAI without the guesswork. We vet the lot, set the ceiling with you, and bid.",
    points: ["Lot history and photo review", "Bidding to your agreed limit", "Auction payment and title handling"],
  },
  {
    icon: Ship,
    title: "Logistics",
    summary: "From the auction yard to the port of Poti, one coordinated chain with a single point of contact.",
    points: ["Inland towing to the nearest export port", "Container loading and ocean freight", "Status updates at every hand-off"],
  },
  {
    icon: FileCheck2,
    title: "Clearing",
    summary: "Georgian customs, duties and paperwork handled precisely, so the car is ready when it lands.",
    points: ["Customs declaration and duties", "Document preparation and checks", "Release and hand-over in Georgia"],
  },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-gold">About us</p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.01em] text-charcoal">
              A quieter way to import a car.
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="space-y-5 text-[17px] leading-relaxed text-slate-blue lg:pt-10">
            <p>
              Importing from the United States involves auctions, towing companies, shipping lines and customs
              officers — each with their own timing and paperwork. Oceans Lines brings all of it onto one line.
            </p>
            <p>
              Members see every rate before they commit, follow each stage from the portal, and deal with one team
              from the first bid to the moment the keys change hands.
            </p>
          </Reveal>
        </div>

        <div id="services" className="scroll-mt-28 pt-20">
          <Reveal className="flex items-center gap-4">
            <span className="hairline w-10" />
            <p className="eyebrow text-slate-blue">Core services</p>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
            {SERVICES.map((service, i) => (
              <RevealItem key={service.title} className="h-full">
                <ServiceCard service={service} index={i} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = service.icon;
  return (
    <motion.article
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={{ rest: { y: 0 }, hover: { y: -6 } }}
      transition={{ duration: 0.6, ease: EASE_LUXE }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-charcoal/[0.07] bg-white/60 p-8 shadow-soft backdrop-blur-sm transition-shadow duration-700 ease-luxe hover:shadow-lifted"
    >
      {/* Gold hairline that draws across on hover. */}
      <motion.span
        aria-hidden
        variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
        transition={{ duration: 0.7, ease: EASE_LUXE }}
        className="absolute inset-x-0 top-0 h-px origin-left bg-gold"
      />

      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/40 bg-cashmere text-charcoal transition-colors duration-500 group-hover:border-gold group-hover:text-gold">
          <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <span className="font-serif text-sm italic text-charcoal/30">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <h3 className="mt-8 font-serif text-2xl text-charcoal">{service.title}</h3>
      <p className="mt-3 leading-relaxed text-slate-blue">{service.summary}</p>

      <ul className="mt-6 space-y-2.5 border-t border-charcoal/[0.07] pt-6">
        {service.points.map((p) => (
          <li key={p} className="flex gap-3 text-sm text-charcoal/80">
            <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-gold" />
            {p}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
