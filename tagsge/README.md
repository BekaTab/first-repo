# tags.ge — retail anti-theft systems (B2B)

A one-page Georgian website for tags.ge, an importer and supplier of EAS (anti-theft) systems: RF/AM antennas, hard tags, soft labels, detachers and deactivators.

Plain HTML, CSS and JavaScript with no build step and no dependencies. Open `index.html` in a browser to preview it.

```
tagsge/
├── index.html          the whole site: HTML, CSS (in <style>), JS (at the end), Schema.org JSON-LD
├── img/                product renders (SVG), hero EAS-gate scene, logo files
├── og-image.jpg        1200×630 social preview (Facebook, Messenger, LinkedIn, Telegram)
├── favicon.svg / favicon.ico / apple-touch-icon.png / icon-192.png / icon-512.png
├── site.webmanifest
├── robots.txt, sitemap.xml
└── vercel.json         security headers and image caching for a Vercel deployment
```

## Before going live: replace the placeholders

These values in `index.html` are placeholders. Use search and replace across the whole file:

| What | Placeholder | Where it appears |
|---|---|---|
| Phone (shown) | `+995 5XX XX XX XX` (the spaces are non-breaking) | header, mobile menu, CTA, contact cards, footer, dock, JSON-LD `telephone` |
| Phone (dial link) | `+9955XXXXXXXX` | every `tel:` link |
| Email | `info@tags.ge` | contact cards, footer, mobile menu, form `data-email`, JSON-LD |
| Address | `თბილისი, საქართველო` | contact card, footer, JSON-LD `address` (add `streetAddress` and `postalCode`) |
| Map | `q=Tbilisi%2C%20Georgia` | the Google Maps `<iframe>` and the "Google Maps-ში გახსნა" link: put the street address there |
| Coordinates | `41.7151`, `44.8271` | `geo.position` / `ICBM` meta tags and JSON-LD `geo` |
| Opening hours | `ორშ–პარ 10:00–19:00`, `შაბ 11:00–16:00` | contact card and JSON-LD `openingHoursSpecification` |

Also check the product specs (sizes, gauss values, detection widths, roll quantities). They are typical industry values. Change them to match the models you actually stock.

## Contact form

The form (`#quote-form`) collects name, company, phone, email, area of interest, the visitor's **request list** (products added with "ფასის მოთხოვნა" or "+"), and a message.

- **As shipped** (`data-endpoint=""`), sending the form opens the visitor's email app with a ready-made message addressed to `data-email`.
- **To receive submissions directly**, set `data-endpoint` to a form service. For example, with FormSubmit (free, no account): `data-endpoint="https://formsubmit.co/ajax/info@tags.ge"`. The first submission sends an activation email to that address; confirm it once. Any service that accepts a JSON POST and returns `{ "success": true }` works.
- The form has a hidden honeypot field (`_gotcha`) that filters out simple spam bots.

## Catalogue

20 products in 4 categories (8 + 4 + 4 + 4), each with an image, technology badges, description, specs, a **ფასის მოთხოვნა** button (adds the product to the request list, picks the matching category in the form and scrolls to it) and a **+** button (adds it to the list without scrolling).

- Filters: by category and by technology (RF / AM). Products tagged `data-tech="rf am"` show under both.
- On phones, each category becomes a swipeable row.
- Footer links (`data-cat-link`) open a single category. Links such as `tags.ge/#detachers` also work.
- The request list is saved in the visitor's browser, so it survives a reload.

**Adding a product:** copy an `<article class="product">` block inside the right `<section class="cat-group">`, give it a unique `id`, and update the image, `alt`, title, description, specs and both `data-product` attributes (they must match the title). Add a matching `Product` entry to the JSON-LD and an `Offer` in that category's `OfferCatalog`.

**Using real photos:** replace the file in `img/` (or point `src` at a new `.webp`/`.jpg`) and keep the `alt` text. Images display at 4:3. The hero (`img/eas-gates-hero.svg`) can be swapped for a wide photo of your EAS gates in the same way.

## SEO

- One `<h1>`, semantic sections (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`), Georgian `lang="ka"`, canonical `https://tags.ge/`.
- All 16 target Georgian search terms are used verbatim in the title, description, keywords meta, headings, image `alt` text and body copy.
- JSON-LD `@graph`: `LocalBusiness` + `WholesaleStore` (with `OfferCatalog` per category), `WebSite`, `WebPage`, 20 `Product` items and a `FAQPage` whose answers match the visible FAQ word for word.
- Open Graph and Twitter cards, `sitemap.xml`, `robots.txt`, manifest, favicons.
- To show Google product rich results (price in search results), add `"offers": { "@type": "Offer", "price": "…", "priceCurrency": "GEL", "availability": "https://schema.org/InStock" }` to each `Product`. Google requires a price for those.
- After launch: verify the domain in Google Search Console, submit `https://tags.ge/sitemap.xml`, and create a Google Business Profile with the same name, phone and address as the site.

## Deploy

- **Vercel:** Add New → Project → this repository → **Root Directory: `tagsge`** → Deploy, then add the `tags.ge` domain.
- **GitHub Pages:** once merged to `main`, the existing Pages workflow publishes this folder at `https://bekatab.github.io/first-repo/tagsge/`. The canonical URL still points to `https://tags.ge/`, so that copy doesn't compete with the real domain in search results.
- **Any static host** (Netlify, Cloudflare Pages, cPanel): upload the contents of this folder to the site root.

## Quality checks run

- No horizontal scrolling at 320, 360, 375, 390, 414, 820, 1024, 1100, 1180, 1280 and 1440 px.
- `html-validate` (recommended rules): no errors.
- axe-core (WCAG 2 A/AA + best practices): no violations on desktop or mobile.
- Respects `prefers-reduced-motion`. Keyboard accessible: skip link, visible focus, Escape closes the menu, native `<details>` FAQ.
- Page weight: about 40 KB gzipped for `index.html` (CSS and JS inline), plus small SVG images.
