"use client";

import { useReducedMotion } from "framer-motion";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { Move } from "lucide-react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import landTopology from "world-atlas/land-110m.json";
import { useT, type Dictionary } from "@/i18n";
import { cn } from "@/lib/utils";

/*
 * Interactive night globe: shipping arcs from the main US export ports to Poti.
 *
 * - Arcs draw themselves in sequence with an arrowhead travelling to Poti.
 * - Drag (mouse or touch) to rotate; on release it eases back to the home view.
 * - Hover / focus a port to highlight its route.
 *
 * Geometry comes from d3-geo (orthographic projection) and is written straight
 * to SVG attributes each animation frame — no React re-renders while animating.
 * The first frame is rendered on the server.
 */

type LonLat = [number, number];
type Pt = { x: number; y: number };
type PortKey = Exclude<keyof Dictionary["hero"]["ports"], "poti">;

interface Port {
  key: PortKey;
  coords: LonLat;
  label: { anchor: "start" | "middle" | "end"; dx: number; dy: number };
}

const PORTS: readonly Port[] = [
  { key: "newark", coords: [-74.17, 40.69], label: { anchor: "start", dx: 11, dy: -9 } },
  { key: "savannah", coords: [-81.09, 32.08], label: { anchor: "start", dx: 10, dy: 21 } },
  { key: "houston", coords: [-95.27, 29.73], label: { anchor: "end", dx: -7, dy: 25 } },
  { key: "losAngeles", coords: [-118.26, 33.73], label: { anchor: "end", dx: -11, dy: -7 } },
];
const POTI: LonLat = [41.67, 42.15];

const R = 230;
const CX = 260;
const CY = 260;
const HOME: [number, number] = [38, -26]; // rotation: centred over the North Atlantic
const SWAY_DEG = 5;
const SWAY_PERIOD = 48;
const DRAG_SPEED = 0.35; // degrees per viewBox unit
const LAT_LIMIT = 35;
const RETURN_DELAY = 1.4; // s after release before easing home
const RETURN_RATE = 1.8; // higher = faster ease home

const SAMPLES = 80;
const PERIOD = 7.5;
const STAGGER = 1.1;
const DRAW = 0.5;
const HOLD = 0.8;
const ARC_HEIGHT = 0.14;

// Tight frame around the globe, with room for the port labels on the left.
const VIEW_X = -104;
const VIEW_Y = 12;
const VIEW_W = 644;
const VIEW_H = 500;

const topology = landTopology as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topology, topology.objects.land) as FeatureCollection<Geometry>;
const GRATICULE = geoGraticule10();

const ROUTES: readonly LonLat[][] = PORTS.map((p) => {
  const interpolate = geoInterpolate(p.coords, POTI);
  return Array.from({ length: SAMPLES + 1 }, (_, i) => interpolate(i / SAMPLES) as LonLat);
});

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

interface ArcFrame {
  d: string;
  opacity: number;
  width: number;
  head: (Pt & { angle: number }) | null;
}

interface Frame {
  land: string;
  graticule: string;
  ports: (Pt & { visible: boolean })[];
  poti: Pt & { visible: boolean };
  tracks: string[];
  arcs: ArcFrame[];
}

interface View {
  time: number;
  animate: boolean;
  offset: { lon: number; lat: number };
  hovered: number | null;
}

/** Polyline through visible points only, breaking where the route passes behind the globe. */
function toPath(pts: Pt[], visible: boolean[]): string {
  let d = "";
  let pen = false;
  pts.forEach((p, i) => {
    if (!visible[i]) {
      pen = false;
      return;
    }
    d += `${pen ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    pen = true;
  });
  return d;
}

function headAt(pts: Pt[], index: number) {
  const p = pts[index]!;
  const prev = pts[Math.max(0, index - 2)]!;
  return { x: p.x, y: p.y, angle: (Math.atan2(p.y - prev.y, p.x - prev.x) * 180) / Math.PI };
}

function computeFrame({ time, animate, offset, hovered }: View): Frame {
  const sway = animate ? SWAY_DEG * Math.sin((2 * Math.PI * time) / SWAY_PERIOD) : 0;
  const rotation: [number, number] = [HOME[0] + sway + offset.lon, HOME[1] + offset.lat];
  const centre: LonLat = [-rotation[0], -rotation[1]];
  const projection = geoOrthographic().scale(R).translate([CX, CY]).rotate(rotation).clipAngle(90);
  const path = geoPath(projection);

  const isVisible = (c: LonLat) => geoDistance(c, centre) < Math.PI / 2 - 0.02;
  const project = (c: LonLat, altitude = 0): Pt => {
    const [x, y] = projection(c) ?? [CX, CY];
    return { x: CX + (x - CX) * (1 + altitude), y: CY + (y - CY) * (1 + altitude) };
  };

  const routes = ROUTES.map((geo) => ({
    pts: geo.map((c, i) => project(c, ARC_HEIGHT * Math.sin((Math.PI * i) / SAMPLES))),
    visible: geo.map(isVisible),
  }));

  const arcs = routes.map(({ pts, visible }, i): ArcFrame => {
    const isHovered = hovered === i;
    const dimmed = hovered !== null && !isHovered;

    let progress = 1;
    let opacity = 1;
    if (animate && !isHovered) {
      const local = time - i * STAGGER;
      if (local < 0) {
        progress = 0;
      } else {
        const phase = (local % PERIOD) / PERIOD;
        progress = phase < DRAW ? easeInOut(phase / DRAW) : 1;
        opacity = phase < HOLD ? 1 : 1 - (phase - HOLD) / (1 - HOLD);
      }
    }
    if (dimmed) opacity *= 0.25;

    if (progress <= 0) return { d: "", opacity: 0, width: 2.4, head: null };

    const exact = progress * SAMPLES;
    const whole = Math.floor(exact);
    const partial = pts.slice(0, whole + 1);
    const vis = visible.slice(0, whole + 1);
    if (whole < SAMPLES) {
      const a = pts[whole]!;
      const b = pts[whole + 1]!;
      const f = exact - whole;
      partial.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
      vis.push(visible[whole + 1]!);
    }
    const last = partial.length - 1;
    return {
      d: toPath(partial, vis),
      opacity,
      width: isHovered ? 3.6 : 2.4,
      head: vis[last] && progress > 0.01 ? headAt(partial, last) : null,
    };
  });

  return {
    land: path(LAND) ?? "",
    graticule: path(GRATICULE) ?? "",
    ports: PORTS.map((p) => ({ ...project(p.coords), visible: isVisible(p.coords) })),
    poti: { ...project(POTI), visible: isVisible(POTI) },
    tracks: routes.map(({ pts, visible }) => toPath(pts, visible)),
    arcs,
  };
}

const ARROW = "M8 0L-5.5 -6L-2.5 0L-5.5 6Z";
const LABEL_HALO = "[paint-order:stroke] [stroke-linejoin:round] [stroke-width:5px] [stroke:rgb(11_19_40/0.85)]";

export function GlobeRoutes({ className }: { className?: string }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [hintVisible, setHintVisible] = useState(true);

  const initial = useMemo(() => computeFrame({ time: 0, animate: false, offset: { lon: 0, lat: 0 }, hovered: null }), []);

  const svgRef = useRef<SVGSVGElement>(null);
  const landRef = useRef<SVGPathElement>(null);
  const gratRef = useRef<SVGPathElement>(null);
  const potiRef = useRef<SVGGElement>(null);
  const portRefs = useRef<(SVGGElement | null)[]>([]);
  const trackRefs = useRef<(SVGPathElement | null)[]>([]);
  const arcRefs = useRef<(SVGPathElement | null)[]>([]);
  const headRefs = useRef<(SVGPathElement | null)[]>([]);

  // Interaction state lives in refs: read by the animation loop, never re-renders.
  const offset = useRef({ lon: 0, lat: 0 });
  const hovered = useRef<number | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; lon: number; lat: number } | null>(null);
  const releasedAt = useRef(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const start = last;

    const paint = (f: Frame) => {
      landRef.current?.setAttribute("d", f.land);
      gratRef.current?.setAttribute("d", f.graticule);
      const poti = potiRef.current;
      poti?.setAttribute("transform", `translate(${f.poti.x} ${f.poti.y})`);
      poti?.setAttribute("opacity", f.poti.visible ? "1" : "0");
      f.ports.forEach((p, i) => {
        const g = portRefs.current[i];
        const active = hovered.current === i;
        g?.setAttribute("transform", `translate(${p.x} ${p.y}) scale(${active ? 1.25 : 1})`);
        g?.setAttribute("opacity", p.visible ? (hovered.current === null || active ? "1" : "0.55") : "0");
      });
      f.tracks.forEach((d, i) => trackRefs.current[i]?.setAttribute("d", d));
      f.arcs.forEach((arc, i) => {
        const el = arcRefs.current[i];
        el?.setAttribute("d", arc.d);
        el?.setAttribute("opacity", String(arc.opacity));
        el?.setAttribute("stroke-width", String(arc.width));
        const head = headRefs.current[i];
        if (head) {
          head.setAttribute("opacity", arc.head ? String(arc.opacity) : "0");
          if (arc.head) head.setAttribute("transform", `translate(${arc.head.x} ${arc.head.y}) rotate(${arc.head.angle})`);
        }
      });
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Ease back to the home view a moment after the user lets go.
      if (!drag.current && now - releasedAt.current > RETURN_DELAY * 1000) {
        const k = Math.exp(-RETURN_RATE * dt);
        offset.current = { lon: offset.current.lon * k, lat: offset.current.lat * k };
      }

      paint(computeFrame({ time: (now - start) / 1000, animate: !reduceMotion, offset: offset.current, hovered: hovered.current }));
      if (visible) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(svg);
    raf = requestAnimationFrame(tick);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  // --- Pointer handling -------------------------------------------------------

  const toViewBox = (e: ReactPointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const scale = VIEW_W / rect.width;
    return { x: e.clientX * scale, y: e.clientY * scale };
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const p = toViewBox(e);
    drag.current = { id: e.pointerId, x: p.x, y: p.y, lon: offset.current.lon, lat: offset.current.lat };
    e.currentTarget.setPointerCapture(e.pointerId);
    setHintVisible(false);
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const p = toViewBox(e);
    offset.current = {
      lon: d.lon + (p.x - d.x) * DRAG_SPEED,
      lat: Math.max(-LAT_LIMIT, Math.min(LAT_LIMIT, d.lat - (p.y - d.y) * DRAG_SPEED)),
    };
  };

  const endDrag = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    releasedAt.current = performance.now();
  };

  return (
    <div className={cn("relative", className)}>
      <svg
        ref={svgRef}
        viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={t.hero.routeAria}
        className="h-auto w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <radialGradient id={`${uid}-sphere`} cx="40%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#243A6B" />
            <stop offset="55%" stopColor="#152447" />
            <stop offset="100%" stopColor="#0A1430" />
          </radialGradient>
          <radialGradient id={`${uid}-atmo`} cx="50%" cy="50%" r="50%">
            <stop offset="84%" stopColor="#3A7DD8" stopOpacity="0.45" />
            <stop offset="92%" stopColor="#3A7DD8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3A7DD8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-spec`} cx="34%" cy="26%" r="45%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-arc`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E9CF9E" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E3B66A" />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`${uid}-clip`}>
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>

        {/* Atmosphere + ocean */}
        <circle cx={CX} cy={CY} r={R + 34} fill={`url(#${uid}-atmo)`} />
        <circle cx={CX} cy={CY} r={R} fill={`url(#${uid}-sphere)`} />

        <g clipPath={`url(#${uid}-clip)`}>
          <path ref={gratRef} d={initial.graticule} fill="none" stroke="rgb(236 232 224 / 0.07)" strokeWidth="0.75" />
          <path ref={landRef} d={initial.land} fill="rgb(236 232 224 / 0.17)" stroke="rgb(236 232 224 / 0.28)" strokeWidth="0.6" />
          <circle cx={CX} cy={CY} r={R} fill={`url(#${uid}-spec)`} />
        </g>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgb(197 168 128 / 0.35)" strokeWidth="1" />

        {/* Faint dashed tracks */}
        {initial.tracks.map((d, i) => (
          <path
            key={`track-${i}`}
            ref={(el) => {
              trackRefs.current[i] = el;
            }}
            d={d}
            fill="none"
            stroke="rgb(227 182 106 / 0.4)"
            strokeWidth="1.2"
            strokeDasharray="2 6"
            strokeLinecap="round"
          />
        ))}

        {/* Animated arcs + arrowheads */}
        <g filter={`url(#${uid}-glow)`}>
          {initial.arcs.map((arc, i) => (
            <path
              key={`arc-${i}`}
              ref={(el) => {
                arcRefs.current[i] = el;
              }}
              d={arc.d}
              fill="none"
              stroke={`url(#${uid}-arc)`}
              strokeWidth={arc.width}
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
              fill="#E9C27E"
              transform={arc.head ? `translate(${arc.head.x} ${arc.head.y}) rotate(${arc.head.angle})` : undefined}
              opacity={arc.head ? 1 : 0}
            />
          ))}
        </g>

        {/* US ports (hover / focus to highlight the route) */}
        {PORTS.map((port, i) => {
          const p = initial.ports[i]!;
          const enter = () => {
            hovered.current = i;
          };
          const leave = () => {
            if (hovered.current === i) hovered.current = null;
          };
          return (
            <g
              key={port.key}
              ref={(el) => {
                portRefs.current[i] = el;
              }}
              transform={`translate(${p.x} ${p.y})`}
              className="cursor-pointer outline-none"
              onPointerEnter={enter}
              onPointerLeave={leave}
              onFocus={enter}
              onBlur={leave}
              tabIndex={0}
              aria-label={t.hero.ports[port.key]}
            >
              <circle r="16" fill="transparent" />
              <circle r="7.5" fill="rgb(197 168 128 / 0.25)" />
              <circle r="4.4" fill="#F3EFE7" />
              <text
                x={port.label.dx}
                y={port.label.dy}
                textAnchor={port.label.anchor}
                className={cn("pointer-events-none fill-[#F3EFE7] font-sans text-[17px] font-medium", LABEL_HALO)}
              >
                {t.hero.ports[port.key]}
              </text>
            </g>
          );
        })}

        {/* Poti */}
        <g ref={potiRef} transform={`translate(${initial.poti.x} ${initial.poti.y})`} className="pointer-events-none">
          <circle
            r="6.5"
            fill="none"
            stroke="#E3B66A"
            strokeWidth="1.5"
            className="origin-center animate-[ol-pulse_2.8s_ease-out_infinite] [transform-box:fill-box]"
          />
          <circle r="9" fill="rgb(227 182 106 / 0.25)" />
          <circle r="5.8" fill="#E3B66A" />
          <text x="13" y="-13" className={cn("fill-[#F5E3C0] font-serif text-[23px] italic", LABEL_HALO)}>
            {t.hero.ports.poti}
          </text>
        </g>
      </svg>

      <p
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-[11px] text-[#F3EFE7]/55 transition-opacity duration-700",
          hintVisible ? "opacity-100" : "opacity-0",
        )}
      >
        <Move className="h-3 w-3" />
        {t.hero.dragHint}
      </p>
    </div>
  );
}
