# LuxePet — premium pet accessories store

A single-page "quiet luxury" shop built with React, Tailwind CSS, Framer Motion, Lucide icons and Zustand.

## Run it

```bash
cd luxepet
npm install
npm run build      # writes dist/
npm run preview    # builds and serves dist/ at http://localhost:3000
```

`dist/standalone.html` has the CSS and JavaScript inlined, so it also opens straight from disk (double-click) with no server.

## Live on GitHub Pages

Every push to `main` builds the store and publishes it at **https://bekatab.github.io/first-repo/luxepet/** (`.github/workflows/pages.yml`, step "Build LuxePet store").

## Deploy (Vercel)

Add New → Project → `first-repo` → **Root Directory: `luxepet`** → Deploy. Install, build and output settings come from `luxepet/vercel.json`.

## Languages

The site is in Georgian and English. It opens in Georgian (`BRAND.defaultLang`); the **ქა / EN** switch in the header (in the menu on phones) changes every text on the page, and the visitor's choice is remembered. Georgian letters are set in Noto Serif Georgian and Noto Sans Georgian, which sit behind Playfair Display and Inter in the font stacks.

## Where to change things

Everything lives in `LuxePetStore.jsx`:

- **Brand name, currency, default language** — the `BRAND` object at the top. The name is used in the header, footer, menu and confirmation.
- **All site text** — the `TEXT` object, with a `ka` and an `en` block holding the same keys.
- **Products** — the `PRODUCTS` array (`name` and `material` each as `{ ka, en }`, `category`: `walk` / `sleep` / `eat`, `price`, `image`). `image` is an Unsplash photo id: the part after `photo-` in an `images.unsplash.com/photo-…` URL.
- **Hero photo** — `HERO_IMAGE`.
- **Logo** — `GREYHOUND` is the single SVG path of the line-art mark (the favicon in `build.mjs` uses the same path).
- **Colours** — written as Tailwind arbitrary values (`bg-[#F9F9F8]`, `text-[#2C2C2C]`, `bg-[#E6E2DD]`, `text-[#A9A297]`, `bg-[#1A1A1A]`, `border-[#E5E5E5]`).
- **Fonts** — Playfair Display and Inter, loaded from Google Fonts in `build.mjs` and mapped in `tailwind.config.cjs`.

If a photo fails to load, its frame shows the greyhound mark on cashmere beige instead of a broken image.

## How the cart works

`useBag` (Zustand) keeps the bag as `[{ id, qty }]` in add order and saves it in `localStorage` (`luxepet-bag`), so it survives a reload. Entries that no longer match a product are dropped on load. Quantities run from 1 to 10. Checkout is simulated: it shows a short processing state, confirms an order number and empties the bag. No payment is taken.
