# tags.ge page generator

Sources for `tagsge/index.html`. The published site has no build step; run this only when the catalogue or the layout changes.

| File | What it is |
|---|---|
| `catalog.py` | the catalogue: 10 categories and 42 product families with their model tables and photo sources. Run it to write `catalog.json`. |
| `template.html` | the page layout, CSS and JavaScript, with `{{PLACEHOLDERS}}` |
| `build.cjs` | fills the template: product cards and windows, JSON-LD, logo, icons, flags; also writes `tagsge/sitemap.xml`. Contact placeholders (phone, email, address) are the `C` object at the top. |
| `images.json` | photo source → file name in `tagsge/img/p/` |
| `tags.json`, `ge.json` | logo wordmark outlines |
| `images.py` | how the product photos were made from the two PDF catalogues and the supplier's website (crop, Real-ESRGAN 4× for small photos, white background, WebP). Its inputs are not in the repository. |
| `e2e.cjs` | Playwright end-to-end test |

```bash
cd tools/tagsge
python3 catalog.py
node build.cjs ../../tagsge/index.html
```

To test, serve the repository root and run the end-to-end test against it:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

```bash
BASE=http://127.0.0.1:8765/tagsge/ node tools/tagsge/e2e.cjs
```
