// Builds the LuxePet store into dist/ (Vercel project root: luxepet/).
//   dist/index.html       page shell
//   dist/app.js           React app bundled from LuxePetStore.jsx
//   dist/app.css          Tailwind CSS generated from the classes the app uses
//   dist/standalone.html  the same page with CSS and JS inlined — opens straight from disk, no server needed
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await build({
  stdin: {
    contents: `import { createRoot } from "react-dom/client";
import App from "./LuxePetStore.jsx";
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
writeFileSync(
  cssIn,
  `@tailwind base;
@tailwind components;
@tailwind utilities;
@layer base {
  html { background: #F9F9F8; color: #2C2C2C; -webkit-tap-highlight-color: transparent; }
  ::selection { background: #E6E2DD; color: #1A1A1A; }
  :focus-visible { outline: 1px solid #2C2C2C; outline-offset: 4px; }
}
`
);
execFileSync(join(here, "node_modules", ".bin", "tailwindcss"), ["-c", join(here, "tailwind.config.cjs"), "-i", cssIn, "-o", join(dist, "app.css"), "--minify"], {
  stdio: ["ignore", "ignore", "inherit"],
});
rmSync(cssIn);
// cache-busting version: changes whenever the bundle or styles change
const ASSET_V = createHash("sha256").update(readFileSync(join(dist, "app.js"))).update(readFileSync(join(dist, "app.css"))).digest("hex").slice(0, 10);

const TITLE = "LuxePet — Objects for the considered companion";
const DESCRIPTION = "Hand-made leather leads, bouclé beds and stoneware for dogs and cats. Made in small numbers, designed to last a lifetime.";
const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#E6E2DD"/><path d="M4.5 41.8C6.2 44.2 9 45 12 44.6C8.4 41.2 8.6 34.2 13.2 30.4C16.8 27.6 19.2 23.6 20.6 19.2C21.8 15.2 23.2 11.4 25.8 9.6Q24.4 8.4 22.8 9.2Q24.8 7.6 27.4 8.2C30.6 8.6 34.6 10 38.8 11.8C36 12.9 32.4 12.7 29.8 13.8C29 17.2 29.6 21 31.2 24.4C32.6 27.6 31.6 31 28.8 32.8C28.2 36.4 28.6 40.6 29 44.6H32.2" fill="none" stroke="#2C2C2C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  );

const head = (styles) => `<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">
<meta name="theme-color" content="#F9F9F8">
<link rel="icon" href="${favicon}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap">
${styles}
<style>html,body{background:#F9F9F8;color:#2C2C2C;margin:0}</style>`;
const page = (styles, script) =>
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head(styles)}
</head>
<body>
<noscript><p style="font:16px sans-serif;padding:24px;text-align:center">LuxePet needs JavaScript to run.</p></noscript>
<div id="root"></div>
${script}
</body>
</html>
`;

writeFileSync(join(dist, "index.html"), page(`<link rel="stylesheet" href="/app.css?v=${ASSET_V}">`, `<script src="/app.js?v=${ASSET_V}" defer></script>`));

const css = readFileSync(join(dist, "app.css"), "utf8");
const js = readFileSync(join(dist, "app.js"), "utf8").replace(/<\/script/gi, "<\\/script");
writeFileSync(join(dist, "standalone.html"), page(`<style>${css}</style>`, `<script>${js}</script>`));

console.log("built dist/ (index.html, app.js, app.css, standalone.html)");
