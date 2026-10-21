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
  html { background: #FAFAF9; color: #1F2933; -webkit-tap-highlight-color: transparent; }
  ::selection { background: #FFD8BF; color: #1F2933; }
  :focus-visible { outline: 2px solid #F26B1D; outline-offset: 2px; }
}
`
);
execFileSync(join(here, "node_modules", ".bin", "tailwindcss"), ["-c", join(here, "tailwind.config.cjs"), "-i", cssIn, "-o", join(dist, "app.css"), "--minify"], {
  stdio: ["ignore", "ignore", "inherit"],
});
rmSync(cssIn);
// cache-busting version: changes whenever the bundle or styles change
const ASSET_V = createHash("sha256").update(readFileSync(join(dist, "app.js"))).update(readFileSync(join(dist, "app.css"))).digest("hex").slice(0, 10);

// the page opens in Georgian (BRAND.defaultLang); the app switches lang and title when the visitor changes language
const TITLE = "LuxePet — ძაღლისა და კატის საკვები და აქსესუარები";
const DESCRIPTION = "ძაღლისა და კატის საკვები, აქსესუარები, ტანსაცმელი და სათამაშოები. მიწოდება თბილისში იმავე დღეს. Dog and cat food, accessories and toys with same-day delivery in Tbilisi.";
// tab icon: the white paw on orange from the header logo
const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#F26B1D"/><g fill="#fff"><ellipse cx="16" cy="20.5" rx="5.6" ry="4.8"/><ellipse cx="9.2" cy="14.6" rx="2.3" ry="2.9" transform="rotate(-18 9.2 14.6)"/><ellipse cx="13.6" cy="10.4" rx="2.3" ry="3" transform="rotate(-6 13.6 10.4)"/><ellipse cx="18.4" cy="10.4" rx="2.3" ry="3" transform="rotate(6 18.4 10.4)"/><ellipse cx="22.8" cy="14.6" rx="2.3" ry="2.9" transform="rotate(18 22.8 14.6)"/></g></svg>`
  );

const head = (styles) => `<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">
<meta name="theme-color" content="#1F2933">
<link rel="icon" href="${favicon}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Georgian:wght@400;500;600;700&display=swap">
${styles}
<style>html,body{background:#FAFAF9;color:#1F2933;margin:0}</style>`;
const page = (styles, script) =>
  `<!doctype html>
<html lang="ka">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head(styles)}
</head>
<body>
<noscript><p style="font:16px sans-serif;padding:24px;text-align:center">LuxePet მუშაობს JavaScript-ით. · LuxePet needs JavaScript to run.</p></noscript>
<div id="root"></div>
${script}
</body>
</html>
`;

// relative asset paths, so the page works at a domain root (Vercel) and in a subfolder (GitHub Pages: /first-repo/luxepet/)
writeFileSync(join(dist, "index.html"), page(`<link rel="stylesheet" href="app.css?v=${ASSET_V}">`, `<script src="app.js?v=${ASSET_V}" defer></script>`));

const css = readFileSync(join(dist, "app.css"), "utf8");
const js = readFileSync(join(dist, "app.js"), "utf8").replace(/<\/script/gi, "<\\/script");
writeFileSync(join(dist, "standalone.html"), page(`<style>${css}</style>`, `<script>${js}</script>`));

console.log("built dist/ (index.html, app.js, app.css, standalone.html)");
