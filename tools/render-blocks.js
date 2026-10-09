// Renders the custom content blocks added in /admin. One source for both places that need it:
// tools/apply-content.mjs (at deploy) and the admin preview inside the page.
// blocks: [{ id, pos: 'a'|'b', bg: 'white'|'light'|'dark', image, ka: {eyebrow, title, text}, en: {…} }]
// pos 'a' = after Services, 'b' = before Contact. resolve(path) turns an image path into a URL.
(function (root) {
  var BG = { white: ['#FFFFFF', 'blk-light'], light: ['var(--c-ice)', 'blk-light'], dark: ['var(--c-navy)', 'blk-dark'] };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function renderBlocks(blocks, lang, slot, resolve) {
    if (!Array.isArray(blocks)) return '';
    return blocks.filter(function (b) {
      return b && typeof b === 'object' && /^[a-z0-9-]{1,40}$/.test(b.id || '') && (b.pos === 'b' ? 'b' : 'a') === slot;
    }).map(function (b) {
      var t = (b[lang] && typeof b[lang] === 'object') ? b[lang] : {};
      var bg = BG[b.bg] || BG.white;
      var img = typeof b.image === 'string' && b.image ? resolve(b.image) : '';
      var paras = String(t.text || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean)
        .map(function (x) { return '<p class="blk-text">' + esc(x).replace(/\n/g, '<br>') + '</p>'; }).join('');
      var head = (t.eyebrow ? '<span class="blk-eyebrow">' + esc(t.eyebrow) + '</span>' : '') +
                 (t.title ? '<h2 class="blk-title">' + esc(t.title) + '</h2>' : '');
      if (!head && !paras && !img) return '';   // nothing to show in this language
      return '<section class="layer eib-block ' + bg[1] + '" id="block-' + b.id + '" data-block="' + b.id + '" style="background: ' + bg[0] + '">\n' +
        '<div class="wrap"><div class="g blk-grid">\n' +
        '<div class="c-1-5 blk-head">' + head + '</div>\n' +
        '<div class="c-7-6 blk-body">' + paras + (img ? '<img class="blk-img" src="' + esc(img) + '" alt="' + esc(t.title || '') + '" loading="lazy">' : '') + '</div>\n' +
        '</div></div>\n</section>';
    }).filter(Boolean).join('\n');
  }
  root.eibRenderBlocks = renderBlocks;
})(typeof window !== 'undefined' ? window : globalThis);
