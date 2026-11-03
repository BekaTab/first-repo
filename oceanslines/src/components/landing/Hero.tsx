"use client";

import { Anchor, Gavel, MapPin, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { GlobeRoutes } from "./GlobeRoutes";

/** Staggered CSS entrance (see .ol-rise in globals.css). */
const rise = (step: number) => ({ animationDelay: `${0.1 + step * 0.12}s` });

export function Hero() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden pb-24 pt-32 sm:pb-28 sm:pt-36">
      <div className="container grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <div className="ol-rise text-[26px] sm:text-[34px]" style={rise(0)}>
            <Logo variant="full" />
          </div>

          <div className="ol-rise mt-12 flex items-center gap-4" style={rise(1)}>
            <span className="hairline w-10" />
            <span className="eyebrow text-slate-blue">{t.hero.eyebrow}</span>
          </div>

          <h1
            style={rise(2)}
            className="ol-rise mt-6 max-w-[18ch] font-serif text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.05] tracking-[-0.015em] text-charcoal"
          >
            {t.hero.titleLead} <em className="text-gold">{t.hero.titleAccent}</em>
          </h1>

          <p className="ol-rise mt-7 max-w-xl text-[17px] leading-relaxed text-slate-blue" style={rise(3)}>
            {t.hero.body}
          </p>
        </div>

        <RouteCard />
      </div>
    </section>
  );
}

const STEP_ICONS: readonly LucideIcon[] = [Gavel, Anchor, MapPin];

function RouteCard() {
  const t = useT();
  return (
    <aside
      style={{ animationDelay: "0.3s", animationDuration: "1.1s" }}
      className="ol-rise relative isolate overflow-hidden rounded-[1.5rem] border border-gold/25 bg-[radial-gradient(120%_85%_at_70%_0%,#1C2D57_0%,#0F1A37_55%,#0A1228_100%)] p-3 shadow-lifted sm:p-5"
    >
      {/* Star dust */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgb(255_255_255/0.9)_1px,transparent_1.2px)] opacity-[0.08] [background-size:26px_26px] [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      <GlobeRoutes />
      <StepTrail steps={t.hero.steps} />
    </aside>
  );
}

/** Auction → US port → Poti: three nodes joined by a gold line with a travelling light. */
function StepTrail({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="relative mx-auto mt-1 grid max-w-md grid-cols-3 pb-2">
      <span aria-hidden className="absolute left-[16.67%] right-[16.67%] top-5 h-px bg-gradient-to-r from-gold/30 via-gold/60 to-gold/90" />
      <span aria-hidden className="absolute left-[16.67%] right-[16.67%] top-5 h-[3px] -translate-y-1/2 overflow-hidden">
        <span className="block h-full w-full animate-[ol-travel_3.6s_cubic-bezier(0.45,0,0.55,1)_infinite] bg-[linear-gradient(90deg,transparent_38%,#F5E3C0_50%,transparent_62%)] will-change-transform" />
      </span>
      {steps.map((step, i) => {
        const Icon = STEP_ICONS[i] ?? MapPin;
        const last = i === steps.length - 1;
        return (
          <li
            key={i}
            style={{ animationDelay: `${0.8 + i * 0.15}s` }}
            className="ol-rise relative flex flex-col items-center gap-2.5"
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full ring-[5px] ring-[#0E1834]",
                last ? "bg-gradient-to-br from-[#F0D29B] to-[#C9A063] text-[#14203F] shadow-[0_0_24px_rgb(227_182_106/0.45)]" : "border border-gold/45 bg-[#13203F] text-[#E9CF9E]",
              )}
            >
              <Icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </span>
            <span className={cn("text-center text-[13px]", last ? "font-medium text-[#F5E3C0]" : "text-[#F3EFE7]/75")}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
