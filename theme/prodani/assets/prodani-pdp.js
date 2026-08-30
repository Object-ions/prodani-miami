/* Prodani PDP — mobile sticky add-to-cart.
   It does NOT re-implement add-to-cart. It mirrors the real Dawn buy button's
   price + disabled state and, on tap, clicks the real button so all of Shopify's
   cart/variant/selling-plan logic runs untouched. Show/hide is driven by whether
   the real buy button has been scrolled past. */
(function () {
  var bar = document.querySelector('[data-pd-sticky]');
  if (!bar) return;

  var scope = document.querySelector('product-info') || document;
  var realBtn = scope.querySelector('.product-form__submit');
  var anchor = scope.querySelector('.product-form__buttons') || realBtn;
  if (!realBtn || !anchor) { bar.remove(); return; }

  var sBtn = bar.querySelector('[data-pd-sticky-add]');
  var sPrice = bar.querySelector('[data-pd-sticky-price]');
  var priceEl = scope.querySelector('.price');

  function syncPrice() {
    if (!priceEl || !sPrice) return;
    var pick = priceEl.querySelector('.price-item--sale, .price-item--last, .price-item--regular');
    var text = (pick ? pick.textContent : priceEl.textContent) || '';
    text = text.trim();
    if (text) sPrice.textContent = text;
  }

  function syncDisabled() {
    var disabled = realBtn.hasAttribute('disabled');
    sBtn.disabled = disabled;
    var label = (realBtn.querySelector('span') || realBtn).textContent.trim();
    sBtn.textContent = label || (disabled ? 'Sold out' : 'Add to cart');
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

  var mo = new MutationObserver(function () { syncPrice(); syncDisabled(); });
  mo.observe(scope, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['disabled', 'class']
  });
})();
