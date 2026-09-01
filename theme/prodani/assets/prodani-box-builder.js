/* Build Your Box — interactive logic. Vanilla JS, no framework.

   Flow: Choose Box -> Choose Flavors -> One-Time or Subscribe -> Checkout.

   Curated boxes are PRESETS over the same state, not a second cart path: choosing one
   sets the size and fills the flavor quantities, then hands you to step 2 with every
   quantity still editable. One add-to-cart path means one place for bugs to live.

   Subscriptions use Shopify's native selling plans. When "Subscribe & save" is chosen
   and a real plan id is selected, every line item carries `selling_plan`, so Shopify's
   own subscription logic runs at checkout. The preview shell (no plans attached yet,
   ticket T12) is disabled in Liquid and can never reach this path. */
(function () {
  var root = document.querySelector('[data-pd-box]');
  if (!root) return;

  var sizeBtns = Array.prototype.slice.call(root.querySelectorAll('.pd-box__size'));
  var flavorEls = Array.prototype.slice.call(root.querySelectorAll('.pd-box__flavor'));
  var modeBtns = Array.prototype.slice.call(root.querySelectorAll('[data-pd-mode]'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('[data-pd-panel]'));
  var curatedCards = Array.prototype.slice.call(root.querySelectorAll('[data-pd-curated]'));
  var elSelected = root.querySelector('[data-pd-selected]');
  var elTotal = root.querySelector('[data-pd-total]');
  var elBar = root.querySelector('[data-pd-bar]');
  var elUpsell = root.querySelector('[data-pd-upsell]');
  var elCtaTotal = root.querySelector('[data-pd-cta-total]');
  var elCtaPer = root.querySelector('[data-pd-cta-per]');
  var elAdd = root.querySelector('[data-pd-add]');
  var elNote = root.querySelector('[data-pd-note]');

  var subOnetime = root.querySelector('[data-pd-box-onetime]');
  var subSubscribe = root.querySelector('[data-pd-box-subscribe]');
  var subFreq = root.querySelector('[data-pd-box-freq]');
  var subPlan = root.querySelector('[data-pd-box-plan]');

  var state = { size: 0, price: 0, sel: {}, curated: null };

  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, ''); }
  function totalQty() { return Object.keys(state.sel).reduce(function (s, k) { return s + state.sel[k]; }, 0); }

  /* ---- step 1a: sizes ---- */

  function selectSize(btn, keepCurated) {
    sizeBtns.forEach(function (b) { b.setAttribute('aria-checked', b === btn ? 'true' : 'false'); });
    state.size = parseInt(btn.getAttribute('data-size'), 10) || 0;
    state.price = parseFloat(btn.getAttribute('data-price')) || 0;
    if (!keepCurated) clearCurated();
    refresh();
  }

  sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { selectSize(btn); });
  });

  /* ---- step 1b: curated presets ---- */

  function clearCurated() {
    state.curated = null;
    curatedCards.forEach(function (c) { c.classList.remove('is-active'); });
  }

  // "Chocolate Fudge:4, Vanilla Bean:4" -> fills state.sel by flavor NAME.
  // Blank mix = even spread across every in-stock flavor, remainder handed out one
  // at a time from the top so the box always totals exactly the chosen size.
  function applyCurated(card) {
    var size = parseInt(card.getAttribute('data-size'), 10) || 0;
    var price = parseFloat(card.getAttribute('data-price')) || 0;
    var mix = (card.getAttribute('data-mix') || '').trim();

    Object.keys(state.sel).forEach(function (k) { state.sel[k] = 0; });

    var available = flavorEls.filter(function (el) { return el.getAttribute('data-soldout') !== 'true'; });

    if (mix) {
      mix.split(',').forEach(function (part) {
        var bits = part.split(':');
        var name = (bits[0] || '').trim().toLowerCase();
        var qty = parseInt(bits[1], 10) || 0;
        if (!name || qty <= 0) return;
        var match = available.filter(function (el) {
          return (el.getAttribute('data-name') || '').trim().toLowerCase() === name;
        })[0];
        if (match) state.sel[match.getAttribute('data-flavor')] = qty;
      });
    } else if (available.length) {
      var base = Math.floor(size / available.length);
      var extra = size % available.length;
      available.forEach(function (el, i) {
        state.sel[el.getAttribute('data-flavor')] = base + (i < extra ? 1 : 0);
      });
    }

    state.size = size;
    state.price = price;
    state.curated = card;

    // Reflect the curated size on the size buttons so step 1 and step 2 agree.
    sizeBtns.forEach(function (b) {
      b.setAttribute('aria-checked', (parseInt(b.getAttribute('data-size'), 10) === size) ? 'true' : 'false');
    });
    curatedCards.forEach(function (c) { c.classList.toggle('is-active', c === card); });

    refresh();

    // A curated box that doesn't total its own size is a content error (a mix that
    // names a sold-out or renamed flavor). Say so rather than silently under-filling.
    var total = totalQty();
    if (total !== size) {
      elNote.textContent = 'This box is ' + total + ' of ' + size + ' cakes — top it up below.';
    } else {
      elNote.textContent = '';
    }

    var flavors = root.querySelector('.pd-box__flavors');
    if (flavors && flavors.scrollIntoView) flavors.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  curatedCards.forEach(function (card) {
    card.addEventListener('click', function () { applyCurated(card); });
  });

  /* ---- step 1: mode tabs ---- */

  modeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-pd-mode');
      modeBtns.forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-pd-panel') !== mode; });
    });
  });

  /* ---- step 2: flavors ---- */

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
    // Hand-editing a curated box makes it yours — drop the preset highlight, keep the
    // quantities. The size and price stay put so the deal doesn't silently change.
    if (state.curated) clearCurated();
    refresh();
  }

  /* ---- step 3: purchase options ---- */

  function subscribing() {
    return !!(subSubscribe && subSubscribe.checked && !subSubscribe.disabled);
  }

  function planId() {
    if (!subscribing() || !subPlan) return null;
    var v = subPlan.value;
    return /^\d+$/.test(v) ? v : null;
  }

  function syncSub() {
    if (subFreq) subFreq.hidden = !subscribing();
    refresh();
  }

  if (subOnetime) subOnetime.addEventListener('change', syncSub);
  if (subSubscribe) subSubscribe.addEventListener('change', syncSub);
  if (subPlan) subPlan.addEventListener('change', syncSub);

  /* ---- upsell ---- */

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

  /* ---- render ---- */

  function refresh() {
    var total = totalQty();
    flavorEls.forEach(function (el) { el._sync(); });
    if (elSelected) elSelected.textContent = total;
    if (elTotal) elTotal.textContent = state.size || 0;
    if (elBar) elBar.style.width = (state.size ? Math.min(100, (total / state.size) * 100) : 0) + '%';

    if (elCtaTotal) elCtaTotal.textContent = state.size ? money(state.price) : '';
    if (elCtaPer) {
      var per = state.size ? money(state.price / state.size) + '/cake' : '';
      // The subscription discount lives on the selling plan, so the real total is
      // computed by Shopify at checkout. Don't state a discounted number we'd be
      // guessing at — say where the saving comes from instead.
      elCtaPer.textContent = subscribing() && per ? per + ' · subscription savings applied at checkout' : per;
    }

    var ready = state.size > 0 && total === state.size;
    elAdd.disabled = !ready;
    if (state.size === 0) { elAdd.textContent = 'Choose a box to start'; }
    else if (total < state.size) { elAdd.textContent = 'Add ' + (state.size - total) + ' more'; }
    else if (total > state.size) { elAdd.textContent = 'Remove ' + (total - state.size); }
    else { elAdd.textContent = subscribing() ? 'Subscribe — add box to cart' : 'Add box to cart'; }

    upsell();
  }

  /* ---- step 4: cart ---- */

  elAdd.addEventListener('click', addToCart);

  function addToCart() {
    if (elAdd.disabled) return;
    var items = [], missing = false, boxId = 'box-' + Date.now();
    var plan = planId();

    flavorEls.forEach(function (el) {
      var q = state.sel[el.getAttribute('data-flavor')];
      if (!q) return;
      var vid = el.getAttribute('data-variant');
      if (!vid || vid === '') { missing = true; return; }
      var item = {
        id: parseInt(vid, 10),
        quantity: q,
        properties: { _box_id: boxId, 'Box': state.size + '-cake box' }
      };
      if (plan) item.selling_plan = parseInt(plan, 10);
      items.push(item);
    });

    if (missing || !items.length) {
      elNote.textContent = 'Preview mode: connect each flavor to a product (ticket T3) and set box pricing to enable checkout. Your ' + state.size + '-cake selection is valid.';
      return;
    }

    var label = elAdd.textContent;
    elAdd.disabled = true; elAdd.textContent = 'Adding…';
    fetch((window.routes && window.routes.cart_add_url ? window.routes.cart_add_url : '/cart/add') + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: items })
    }).then(function (r) { return r.json(); }).then(function () {
      window.location.href = (window.routes && window.routes.cart_url) ? window.routes.cart_url : '/cart';
    }).catch(function () {
      elAdd.disabled = false; elAdd.textContent = label;
      elNote.textContent = 'Something went wrong adding to cart. Please try again.';
    });
  }

  // Initialise from the size marked selected in Liquid (if any).
  var preselected = sizeBtns.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0];
  if (preselected) selectSize(preselected); else refresh();
})();
