"use client";

import { useId, useState } from "react";
import { useT, type Dictionary } from "@/i18n";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";
import { GLOBE, PORT_POINTS, POTI_POINT, ROUTE_PATHS } from "./globe-geometry";

/*
 * Night globe with shipping routes from the main US export ports to Poti.
 *
 * Lightweight by design: the map is a pre-rendered image (public/globe-base.svg,
 * from scripts/build-globe.mjs) that the browser draws once and caches; only
 * the small route layer is inline. Arcs draw with a CSS dash animation and the
 * arrowheads ride along them with native SVG <animateMotion>. No JavaScript
 * runs per frame. Hovering a port highlights its route.
 */

type PortKey = Exclude<keyof Dictionary["hero"]["ports"], "poti">;

const PORTS: readonly { key: PortKey; label: { anchor: "start" | "end"; dx: number; dy: number } }[] = [
  { key: "newark", label: { anchor: "start", dx: 11, dy: -9 } },
  { key: "savannah", label: { anchor: "start", dx: 10, dy: 21 } },
  { key: "houston", label: { anchor: "end", dx: -7, dy: 25 } },
  { key: "losAngeles", label: { anchor: "end", dx: -11, dy: -7 } },
];

const PERIOD = 7.5; // s — one draw / hold / fade cycle per route
const STAGGER = 1.1; // s between routes

const VIEWBOX = GLOBE.viewBox;
const ARROW = "M8 0L-5.5 -6L-2.5 0L-5.5 6Z";
const LABEL_HALO = "[paint-order:stroke] [stroke-linejoin:round] [stroke-width:5px] [stroke:rgb(11_19_40/0.85)]";

export function GlobeRoutes({ className }: { className?: string }) {
  const t = useT();
  const uid = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<PortKey | null>(null);

  return (
    <div role="img" aria-label={t.hero.routeAria} className={cn("relative select-none", className)}>
      {/* Static base map: a cached image, drawn once. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- static file from /public, works in the static export */}
      <img
        src={asset("/globe-base.svg")}
        alt=""
        width={GLOBE.width}
        height={GLOBE.height}
        decoding="async"
        className="block h-auto w-full"
      />

      {/* Animated routes, ports and labels */}
      <svg viewBox={VIEWBOX} className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${uid}-arc`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E9CF9E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E3B66A" />
          </linearGradient>
        </defs>

      {/* Routes */}
      {PORTS.map(({ key }, i) => {
        const id = `${uid}-route-${key}`;
        const isHovered = hovered === key;
        const timing = { animationDuration: `${PERIOD}s`, animationDelay: `${i * STAGGER}s` };
        return (
          <g
            key={key}
            className="transition-opacity duration-300"
            opacity={hovered && !isHovered ? 0.2 : 1}
          >
            {/* Faint dashed track */}
            <path d={ROUTE_PATHS[key]} fill="none" stroke="rgb(227 182 106 / 0.4)" strokeWidth="1.2" strokeDasharray="2 6" strokeLinecap="round" />
            {/* Drawing arc */}
            <path
              id={id}
              d={ROUTE_PATHS[key]}
              pathLength={1}
              fill="none"
              stroke={`url(#${uid}-arc)`}
              strokeWidth={isHovered ? 3.4 : 2.4}
              strokeLinecap="round"
              strokeDasharray="1"
              className={cn("ol-arc", isHovered && "ol-arc-hold")}
              style={timing}
            />
            {/* Arrowhead travelling with the front of the arc */}
            <g className="ol-arc-head" style={timing}>
              <path d={ARROW} fill="#E9C27E">
                <animateMotion
                  dur={`${PERIOD}s`}
                  begin={`${i * STAGGER}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                  keyPoints="0;1;1"
                  keyTimes="0;0.5;1"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0 0 1 1"
                >
                  <mpath href={`#${id}`} />
                </animateMotion>
              </path>
            </g>
          </g>
        );
      })}

      {/* US ports — hover / focus highlights the route */}
      {PORTS.map(({ key, label }) => {
        const p = PORT_POINTS[key];
        const active = hovered === key;
        return (
          <g
            key={key}
            transform={`translate(${p.x} ${p.y})`}
            className="cursor-pointer outline-none"
            opacity={hovered && !active ? 0.55 : 1}
            onPointerEnter={() => setHovered(key)}
            onPointerLeave={() => setHovered((h) => (h === key ? null : h))}
            onFocus={() => setHovered(key)}
            onBlur={() => setHovered((h) => (h === key ? null : h))}
            tabIndex={0}
            aria-label={t.hero.ports[key]}
          >
            <circle r="16" fill="transparent" />
            <circle r={active ? 9.5 : 7.5} fill="rgb(197 168 128 / 0.25)" className="transition-[r] duration-300" />
            <circle r="4.4" fill="#F3EFE7" />
            <text
              x={label.dx}
              y={label.dy}
              textAnchor={label.anchor}
              className={cn("pointer-events-none fill-[#F3EFE7] font-sans text-[17px] font-medium", LABEL_HALO)}
            >
              {t.hero.ports[key]}
            </text>
          </g>
        );
      })}

      {/* Poti */}
      <g transform={`translate(${POTI_POINT.x} ${POTI_POINT.y})`} className="pointer-events-none">
        <circle r="6.5" fill="none" stroke="#E3B66A" strokeWidth="1.5" className="origin-center animate-[ol-pulse_2.8s_ease-out_infinite] [transform-box:fill-box]" />
        <circle r="9" fill="rgb(227 182 106 / 0.25)" />
        <circle r="5.8" fill="#E3B66A" />
        <text x="13" y="-13" className={cn("fill-[#F5E3C0] font-serif text-[23px] italic", LABEL_HALO)}>
          {t.hero.ports.poti}
        </text>
      </g>
      </svg>
    </div>
  );
}
