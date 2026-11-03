/**
 * Generates public/bg-waves.svg — the fine ocean-current lines used by the
 * site background. A static, cached image keeps them out of every page's HTML.
 *
 *   node scripts/build-background.mjs
 */
import { writeFileSync } from "node:fs";

const W = 1440;
const H = 960;
const LINES = 22;

let paths = "";
for (let i = 0; i < LINES; i++) {
  const y0 = 40 + i * 42;
  const amp = 10 + (i % 5) * 4;
  const phase = i * 0.7;
  let d = "";
  for (let x = 0; x <= W; x += 24) {
    const y = y0 + amp * Math.sin(x / 120 + phase) + 6 * Math.sin(x / 47 + phase * 2);
    d += `${x ? "L" : "M"}${x} ${Math.round(y)}`;
  }
  paths += `<path d="${d}"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><g fill="none" stroke="#1F2A4D" stroke-opacity=".07">${paths}</g></svg>\n`;
writeFileSync(new URL("../public/bg-waves.svg", import.meta.url), svg);
console.log(`bg-waves.svg ${(svg.length / 1024).toFixed(1)} KB`);
