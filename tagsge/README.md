# tags.ge — store security systems (B2B)

A one-page Georgian website for tags.ge, an importer and supplier of store security (EAS) equipment: RF/AM antennas, hard tags, labels, detachers and deactivators.

Plain HTML, CSS and JavaScript with no build step and no dependencies. Open `index.html` in a browser to preview it. The live copy is at https://tags-ge.vercel.app.

```
tagsge/
├── index.html          the whole site: HTML, CSS (in <style>), JS (at the end), Schema.org JSON-LD
├── img/                product renders (SVG), hero illustration (hero-light.svg), logo files
├── og-image.jpg        1200×630 social preview (Facebook, Messenger, LinkedIn, Telegram)
├── favicon.svg / favicon.ico / apple-touch-icon.png / icon-192.png / icon-512.png
├── site.webmanifest
├── robots.txt, sitemap.xml
└── vercel.json         security headers and image caching for a Vercel deployment
```

## Page

Light, minimal layout with one accent colour (blue `#1F5EFF`):

1. **Hero:** headline, one line of text, "ფასის მოთხოვნა" and "კატალოგი" buttons, the antenna illustration, and four short points (free measuring, installation and service, wholesale price, RF/AM compatibility).
2. **კატალოგი:** category tabs and 20 products.
3. **RF თუ AM?:** two cards comparing the systems.
4. **ხშირი კითხვები:** five questions.
5. **კონტაქტი:** phone, email, address, hours, map and the request form.

## Before going live: replace the placeholders

These values in `index.html` are placeholders. Use search and replace across the whole file:

| What | Placeholder | Where it appears |
|---|---|---|
| Phone (shown) | `+995 5XX XX XX XX` (the spaces are non-breaking) | mobile menu, contact section, JSON-LD `telephone` |
| Phone (dial link) | `+9955XXXXXXXX` | every `tel:` link |
| Email | `info@tags.ge` | mobile menu, contact section, form `data-email`, JSON-LD |
| Address | `თბილისი, საქართველო` | contact section, JSON-LD `address` (add `streetAddress` and `postalCode`) |
| Map | `q=Tbilisi%2C%20Georgia` | the Google Maps `<iframe>`: put the street address there |
| Coordinates | `41.7151`, `44.8271` | `geo.position` / `ICBM` meta tags and JSON-LD `geo` |
| Opening hours | `ორშ–პარ 10:00–19:00`, `შაბ 11:00–16:00` | contact section and JSON-LD `openingHoursSpecification` |

Also check the product specs (sizes, gauss values, entrance widths, roll quantities). They are typical industry values. Change them to match the models you actually stock.

## Request form

Each product has one **ფასის მოთხოვნა** button. It adds the product to the form's "არჩეული პროდუქცია" list and scrolls to the form; the visitor can go back and add more, or remove a product with ×. The list is saved in the visitor's browser, so it survives a reload.

The form asks for name and phone (required), shop or company, email and a comment.

- **As shipped** (`data-endpoint=""`), sending the form opens the visitor's email app with a ready-made message addressed to `data-email`.
- **To receive submissions directly**, set `data-endpoint` to a form service. For example, with FormSubmit (free, no account): `data-endpoint="https://formsubmit.co/ajax/info@tags.ge"`. The first submission sends an activation email to that address; confirm it once. Any service that accepts a JSON POST and returns `{ "success": true }` works.
- A hidden honeypot field (`_gotcha`) filters out simple spam bots.

## Catalogue

20 products in 4 categories (8 + 4 + 4 + 4): image, name, one-line description, key specs, and an RF/AM badge where the system matters (pins, magnets and the key work with both, so they have none).

- Category tabs show one category or all of them. Links such as `tags.ge/#detachers` open that category directly.
- On phones, each category is a swipeable row.

**Adding a product:** copy an `<article class="product">` block inside the right `<section class="cat">`, give it a unique `id`, and update the image, `alt`, title, description, spec line and the button's `data-product` and `aria-label` (they must match the title). Add a matching `Product` entry to the JSON-LD and an `Offer` in that category's `OfferCatalog`.

**Using real photos:** replace the file in `img/` (or point `src` at a new `.webp`/`.jpg`) and keep the `alt` text. Product images display at 4:3, the hero image at 5:4 (`img/hero-light.svg`).

## SEO

- One `<h1>`, semantic sections (`header`, `nav`, `main`, `section`, `article`, `footer`), Georgian `lang="ka"`, canonical `https://tags.ge/`.
- Plain wording Georgian shops use (ჩიპი, მაგნიტი, სტიკერი, დეაქტივატორი, ანტენა); the general term is „დაცვის სისტემები“ and the antenna category is „დამცავი ანტენები“.
- The word „ანტიქურდული“ is not shown anywhere. Search terms that contain it are kept only in the hidden keywords meta and the JSON-LD `knowsAbout` list.
- JSON-LD `@graph`: `LocalBusiness` + `WholesaleStore` (with `OfferCatalog` per category), `WebSite`, `WebPage`, 20 `Product` items and a `FAQPage` whose answers match the visible FAQ word for word.
- Open Graph and Twitter cards, `sitemap.xml`, `robots.txt`, manifest, favicons.
- To show Google product rich results (price in search results), add `"offers": { "@type": "Offer", "price": "…", "priceCurrency": "GEL", "availability": "https://schema.org/InStock" }` to each `Product`. Google requires a price for those.
- After launch: verify the domain in Google Search Console, submit `https://tags.ge/sitemap.xml`, and create a Google Business Profile with the same name, phone and address as the site.

## Deploy

- **Vercel:** project `tags-ge` (https://tags-ge.vercel.app). `tags.ge` and `www.tags.ge` are already attached to it; the site moves to tags.ge once the domain's DNS points to Vercel (A record `76.76.21.21` for `tags.ge`, and the CNAME Vercel shows for `www`).
- **GitHub Pages:** once merged to `main`, the existing Pages workflow publishes this folder at `https://bekatab.github.io/first-repo/tagsge/`. The canonical URL still points to `https://tags.ge/`, so that copy doesn't compete with the real domain in search results.
- **Any static host** (Netlify, Cloudflare Pages, cPanel): upload the contents of this folder to the site root.

## Quality checks run

- No horizontal scrolling at 320, 360, 375, 390, 414, 768, 820, 1024, 1280, 1440 and 1920 px.
- `html-validate` (recommended rules): no errors.
- axe-core (WCAG 2 A/AA + best practices): no violations on desktop or mobile.
- Respects `prefers-reduced-motion`. Keyboard accessible: skip link, visible focus, Escape closes the menu, Tab stays inside the open menu, native `<details>` FAQ.
- Page weight: about 23 KB gzipped for `index.html` (CSS and JS inline), plus small SVG images.
