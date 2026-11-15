// Builds tagsge/index.html from template.html + catalog.json (+ images.json from images.py).
const fs = require('fs');
const OUT = process.argv[2];
const tags = require('./tags.json').d, ge = require('./ge.json').d;
const { categories, families } = require('./catalog.json');
const imgs = fs.existsSync(__dirname + '/images.json') ? require('./images.json') : {};

const SITE = 'https://tags.ge/';
const C = { PHONE: '+995 5XX XX XX XX', PHONE_TEL: '+9955XXXXXXXX', EMAIL: 'info@tags.ge', ADDRESS: 'თბილისი, საქართველო' };

const SHIELD = 'M20 2.2L35.2 7.4Q36 7.7 36 8.6V19.6C36 28.8 29.7 35.6 20.6 38.9Q20 39.1 19.4 38.9C10.3 35.6 4 28.8 4 19.6V8.6Q4 7.7 4.8 7.4Z';
const markInner = '<rect x="10.6" y="11" width="3.2" height="18" rx="1.6" fill="#fff"/><rect x="26.2" y="11" width="3.2" height="18" rx="1.6" fill="#fff"/><circle cx="20" cy="20" r="2.3" fill="#fff"/><path d="M17.1 16.6a4.6 4.6 0 0 0 0 6.8M22.9 16.6a4.6 4.6 0 0 1 0 6.8" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".75"/>';
const grad = id => `<linearGradient id="${id}" x1="6" y1="3" x2="34" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6FA6FF"/><stop offset=".55" stop-color="#2F6BFF"/><stop offset="1" stop-color="#1A3FD1"/></linearGradient>`;
const logo = id => `<svg class="logo" viewBox="0 0 160 44" width="132" height="36" role="img" aria-label="tags.ge"><defs>${grad(id)}</defs><path d="${SHIELD}" fill="url(#${id})"/>${markInner}<path d="${tags}" fill="currentColor"/><path class="logo-tld" d="${ge}"/></svg>`;

const svg = (d, cls = '', sw = 1.8) => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  I_ARROW: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  I_ARROW_BTN: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 'arrow', 2),
  I_PHONE: svg('<path d="M5.5 3.5h3l1.8 4.6-2.2 1.4a11.5 11.5 0 0 0 6.4 6.4l1.4-2.2 4.6 1.8v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2z"/>'),
  I_MAIL: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/>'),
  I_PIN: svg('<path d="M12 21s7-6.1 7-11.5a7 7 0 0 0-14 0C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  I_CHECK: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', '', 2.2),
  I_TRUCK: svg('<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 9.5h4l3.5 3.5v3.5h-7.5"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
  I_TOOL: svg('<path d="M14.6 6.4a4.2 4.2 0 0 0-5.5 5.5L3.8 17.2a1.9 1.9 0 0 0 2.7 2.7l5.3-5.3a4.2 4.2 0 0 0 5.5-5.5l-2.6 2.6-2.5-.6-.6-2.5z"/>'),
  I_RULER: svg('<path d="M3.5 16.5 16.5 3.5l4 4-13 13z"/><path d="M7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2"/>'),
  I_TAG: svg('<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7a1 1 0 0 1 .7.3l7.6 7.6a1 1 0 0 1 0 1.4l-7.7 7.7a1 1 0 0 1-1.4 0l-7.6-7.6a1 1 0 0 1-.3-.7z"/><circle cx="8" cy="8" r="1.5"/>'),
  I_SHIELD: svg('<path d="M12 3l7 3v5.5c0 4.2-2.9 7.9-7 9.5-4.1-1.6-7-5.3-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>'),
  I_SEARCH: svg('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  I_BOX: svg('<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>'),
  I_CLOSE: svg('<path d="M6 6l12 12M18 6L6 18"/>', '', 2),
  I_COIN: svg('<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.4 5.8 4.3 0 1.2-1.3 2.1-3 2.1-1.3 0-2.4-.6-3-1.5M12 6.2v1.6M12 16.3v1.5"/>'),
  I_STAR: svg('<path d="M12 3.8l2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.7-5 2.7 1-5.6-4.1-4 5.6-.8z"/>'),
  I_BUILDING: svg('<path d="M4 20.5V6.5L12 3.5l8 3v14"/><path d="M2.5 20.5h19M9 20.5v-4h6v4M8 9.5h1M11.5 9.5h1M15 9.5h1M8 13h1M11.5 13h1M15 13h1"/>'),
  I_BOLT: svg('<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>'),
};
// Round flags (drawn from the official proportions), used in the About section
const f2 = v => Math.round(v * 100) / 100;
function star(cx, cy, R, rot) {
  const r = R * 0.382, pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (rot + i * 36) * Math.PI / 180, k = i % 2 ? r : R;
    pts.push(f2(cx + k * Math.cos(a)) + ' ' + f2(cy + k * Math.sin(a)));
  }
  return 'M' + pts.join('L') + 'Z';
}
const flagSvg = (size, body) => `<svg class="flag" viewBox="0 0 36 36" width="${size}" height="${size}" aria-hidden="true" focusable="false">${body}</svg>`;
function flagTR(size) {
  const G = 37.2, ox = 18 - 0.0859 * G;
  return flagSvg(size, `<circle cx="18" cy="18" r="18" fill="#E30A17"/><circle cx="${f2(ox)}" cy="18" r="${f2(G / 4)}" fill="#fff"/><circle cx="${f2(ox + G / 16)}" cy="18" r="${f2(G / 5)}" fill="#E30A17"/><path fill="#fff" d="${star(ox + 0.3208 * G, 18, G / 8, 180)}"/>`);
}
function flagCN(size) {
  const k = 2.3, X = x => 18 + (x - 7.5) * k, Y = y => 18 + (y - 5.5) * k;
  const big = [X(5), Y(5)];
  const small = [[10, 2], [12, 4], [12, 7], [10, 9]].map(([x, y]) => {
    const sx = X(x), sy = Y(y), rot = Math.atan2(big[1] - sy, big[0] - sx) * 180 / Math.PI;
    return star(sx, sy, k, rot);
  });
  return flagSvg(size, `<circle cx="18" cy="18" r="18" fill="#EE1C25"/><path fill="#FFDE00" d="${star(big[0], big[1], 3 * k, -90)}${small.join('')}"/>`);
}
const route = require('./route.json');
const pin = (cls, pos, inner) => `<span class="pin ${cls}" style="left:${pos.left}%;top:${pos.top}%">${inner}</span>`;
const ROUTE = `<div class="route-map" aria-hidden="true">${route.svg}${pin('pin-tr', route.pins.tr, flagTR(20) + 'თურქეთი')}${pin('pin-cn', route.pins.cn, flagCN(20) + 'ჩინეთი')}${pin('pin-ge', route.pins.ge, '<i></i>საქართველო')}</div>`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const TECH = { rf: 'RF', am: 'AM', rfid: 'RFID', nfc: 'NFC' };
const catById = Object.fromEntries(categories.map(c => [c.id, c]));

const src = spec => `img/p/${imgs[spec] || 'missing'}.webp`;
const thumb = spec => `img/p/${imgs[spec] || 'missing'}-s.webp`;
const numModels = f => f.cols[0] === '№' || f.cols[0] === 'ანტენა, მმ' ? f.rows.length : f.rows.length;
const unitFrom = f => (f.id === 'uhf-labels' || f.id === 'hf-labels') ? 'ტიპიდან' : 'მოდელიდან';
// Like the "+6 more" swatches on big shops: small photos of the models inside, then a plain sentence
function options(f) {
  const n = f.rows.length;
  if (n < 2) return '';
  const pics = [...new Set(f.rows.map(r => r.img).filter(Boolean))].slice(0, n > 3 ? 3 : n);
  const sw = pics.length >= 2 ? `<span class="fam-swatches" aria-hidden="true">${pics.map(s => `<img src="${thumb(s)}" alt="" width="160" height="120" loading="lazy" decoding="async">`).join('')}${n > pics.length ? `<span class="more">+${n - pics.length}</span>` : ''}</span>` : '';
  return `
          <div class="fam-opts">${sw}<span class="fam-count">აირჩიეთ ${n} ${unitFrom(f)}</span></div>`;
}
const hasModelCol = f => f.cols[0] === 'მოდელი' || f.cols[0] === 'ჩიპი';

function gallery(f) {
  // card image first, then extra photos, then each model's own photo
  const out = [], seen = new Set();
  const push = (spec, label) => { if (spec && !seen.has(spec)) { seen.add(spec); out.push({ spec, label }); } };
  push(f.hero, '');
  f.gallery.forEach(g => push(g, ''));
  f.rows.forEach(r => push(r.img, r.m));
  return out;
}

function detail(f) {
  const c = catById[f.cat];
  const g = gallery(f);
  const pickable = hasModelCol(f);
  const thumbs = g.length > 1 ? `
          <div class="pdp-thumbs">${g.map((x, i) => `
            <button type="button" class="pdp-thumb" data-src="${src(x.spec)}"${i === 0 ? ' aria-current="true"' : ''} aria-label="ფოტო ${i + 1}${x.label ? ': ' + esc(x.label) : ''}"><img src="${thumb(x.spec)}" alt="" width="160" height="120" loading="lazy" decoding="async">${x.label ? `<span>${esc(x.label)}</span>` : ''}</button>`).join('')}
          </div>` : '';
  // columns with long text may wrap; everything else stays on one line
  const wide = f.cols.map((h, i) => Math.max(...f.rows.map(r => String(i ? r.v[i - 1] ?? '' : r.m).length)) > 24);
  const wc = i => wide[i] ? ' class="w"' : '';
  const head = `<tr>${pickable ? '<th scope="col"><span class="sr-only">არჩევა</span></th>' : ''}${f.cols.map((h, i) => `<th scope="col"${wc(i)}>${h}</th>`).join('')}</tr>`;
  // keep numbers with their units and sizes like 120 × 40 × 20 on one line; text may wrap
  const keep = v => esc(v).replace(/ × /g, '\u00A0×\u00A0').replace(/(\d) (მმ|სმ|მ|კგ|გ|ც\.|გაუსი|MHz|kHz)(?![\p{L}])/gu, '$1\u00A0$2');
  const body = f.rows.map(r => {
    const cells = [r.m, ...r.v];
    return `<tr${r.img ? ` data-src="${src(r.img)}"` : ''}>${pickable ? `<td class="pick-cell"><input type="checkbox" class="pick" value="${esc(r.m)}" aria-label="${esc(r.m)} — არჩევა"></td>` : ''}${cells.map((v, i) => i === 0 ? `<th scope="row"${wc(i)}>${esc(v)}</th>` : `<td${wc(i)}>${keep(v)}</td>`).join('')}</tr>`;
  }).join('');
  const facts = f.facts.length ? `
          <ul class="pdp-facts">${f.facts.map(([k, v]) => `<li><span>${k}</span><b>${esc(v)}</b></li>`).join('')}</ul>` : '';
  return `
        <div class="fam-detail" hidden>
          <div class="pdp-media">
            <figure class="pdp-main"><img src="${src(f.hero)}" alt="${esc(f.name)}" width="720" height="540" loading="lazy" decoding="async"></figure>${thumbs}
          </div>
          <div class="pdp-info">
            <p class="pdp-cat">${c.name}</p>
            <h4 class="pdp-title">${f.name}</h4>
            <p class="pdp-desc">${f.desc}</p>${facts}
            ${pickable ? '<p class="vt-hint">მონიშნეთ საჭირო მოდელები და მოითხოვეთ ფასი.</p>\n            ' : ''}<div class="vt-wrap" tabindex="0" role="region" aria-label="${esc(f.name)} — მოდელები">
              <table class="vt"><thead>${head}</thead><tbody>${body}</tbody></table>
            </div>
            <div class="pdp-actions">
              <button type="button" class="btn btn-primary js-request">ფასის მოთხოვნა ${I.I_ARROW_BTN}</button>
              <p class="pdp-picked" aria-live="polite"></p>
            </div>
            <p class="pdp-note">${I.I_BOX}<span>სხვა მოდელი, ზომა ან ფერი გჭირდებათ? მოგვწერეთ — შეკვეთით ჩამოვიტანთ ან დავამზადებთ.</span></p>
          </div>
        </div>`;
}

function card(f) {
  const search = [f.name, f.short, catById[f.cat].name, ...f.rows.map(r => r.m), ...f.rows.flatMap(r => r.v)].join(' ').toLowerCase();
  return `
      <article class="fam" id="${f.id}" data-fam="${f.id}" data-search="${esc(search)}">
        <div class="fam-media"><img src="${src(f.hero)}" alt="${esc(f.name)}" width="720" height="540" loading="lazy" decoding="async"><span class="fam-picked" aria-hidden="true">${I.I_CHECK}</span></div>
        <div class="fam-body">
          <h4 class="fam-name"><a href="#${f.id}" class="fam-link">${f.name}</a></h4>
          <p class="fam-short">${f.short}</p>
${options(f)}
          <div class="fam-foot">
            <span class="fam-meta">${f.tech.map(t => `<span class="fam-tech">${TECH[t]}</span>`).join('')}</span>
            <span class="fam-go" aria-hidden="true">${f.rows.length > 1 ? 'ყველა მოდელი' : 'დეტალები'} ${I.I_ARROW}</span>
          </div>
        </div>${detail(f)}
      </article>`;
}

const catalog = categories.map(c => {
  const fs_ = families.filter(f => f.cat === c.id);
  return `
    <section class="cat" id="${c.id}" aria-labelledby="${c.id}-title">
      <div class="cat-head">
        <h3 id="${c.id}-title">${c.name}</h3>
        <p>${c.desc}</p>
      </div>
      <div class="grid">${fs_.map(card).join('')}
      </div>
    </section>`;
}).join('\n');

const strip = s => String(s).replace(/ /g, ' ');
const keywords = ['ანტიქურდული სისტემები', 'ტანსაცმლის ჩიპები', 'დამცავი სტიკერები', 'მაგნიტური ჩიპები', 'ჩიპის მოსახსნელი მაგნიტი', 'ანტიქურდული ანტენები', 'მაღაზიის სიგნალიზაცია', 'პლასტმასის ჩიპები', 'სენსორული სტიკერები', 'მოპარვის საწინააღმდეგო სისტემები', 'პროდუქციის დაცვა ქურდობისგან', 'დეტაჩერი', 'სტიკერის დეაქტივატორი', 'RF ანტენა', 'AM ანტენა', 'მრავალჯერადი ჩიპები', 'RFID', 'NFC'];
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'WholesaleStore'],
      '@id': SITE + '#business',
      name: 'tags.ge',
      description: 'მაღაზიის დაცვის სისტემები: ანტენები, ჩიპები, სტიკერები, მაგნიტები, დეაქტივატორები და RFID. პირდაპირი მომწოდებლები თურქეთსა და ჩინეთში; საბითუმოდ, მონტაჟით მთელ საქართველოში.',
      url: SITE,
      logo: SITE + 'icon-512.png',
      image: [SITE + 'og-image.jpg'],
      telephone: strip(C.PHONE),
      email: C.EMAIL,
      priceRange: '₾',
      currenciesAccepted: 'GEL',
      address: { '@type': 'PostalAddress', addressLocality: 'თბილისი', addressRegion: 'თბილისი', addressCountry: 'GE' },
      geo: { '@type': 'GeoCoordinates', latitude: 41.7151, longitude: 44.8271 },
      areaServed: { '@type': 'Country', name: 'საქართველო' },
      knowsAbout: keywords,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'tags.ge — კატალოგი',
        itemListElement: categories.map(c => ({
          '@type': 'OfferCatalog',
          name: c.name,
          url: SITE + '#' + c.id,
          itemListElement: families.filter(f => f.cat === c.id).map(f => ({ '@type': 'Offer', availability: 'https://schema.org/InStock', itemOffered: { '@id': SITE + '#' + f.id } })),
        })),
      },
    },
    { '@type': 'WebSite', '@id': SITE + '#website', url: SITE, name: 'tags.ge', inLanguage: 'ka', publisher: { '@id': SITE + '#business' } },
    {
      '@type': 'WebPage', '@id': SITE + '#webpage', url: SITE, inLanguage: 'ka',
      name: 'მაღაზიის დაცვის სისტემები და ტანსაცმლის ჩიპები — tags.ge',
      isPartOf: { '@id': SITE + '#website' }, about: { '@id': SITE + '#business' },
      primaryImageOfPage: { '@type': 'ImageObject', url: SITE + 'og-image.jpg', width: 1200, height: 630 },
    },
    ...families.map(f => ({
      '@type': 'ProductGroup',
      '@id': SITE + '#' + f.id,
      name: strip(f.name),
      description: f.desc,
      image: SITE + src(f.hero),
      category: catById[f.cat].name,
      url: SITE + '#' + f.id,
      productGroupID: f.id,
      ...(hasModelCol(f) ? { hasVariant: f.rows.map(r => ({ '@type': 'Product', sku: strip(r.m), name: strip(f.name + ' ' + r.m) })) } : {}),
    })),
  ],
};

const rep = {
  ...C, ...I,
  JSONLD: JSON.stringify(ld).replace(/</g, '\\u003c'),
  LOGO_HEADER: logo('lg-h'), LOGO_FOOTER: logo('lg-f'),
  FILTER_BUTTONS: categories.map(c => `<button type="button" data-filter="${c.id}" aria-pressed="false">${c.tab}</button>`).join('\n      '),
  CATALOG: catalog,
  FLAG_TR: flagTR(36), FLAG_CN: flagCN(36), ROUTE_SVG: ROUTE,
  FAM_COUNT: String(families.length),
  MODEL_COUNT: String(families.reduce((a, f) => a + f.rows.length, 0)),
};
let html = fs.readFileSync(__dirname + '/template.html', 'utf8');
html = html.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => { if (!(k in rep)) throw new Error('missing ' + k); return rep[k]; });
fs.writeFileSync(OUT, html);
// sitemap with the product photos (Google image sitemap extension)
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(require('path').join(require('path').dirname(OUT), 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <image:image><image:loc>${SITE}og-image.jpg</image:loc></image:image>
${families.map(f => `    <image:image><image:loc>${SITE}${src(f.hero)}</image:loc></image:image>`).join('\n')}
  </url>
</urlset>
`);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + ' KB,', families.length, 'families,', rep.MODEL_COUNT, 'variants,', Object.keys(imgs).length, 'images mapped');
