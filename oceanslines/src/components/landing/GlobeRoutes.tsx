"use client";

import { useReducedMotion } from "framer-motion";
import { geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { useEffect, useId, useMemo, useRef } from "react";
import landTopology from "world-atlas/land-110m.json";
import { useT, type Dictionary } from "@/i18n";
import { cn } from "@/lib/utils";

/*
 * Animated globe: shipping arcs from the main US export ports to Poti.
 *
 * Geometry is computed with d3-geo (orthographic projection) and written
 * straight to the SVG attributes on each animation frame — no React
 * re-renders while animating. The first frame is rendered on the server, so
 * the globe is visible before JavaScript runs.
 */

type LonLat = [number, number];
type PortKey = keyof Dictionary["hero"]["ports"];

interface Port {
  key: Exclude<PortKey, "poti">;
  coords: LonLat;
  /** Label placement relative to the dot. */
  label: { anchor: "start" | "middle" | "end"; dx: number; dy: number };
}

const PORTS: readonly Port[] = [
  { key: "newark", coords: [-74.17, 40.69], label: { anchor: "start", dx: 10, dy: -8 } },
  { key: "savannah", coords: [-81.09, 32.08], label: { anchor: "start", dx: 9, dy: 20 } },
  { key: "houston", coords: [-95.27, 29.73], label: { anchor: "end", dx: -6, dy: 24 } },
  { key: "losAngeles", coords: [-118.26, 33.73], label: { anchor: "end", dx: -10, dy: -6 } },
];
const POTI: LonLat = [41.67, 42.15];

// View: centred over the North Atlantic so both coasts are on the visible face.
const R = 230;
const CX = 260;
const CY = 260;
const BASE_ROTATION: [number, number] = [38, -26];
const SWAY_DEG = 5; // slow side-to-side rotation
const SWAY_PERIOD = 48; // s

// Arc timing.
const SAMPLES = 80;
const PERIOD = 7.5; // s, one full cycle per arc
const STAGGER = 1.1; // s between arcs
const DRAW = 0.5; // share of the cycle spent drawing
const HOLD = 0.8; // …then holding until this point, then fading
const ARC_HEIGHT = 0.14; // peak altitude as a share of the radius

const topology = landTopology as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topology, topology.objects.land) as FeatureCollection<Geometry>;
const GRATICULE = geoGraticule10();

/** Great-circle samples for each route (static). */
const ROUTES: readonly LonLat[][] = PORTS.map((p) => {
  const interpolate = geoInterpolate(p.coords, POTI);
  return Array.from({ length: SAMPLES + 1 }, (_, i) => interpolate(i / SAMPLES) as LonLat);
});

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

interface Frame {
  land: string;
  graticule: string;
  ports: { x: number; y: number }[];
  poti: { x: number; y: number };
  tracks: string[];
  arcs: { d: string; opacity: number; head: { x: number; y: number; angle: number } | null }[];
}

function computeFrame(time: number, animate: boolean): Frame {
  const sway = animate ? SWAY_DEG * Math.sin((2 * Math.PI * time) / SWAY_PERIOD) : 0;
  const projection = geoOrthographic()
    .scale(R)
    .translate([CX, CY])
    .rotate([BASE_ROTATION[0] + sway, BASE_ROTATION[1]])
    .clipAngle(90);
  const path = geoPath(projection);

  const project = (c: LonLat, altitude = 0) => {
    const [x, y] = projection(c) ?? [CX, CY];
    return { x: CX + (x - CX) * (1 + altitude), y: CY + (y - CY) * (1 + altitude) };
  };

  const lifted = ROUTES.map((pts) => pts.map((c, i) => project(c, ARC_HEIGHT * Math.sin((Math.PI * i) / SAMPLES))));
  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("");

  const arcs = lifted.map((pts, i) => {
    const local = time - i * STAGGER;
    if (!animate) return { d: toPath(pts), opacity: 1, head: headAt(pts, SAMPLES) };
    if (local < 0) return { d: "", opacity: 0, head: null };

    const phase = (local % PERIOD) / PERIOD;
    const progress = phase < DRAW ? easeInOut(phase / DRAW) : 1;
    const opacity = phase < HOLD ? 1 : 1 - (phase - HOLD) / (1 - HOLD);

    const exact = progress * SAMPLES;
    const whole = Math.floor(exact);
    const partial = pts.slice(0, whole + 1);
    const next = pts[Math.min(whole + 1, SAMPLES)]!;
    const last = pts[whole]!;
    const f = exact - whole;
    partial.push({ x: last.x + (next.x - last.x) * f, y: last.y + (next.y - last.y) * f });

    return { d: progress > 0 ? toPath(partial) : "", opacity, head: progress > 0.01 ? headAt(partial, partial.length - 1) : null };
  });

  return {
    land: path(LAND) ?? "",
    graticule: path(GRATICULE) ?? "",
    ports: PORTS.map((p) => project(p.coords)),
    poti: project(POTI),
    tracks: lifted.map(toPath),
    arcs,
  };
}

function headAt(pts: { x: number; y: number }[], index: number) {
  const p = pts[index]!;
  const prev = pts[Math.max(0, index - 2)]!;
  return { x: p.x, y: p.y, angle: (Math.atan2(p.y - prev.y, p.x - prev.x) * 180) / Math.PI };
}

const ARROW = "M7 0L-5 -5.5L-2.5 0L-5 5.5Z";

export function GlobeRoutes({ className }: { className?: string }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");

  // Server + first client render: a static frame with all routes drawn.
  const initial = useMemo(() => computeFrame(0, false), []);

  const svgRef = useRef<SVGSVGElement>(null);
  const landRef = useRef<SVGPathElement>(null);
  const gratRef = useRef<SVGPathElement>(null);
  const potiRef = useRef<SVGGElement>(null);
  const portRefs = useRef<(SVGGElement | null)[]>([]);
  const trackRefs = useRef<(SVGPathElement | null)[]>([]);
  const arcRefs = useRef<(SVGPathElement | null)[]>([]);
  const headRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (reduceMotion) return;
    const svg = svgRef.current;
    if (!svg) return;

    let raf = 0;
    let visible = true;
    const start = performance.now();

    const paint = (frame: Frame) => {
      landRef.current?.setAttribute("d", frame.land);
      gratRef.current?.setAttribute("d", frame.graticule);
      potiRef.current?.setAttribute("transform", `translate(${frame.poti.x} ${frame.poti.y})`);
      frame.ports.forEach((p, i) => portRefs.current[i]?.setAttribute("transform", `translate(${p.x} ${p.y})`));
      frame.tracks.forEach((d, i) => trackRefs.current[i]?.setAttribute("d", d));
      frame.arcs.forEach((arc, i) => {
        const el = arcRefs.current[i];
        const head = headRefs.current[i];
        el?.setAttribute("d", arc.d);
        el?.setAttribute("opacity", String(arc.opacity));
        if (head) {
          head.setAttribute("opacity", arc.head ? String(arc.opacity) : "0");
          if (arc.head) head.setAttribute("transform", `translate(${arc.head.x} ${arc.head.y}) rotate(${arc.head.angle})`);
        }
      });
    };

    const tick = (now: number) => {
      raf = 0;
      paint(computeFrame((now - start) / 1000, true));
      if (visible) raf = requestAnimationFrame(tick);
    };

    // Only animate while on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(svg);
    raf = requestAnimationFrame(tick);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      paint(initial);
    };
  }, [reduceMotion, initial]);

  return (
    <svg
      ref={svgRef}
      viewBox="-76 14 628 494"
      role="img"
      aria-label={t.hero.routeAria}
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <radialGradient id={`${uid}-sphere`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F4F1EC" />
          <stop offset="100%" stopColor="#E6E0D6" />
        </radialGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="rgb(var(--gold))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="rgb(var(--gold))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-arc`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(var(--gold))" stopOpacity="0.45" />
          <stop offset="100%" stopColor="rgb(var(--gold))" />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={`${uid}-clip`}>
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
      </defs>

      {/* Halo + sphere */}
      <circle cx={CX} cy={CY} r={R + 26} fill={`url(#${uid}-glow)`} />
      <circle cx={CX} cy={CY} r={R} fill={`url(#${uid}-sphere)`} stroke="rgb(var(--gold) / 0.35)" strokeWidth="1" />

      <g clipPath={`url(#${uid}-clip)`}>
        <path ref={gratRef} d={initial.graticule} fill="none" stroke="rgb(var(--charcoal) / 0.06)" strokeWidth="0.75" />
        <path ref={landRef} d={initial.land} fill="rgb(var(--navy) / 0.13)" stroke="rgb(var(--navy) / 0.18)" strokeWidth="0.5" />
      </g>

      {/* Faint dashed tracks */}
      {initial.tracks.map((d, i) => (
        <path
          key={`track-${i}`}
          ref={(el) => {
            trackRefs.current[i] = el;
          }}
          d={d}
          fill="none"
          stroke="rgb(var(--gold) / 0.6)"
          strokeWidth="1.3"
          strokeDasharray="2 6"
          strokeLinecap="round"
        />
      ))}

      {/* Animated arcs + arrowheads */}
      <g filter={`url(#${uid}-soft)`}>
        {initial.arcs.map((arc, i) => (
          <path
            key={`arc-${i}`}
            ref={(el) => {
              arcRefs.current[i] = el;
            }}
            d={arc.d}
            fill="none"
            stroke={`url(#${uid}-arc)`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        ))}
        {initial.arcs.map((arc, i) => (
          <path
            key={`head-${i}`}
            ref={(el) => {
              headRefs.current[i] = el;
            }}
            d={ARROW}
            fill="rgb(var(--gold))"
            transform={arc.head ? `translate(${arc.head.x} ${arc.head.y}) rotate(${arc.head.angle})` : undefined}
            opacity={arc.head ? 1 : 0}
          />
        ))}
      </g>

      {/* US ports */}
      {PORTS.map((port, i) => {
        const p = initial.ports[i]!;
        return (
          <g
            key={port.key}
            ref={(el) => {
              portRefs.current[i] = el;
            }}
            transform={`translate(${p.x} ${p.y})`}
          >
            <circle r="7" fill="rgb(var(--cashmere))" opacity="0.9" />
            <circle r="4.2" fill="rgb(var(--navy))" />
            <text
              x={port.label.dx}
              y={port.label.dy}
              textAnchor={port.label.anchor}
              className="fill-charcoal/80 font-sans text-[16px] font-medium [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px] [stroke:rgb(var(--cashmere)/0.85)]"
            >
              {t.hero.ports[port.key]}
            </text>
          </g>
        );
      })}

      {/* Poti */}
      <g ref={potiRef} transform={`translate(${initial.poti.x} ${initial.poti.y})`}>
        <circle r="6" fill="none" stroke="rgb(var(--gold))" strokeWidth="1.4" className="origin-center animate-[ol-pulse_2.8s_ease-out_infinite] [transform-box:fill-box]" />
        <circle r="8.5" fill="rgb(var(--cashmere))" opacity="0.9" />
        <circle r="5.6" fill="rgb(var(--gold))" />
        <text x="12" y="-12" className="fill-charcoal font-serif text-[21px] italic [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px] [stroke:rgb(var(--cashmere)/0.85)]">
          {t.hero.ports.poti}
        </text>
      </g>
    </svg>
  );
}
