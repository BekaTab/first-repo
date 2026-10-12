// Builds the mypoker.ge store into dist/ (Vercel project root: mypoker/).
//   dist/index.html   page shell with products.json inlined as a JSON data element (#mp-data)
//   dist/app.js       React app bundled from MyPokerStore.jsx
//   dist/app.css      Tailwind CSS generated from the classes the app uses
//   dist/admin/       admin panel (products, prices, sales, settings)
//   dist/images/      product photos uploaded from the admin panel
//   dist/p/<id>/      one page per visible product (own title, description, preview image)
//   dist/404.html, sitemap.xml, robots.txt
// Usage: node build.mjs [--fragment <file>]   (--fragment also writes a page body without <html>/<head>, for previews)
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
const fragIdx = process.argv.indexOf("--fragment");
const fragmentOut = fragIdx > -1 ? process.argv[fragIdx + 1] : null;

const data = JSON.parse(readFileSync(join(here, "products.json"), "utf8"));
if (!data || !Array.isArray(data.products) || typeof data.settings !== "object") {
  throw new Error("products.json must contain { settings: {...}, products: [...] }");
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await build({
  stdin: {
    contents: `import { createRoot } from "react-dom/client";
import App from "./MyPokerStore.jsx";
createRoot(document.getElementById("root")).render(<App />);`,
    resolveDir: here,
    loader: "jsx",
  },
  bundle: true,
  minify: true,
  jsx: "automatic",
  target: "es2019",
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: join(dist, "app.js"),
  logLevel: "warning",
});

const cssIn = join(dist, ".tailwind-input.css");
writeFileSync(cssIn, "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
execFileSync(join(here, "node_modules", ".bin", "tailwindcss"), ["-i", cssIn, "-o", join(dist, "app.css"), "--content", join(here, "MyPokerStore.jsx"), "--minify"], {
  stdio: ["ignore", "ignore", "inherit"],
});
rmSync(cssIn);

if (existsSync(join(here, "public"))) cpSync(join(here, "public"), dist, { recursive: true });
cpSync(join(here, "admin"), join(dist, "admin"), { recursive: true });

// Tab icon: big red spade on white with a red outline (readable at 16px on light and dark tab bars)
const SPADE = "M20 9.2c0 0-8.4 6.3-8.4 11.3 0 2.8 2.1 4.7 4.6 4.7 1.4 0 2.6-.6 3.1-1.5l-1.2 5.1h3.8l-1.2-5.1c.5.9 1.7 1.5 3.1 1.5 2.5 0 4.6-1.9 4.6-4.7 0-5-8.4-11.3-8.4-11.3Z";
const iconSvg = (outline = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7" fill="#fff"${
    outline ? ' stroke="#c8102e" stroke-width="2"' : ""
  }/><path d="${SPADE}" fill="#c8102e" transform="translate(16 16.3) scale(1.3) translate(-20 -19.35)"/></svg>`;
writeFileSync(join(dist, "favicon.svg"), iconSvg());
const favicon = "data:image/svg+xml," + encodeURIComponent(iconSvg());
const SITE = "https://mypoker.ge";
const storeTitle = "mypoker.ge — პოკერის აქსესუარების მაღაზია";
const storeDescription = "პოკერის ჩიპები, კარტები, მაგიდები და აქსესუარები. შეკვეთა WhatsApp-ით, მიწოდება მთელ საქართველოში.";
const inlineData = JSON.stringify(data).replace(/</g, "\\u003c");
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (v, n) => (v.length > n ? v.slice(0, n - 1).trimEnd() + "…" : v);
const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/i;

// Every page is the same app shell; only the title, description, canonical URL and preview image differ.
const pageHead = ({ title, description, path, image }) => `<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="${path === "/" ? "website" : "product"}">
<meta property="og:site_name" content="mypoker.ge">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">${image ? `\n<meta property="og:image" content="${SITE}/${esc(image.replace(/^\//, ""))}">` : ""}
<meta name="theme-color" content="#18191c">
<link rel="icon" href="${favicon}" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/app.css">
<style>html,body{background:#f3f2ef;color:#18191c;margin:0}</style>`;
const body = `<div id="root"></div>
<script type="application/json" id="mp-data">${inlineData}</script>
<script src="/app.js" defer></script>`;
const page = (head) =>
  `<!doctype html>\n<html lang="ka">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;

const head = pageHead({ title: storeTitle, description: storeDescription, path: "/" });
writeFileSync(join(dist, "index.html"), page(head));
// unknown addresses get the app too; it shows "product not found" with a link back to the shop
writeFileSync(join(dist, "404.html"), page(pageHead({ title: "გვერდი ვერ მოიძებნა — mypoker.ge", description: storeDescription, path: "/" })));

const urls = [`${SITE}/`];
let pages = 0;
for (const p of data.products) {
  if (!p || p.visible === false || !p.name) continue;
  if (!SAFE_ID.test(String(p.id))) {
    console.warn(`skipped product page for unsafe id: ${JSON.stringify(p.id)}`);
    continue;
  }
  const first = Array.isArray(p.images) && p.images[0] ? p.images[0] : p.image || null;
  const image = first ? (typeof first === "string" ? first : first.src) : null;
  const text = [p.spec, String(p.description || "").replace(/\s+/g, " ")].filter(Boolean).join(" — ");
  const path = `/p/${p.id}/`;
  mkdirSync(join(dist, "p", p.id), { recursive: true });
  writeFileSync(
    join(dist, "p", p.id, "index.html"),
    page(pageHead({ title: `${p.name} — mypoker.ge`, description: clip(text || storeDescription, 160), path, image }))
  );
  urls.push(SITE + path);
  pages++;
}
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`
);
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nDisallow: /admin/\nSitemap: ${SITE}/sitemap.xml\n`);

if (fragmentOut) {
  // preview page: styles and script inlined so it works without serving app.css/app.js alongside
  const css = readFileSync(join(dist, "app.css"), "utf8");
  const js = readFileSync(join(dist, "app.js"), "utf8").replace(/<\/script/gi, "<\\/script");
  const previewHead = head.replace('<link rel="stylesheet" href="/app.css">', () => `<style>${css}</style>`);
  const previewBody = body.replace('<script src="/app.js" defer></script>', () => `<script>${js}</script>`);
  writeFileSync(fragmentOut, `${previewHead}\n${previewBody}\n`);
}

console.log(`built dist/ (${data.products.length} products, ${pages} product pages)`);
