// Builds the mypoker.ge store into dist/ (Vercel project root: mypoker/).
//   dist/index.html   page shell with products.json inlined as a JSON data element (#mp-data)
//   dist/app.js       React app bundled from MyPokerStore.jsx
//   dist/app.css      Tailwind CSS generated from the classes the app uses
//   dist/admin/       admin panel (products, prices, sales, settings)
//   dist/images/      product photos uploaded from the admin panel
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

const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#c8102e"/><path d="M20 9.2c0 0-8.4 6.3-8.4 11.3 0 2.8 2.1 4.7 4.6 4.7 1.4 0 2.6-.6 3.1-1.5l-1.2 5.1h3.8l-1.2-5.1c.5.9 1.7 1.5 3.1 1.5 2.5 0 4.6-1.9 4.6-4.7 0-5-8.4-11.3-8.4-11.3Z" fill="#fff"/></svg>'
  );
const title = "mypoker.ge — პოკერის აქსესუარების მაღაზია";
const description = "პოკერის ჩიპები, კარტები, მაგიდები და აქსესუარები. შეკვეთა WhatsApp-ით, მიწოდება მთელ საქართველოში.";
const inlineData = JSON.stringify(data).replace(/</g, "\\u003c");

const head = `<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta name="theme-color" content="#18191c">
<link rel="icon" href="${favicon}">
<link rel="stylesheet" href="app.css">
<style>html,body{background:#f3f2ef;color:#18191c;margin:0}</style>`;
const body = `<div id="root"></div>
<script type="application/json" id="mp-data">${inlineData}</script>
<script src="app.js" defer></script>`;

writeFileSync(
  join(dist, "index.html"),
  `<!doctype html>\n<html lang="ka">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`
);
if (fragmentOut) {
  // preview page: styles and script inlined so it works without serving app.css/app.js alongside
  const css = readFileSync(join(dist, "app.css"), "utf8");
  const js = readFileSync(join(dist, "app.js"), "utf8").replace(/<\/script/gi, "<\\/script");
  const previewHead = head.replace('<link rel="stylesheet" href="app.css">', () => `<style>${css}</style>`);
  const previewBody = body.replace('<script src="app.js" defer></script>', () => `<script>${js}</script>`);
  writeFileSync(fragmentOut, `${previewHead}\n${previewBody}\n`);
}

console.log(`built dist/ (${data.products.length} products)`);
