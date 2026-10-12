// Builds the mypoker.ge store into dist/ (Vercel project root: mypoker/).
//   dist/index.html   page shell with products.json inlined as a JSON data element (#mp-data)
//   dist/app.js       React app bundled from MyPokerStore.jsx
//   dist/app.css      Tailwind CSS generated from the classes the app uses
//   dist/admin/       admin panel (products, prices, sales, settings)
//   dist/images/      product photos uploaded from the admin panel
//   dist/p/<id>/      one page per visible product (own title, description, preview image)
//   dist/en/...       the same pages in English (products use nameEn/specEn/badgeEn/descriptionEn when set)
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

// Tab icon: big red diamond (♦) on white with a red outline (readable at 16px on light and dark tab bars)
const DIAMOND = "M20 2.5C23.4 8.7 28 14.7 34 20c-6 5.3-10.6 11.3-14 17.5C16.6 31.3 12 25.3 6 20c6-5.3 10.6-11.3 14-17.5Z";
const iconSvg = (outline = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7" fill="#fff"${
    outline ? ' stroke="#c8102e" stroke-width="2"' : ""
  }/><path d="${DIAMOND}" fill="#c8102e" transform="translate(16 16) scale(.74) translate(-20 -20)"/></svg>`;
writeFileSync(join(dist, "favicon.svg"), iconSvg());
const favicon = "data:image/svg+xml," + encodeURIComponent(iconSvg());
const SITE = "https://mypoker.ge";
const STORE = {
  ka: { title: "mypoker.ge — პოკერის აქსესუარების მაღაზია", description: "პოკერის ჩიპები, კარტები, მაგიდები და აქსესუარები. შეკვეთა WhatsApp-ით, მიწოდება მთელ საქართველოში.", notFound: "გვერდი ვერ მოიძებნა — mypoker.ge" },
  en: { title: "mypoker.ge — poker accessories store", description: "Poker chips, cards, tables and accessories. Order via WhatsApp, delivery across Georgia.", notFound: "Page not found — mypoker.ge" },
};
const LANGS = { ka: "", en: "/en" }; // URL prefix per language
const inlineData = JSON.stringify(data).replace(/</g, "\\u003c");
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (v, n) => (v.length > n ? v.slice(0, n - 1).trimEnd() + "…" : v);
const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/i;
const pick = (p, field, lang) => (lang === "en" && typeof p[`${field}En`] === "string" && p[`${field}En`].trim() ? p[`${field}En`] : p[field] || "");

// Every page is the same app shell; only the language, title, description, URLs and preview image differ.
// `path` is the language-neutral path ("/" or "/p/<id>/"); each page links to its twin in the other language.
const pageHead = ({ lang, title, description, path, image, jsonld }) => `<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${LANGS[lang]}${path}">
<link rel="alternate" hreflang="ka" href="${SITE}${path}">
<link rel="alternate" hreflang="en" href="${SITE}/en${path}">
<link rel="alternate" hreflang="x-default" href="${SITE}${path}">
<meta property="og:type" content="${path === "/" ? "website" : "product"}">
<meta property="og:site_name" content="mypoker.ge">
<meta property="og:locale" content="${lang === "en" ? "en_US" : "ka_GE"}">
<meta property="og:url" content="${SITE}${LANGS[lang]}${path}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">${image ? `\n<meta property="og:image" content="${SITE}/${esc(image.replace(/^\//, ""))}">` : ""}
<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">
<meta name="theme-color" content="#0f172a">${jsonld ? `\n<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;500;600;700;800&family=Manrope:wght@600;700&display=swap">
<link rel="icon" href="${favicon}" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/app.css">
<style>html,body{background:#0f172a;color:#f8fafc;margin:0}</style>`;
const body = `<noscript><p style="font:16px sans-serif;padding:24px;text-align:center">mypoker.ge მუშაობს JavaScript-ით. ჩართეთ JavaScript ან დაგვიკავშირდით WhatsApp-ით. · Please enable JavaScript.</p></noscript>
<div id="root"></div>
<script type="application/json" id="mp-data">${inlineData}</script>
<script src="/app.js" defer></script>`;
const page = (lang, head) =>
  `<!doctype html>\n<html lang="${lang}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
const write = (lang, path, html) => {
  const dir = join(dist, LANGS[lang].slice(1), path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
};

const head = pageHead({ lang: "ka", title: STORE.ka.title, description: STORE.ka.description, path: "/" });
// unknown addresses get the app too; it shows "product not found" with a link back to the shop
writeFileSync(join(dist, "404.html"), page("ka", pageHead({ lang: "ka", title: STORE.ka.notFound, description: STORE.ka.description, path: "/" })));

const urls = [];
let pages = 0;
for (const lang of Object.keys(LANGS)) {
  write(lang, "/", page(lang, lang === "ka" ? head : pageHead({ lang, title: STORE[lang].title, description: STORE[lang].description, path: "/" })));
  urls.push(`${SITE}${LANGS[lang]}/`);
  for (const p of data.products) {
    if (!p || p.visible === false || !p.name) continue;
    if (!SAFE_ID.test(String(p.id))) {
      if (lang === "ka") console.warn(`skipped product page for unsafe id: ${JSON.stringify(p.id)}`);
      continue;
    }
    const first = Array.isArray(p.images) && p.images[0] ? p.images[0] : p.image || null;
    const image = first ? (typeof first === "string" ? first : first.src) : null;
    const text = [pick(p, "spec", lang), String(pick(p, "description", lang)).replace(/\s+/g, " ")].filter(Boolean).join(" — ");
    const path = `/p/${p.id}/`;
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tbilisi" });
    const onSale = Number(p.salePrice) > 0 && Number(p.salePrice) < Number(p.price) && (!p.saleEnds || p.saleEnds >= today);
    const jsonld = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: pick(p, "name", lang),
      description: text || undefined,
      image: image ? `${SITE}/${image.replace(/^\//, "")}` : undefined,
      offers: {
        "@type": "Offer",
        url: `${SITE}${LANGS[lang]}${path}`,
        priceCurrency: "GEL",
        price: String(onSale ? Number(p.salePrice) : Number(p.price)),
        ...(onSale && p.saleEnds ? { priceValidUntil: p.saleEnds } : {}),
        availability: p.inStock === false ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      },
    };
    write(lang, path, page(lang, pageHead({ lang, title: `${pick(p, "name", lang)} — mypoker.ge`, description: clip(text || STORE[lang].description, 160), path, image, jsonld })));
    urls.push(`${SITE}${LANGS[lang]}${path}`);
    pages++;
  }
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
