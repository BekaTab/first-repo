// Builds a standalone preview page from MyPokerStore.jsx (React, Tailwind and Lucide from CDNs).
// Usage: node mypoker/build.mjs [out.html] [--fragment]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv.find((a, i) => i > 1 && !a.startsWith("--")) || join(here, "index.html");
const fragment = process.argv.includes("--fragment");

const raw = readFileSync(join(here, "MyPokerStore.jsx"), "utf8");
const source = raw
  .replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*$/gm, "")
  .replace("export default function App", "function App")
  .replace(/<\/script/gi, "<\\/script");

const hooks = (raw.match(/import\s+React\s*,\s*\{([^}]*)\}\s*from\s*"react"/) || [, ""])[1];
const icons = (raw.match(/import\s*\{([^}]*)\}\s*from\s*"lucide-react"/) || [, ""])[1];

const head = `<title>mypoker.ge</title>
<meta name="description" content="პოკერის პრემიუმ აქსესუარები საქართველოში — ჩიპები, კარტები, მაგიდები და აქსესუარები.">
<style>html,body{background:#343d4a;color:#f5f7fa;margin:0}</style>
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/lucide-react@0.263.1/dist/umd/lucide-react.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>`;

const body = `<div id="root"></div>
<script type="text/babel" data-presets="react">
const { ${hooks.trim().replace(/\s+/g, " ")} } = React;
const __icons = window.LucideReact || {};
const { ${icons.trim().replace(/\s+/g, " ")} } = new Proxy(__icons, { get: (t, k) => t[k] || (() => null) });
${source}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>`;

const html = fragment
  ? `${head}\n${body}\n`
  : `<!doctype html>\n<html lang="ka">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`wrote ${out}`);
