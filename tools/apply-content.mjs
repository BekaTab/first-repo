// Applies content.json (edited in /admin) to the site's HTML before GitHub Pages publishes it.
// Every editable element carries data-edit="key" and holds plain text only.
// Usage: node tools/apply-content.mjs [rootDir]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// shared with the admin preview: tools/render-blocks.js defines globalThis.eibRenderBlocks
const here = fileURLToPath(new URL('.', import.meta.url));
new Function(readFileSync(join(here, 'render-blocks.js'), 'utf8'))();
const renderBlocks = globalThis.eibRenderBlocks;
const COLOR_KEYS = ['navy', 'accent', 'gold', 'ice', 'mist'];
const SECTION_KEYS = ['video', 'services', 'experience'];

const root = process.argv[2] || '.';
const PAGES = ['index.html', 'en/index.html'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
const digits = (s) => String(s || '').replace(/[^\d+]/g, '');
const validEmail = (s) => /^[^\s@\[\]]+@[^\s@\[\]]+$/.test(s || '');
// Only same-site paths or https URLs may be used for images and the form endpoint.
const safeUrl = (s) => typeof s === 'string' && (/^https:\/\/[^\s"<>]+$/.test(s) || /^[\w./-]+$/.test(s)) ? s : '';

function setAttr(tag, name, value) {
  const re = new RegExp(`\\s${name}(="[^"]*")?(?=[\\s>])`);
  const cleaned = tag.replace(re, '');
  if (value === null) return cleaned;
  return cleaned.replace(/^<([a-zA-Z0-9]+)/, `<$1 ${name}${value === '' ? '' : `="${escAttr(value)}"`}`);
}

// Rewrites every opening tag that carries `attr`, via fn(openingTag) -> newTag.
function eachTag(html, attr, fn) {
  return html.replace(new RegExp(`<[a-zA-Z0-9]+\\b[^>]*\\s${attr}(?:="[^"]*")?[^>]*>`, 'g'), fn);
}

export function applyContent(html, content, base = '') {
  const lang = (html.match(/<html[^>]*\slang="([^"]+)"/) || [])[1] || 'ka';
  const t = content[lang] || {};
  const sh = content.shared || {};
  let missing = 0;

  // text: <tag ... data-edit="key" ...>TEXT</tag>
  html = html.replace(/(<([a-zA-Z0-9]+)\b[^>]*\sdata-edit="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, _tag, key, _text, close) => {
    const v = key.startsWith('shared.') ? sh[key.slice(7)] : t[key];
    if (typeof v !== 'string') { missing++; return m; }
    return open + esc(v) + close;
  });

  if (typeof sh.phone === 'string' && digits(sh.phone)) html = eachTag(html, 'data-tel', (tag) => setAttr(tag, 'href', 'tel:' + digits(sh.phone)));
  // WhatsApp chat links follow the same number (digits only, with country code)
  const wa = String(sh.phone || '').replace(/\D/g, '');
  if (wa) html = eachTag(html, 'data-wa', (tag) => setAttr(tag, 'href', 'https://wa.me/' + wa));
  html = eachTag(html, 'data-mail', (tag) => setAttr(tag, 'href', validEmail(sh.email) ? 'mailto:' + sh.email : null));

  // site paths are stored relative to the site root; pages in sub-folders (en/) need a prefix
  const resolve = (p) => (/^https:\/\//.test(p) ? p : base + p);
  const logo = safeUrl(sh.logo) && resolve(safeUrl(sh.logo)), logoDark = (safeUrl(sh.logoDark) && resolve(safeUrl(sh.logoDark))) || logo;
  html = eachTag(html, 'data-logo', (tag) => {
    const src = /data-logo="footer"/.test(tag) ? logoDark : logo;
    tag = setAttr(tag, 'src', src || null);
    return setAttr(tag, 'hidden', src ? null : '');
  });
  const hideWords = !!logo && sh.showWordmark === false;
  html = eachTag(html, 'data-wordmark', (tag) => setAttr(tag, 'hidden', hideWords ? '' : null));
  html = eachTag(html, 'data-endpoint', (tag) => setAttr(tag, 'data-endpoint', safeUrl(sh.formEndpoint)));

  // brand colours
  const cols = (sh.colors && typeof sh.colors === 'object') ? sh.colors : {};
  const vars = COLOR_KEYS.filter((k) => /^#[0-9a-f]{6}$/i.test(cols[k] || '')).map((k) => `--c-${k}:${cols[k]};`).join('');
  html = html.replace(/<style id="eib-theme">[^<]*<\/style>/, `<style id="eib-theme">${vars ? `:root{${vars}}` : ''}</style>`);

  // hidden sections (and their menu links)
  const hid = (sh.hidden && typeof sh.hidden === 'object') ? sh.hidden : {};
  html = eachTag(html, 'data-section', (tag) => {
    const name = (tag.match(/data-section="([^"]+)"/) || [])[1];
    return setAttr(tag, 'hidden', SECTION_KEYS.includes(name) && hid[name] === true ? '' : null);
  });

  // custom blocks
  for (const slot of ['a', 'b']) {
    const re = new RegExp(`(<div class="eib-blocks" data-slot="${slot}"[^>]*>)[\\s\\S]*?(</div><!--/eib-slot-${slot}-->)`);
    html = html.replace(re, (m, open, close) => open + renderBlocks(content.blocks, lang, slot, (p) => (safeUrl(p) ? resolve(safeUrl(p)) : '')) + close);
  }

  // function replacements: a "$&" or "$1" typed in the admin must stay literal text
  // Google Analytics (GA4): loaded only on the live page, never inside the admin preview.
  // Counts calls, WhatsApp, email and form submissions as "generate_lead".
  const gaId = /^G-[A-Z0-9]{4,15}$/.test(sh.gaId || '') ? sh.gaId : '';
  const gaTag = gaId ? `<!--ga--><script>
(function () {
  if (window.parent !== window || /[?&]preview\\b/.test(location.search)) return;
  var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}'; document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); } window.gtag = gtag;
  gtag('js', new Date()); gtag('config', '${gaId}');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href'), m = /^tel:/.test(h) ? 'phone' : /wa\\.me/.test(h) ? 'whatsapp' : /^mailto:/.test(h) ? 'email' : '';
    if (m) gtag('event', 'generate_lead', { method: m });
  }, true);
})();
</script><!--/ga-->` : '';
  html = html.replace(/<!--ga-->[\s\S]*?<!--\/ga-->/, '');
  if (gaTag) html = html.replace('</head>', () => gaTag + '\n</head>');

  if (typeof t['seo.title'] === 'string') html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(t['seo.title'])}</title>`);
  if (typeof t['seo.description'] === 'string') html = html.replace(/(<meta name="description" content=")[^"]*(")/, (m, a, b) => a + escAttr(t['seo.description']) + b);
  return { html, missing };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = join(root, 'content.json');
  if (!existsSync(file)) { console.log('content.json not found; pages left unchanged.'); process.exit(0); }
  let content;
  try { content = JSON.parse(readFileSync(file, 'utf8')); }
  catch (e) { console.error('content.json is not valid JSON:', e.message); process.exit(1); }
  for (const page of PAGES) {
    const path = join(root, page);
    if (!existsSync(path)) continue;
    const base = '../'.repeat(page.split('/').length - 1);
    const { html, missing } = applyContent(readFileSync(path, 'utf8'), content, base);
    writeFileSync(path, html);
    console.log(`${page}: content applied${missing ? ` (${missing} keys kept their default text)` : ''}`);
  }
}
