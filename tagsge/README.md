# tags.ge — store security systems (B2B)

A one-page Georgian website for tags.ge, an importer and supplier of store security (EAS) equipment: RF/AM antennas, hard tags, labels, detachers and deactivators.

Plain HTML, CSS and JavaScript with no build step and no dependencies. Open `index.html` in a browser to preview it. The live copy is at https://tags-ge.vercel.app.

```
tagsge/
├── index.html          the whole site: HTML, CSS (in <style>), JS (at the end), Schema.org JSON-LD
├── img/                product renders (SVG), hero image (hero-family.svg), logo files
├── og-image.jpg        1200×630 social preview (Facebook, Messenger, LinkedIn, Telegram)
├── favicon.svg / favicon.ico / apple-touch-icon.png / icon-192.png / icon-512.png
├── site.webmanifest
├── robots.txt, sitemap.xml
└── vercel.json         security headers and image caching for a Vercel deployment
```

## Page

Light, minimal layout with a blue accent (`#1F5EFF`) and violet, teal and orange as secondary colours:

1. **Header:** the logo, a framed menu (კატალოგი, ტექნოლოგიები, კონტაქტი) whose highlight slides to the link under the pointer and to the section in view, the "ფასის მოთხოვნა" button, and a thin reading-progress line.
2. **Hero** (light grey-blue background): the headline, one line of text, one large blue "კატალოგი" button and a large product image (two antennas with a hard tag, a label and a magnet in front) that moves slightly with the pointer. Below, four service cards in four colours, following how EAS suppliers describe their service: measuring and selection, installation, service and warranty, restocking.
3. **კატალოგი:** framed category tabs with a sliding highlight and 20 products. Hovering a product lifts it, outlines it in blue and turns its "ფასის მოთხოვნა" button blue.
4. **Technologies (RF, AM, RFID):** three cards without a visible section title (the title is kept for screen readers). Each card has a softly drifting colour glow with a frosted-glass icon at the top, then the frequency, how the technology works and its entrance width/range, strength, weakness and best use. Hovering a card tints the whole card in its colour.
5. **კონტაქტი:** a white card in the same style as the form card, with a thin colour line on top: phone, email and address as soft rows (the row lifts and its icon turns blue on hover; phone and email have a copy button), and the map. The request form sits next to it.

Animations are short and calm, and all of them switch off for visitors who ask for reduced motion.

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

**Using real photos:** replace the file in `img/` (or point `src` at a new `.webp`/`.jpg`) and keep the `alt` text. Product images display at 4:3, the hero image at 4:3 too (`img/hero-family.svg`).

## SEO

- One `<h1>`, semantic sections (`header`, `nav`, `main`, `section`, `article`, `footer`), Georgian `lang="ka"`, canonical `https://tags.ge/`.
- Plain wording Georgian shops use (ჩიპი, მაგნიტი, სტიკერი, დეაქტივატორი, ანტენა); the general term is „დაცვის სისტემები“ and the antenna category is „დამცავი ანტენები“.
- The word „ანტიქურდული“ is not shown anywhere. Search terms that contain it are kept only in the hidden keywords meta and the JSON-LD `knowsAbout` list.
- JSON-LD `@graph`: `LocalBusiness` + `WholesaleStore` (with `OfferCatalog` per category), `WebSite`, `WebPage` and 20 `Product` items. Opening hours are not published; add `openingHoursSpecification` once you have the real hours.
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
- Respects `prefers-reduced-motion`. Keyboard accessible: skip link, visible focus, Escape closes the menu, Tab stays inside the open menu.
- Page weight: about 26 KB gzipped for `index.html` (CSS and JS inline), plus small SVG images.
