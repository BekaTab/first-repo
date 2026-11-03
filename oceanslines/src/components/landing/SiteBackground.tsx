/**
 * Page backdrop for the public pages: warm cashmere with soft gold / ocean
 * light and fine ocean-current lines that drift slowly. Fixed behind content,
 * purely decorative.
 */

const W = 1680; // wider than the viewBox so the drift never shows an edge
const LINES = 22;

// Gentle sine "currents", each with its own phase and amplitude.
const WAVES = Array.from({ length: LINES }, (_, i) => {
  const y0 = 40 + i * 42;
  const amp = 10 + (i % 5) * 4;
  const phase = i * 0.7;
  let d = "";
  for (let x = 0; x <= W; x += 24) {
    const y = y0 + amp * Math.sin(x / 120 + phase) + 6 * Math.sin(x / 47 + phase * 2);
    d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
  }
  return d;
});

export function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-cashmere">
      {/* Soft light */}
      <div className="absolute -right-[10%] -top-[15%] h-[70vh] w-[60vw] rounded-full bg-gold/25 blur-[120px]" />
      <div className="absolute -left-[15%] top-[35%] h-[60vh] w-[50vw] rounded-full bg-ocean/[0.12] blur-[130px]" />
      <div className="absolute -bottom-[20%] right-[10%] h-[50vh] w-[50vw] rounded-full bg-navy/[0.08] blur-[120px]" />

      {/* Ocean-current lines */}
      <svg
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(75%_70%_at_50%_45%,black,transparent)]"
        viewBox="0 0 1440 960"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="animate-[ol-drift_60s_linear_infinite]" fill="none" stroke="rgb(var(--navy) / 0.07)" strokeWidth="1">
          {WAVES.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>

      {/* Fine grain so the gradients never band */}
      <div className="absolute inset-0 opacity-[0.035] [background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;)]" />
    </div>
  );
}
