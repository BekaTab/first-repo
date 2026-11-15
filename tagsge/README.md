# tags.ge — store security systems (B2B)

A one-page Georgian website for tags.ge, an importer and supplier of store security equipment: RF, AM and RFID antennas, hard tags, labels, deactivators, detachers, safer boxes and RFID products.

Plain HTML, CSS and JavaScript with no dependencies. Open `index.html` in a browser to preview it. The live copy is at https://tags-ge.vercel.app.

```
tagsge/
├── index.html          the whole site: HTML, CSS (in <style>), JS (at the end), Schema.org JSON-LD
├── img/p/              product photos (WebP): <family>.webp (720×540) and <family>-s.webp thumbnails (160×120)
├── img/                hero image (hero-family.svg) and logo files
├── og-image.jpg        1200×630 social preview (Facebook, Messenger, LinkedIn, Telegram)
├── favicon.svg / favicon.ico / apple-touch-icon.png / icon-192.png / icon-512.png
├── site.webmanifest
├── robots.txt, sitemap.xml (includes every product photo)
└── vercel.json         security headers and image caching for a Vercel deployment
```

`index.html` is generated from the sources in `tools/tagsge/` at the repository root (see "Editing the catalogue" below). Small text fixes can still be made directly in `index.html`.

## Page

Light, minimal layout with a blue accent (`#1F5EFF`) and violet, teal and orange as secondary colours:

1. **Header:** the logo, a framed menu (კატალოგი, ტექნოლოგიები, ჩვენს შესახებ, კონტაქტი) whose highlight slides to the link under the pointer and to the section in view, the "ფასის მოთხოვნა" button, and a thin reading-progress line.
2. **Hero:** the headline, one line of text, a large blue "კატალოგი" button and the product image, followed by four service cards (measuring and selection, installation, service and warranty, restocking).
3. **კატალოგი:** a search box, a note that the catalogue shows the main models only and that anything else can be imported or made to order, category tabs, and product family cards. Each family (for example all sizes of one hard tag, or all 32 safer box sizes) is one card that opens a product window. See below.
4. **Technologies (RF, AM, RFID):** three cards comparing frequency, how the technology works, entrance width, strengths and best use.
5. **ჩვენს შესახებ:** experience, partnership with several of Georgia's largest retail companies, best prices, direct suppliers in **Turkey and China** (highlighted, with flags), fastest delivery, and a dotted map with the supply routes Turkey → Georgia ← China.
6. **კონტაქტი:** phone, email and address with copy buttons, the map, and the request form.

Animations are short and calm, and all of them switch off for visitors who ask for reduced motion.

## Catalogue

10 categories, 42 product families, 266 models, 216 product photos. The product data and photos come from the two supplier catalogues (EAS and RFID). Small catalogue photos were enlarged with Real-ESRGAN (4×) and all photos were cleaned to a white background.

- **Card:** photo, name, one-line description, number of models and the technology (RF, AM, RFID, NFC). A blue tick appears on the card once the family is in the request list.
- **Product window:** a large photo with thumbnails (each model with its own photo has one; clicking a table row also shows that model), the description, key facts, and a table with every model and its sizes, frequency and other specs. Visitors tick the models they need and press "ფასის მოთხოვნა".
- **Links:** every family and category has its own address, for example `tags.ge/#safer-boxes` opens the safer box window and `tags.ge/#detachers` shows the magnets category. The browser Back button closes the window.
- **Search** looks through names, descriptions, model numbers and specs (for example `T015`, `58 kHz`, `RFID`). When nothing matches, it invites the visitor to write, because anything can be ordered.
- On phones, each category is a swipeable row and the product window fills the screen.

### Editing the catalogue

The catalogue lives in `tools/tagsge/catalog.py` (categories, families, model tables, photo sources). After a change:

```bash
cd tools/tagsge
python3 catalog.py
node build.cjs ../../tagsge/index.html
```

`build.cjs` combines `template.html` (layout, CSS and JS), `catalog.json`, `images.json` (photo file names) and `route.json` (the About map) into `tagsge/index.html` and writes `tagsge/sitemap.xml`. New photos go into `tagsge/img/p/` as 720×540 WebP plus a 160×120 `-s.webp` thumbnail; `images.py` is the script that produced the current set from the PDF catalogues.

## Before going live: replace the placeholders

These values are placeholders. Change them in `tools/tagsge/build.cjs` (the `C` object at the top) and rebuild, or search and replace across `index.html`:

| What | Placeholder | Where it appears |
|---|---|---|
| Phone (shown) | `+995 5XX XX XX XX` (the spaces are non-breaking) | mobile menu, contact section, JSON-LD `telephone` |
| Phone (dial link) | `+9955XXXXXXXX` | every `tel:` link |
| Email | `info@tags.ge` | mobile menu, contact section, form `data-email`, JSON-LD |
| Address | `თბილისი, საქართველო` | contact section, JSON-LD `address` (add `streetAddress` and `postalCode`) |
| Map | `q=Tbilisi%2C%20Georgia` | the Google Maps `<iframe>`: put the street address there |
| Coordinates | `41.7151`, `44.8271` | `geo.position` / `ICBM` meta tags and JSON-LD `geo` |

## Request form

In the product window, visitors tick models and press **ფასის მოთხოვნა**: the family and the ticked models (for example "დამცავი ყუთები — S101, S105") are added to the form's "არჩეული პროდუქცია" list and the page scrolls to the form. Without ticks, the whole family is requested. Items can be removed with ×, and the list is saved in the visitor's browser, so it survives a reload.

The form asks for name and phone (required), shop or company, email and a comment. Its hint invites visitors to describe products that are not in the catalogue.

- **As shipped** (`data-endpoint=""`), sending the form opens the visitor's email app with a ready-made message addressed to `data-email`.
- **To receive submissions directly**, set `data-endpoint` to a form service. For example, with FormSubmit (free, no account): `data-endpoint="https://formsubmit.co/ajax/info@tags.ge"`. The first submission sends an activation email to that address; confirm it once. Any service that accepts a JSON POST and returns `{ "success": true }` works.
- A hidden honeypot field (`_gotcha`) filters out simple spam bots.

## SEO

- One `<h1>`, semantic sections, Georgian `lang="ka"`, canonical `https://tags.ge/`.
- Plain wording Georgian shops use (ჩიპი, მაგნიტი, სტიკერი, დეაქტივატორი, ანტენა). The word „ანტიქურდული“ is not shown anywhere; search terms that contain it are kept only in the keywords meta and the JSON-LD `knowsAbout` list.
- JSON-LD `@graph`: `LocalBusiness` + `WholesaleStore` (with an `OfferCatalog` per category), `WebSite`, `WebPage` and one `ProductGroup` per family with its models as `hasVariant` (SKU = model number).
- All product text is in the page itself (the product windows are hidden blocks inside each card), so search engines read every model number.
- `sitemap.xml` lists every product photo. Open Graph and Twitter cards, `robots.txt`, manifest, favicons.
- To show Google product rich results (price in search results), add an `offers` block with a price in GEL to the products. Google requires a price for those.
- After launch: verify the domain in Google Search Console, submit `https://tags.ge/sitemap.xml`, and create a Google Business Profile with the same name, phone and address as the site.

## Deploy

- **Vercel:** project `tags-ge` (https://tags-ge.vercel.app). `tags.ge` and `www.tags.ge` are attached to it; the site moves to tags.ge once the domain's DNS points to Vercel: an `A` record for `tags.ge` and for `www` with the value `216.198.79.1`.
- **GitHub Pages:** once merged to `main`, the existing Pages workflow publishes this folder at `https://bekatab.github.io/first-repo/tagsge/`. The canonical URL still points to `https://tags.ge/`, so that copy doesn't compete with the real domain in search results.
- **Any static host** (Netlify, Cloudflare Pages, cPanel): upload the contents of this folder to the site root.

## Quality checks run

- End-to-end test (`tools/tagsge/e2e.cjs`, Playwright): tabs, search, product window (thumbnails, row photos, model ticks, Back button, Escape, deep links), request list and its persistence, form sending, About link, mobile menu and full-screen product window.
- No horizontal scrolling at 320, 360, 375, 390, 414, 768, 820, 1024, 1280, 1440 and 1920 px.
- `html-validate` (recommended rules): no errors.
- axe-core (WCAG 2 A/AA + best practices): no violations on desktop or mobile, for the page and inside the open product window.
- Page weight: about 64 KB gzipped for `index.html`; product photos load lazily (about 3 MB in total, each card photo 10–30 KB).
