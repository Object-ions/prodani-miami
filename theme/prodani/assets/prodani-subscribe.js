/* Purchase-option selector: toggles One-time vs Subscribe and writes the chosen
   selling-plan id into the product form's hidden `selling_plan` input, so Shopify's
   native subscription logic runs on add-to-cart. No-op in the preview shell (no plans). */
(function () {
  document.querySelectorAll('[data-pd-sub]').forEach(function (root) {
    var onetime = root.querySelector('[data-pd-sub-onetime]');
    var subscribe = root.querySelector('[data-pd-sub-subscribe]');
    var freq = root.querySelector('[data-pd-sub-freq]');
    var select = root.querySelector('[data-pd-sub-select]');
    var input = root.querySelector('[data-pd-sub-input]');
    if (!onetime || !subscribe || !input) return;

    function apply() {
      var subscribing = subscribe.checked && !subscribe.disabled;
      if (freq) freq.hidden = !subscribing;
      // Only set a real plan id when the select carries selling-plan values (not the preview).
      var val = (subscribing && select && select.value && /^\d+$/.test(select.value)) ? select.value : '';
      input.value = val;
    }

    onetime.addEventListener('change', apply);
    subscribe.addEventListener('change', apply);
    if (select) select.addEventListener('change', apply);
    apply();
  });
})();
