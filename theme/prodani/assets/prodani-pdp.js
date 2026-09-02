/* Prodani PDP — mobile sticky add-to-cart.
   It does NOT re-implement add-to-cart. It mirrors the real Dawn buy button's
   price + disabled state and, on tap, clicks the real button so all of Shopify's
   cart/variant/selling-plan logic runs untouched. Show/hide is driven by whether
   the real buy button has been scrolled past. */
(function () {
  var bar = document.querySelector('[data-pd-sticky]');
  if (!bar) return;

  /* The bar renders inside the product section, whose wrapper carries Dawn's
     scroll-trigger animation classes. Those leave an identity transform on
     the wrapper, and ANY transformed ancestor becomes the containing block
     for position:fixed — so the "fixed" bar scrolled with the page. Reparent
     to <body> so no section-level transform can ever capture it. */
  document.body.appendChild(bar);

  var scope = document.querySelector('product-info') || document;
  var realBtn = scope.querySelector('.product-form__submit');
  var anchor = scope.querySelector('.product-form__buttons') || realBtn;
  if (!realBtn || !anchor) { bar.remove(); return; }

  var sBtn = bar.querySelector('[data-pd-sticky-add]');
  var sPrice = bar.querySelector('[data-pd-sticky-price]');
  var priceEl = scope.querySelector('.price');

  /* The bar lives INSIDE the observed <product-info> subtree (rendered via a
     custom_liquid block in product.json), and setting textContent always
     emits a mutation record even when the text is identical. Unconditional
     writes here therefore re-trigger the observer forever and wedge the main
     thread — the "PDP defeats capture" bug. Every write below is guarded so
     the sync converges, and the observer also ignores records that originate
     from the bar itself. */
  function syncPrice() {
    if (!priceEl || !sPrice) return;
    var pick = priceEl.querySelector('.price-item--sale, .price-item--last, .price-item--regular');
    var text = (pick ? pick.textContent : priceEl.textContent) || '';
    text = text.trim();
    if (text && sPrice.textContent !== text) sPrice.textContent = text;
  }

  function syncDisabled() {
    var disabled = realBtn.hasAttribute('disabled');
    if (sBtn.disabled !== disabled) sBtn.disabled = disabled;
    var label = (realBtn.querySelector('span') || realBtn).textContent.trim() ||
      (disabled ? 'Sold out' : 'Add to cart');
    if (sBtn.textContent !== label) sBtn.textContent = label;
  }

  syncPrice();
  syncDisabled();

  sBtn.addEventListener('click', function () {
    if (!sBtn.disabled) realBtn.click();
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // Show only once the real buy button has scrolled up out of view.
        var scrolledPast = !e.isIntersecting && e.boundingClientRect.top < 0;
        bar.classList.toggle('is-visible', scrolledPast);
      });
    }, { threshold: 0 });
    io.observe(anchor);
  }

  var mo = new MutationObserver(function (records) {
    var external = false;
    for (var i = 0; i < records.length; i++) {
      if (!bar.contains(records[i].target)) { external = true; break; }
    }
    if (!external) return;
    syncPrice();
    syncDisabled();
  });
  mo.observe(scope, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['disabled', 'class']
  });
})();
