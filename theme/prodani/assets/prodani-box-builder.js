/* Build Your Balance Box — interactive logic (brief §05). Vanilla JS, no framework.
   Coordinates size, flavor quantities, live counter, validation, sold-out, and upsell.
   Add-to-cart posts real line items when flavors are linked to products; until then it
   explains what's needed (flavors-as-products T3, box-pricing Function). */
(function () {
  var root = document.querySelector('[data-pd-box]');
  if (!root) return;

  var sizeBtns = Array.prototype.slice.call(root.querySelectorAll('.pd-box__size'));
  var flavorEls = Array.prototype.slice.call(root.querySelectorAll('.pd-box__flavor'));
  var elSelected = root.querySelector('[data-pd-selected]');
  var elTotal = root.querySelector('[data-pd-total]');
  var elBar = root.querySelector('[data-pd-bar]');
  var elUpsell = root.querySelector('[data-pd-upsell]');
  var elCtaTotal = root.querySelector('[data-pd-cta-total]');
  var elCtaPer = root.querySelector('[data-pd-cta-per]');
  var elAdd = root.querySelector('[data-pd-add]');
  var elNote = root.querySelector('[data-pd-note]');

  var state = { size: 0, price: 0, sel: {} };

  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, ''); }
  function totalQty() { return Object.keys(state.sel).reduce(function (s, k) { return s + state.sel[k]; }, 0); }

  function selectSize(btn) {
    sizeBtns.forEach(function (b) { b.setAttribute('aria-checked', b === btn ? 'true' : 'false'); });
    state.size = parseInt(btn.getAttribute('data-size'), 10) || 0;
    state.price = parseFloat(btn.getAttribute('data-price')) || 0;
    refresh();
  }

  sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { selectSize(btn); });
  });

  flavorEls.forEach(function (el) {
    var id = el.getAttribute('data-flavor');
    var soldout = el.getAttribute('data-soldout') === 'true';
    var qtyEl = el.querySelector('[data-qty]');
    var minus = el.querySelector('[data-minus]');
    var plus = el.querySelector('[data-plus]');
    state.sel[id] = 0;

    minus.addEventListener('click', function () { bump(id, -1); });
    plus.addEventListener('click', function () { bump(id, 1); });

    el._sync = function () {
      var q = state.sel[id];
      qtyEl.textContent = q;
      el.classList.toggle('is-active', q > 0);
      minus.disabled = q === 0;
      plus.disabled = soldout || totalQty() >= state.size || state.size === 0;
    };
  });

  function bump(id, delta) {
    if (delta > 0 && (totalQty() >= state.size || state.size === 0)) return;
    state.sel[id] = Math.max(0, (state.sel[id] || 0) + delta);
    refresh();
  }

  function upsell() {
    if (!elUpsell) return;
    // Data-driven: nudge toward the next size up in the rendered tier ladder
    // (6 -> 12 "Most Popular" -> 18 "Best Value"), whatever the tiers are set to.
    var target = null, msg = '';
    sizeBtns.forEach(function (b) {
      var s = parseInt(b.getAttribute('data-size'), 10) || 0;
      if (s > state.size && (!target || s < parseInt(target.getAttribute('data-size'), 10))) target = b;
    });
    if (target && state.size > 0) {
      var nextSize = parseInt(target.getAttribute('data-size'), 10);
      var isLast = sizeBtns.every(function (b) { return (parseInt(b.getAttribute('data-size'), 10) || 0) <= nextSize; });
      msg = isLast
        ? 'Upgrade to ' + nextSize + ' cakes for the best value.'
        : 'Add ' + (nextSize - state.size) + ' more and save — switch to a ' + nextSize + '-cake box.';
    } else {
      target = null;
    }
    if (target) {
      elUpsell.hidden = false;
      elUpsell.innerHTML = '<span></span><button type="button">Switch</button>';
      elUpsell.querySelector('span').textContent = msg;
      elUpsell.querySelector('button').onclick = function () { selectSize(target); };
    } else {
      elUpsell.hidden = true;
    }
  }

  function refresh() {
    var total = totalQty();
    flavorEls.forEach(function (el) { el._sync(); });
    if (elSelected) elSelected.textContent = total;
    if (elTotal) elTotal.textContent = state.size || 0;
    if (elBar) elBar.style.width = (state.size ? Math.min(100, (total / state.size) * 100) : 0) + '%';

    if (elCtaTotal) elCtaTotal.textContent = state.size ? money(state.price) : '';
    if (elCtaPer) elCtaPer.textContent = state.size ? money(state.price / state.size) + '/cake' : '';

    var ready = state.size > 0 && total === state.size;
    elAdd.disabled = !ready;
    if (state.size === 0) { elAdd.textContent = 'Choose a size to start'; }
    else if (total < state.size) { elAdd.textContent = 'Add ' + (state.size - total) + ' more'; }
    else if (total > state.size) { elAdd.textContent = 'Remove ' + (total - state.size); }
    else { elAdd.textContent = 'Add box to cart'; }

    upsell();
  }

  elAdd.addEventListener('click', addToCart);

  function addToCart() {
    if (elAdd.disabled) return;
    var items = [], missing = false, boxId = 'box-' + Date.now();
    flavorEls.forEach(function (el) {
      var q = state.sel[el.getAttribute('data-flavor')];
      if (!q) return;
      var vid = el.getAttribute('data-variant');
      if (!vid || vid === '') { missing = true; return; }
      items.push({
        id: parseInt(vid, 10),
        quantity: q,
        properties: { _box_id: boxId, 'Box': state.size + '-cake box' }
      });
    });

    if (missing || !items.length) {
      elNote.textContent = 'Preview mode: connect each flavor to a product (ticket T3) and set box pricing to enable checkout. Your ' + state.size + '-cake selection is valid.';
      return;
    }

    elAdd.disabled = true; elAdd.textContent = 'Adding…';
    fetch((window.routes && window.routes.cart_add_url ? window.routes.cart_add_url : '/cart/add') + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: items })
    }).then(function (r) { return r.json(); }).then(function () {
      window.location.href = (window.routes && window.routes.cart_url) ? window.routes.cart_url : '/cart';
    }).catch(function () {
      elAdd.disabled = false; elAdd.textContent = 'Add box to cart';
      elNote.textContent = 'Something went wrong adding to cart. Please try again.';
    });
  }

  // Initialise from the size marked selected in Liquid (if any).
  var preselected = sizeBtns.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0];
  if (preselected) selectSize(preselected); else refresh();
})();
