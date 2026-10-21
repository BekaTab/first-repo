# LuxePet — dog & cat shop

A single-page online pet shop in Georgian and English, built with React, Tailwind CSS, Framer Motion, Lucide icons and Zustand.

- Header: delivery and phone bar, ქა / EN switch, search, cart button that shows the running total
- Category bar (dogs, cats, sale, food, treats, accessories, clothing, beds, toys, care) and category tiles
- Catalogue: filters for pet, category, price, sale and stock; sorting; pages of 12 products
- Product cards with discount and "new" badges, old and new prices, stock status, and an add-to-cart button that turns into a quantity stepper
- Product popup with a description and quantity
- Cart: quantities, free-delivery progress bar, delivery cost, then an order form (name, phone, city, address, payment) with validation and a confirmation. Ordering is simulated; nothing is sent.
- Cart and language choice are remembered in the browser

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

## Where to change things

Everything lives in `LuxePetStore.jsx`:

- **Shop name, phone, email, social links, delivery prices, free-delivery threshold, products per page, default language**: the `BRAND` object at the top. The phone number is a placeholder (`+995 5XX XX XX XX`).
- **All site text**: the `TEXT` object, with a `ka` and an `en` block holding the same keys.
- **Products**: the `PRODUCTS` array. Each product has `animal` (`dog` / `cat`), `category`, `brand`, `name` and `desc` as `{ ka, en }`, `size`, `price`, optional `oldPrice` (shows the discount badge), `isNew`, `inStock: false`, and `rank` for the "Most popular" order. The 24 products are examples: replace them with the shop's real range and prices.
- **Pictures**: each product has a simple drawing (`art` + `color`). Add `image: "https://…"` to a product to show a real photo instead.
- **Colours**: Tailwind arbitrary values, listed in a comment under `BRAND` (orange `#F26B1D`, ink `#1F2933`).
