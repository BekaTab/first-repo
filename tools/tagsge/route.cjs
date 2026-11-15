// Dot-matrix map (Turkey — Georgia — China) for the About section. Writes route.json
const fs = require('fs');
const topo = require('topojson-client');
const world = require('world-atlas/countries-50m.json');
const feats = topo.feature(world, world.objects.countries).features;

const LON0 = 20, LON1 = 136, LAT0 = 16, LAT1 = 54;
const KX = Math.cos(38 * Math.PI / 180);
const W = 600, S = W / ((LON1 - LON0) * KX), H = Math.round((LAT1 - LAT0) * S);
const P = (lon, lat) => [(lon - LON0) * KX * S, (LAT1 - lat) * S];
const STEP = 8;                           // dot pitch in viewBox units (integer: short path data)

const rings = feats.map(f => {
  const g = f.geometry; if (!g) return null;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let bb = [1e9, 1e9, -1e9, -1e9];
  polys.forEach(p => p[0].forEach(([x, y]) => { bb = [Math.min(bb[0], x), Math.min(bb[1], y), Math.max(bb[2], x), Math.max(bb[3], y)]; }));
  return { id: f.id, polys, bb };
}).filter(Boolean);
function inRing(r, x, y) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function country(lon, lat) {
  for (const f of rings) {
    if (lon < f.bb[0] || lon > f.bb[2] || lat < f.bb[1] || lat > f.bb[3]) continue;
    for (const p of f.polys) {
      if (!inRing(p[0], lon, lat)) continue;
      if (p.slice(1).some(h => inRing(h, lon, lat))) continue;
      return f.id;
    }
  }
  return null;
}
const groups = { base: [], hl: [], ge: [] };
const HL = { '792': 'hl', '156': 'hl', '268': 'ge' };   // Turkey, China, Georgia (ISO 3166 numeric)
for (let y = STEP / 2; y < H; y += STEP) {
  for (let x = STEP / 2; x < W; x += STEP) {
    const lon = x / S / KX + LON0, lat = LAT1 - y / S;
    const id = country(lon, lat);
    if (id == null) continue;
    groups[HL[id] || 'base'].push([x, y]);
  }
}
// Georgia is small: also mark the grid points that sit within half a pitch of its border
const geo = rings.find(r => r.id === '268');
for (let y = STEP / 2; y < H; y += STEP) for (let x = STEP / 2; x < W; x += STEP) {
  if (groups.ge.some(([a, b]) => a === x && b === y)) continue;
  const near = [[0, 0], [STEP / 3, 0], [-STEP / 3, 0], [0, STEP / 3], [0, -STEP / 3]].some(([dx, dy]) => {
    const lon = (x + dx) / S / KX + LON0, lat = LAT1 - (y + dy) / S;
    return geo.polys.some(p => inRing(p[0], lon, lat));
  });
  if (near) {
    for (const k of ['base', 'hl']) groups[k] = groups[k].filter(([a, b]) => !(a === x && b === y));
    groups.ge.push([x, y]);
  }
}
const r1 = v => Math.round(v * 10) / 10;
// one subpath per dot; consecutive dots in a row use a short relative move (compresses very well)
const dots = pts => {
  const rows = {}; pts.forEach(([x, y]) => (rows[y] = rows[y] || []).push(x));
  let d = '';
  Object.keys(rows).map(Number).sort((a, b) => a - b).forEach(y => {
    const xs = rows[y].sort((a, b) => a - b);
    xs.forEach((x, i) => { d += i && x - xs[i - 1] === STEP ? `m${STEP - .01} 0h.01` : `M${r1(x)} ${r1(y)}h.01`; });
  });
  return d;
};

const IST = P(28.98, 41.01), TBS = P(44.79, 41.72), SZX = P(114.06, 22.54);
const arc = (a, b, lift) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - lift;
  return `M${r1(a[0])} ${r1(a[1])}Q${r1(mx)} ${r1(my)} ${r1(b[0])} ${r1(b[1])}`;
};
const trArc = arc(IST, TBS, 34), cnArc = arc(SZX, TBS, 120);
const svg = `<svg class="route-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">` +
  `<defs><radialGradient id="map-fade" cx=".5" cy=".5" r=".62"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="map-mask"><rect width="${W}" height="${H}" fill="url(#map-fade)"/></mask></defs>` +
  `<path class="dots" mask="url(#map-mask)" d="${dots(groups.base)}"/>` +
  `<path class="dots dots-hl" d="${dots(groups.hl)}"/>` +
  `<path class="dots dots-ge" d="${dots(groups.ge)}"/>` +
  `<path class="route-path" d="${trArc}"/><path class="route-path" d="${cnArc}"/>` +
  `<path class="route-flow" pathLength="100" d="${trArc}"/><path class="route-flow f2" pathLength="100" d="${cnArc}"/>` +
  `<circle class="node" cx="${r1(IST[0])}" cy="${r1(IST[1])}" r="4.5"/><circle class="node" cx="${r1(SZX[0])}" cy="${r1(SZX[1])}" r="4.5"/>` +
  `<circle class="ge-pulse" cx="${r1(TBS[0])}" cy="${r1(TBS[1])}" r="9"/><circle class="ge-node" cx="${r1(TBS[0])}" cy="${r1(TBS[1])}" r="5.5"/>` +
  `</svg>`;
const pct = (p, dx = 0, dy = 0) => ({ left: r1((p[0] + dx) / W * 100), top: r1((p[1] + dy) / H * 100) });
const out = {
  W, H, svg,
  pins: {
    tr: pct(P(33.5, 38.6), 0, 24),
    cn: pct(P(101, 35)),
    ge: pct(TBS, 0, -30),
  },
  counts: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
};
fs.writeFileSync(__dirname + '/route.json', JSON.stringify(out));
console.log('viewBox', W, H, 'dots', out.counts, 'svg', (svg.length / 1024).toFixed(1) + ' KB', out.pins);
