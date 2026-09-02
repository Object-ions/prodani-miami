/* ProDani demo skin switcher — client review only, never ships live.
   The CSS variables in prodani-skins.css carry ~95% of each skin; this
   script covers the rest: section settings render a few literal hexes
   inline (backgrounds picked in the theme editor), so on skin change we
   rewrite those literals in [style] attributes and same-document <style>
   tags, always starting from the cached blend-original text so switches
   are lossless in both directions. */
(function () {
  'use strict';

  var SKINS = ['blend', 'calm', 'bold', 'current'];
  var LABELS = { blend: 'Blend — caramel (recommended)', calm: 'Calm — champagne (#3 as sent)', bold: 'Bold — noir (#4 as sent)', current: 'Current site (#1)' };

  /* blend literal → per-skin literal (case-insensitive on input) */
  var LITS = {
    calm: { FAF4E9: 'F8F5EF', F3ECDD: 'EFEAE0', 362619: '211913', 241811: '171009', '54402D': '3A2E24', E0A458: 'C0A472', C68A42: 'A98D5D', '8A5A24': '7E6537', '6D6B48': '67654A', D6CCB9: 'CFC8B8' },
    bold: { FAF4E9: '0E0E10', F3ECDD: '17161B', 362619: '232229', 241811: '08080A', '54402D': '22212A', E0A458: 'CDEB4B', C68A42: 'A9C43A', '8A5A24': 'B6D93F', '6D6B48': '9FBF8A', D6CCB9: '9FBF8A' },
    current: { FAF4E9: 'FBF5E8', F3ECDD: 'FFFBE5', 362619: '48312A', 241811: '3A2721', '54402D': '5C4239', E0A458: 'FDC3D4', C68A42: 'F79CBB', '8A5A24': 'C4587E', '6D6B48': '7FA86B', D6CCB9: 'EFE5D2' }
  };
  var HEX_RE = /#(FAF4E9|F3ECDD|362619|241811|54402D|E0A458|C68A42|8A5A24|6D6B48|D6CCB9)/gi;

  var styleAttrCache = new WeakMap(); /* element → original style attribute */
  var styleTagCache = new WeakMap();  /* <style> → original text */

  function rewrite(text, map) {
    return text.replace(HEX_RE, function (_, hex) {
      var to = map && map[hex.toUpperCase()];
      return to ? '#' + to : '#' + hex;
    });
  }

  function applyLiterals(skin) {
    var map = LITS[skin]; /* undefined for blend → restores originals */
    document.querySelectorAll('[style]').forEach(function (el) {
      if (el.closest('.pd-skins')) return;
      var orig = styleAttrCache.get(el);
      if (orig === undefined) {
        if (!el.getAttribute('style').match(HEX_RE)) return;
        orig = el.getAttribute('style');
        styleAttrCache.set(el, orig);
      }
      el.setAttribute('style', map ? rewrite(orig, map) : orig);
    });
    document.querySelectorAll('style').forEach(function (tag) {
      var orig = styleTagCache.get(tag);
      if (orig === undefined) {
        if (!tag.textContent.match(HEX_RE)) return;
        orig = tag.textContent;
        styleTagCache.set(tag, orig);
      }
      tag.textContent = map ? rewrite(orig, map) : orig;
    });
  }

  function apply(skin) {
    if (SKINS.indexOf(skin) === -1) skin = 'blend';
    if (skin === 'blend') delete document.documentElement.dataset.pdSkin;
    else document.documentElement.dataset.pdSkin = skin;
    applyLiterals(skin);
    try { localStorage.setItem('pd-skin', skin); } catch (e) { /* private mode */ }
    document.querySelectorAll('.pd-skins__dot').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.skin === skin));
    });
  }

  function buildWidget() {
    var wrap = document.createElement('div');
    wrap.className = 'pd-skins';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Palette preview switcher (demo)');
    var label = document.createElement('span');
    label.className = 'pd-skins__label';
    label.textContent = 'skin';
    wrap.appendChild(label);
    SKINS.forEach(function (skin) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pd-skins__dot pd-skins__dot--' + skin;
      b.dataset.skin = skin;
      b.title = LABELS[skin];
      b.setAttribute('aria-label', LABELS[skin]);
      b.addEventListener('click', function () { apply(skin); });
      wrap.appendChild(b);
    });
    document.body.appendChild(wrap);
  }

  function init() {
    buildWidget();
    var saved = 'blend';
    try { saved = localStorage.getItem('pd-skin') || 'blend'; } catch (e) { /* ignore */ }
    apply(saved);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
