(function () {
  'use strict';
  // ---------------------------------------------------------------- configuration
  var DEFAULT_REPO = { owner: 'BekaTab', repo: 'first-repo', branch: 'main' };
  var DATA_PATH = 'mypoker/products.json';
  var IMAGE_DIR = 'mypoker/public/images';
  var STORE_KEY = 'mypoker-admin-v1';
  var SESSION_KEY = 'mypoker-admin-session';
  var API = 'https://api.github.com';
  var CATEGORIES = [['cards', 'კარტები', '🂡'], ['chips', 'ჩიპები', '🪙'], ['tables', 'მაგიდები', '🟩'], ['accessories', 'აქსესუარები', '♠']];
  var CAT_LABEL = {}; CATEGORIES.forEach(function (c) { CAT_LABEL[c[0]] = c[1]; });
  var CAT_ICON = {}; CATEGORIES.forEach(function (c) { CAT_ICON[c[0]] = c[2]; });

  // ---------------------------------------------------------------- helpers
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c !== null && c !== undefined && c !== false) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function show(view) { ['viewSetup', 'viewLogin', 'viewApp'].forEach(function (v) { $(v).hidden = v !== view; }); }
  function store(get, val) {
    try { if (get) return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); localStorage.setItem(STORE_KEY, JSON.stringify(val)); } catch (e) { return null; }
  }
  function b64FromBytes(bytes) { var s = ''; for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
  function bytesFromB64(b64) { var bin = atob(b64.replace(/\s/g, '')); var out = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
  var enc = new TextEncoder(), dec = new TextDecoder();
  function today() { return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tbilisi' }); }
  function money(n) { return Math.round(n).toLocaleString('ka-GE') + ' ₾'; }
  function slug(name) {
    var base = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
    return (base || 'product') + '-' + Date.now().toString(36);
  }
  function saleActive(p) { return p.salePrice > 0 && p.salePrice < p.price && (!p.saleEnds || p.saleEnds >= today()); }

  // ---------------------------------------------------------------- token encryption (PBKDF2 + AES-GCM, local only)
  function deriveKey(pass, salt) {
    return crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function encryptToken(token, pass) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(pass, salt).then(function (key) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(token)); })
      .then(function (ct) { return { salt: b64FromBytes(salt), iv: b64FromBytes(iv), data: b64FromBytes(new Uint8Array(ct)) }; });
  }
  function decryptToken(box, pass) {
    return deriveKey(pass, bytesFromB64(box.salt)).then(function (key) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytesFromB64(box.iv) }, key, bytesFromB64(box.data));
    }).then(function (pt) { return dec.decode(pt); });
  }

  // ---------------------------------------------------------------- GitHub API
  var S = { token: null, repo: clone(DEFAULT_REPO) };
  function gh(method, path, body) {
    return fetch(API + path, {
      method: method, cache: 'no-store',
      headers: { 'Authorization': 'Bearer ' + S.token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var data = null; try { data = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) { var err = new Error((data && data.message) || ('HTTP ' + r.status)); err.status = r.status; throw err; }
        return data;
      });
    });
  }
  function repoPath(p) { return '/repos/' + encodeURIComponent(S.repo.owner) + '/' + encodeURIComponent(S.repo.repo) + p; }
  function explain(e) {
    if (!navigator.onLine) return 'ინტერნეტთან კავშირი არ არის.';
    if (e.status === 401) return 'Token არასწორია ან ვადა გაუვიდა. შექმენით ახალი token და დააყენეთ თავიდან.';
    if (e.status === 403) return 'Token-ს არ აქვს საკმარისი უფლება (საჭიროა Contents: Read and write).';
    if (e.status === 404) return 'რეპოზიტორია ან ფაილი ვერ მოიძებნა. შეამოწმეთ token-ის Repository access.';
    if (e.status === 409 || e.status === 422) return 'GitHub-მა ცვლილება ვერ მიიღო. სცადეთ ხელახლა.';
    return 'შეცდომა: ' + e.message;
  }

  // ---------------------------------------------------------------- state
  var published = null, draft = null, publishedSha = null, busy = false;
  var pending = {}; // images uploaded here, not yet published: { 'images/x.webp': { b64, dataUrl } }
  var editingId = null, editImage = '';

  function normalise(d) {
    d = d && typeof d === 'object' ? d : {};
    var s = d.settings || {};
    var out = { settings: { phoneDisplay: String(s.phoneDisplay || ''), phoneTel: String(s.phoneTel || ''), whatsappNumber: String(s.whatsappNumber || '') }, products: [] };
    (Array.isArray(d.products) ? d.products : []).forEach(function (p) {
      if (!p || !p.id) return;
      var price = Math.round(Number(p.price) || 0), sale = Math.round(Number(p.salePrice) || 0);
      var o = {
        id: String(p.id), name: String(p.name || ''), category: CAT_LABEL[p.category] ? p.category : 'accessories', price: price,
        salePrice: sale > 0 ? sale : null, saleEnds: /^\d{4}-\d{2}-\d{2}$/.test(p.saleEnds || '') ? p.saleEnds : '',
        badge: String(p.badge || ''), spec: String(p.spec || ''), image: typeof p.image === 'string' ? p.image : '',
        inStock: p.inStock !== false, visible: p.visible !== false
      };
      if (p.visual) o.visual = p.visual;
      out.products.push(o);
    });
    return out;
  }
  function changes() {
    if (!published || !draft) return 0;
    var n = 0, before = {};
    published.products.forEach(function (p) { before[p.id] = JSON.stringify(p); });
    draft.products.forEach(function (p) { if (before[p.id] !== JSON.stringify(p)) n++; delete before[p.id]; });
    n += Object.keys(before).length;
    if (JSON.stringify(draft.settings) !== JSON.stringify(published.settings)) n++;
    if (!n && draft.products.map(function (p) { return p.id; }).join() !== published.products.map(function (p) { return p.id; }).join()) n++;
    return n;
  }
  function setStatus(kind, text) { $('status').className = 'status ' + (kind || ''); $('statusText').textContent = text; }
  function refresh() {
    renderProducts(); renderSales();
    if (busy) return;
    var n = changes();
    $('publishBtn').disabled = !n || !!settingsError();
    $('discard').hidden = !n;
    if (n) setStatus('dirty', n + ' გამოუქვეყნებელი ცვლილება'); else setStatus('', 'ყველაფერი გამოქვეყნებულია');
  }

  // ---------------------------------------------------------------- auth
  function boot() {
    var saved = store(true);
    S.repo = (saved && saved.repo) || clone(DEFAULT_REPO);
    var sess = null; try { sess = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (e) {}
    if (saved && sess && sess.token && sess.exp > Date.now()) { S.token = sess.token; return enterApp(); }
    if (saved && saved.box) { show('viewLogin'); setTimeout(function () { $('loginPass').focus(); }, 50); }
    else { show('viewSetup'); $('setupOwner').value = S.repo.owner; $('setupRepo').value = S.repo.repo; $('setupBranch').value = S.repo.branch; }
  }
  function keepSession() { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: S.token, exp: Date.now() + 4 * 3600 * 1000 })); } catch (e) {} }

  $('setupForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('setupErr'), btn = $('setupBtn'); err.hidden = true;
    var token = $('setupToken').value.trim(), p1 = $('setupPass').value, p2 = $('setupPass2').value;
    var repo = { owner: $('setupOwner').value.trim() || DEFAULT_REPO.owner, repo: $('setupRepo').value.trim() || DEFAULT_REPO.repo, branch: $('setupBranch').value.trim() || DEFAULT_REPO.branch };
    var fail = function (m) { err.textContent = m; err.hidden = false; btn.disabled = false; btn.textContent = 'დაყენება და შესვლა'; };
    if (!token) return fail('ჩასვით GitHub token.');
    if (p1.length < 8) return fail('პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო.');
    if (p1 !== p2) return fail('პაროლები არ ემთხვევა.');
    btn.disabled = true; btn.textContent = 'მოწმდება…';
    S.token = token; S.repo = repo;
    gh('GET', repoPath('')).then(function (r) {
      if (r && r.permissions && r.permissions.push === false) throw Object.assign(new Error('no push'), { status: 403 });
      return encryptToken(token, p1);
    }).then(function (box) {
      store(false, { v: 1, repo: repo, box: box });
      $('setupToken').value = $('setupPass').value = $('setupPass2').value = '';
      keepSession(); enterApp();
    }).catch(function (e) { S.token = null; fail(explain(e)); });
  });

  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('loginErr'), btn = $('loginBtn'); err.hidden = true;
    var saved = store(true); if (!saved || !saved.box) return boot();
    btn.disabled = true; btn.textContent = 'მოწმდება…';
    decryptToken(saved.box, $('loginPass').value).then(function (token) {
      S.token = token; S.repo = saved.repo; $('loginPass').value = ''; keepSession(); enterApp();
    }).catch(function () {
      err.textContent = 'პაროლი არასწორია.'; err.hidden = false; $('loginPass').select();
    }).then(function () { btn.disabled = false; btn.textContent = 'შესვლა'; });
  });

  $('resetDevice').addEventListener('click', function () {
    if (!window.confirm('ამ მოწყობილობაზე შენახული token წაიშლება და დაგჭირდებათ თავიდან დაყენება. გავაგრძელო?')) return;
    try { localStorage.removeItem(STORE_KEY); sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    boot();
  });
  $('logout').addEventListener('click', function () {
    if (changes() && !window.confirm('გაქვთ გამოუქვეყნებელი ცვლილებები. მაინც გავიდე?')) return;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    S.token = null; published = draft = null; pending = {};
    show('viewLogin'); $('loginErr').hidden = true;
  });

  // ---------------------------------------------------------------- load
  function readData() {
    return gh('GET', repoPath('/contents/' + DATA_PATH + '?ref=' + encodeURIComponent(S.repo.branch))).then(function (f) {
      return { sha: f.sha, data: normalise(JSON.parse(dec.decode(bytesFromB64(f.content)))) };
    });
  }
  function enterApp() {
    show('viewApp'); busy = true; setStatus('busy', 'იტვირთება…');
    readData().then(function (r) {
      published = r.data; publishedSha = r.sha; draft = clone(published); pending = {};
      busy = false; fillSettings(); refresh();
    }).catch(function (e) {
      busy = false; setStatus('err', explain(e));
      var m = $('loadMsg'); m.className = 'msg err'; m.textContent = explain(e); m.hidden = false;
      if (e.status === 401) { try { sessionStorage.removeItem(SESSION_KEY); } catch (x) {} }
    });
  }

  // ---------------------------------------------------------------- tabs
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) {
    t.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (x) { x.setAttribute('aria-selected', String(x === t)); });
      ['products', 'sales', 'settings'].forEach(function (id) { $('tab-' + id).hidden = id !== t.dataset.tab; });
    });
  });

  // ---------------------------------------------------------------- products list
  function imageSrc(path) { return pending[path] ? pending[path].dataUrl : (path ? '../' + path : ''); }
  function thumb(p, img) {
    var src = imageSrc(img !== undefined ? img : p.image);
    return el('div', { class: 'thumb' }, [src ? el('img', { src: src, alt: '' }) : (CAT_ICON[p.category] || '♠')]);
  }
  function priceCell(p) {
    var on = saleActive(p);
    var kids = [el('span', { class: 'now num' + (on ? ' sale' : ''), text: money(on ? p.salePrice : p.price) })];
    if (on) kids.push(el('s', { class: 'num', text: money(p.price) }));
    var box = el('div', { class: 'price' }, kids);
    if (p.salePrice && !on) box.appendChild(el('div', { class: 'pmeta', text: 'ფასდაკლების ვადა გასულია' }));
    else if (on && p.saleEnds) box.appendChild(el('div', { class: 'pmeta', text: 'ფასდაკლება ' + p.saleEnds + '-მდე' }));
    return box;
  }
  function toggle(p, key, label) {
    var input = el('input', { type: 'checkbox' }); input.checked = !!p[key];
    input.addEventListener('change', function () { p[key] = input.checked; refresh(); });
    return el('label', { class: 'check' }, [input, label]);
  }
  function move(i, d) {
    var j = i + d, list = draft.products; if (j < 0 || j >= list.length) return;
    var t = list[i]; list[i] = list[j]; list[j] = t; refresh();
  }
  function renderProducts() {
    var ul = $('plist'); ul.innerHTML = '';
    if (!draft) return;
    var q = $('q').value.trim().toLowerCase(), cat = $('qCat').value;
    var shown = 0;
    draft.products.forEach(function (p, i) {
      if (cat !== 'all' && p.category !== cat) return;
      if (q && p.name.toLowerCase().indexOf(q) < 0) return;
      shown++;
      var tags = [el('span', { class: 'tag', text: CAT_LABEL[p.category] })];
      if (p.badge) tags.push(el('span', { class: 'tag dark', text: p.badge }));
      if (saleActive(p)) tags.push(el('span', { class: 'tag red num', text: '−' + Math.round((1 - p.salePrice / p.price) * 100) + '%' }));
      if (!p.inStock) tags.push(el('span', { class: 'tag amber', text: 'შეკვეთით' }));
      if (!p.visible) tags.push(el('span', { class: 'tag', text: 'დამალულია' }));
      ul.appendChild(el('li', { class: 'prow' + (p.visible ? '' : ' off') }, [
        thumb(p),
        el('div', { class: 'info', style: 'min-width:0' }, [el('div', { class: 'pname', text: p.name || '(უსახელო)' }), el('div', { class: 'pmeta' }, tags)]),
        priceCell(p),
        el('div', { class: 'toggles' }, [toggle(p, 'inStock', 'მარაგშია'), toggle(p, 'visible', 'ჩანს საიტზე')]),
        el('div', { class: 'actions' }, [
          el('button', { class: 'btn ghost icon', type: 'button', title: 'ზემოთ', 'aria-label': 'ზემოთ', onclick: function () { move(i, -1); } }, ['↑']),
          el('button', { class: 'btn ghost icon', type: 'button', title: 'ქვემოთ', 'aria-label': 'ქვემოთ', onclick: function () { move(i, 1); } }, ['↓']),
          el('button', { class: 'btn', type: 'button', onclick: function () { openEditor(p.id); } }, ['რედაქტირება']),
          el('button', { class: 'btn ghost icon danger', type: 'button', title: 'წაშლა', 'aria-label': 'წაშლა', onclick: function () {
            if (!window.confirm('წავშალო „' + p.name + '“?')) return;
            draft.products = draft.products.filter(function (x) { return x.id !== p.id; }); refresh();
          } }, ['🗑'])
        ])
      ]));
    });
    if (!shown) ul.appendChild(el('li', { class: 'empty', text: draft.products.length ? 'ამ ფილტრით პროდუქტი ვერ მოიძებნა.' : 'პროდუქტები ჯერ არ არის. დააჭირეთ „+ ახალი პროდუქტი“.' }));
  }
  $('q').addEventListener('input', renderProducts);
  $('qCat').addEventListener('change', renderProducts);

  // ---------------------------------------------------------------- editor dialog
  function fillCats(select, withAll, allLabel) {
    select.innerHTML = '';
    if (withAll) select.appendChild(el('option', { value: 'all', text: allLabel }));
    CATEGORIES.forEach(function (c) { select.appendChild(el('option', { value: c[0], text: c[1] })); });
  }
  fillCats($('qCat'), true, 'ყველა კატეგორია'); fillCats($('fCat'), false); fillCats($('saleScope'), true, 'ყველა პროდუქტი');

  function renderEditThumb() {
    var box = $('fThumb'); box.innerHTML = '';
    var src = imageSrc(editImage);
    box.appendChild(src ? el('img', { src: src, alt: '' }) : document.createTextNode(CAT_ICON[$('fCat').value] || '♠'));
    $('fImageRemove').hidden = !editImage;
  }
  function openEditor(id) {
    editingId = id;
    var p = id ? draft.products.find(function (x) { return x.id === id; }) : null;
    $('dlgTitle').textContent = p ? 'პროდუქტის რედაქტირება' : 'ახალი პროდუქტი';
    $('fName').value = p ? p.name : '';
    $('fCat').value = p ? p.category : ($('qCat').value !== 'all' ? $('qCat').value : 'chips');
    $('fBadge').value = p ? p.badge : '';
    $('fSpec').value = p ? p.spec : '';
    $('fPrice').value = p ? p.price : '';
    $('fSale').value = p && p.salePrice ? p.salePrice : '';
    $('fSaleEnds').value = p ? p.saleEnds : '';
    $('fStock').checked = p ? p.inStock : true;
    $('fVisible').checked = p ? p.visible : true;
    editImage = p ? p.image : '';
    $('fErr').hidden = true;
    renderEditThumb();
    $('dlg').showModal();
    setTimeout(function () { $('fName').focus(); }, 30);
  }
  $('addProduct').addEventListener('click', function () { openEditor(null); });
  $('dlgClose').addEventListener('click', function () { $('dlg').close(); });
  $('dlgCancel').addEventListener('click', function () { $('dlg').close(); });
  $('fCat').addEventListener('change', renderEditThumb);
  $('fImageRemove').addEventListener('click', function () { editImage = ''; renderEditThumb(); });

  // ფოტო მცირდება 1200 პიქსელამდე და ინახება WebP-ად (ან JPEG-ად, თუ ბრაუზერი WebP-ს ვერ ქმნის)
  $('fImage').addEventListener('change', function () {
    var file = this.files && this.files[0]; this.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) { showErr('აირჩიეთ სურათის ფაილი.'); return; }
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var max = 1200, scale = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      var ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      var dataUrl = c.toDataURL('image/webp', 0.86), ext = 'webp';
      if (dataUrl.indexOf('data:image/webp') !== 0) {
        ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        dataUrl = c.toDataURL('image/jpeg', 0.86); ext = 'jpg';
      }
      var path = 'images/' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6) + '.' + ext;
      pending[path] = { b64: dataUrl.split(',')[1], dataUrl: dataUrl };
      editImage = path; renderEditThumb();
    };
    img.onerror = function () { URL.revokeObjectURL(url); showErr('სურათი ვერ წაიკითხა. სცადეთ სხვა ფაილი.'); };
    img.src = url;
  });
  function showErr(m) { var e = $('fErr'); e.textContent = m; e.hidden = false; }
  $('pform').addEventListener('input', function () { $('fErr').hidden = true; });

  $('pform').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('fName').value.trim(), price = Math.round(Number($('fPrice').value)), saleRaw = $('fSale').value.trim();
    var sale = saleRaw ? Math.round(Number(saleRaw)) : null;
    if (!name) return showErr('შეიყვანეთ სახელი.');
    if (!(price > 0)) return showErr('შეიყვანეთ ფასი (დადებითი რიცხვი).');
    if (sale !== null && !(sale > 0 && sale < price)) return showErr('ფასდაკლებული ფასი უნდა იყოს ჩვეულებრივ ფასზე ნაკლები.');
    var p = editingId ? draft.products.find(function (x) { return x.id === editingId; }) : null;
    if (!p) { p = { id: slug(name) }; draft.products.unshift(p); }
    p.name = name; p.category = $('fCat').value; p.badge = $('fBadge').value.trim(); p.spec = $('fSpec').value.trim();
    p.price = price; p.salePrice = sale; p.saleEnds = sale ? $('fSaleEnds').value : '';
    p.image = editImage; p.inStock = $('fStock').checked; p.visible = $('fVisible').checked;
    if (p.image) delete p.visual;
    $('dlg').close(); refresh();
  });

  // ---------------------------------------------------------------- sales
  function inScope(p) { var s = $('saleScope').value; return s === 'all' || p.category === s; }
  function flash(m) { var x = $('saleMsg'); x.textContent = m; x.hidden = false; clearTimeout(flash.t); flash.t = setTimeout(function () { x.hidden = true; }, 4000); }
  $('applySale').addEventListener('click', function () {
    var pct = Math.round(Number($('salePct').value));
    if (!(pct >= 1 && pct <= 90)) { flash('შეიყვანეთ პროცენტი 1-დან 90-მდე.'); return; }
    var ends = $('saleEnds').value, n = 0;
    draft.products.forEach(function (p) {
      if (!inScope(p)) return;
      var s = Math.round(p.price * (1 - pct / 100));
      if (s > 0 && s < p.price) { p.salePrice = s; p.saleEnds = ends; n++; }
    });
    flash(n + ' პროდუქტს დაედო ' + pct + '% ფასდაკლება. არ დაგავიწყდეთ „გამოქვეყნება“.'); refresh();
  });
  $('clearSale').addEventListener('click', function () {
    var n = 0;
    draft.products.forEach(function (p) { if (inScope(p) && p.salePrice) { p.salePrice = null; p.saleEnds = ''; n++; } });
    flash(n ? n + ' პროდუქტს მოეხსნა ფასდაკლება.' : 'ამ კატეგორიაში ფასდაკლება არ იყო.'); refresh();
  });
  function renderSales() {
    var ul = $('saleList'); ul.innerHTML = '';
    if (!draft) return;
    var on = draft.products.filter(saleActive);
    if (!on.length) { ul.appendChild(el('li', { text: 'ამჟამად ფასდაკლება არცერთ პროდუქტზე არ არის.' })); return; }
    on.forEach(function (p) {
      ul.appendChild(el('li', {}, [
        el('span', { text: p.name }),
        el('span', { class: 'num', style: 'white-space:nowrap' }, [el('b', { style: 'color:var(--red)', text: money(p.salePrice) }), ' ', el('s', { style: 'color:var(--subtle)', text: money(p.price) }), p.saleEnds ? ' · ' + p.saleEnds + '-მდე' : ''])
      ]));
    });
  }

  // ---------------------------------------------------------------- settings
  function fillSettings() { $('setPhone').value = draft.settings.phoneDisplay; $('setWa').value = draft.settings.whatsappNumber; }
  function settingsError() {
    if (!draft) return '';
    var wa = draft.settings.whatsappNumber;
    if (wa && !/^\d{9,15}$/.test(wa)) return 'WhatsApp ნომერი უნდა შეიცავდეს მხოლოდ ციფრებს (9–15), მაგ. 995555123456.';
    return '';
  }
  function onSettings() {
    draft.settings.phoneDisplay = $('setPhone').value.trim();
    draft.settings.phoneTel = draft.settings.phoneDisplay.replace(/[^\d+]/g, '');
    draft.settings.whatsappNumber = $('setWa').value.trim();
    var m = settingsError(), box = $('setMsg'); box.textContent = m; box.hidden = !m;
    refresh();
  }
  $('setPhone').addEventListener('input', onSettings);
  $('setWa').addEventListener('input', onSettings);

  // ---------------------------------------------------------------- discard / publish
  $('discard').addEventListener('click', function () {
    if (!window.confirm('ყველა გამოუქვეყნებელი ცვლილება გაუქმდება. გავაგრძელო?')) return;
    draft = clone(published); pending = {}; fillSettings(); $('setMsg').hidden = true; refresh();
  });

  function pollDeploy(sha, started) {
    // სტატუსების სრული სია (უახლესი პირველია); ორივე Vercel პროექტი „Vercel“ სახელით წერს, ამიტომ ვარჩევთ ბმულით
    return gh('GET', repoPath('/commits/' + sha + '/statuses?per_page=100')).then(function (list) {
      var s = (list || []).filter(function (x) { return /vercel/i.test(x.context) && /\/mypoker\//.test(x.target_url || ''); })[0];
      if (s && s.state === 'success') return 'success';
      if (s && (s.state === 'failure' || s.state === 'error')) return 'failure';
      if (Date.now() - started > 4 * 60 * 1000) return 'timeout';
      return new Promise(function (res) { setTimeout(res, 5000); }).then(function () { return pollDeploy(sha, started); });
    });
  }

  $('publishBtn').addEventListener('click', function () {
    if (busy || !changes() || settingsError()) return;
    busy = true; $('publishBtn').disabled = true; $('discard').hidden = true; setStatus('busy', 'ინახება…');
    var b = S.repo.branch, finalData = clone(draft), newSha;
    finalData.products.forEach(function (p) { if (!p.salePrice) { p.salePrice = null; p.saleEnds = ''; } });
    readData().then(function (remote) {
      if (remote.sha !== publishedSha) throw Object.assign(new Error('changed'), { conflict: true });
      return gh('GET', repoPath('/git/ref/heads/' + encodeURIComponent(b)));
    }).then(function (ref) {
      var parent = ref.object.sha;
      return gh('GET', repoPath('/git/commits/' + parent)).then(function (commit) {
        var files = [{ path: DATA_PATH, b64: b64FromBytes(enc.encode(JSON.stringify(finalData, null, 2) + '\n')) }];
        var used = finalData.products.map(function (p) { return p.image; });
        Object.keys(pending).forEach(function (path) { if (used.indexOf(path) >= 0) files.push({ path: IMAGE_DIR + '/' + path.replace(/^images\//, ''), b64: pending[path].b64 }); });
        return Promise.all(files.map(function (f) {
          return gh('POST', repoPath('/git/blobs'), { content: f.b64, encoding: 'base64' }).then(function (blob) { return { path: f.path, mode: '100644', type: 'blob', sha: blob.sha }; });
        })).then(function (tree) { return gh('POST', repoPath('/git/trees'), { base_tree: commit.tree.sha, tree: tree }); })
          .then(function (tree) { return gh('POST', repoPath('/git/commits'), { message: 'Update mypoker products from admin panel', tree: tree.sha, parents: [parent] }); })
          .then(function (c) { newSha = c.sha; return gh('PATCH', repoPath('/git/refs/heads/' + encodeURIComponent(b)), { sha: c.sha, force: false }); });
      });
    }).then(function () {
      return readData().then(function (r) { published = r.data; publishedSha = r.sha; draft = clone(published); }, function () { published = clone(finalData); draft = clone(finalData); });
    }).then(function () {
      refresh(); setStatus('busy', 'შენახულია. საიტი ახლდება…');
      return pollDeploy(newSha, Date.now()).then(function (res) {
        busy = false;
        if (res === 'success') setStatus('ok', 'გამოქვეყნდა. საიტზე უკვე ჩანს ახალი ვერსია.');
        else if (res === 'failure') setStatus('err', 'შენახულია, მაგრამ საიტის განახლება ვერ მოხერხდა. შეამოწმეთ Vercel.');
        else setStatus('ok', 'შენახულია. საიტი განახლდება 1–2 წუთში.');
        pending = {}; $('publishBtn').disabled = !changes();
      }, function () { busy = false; pending = {}; setStatus('ok', 'შენახულია. საიტი განახლდება დაახლოებით 1 წუთში.'); });
    }).catch(function (e) {
      busy = false;
      if (e.conflict) setStatus('err', 'პროდუქცია სხვა მოწყობილობიდან შეიცვალა. გადატვირთეთ გვერდი და გაიმეორეთ ცვლილება.');
      else setStatus('err', explain(e));
      $('publishBtn').disabled = !changes(); $('discard').hidden = !changes();
    });
  });

  window.addEventListener('beforeunload', function (e) { if (draft && changes()) { e.preventDefault(); e.returnValue = ''; } });
  boot();
})();
