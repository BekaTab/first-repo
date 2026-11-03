import { useId } from "react";
import { cn } from "@/lib/utils";

/*
 * Oceans Lines logo, rebuilt as vector so it stays sharp at any size and can
 * flip to an inverse palette on dark surfaces.
 *
 * The mark is a solid field cut by two kinds of holes on an offset grid:
 * horizontal lens shapes and concave diamonds. Holes on the edges are clipped,
 * which produces the scalloped outline of the original.
 */

const W = 440;
const H = 480;
const COL = 110;
const ROW = 93.75;

const lens = (cx: number, cy: number, a = 42, b = 22) => {
  const r = (a * a + b * b) / (2 * b);
  return `M${cx - a} ${cy}A${r} ${r} 0 0 1 ${cx + a} ${cy}A${r} ${r} 0 0 1 ${cx - a} ${cy}Z`;
};

const diamond = (cx: number, cy: number, d = 23) => {
  const r = d * 1.15;
  return (
    `M${cx} ${cy - d}A${r} ${r} 0 0 0 ${cx + d} ${cy}A${r} ${r} 0 0 0 ${cx} ${cy + d}` +
    `A${r} ${r} 0 0 0 ${cx - d} ${cy}A${r} ${r} 0 0 0 ${cx} ${cy - d}Z`
  );
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const HOLES = [
  ...range(5).flatMap((row) => range(5).map((col) => lens(col * COL, 50 + row * ROW))),
  ...range(6).flatMap((row) => range(4).map((col) => diamond(55 + col * COL, 3 + row * ROW))),
].join("");

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  const maskId = useId();
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("text-ocean", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill="#fff" />
          <path d={HOLES} fill="#000" />
        </mask>
      </defs>
      <rect width={W} height={H} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

type LogoTone = "brand" | "inverse";

const TONES: Record<LogoTone, { mark: string; primary: string; secondary: string; rule: string; tagline: string }> = {
  brand: {
    mark: "text-ocean",
    primary: "text-navy",
    secondary: "text-ocean",
    rule: "bg-navy",
    tagline: "text-navy/85",
  },
  inverse: {
    mark: "text-[#6FA2EC]",
    primary: "text-[#F3EFE7]",
    secondary: "text-[#6FA2EC]",
    rule: "bg-[#F3EFE7]/70",
    tagline: "text-[#F3EFE7]/75",
  },
};

interface LogoProps {
  /** `full` includes the tagline. */
  variant?: "full" | "compact";
  tone?: LogoTone;
  className?: string;
}

/**
 * Sizing: set `font-size` on the wrapper (e.g. `text-[28px]`) — every part of
 * the lockup is sized in `em`, so the whole logo scales together.
 */
export function Logo({ variant = "compact", tone = "brand", className }: LogoProps) {
  const t = TONES[tone];
  const full = variant === "full";

  return (
    <span className={cn("inline-flex items-center leading-none", className)} aria-label="Oceans Lines" role="img">
      <LogoMark className={cn(t.mark, full ? "h-[2.35em] w-auto" : "h-[1.25em] w-auto")} />
      <span aria-hidden className={cn("mx-[0.4em] w-[0.06em] self-stretch rounded-full", t.rule)} />
      <span aria-hidden className="flex flex-col justify-center">
        <span className="whitespace-nowrap font-slab font-bold tracking-[0.01em]">
          <span className={t.primary}>OCEANS</span> <span className={t.secondary}>LINES</span>
        </span>
        {full ? (
          <span className={cn("mt-[0.3em] whitespace-nowrap font-sans text-[0.385em] font-light tracking-[0.04em]", t.tagline)}>
            YOUR BEST LINE FOR AUTO IMPORTS
          </span>
        ) : null}
      </span>
    </span>
  );
}
