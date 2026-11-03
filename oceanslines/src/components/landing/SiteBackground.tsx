/**
 * Page backdrop for the public pages: warm cashmere with soft gold / ocean
 * light and fine ocean-current lines. Fixed behind content, purely decorative,
 * and fully static so it costs nothing while scrolling.
 */

const W = 1440;
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
      {/* Soft light — plain gradients (no blur filters) */}
      <div className="absolute inset-0 bg-[radial-gradient(45%_55%_at_88%_6%,rgb(var(--gold)/0.24),transparent_70%),radial-gradient(40%_45%_at_4%_55%,rgb(var(--ocean)/0.10),transparent_70%),radial-gradient(45%_40%_at_75%_100%,rgb(var(--navy)/0.07),transparent_70%)]" />

      {/* Ocean-current lines */}
      <svg
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(75%_70%_at_50%_45%,black,transparent)]"
        viewBox="0 0 1440 960"
        preserveAspectRatio="xMidYMid slice"
      >
        <g fill="none" stroke="rgb(var(--navy) / 0.07)" strokeWidth="1">
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
