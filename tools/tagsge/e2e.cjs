// End-to-end checks for the tags.ge page (catalogue families, dialog, search, request list, About, form)
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8765/tagsge/';
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.log('FAIL', msg); } };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const bad = [];
  p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  await p.goto(BASE, { waitUntil: 'networkidle' });

  // structure
  const s = await p.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    fams: document.querySelectorAll('.fam').length,
    cats: document.querySelectorAll('.cat').length,
    tabs: document.querySelectorAll('#tabs [data-filter]').length,
    details: document.querySelectorAll('.fam .fam-detail[hidden]').length,
    ids: [...document.querySelectorAll('[id]')].map(e => e.id),
    about: !!document.querySelector('#about .route-svg'),
    nav: [...document.querySelectorAll('#nav-pill a')].map(a => a.getAttribute('href')).join(' '),
    note: document.querySelector('.catalog-note .note-title').textContent,
    jsonld: (() => { try { const j = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent); return j['@graph'].filter(x => x['@type'] === 'ProductGroup').length; } catch (e) { return -1; } })(),
  }));
  ok(s.h1 === 1, 'one h1');
  ok(s.fams === 42, 'families 42, got ' + s.fams);
  ok(s.cats === 10, 'categories 10, got ' + s.cats);
  ok(s.tabs === 11, 'tabs 11, got ' + s.tabs);
  ok(s.details === 42, 'all details hidden in cards');
  ok(new Set(s.ids).size === s.ids.length, 'unique ids');
  ok(s.about, 'about map present');
  ok(s.nav === '#catalog #technology #about #contact', 'nav links: ' + s.nav);
  ok(/კატალოგში არ არის/.test(s.note), 'catalog note text');
  ok(s.jsonld === 42, 'ProductGroup JSON-LD x42, got ' + s.jsonld);

  // every product image (cards, main images, thumbnails, row images) loads
  const urls = await p.evaluate(() => [...new Set([...document.querySelectorAll('.fam img, .pdp-thumb, tr[data-src]')].map(e => e.getAttribute('src') || e.getAttribute('data-src')))]);
  const missing = [];
  for (const u of urls) { const r = await p.request.get(new URL(u, BASE).href); if (r.status() !== 200) missing.push(u); }
  ok(missing.length === 0, 'images missing: ' + missing.slice(0, 5).join(', '));
  ok(!urls.some(u => /missing/.test(u)), 'no unmapped images');
  console.log('images checked:', urls.length);

  // tabs
  await p.click('#tabs [data-filter="hard-tags"]');
  let vis = await p.evaluate(() => [...document.querySelectorAll('.cat')].filter(c => !c.hidden).map(c => c.id));
  ok(vis.length === 1 && vis[0] === 'hard-tags', 'tab filters to hard-tags: ' + vis);
  ok(await p.getAttribute('#tabs [data-filter="hard-tags"]', 'aria-pressed') === 'true', 'tab pressed');
  await p.click('#tabs [data-filter="all"]');
  vis = await p.evaluate(() => [...document.querySelectorAll('.cat')].filter(c => !c.hidden).length);
  ok(vis === 10, 'all categories back');

  // search
  await p.fill('#cat-search', 't015');
  await p.waitForTimeout(250);
  let found = await p.evaluate(() => [...document.querySelectorAll('.fam')].filter(f => !f.hidden).map(f => f.id));
  ok(found.join() === 'round-tags', 'search t015 -> round-tags: ' + found);
  ok(await p.isVisible('#search-clear'), 'clear button visible');
  await p.fill('#cat-search', 'უჯრედი-არარსებული');
  await p.waitForTimeout(250);
  ok(await p.isVisible('#catalog-empty'), 'empty state shown');
  await p.click('#search-clear');
  await p.waitForTimeout(250);
  found = await p.evaluate(() => [...document.querySelectorAll('.fam')].filter(f => !f.hidden).length);
  ok(found === 42 && !(await p.isVisible('#catalog-empty')), 'search cleared');
  await p.fill('#cat-search', 'RFID');
  await p.waitForTimeout(250);
  found = await p.evaluate(() => [...document.querySelectorAll('.fam')].filter(f => !f.hidden).length);
  ok(found >= 5, 'search RFID finds several: ' + found);
  await p.press('#cat-search', 'Escape');
  await p.waitForTimeout(250);
  ok((await p.inputValue('#cat-search')) === '', 'Escape clears search');

  // dialog open from a card
  await p.click('#safer-boxes .fam-link');
  await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.getElementById('pdp').open), 'dialog opens');
  ok(p.url().endsWith('#safer-boxes'), 'hash set: ' + p.url());
  ok((await p.textContent('#pdp-title')).includes('დამცავი ყუთები'), 'dialog title');
  const rows = await p.$$eval('#pdp .vopt', r => r.length);
  ok(rows === 32, 'safer box model tiles 32, got ' + rows);
  ok((await p.textContent('#pdp .vsel-name')) === 'S101', 'first model preselected');
  // thumbnails switch the main image
  const t2 = await p.getAttribute('#pdp .pdp-thumb:nth-child(2)', 'data-src');
  await p.click('#pdp .pdp-thumb:nth-child(2)');
  await p.waitForTimeout(300);
  ok((await p.getAttribute('#pdp .pdp-main img', 'src')) === t2, 'thumb switches image');
  // choose a model: label and specs follow
  await p.click('#pdp .vopt[data-name="S105"]');
  ok((await p.textContent('#pdp .vsel-name')) === 'S105', 'selected label');
  ok(await p.isVisible('#pdp .vspec[data-i="4"]') && !(await p.isVisible('#pdp .vspec[data-i="0"]')), 'specs follow the chosen model');
  await p.click('#pdp .js-request');
  await p.waitForTimeout(200);
  ok(!(await p.evaluate(() => document.getElementById('pdp').open)), 'dialog closes after request');
  const chips = await p.$$eval('#quote-items li span', l => l.map(x => x.textContent));
  ok(chips.length === 1 && chips[0] === 'დამცავი ყუთები — S105', 'chip text: ' + chips);
  ok(await p.evaluate(() => document.getElementById('safer-boxes').classList.contains('is-picked')), 'card marked picked');
  ok(!/#safer-boxes/.test(p.url()), 'hash cleared after close: ' + p.url());
  // whole-family request without picking + card without model column
  await p.click('#tabs [data-filter="all"]');
  await p.click('#rfid-readers .fam-link');
  await p.waitForTimeout(150);
  await p.click('#pdp .js-request');
  await p.waitForTimeout(150);
  const chips2 = await p.$$eval('#quote-items li span', l => l.map(x => x.textContent));
  ok(chips2.length === 2, 'second chip added: ' + chips2);
  // a second model of the same family is added to the same line
  await p.click('#safer-boxes .fam-link');
  await p.waitForTimeout(150);
  await p.click('#pdp .vopt[data-name="S204"]');
  await p.click('#pdp .js-request');
  await p.waitForTimeout(200);
  const chips4 = await p.$$eval('#quote-items li span', l => l.map(x => x.textContent));
  ok(chips4.includes('დამცავი ყუთები — S105, S204'), 'second model joins the line: ' + chips4);
  await p.click('#safer-boxes .fam-link');
  await p.waitForTimeout(150);
  // Escape closes, focus returns to the card link
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  ok(!(await p.evaluate(() => document.getElementById('pdp').open)), 'Escape closes');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.closest('#safer-boxes') !== null), 'focus back on card');
  // back button closes the dialog
  await p.click('#round-tags .fam-link');
  await p.waitForTimeout(150);
  await p.goBack();
  await p.waitForTimeout(250);
  ok(!(await p.evaluate(() => document.getElementById('pdp').open)), 'Back closes dialog');
  ok(!/#round-tags/.test(p.url()), 'Back removes hash');
  // backdrop click closes
  await p.click('#round-tags .fam-link');
  await p.waitForTimeout(150);
  await p.mouse.click(10, 450);
  await p.waitForTimeout(150);
  ok(!(await p.evaluate(() => document.getElementById('pdp').open)), 'backdrop click closes');
  // a model with its own photo shows that photo; arrow keys move between models
  await p.click('#metal-detachers .fam-link');
  await p.waitForTimeout(150);
  const tile = await p.$('#pdp .vopt[data-src]:nth-child(3)');
  const rs = await tile.getAttribute('data-src');
  await tile.click();
  await p.waitForTimeout(300);
  ok((await p.getAttribute('#pdp .pdp-main img', 'src')) === rs, 'model tile switches photo');
  await p.keyboard.press('ArrowRight');
  ok((await p.getAttribute('#pdp .vopt:nth-child(4)', 'aria-checked')) === 'true', 'arrow key selects next model');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);                      // closing goes Back in history; let that finish

  // persistence across reload + deep links
  await p.goto(BASE + '#rfid-cards');            // same document: only the hash changes
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.getElementById('pdp').open), 'hashchange opens dialog');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  await p.goto('about:blank');
  await p.goto(BASE + '#uhf-labels', { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.getElementById('pdp').open), 'deep link opens dialog');
  ok((await p.textContent('#pdp-title')).includes('UHF'), 'deep link title');
  const chips3 = await p.$$eval('#quote-items li span', l => l.length);
  ok(chips3 === 2, 'request list survives reload: ' + chips3);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  ok(!/#uhf-labels/.test(p.url()), 'closing deep-linked dialog clears hash');
  await p.goto('about:blank');
  await p.goto(BASE + '#detachers', { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);
  vis = await p.evaluate(() => [...document.querySelectorAll('.cat')].filter(c => !c.hidden).map(c => c.id));
  ok(vis.join() === 'detachers', 'category deep link: ' + vis);
  const top = await p.evaluate(() => Math.round(document.getElementById('detachers').getBoundingClientRect().top));
  ok(top >= 60 && top <= 110, 'category deep link scrolled: top=' + top);

  // remove a chip
  await p.click('#quote-items li:first-child button');
  ok((await p.$$eval('#quote-items li', l => l.length)) === 1, 'chip removed');

  // form via a mock endpoint
  await p.route('**/mock-endpoint', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
  await p.evaluate(() => document.getElementById('quote-form').setAttribute('data-endpoint', '/mock-endpoint'));
  await p.click('#quote-form button[type="submit"]');
  ok((await p.getAttribute('#f-name', 'aria-invalid')) === 'true', 'empty form flags name');
  let posted = null;
  p.on('request', r => { if (r.url().endsWith('/mock-endpoint')) posted = r.postDataJSON(); });
  await p.fill('#f-name', 'ტესტი');
  await p.fill('#f-phone', '555 12 34 56');
  await p.click('#quote-form button[type="submit"]');
  await p.waitForTimeout(400);
  ok(posted && /RFID/.test(posted['პროდუქცია']), 'posted products: ' + (posted && posted['პროდუქცია']));
  ok((await p.textContent('#form-status')).includes('გმადლობთ'), 'form success');
  ok((await p.$$eval('#quote-items li', l => l.length)) === 0, 'list cleared after send');

  // About nav link
  await p.click('#nav-pill a[href="#about"]');
  await p.waitForTimeout(400);
  const at = await p.evaluate(() => Math.round(document.getElementById('about').getBoundingClientRect().top));
  ok(at >= 0 && at < 120, 'about link scrolls: ' + at);

  ok(errs.length === 0, 'console errors: ' + errs.join(' | '));
  ok(bad.length === 0, 'bad responses: ' + bad.slice(0, 5).join(' | '));

  // mobile: dialog full screen and menu link to About
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
  await m.goto(BASE, { waitUntil: 'networkidle' });
  await m.click('#menu-toggle');
  await m.click('#mobile-menu a[href="#about"]');
  await m.waitForTimeout(400);
  ok(!(await m.evaluate(() => document.getElementById('mobile-menu').classList.contains('is-open'))), 'mobile menu closes');
  await m.evaluate(() => document.getElementById('catalog').scrollIntoView());
  await m.tap('#round-tags .fam-link');
  await m.waitForTimeout(200);
  const box = await m.evaluate(() => { const r = document.getElementById('pdp').getBoundingClientRect(); return [r.width, r.height]; });
  ok(box[0] === 390 && box[1] >= 840, 'mobile dialog full screen: ' + box);
  await m.tap('#pdp-close');
  await m.waitForTimeout(200);
  ok(!(await m.evaluate(() => document.getElementById('pdp').open)), 'mobile close button');

  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
