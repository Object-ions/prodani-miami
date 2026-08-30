/* Email-capture popup trigger + a11y. Brief §07A:
   - fires after a delay or exit intent
   - never covers the hero immediately on mobile (waits for the delay AND a scroll
     past ~60% of the first viewport)
   - remembers dismissal/signup so it doesn't nag
   - traps focus, closes on ESC / scrim / button, restores scroll + focus */
(function () {
  var pop = document.querySelector('[data-pd-pop]');
  if (!pop) return;

  var card = pop.querySelector('.pd-pop__card');
  var delayMs = (parseInt(pop.getAttribute('data-delay'), 10) || 0) * 1000;
  var freqDays = parseInt(pop.getAttribute('data-freq'), 10) || 14;
  var designMode = pop.getAttribute('data-design-mode') === 'true';
  var openNow = pop.getAttribute('data-open-now') === 'true';
  var KEY = 'pdPopSeen';
  var lastFocus = null;
  var opened = false;
  var lockedY = 0;

  // iOS ignores overflow:hidden on <html>/<body> for scroll-locking, so the popup would
  // otherwise stay fixed while the page scrolls behind it. Pin the body instead.
  function lockScroll() {
    lockedY = window.scrollY || window.pageYOffset || 0;
    var b = document.body.style;
    b.position = 'fixed'; b.top = (-lockedY) + 'px'; b.left = '0'; b.right = '0'; b.width = '100%';
  }
  function unlockScroll() {
    var b = document.body.style;
    b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = '';
    window.scrollTo(0, lockedY);
  }

  function suppressed() {
    if (designMode) return false;
    try {
      var t = parseInt(localStorage.getItem(KEY), 10);
      if (!t) return false;
      return (Date.now() - t) < freqDays * 864e5;
    } catch (e) { return false; }
  }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }

  function open() {
    if (opened) return;
    opened = true;
    lastFocus = document.activeElement;
    pop.hidden = false;
    // force reflow so the transition runs from the hidden state
    void pop.offsetWidth;
    pop.classList.add('is-open');
    lockScroll();
    var focusTarget = pop.querySelector('#pd-pop-email') || card;
    if (focusTarget) focusTarget.focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    if (!opened) return;
    opened = false;
    pop.classList.remove('is-open');
    unlockScroll();
    document.removeEventListener('keydown', onKey);
    remember();
    var done = function () { pop.hidden = true; card.removeEventListener('transitionend', done); };
    card.addEventListener('transitionend', done);
    setTimeout(done, 500); // fallback if transitionend doesn't fire
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      var f = pop.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      f = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  pop.querySelectorAll('[data-pd-pop-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });

  // Server-driven open: form was just submitted (success or error). Success also
  // suppresses future shows so we don't nag a subscriber.
  if (openNow) {
    open();
    if (pop.querySelector('.pd-pop__success')) remember();
    return;
  }
  if (designMode) { open(); return; }
  if (suppressed()) return;

  var isMobile = window.matchMedia('(max-width: 749px)').matches;
  var timerDone = false;
  var scrolledEnough = !isMobile; // desktop doesn't need the scroll gate

  function maybeOpen() { if (timerDone && scrolledEnough && !suppressed()) open(); }

  setTimeout(function () { timerDone = true; maybeOpen(); }, delayMs);

  if (isMobile) {
    var onScroll = function () {
      if (window.scrollY > window.innerHeight * 0.6) {
        scrolledEnough = true;
        window.removeEventListener('scroll', onScroll);
        maybeOpen();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    // Desktop exit intent — cursor leaving via the top of the viewport.
    var onLeave = function (e) {
      if (e.clientY <= 0) { document.removeEventListener('mouseout', onLeave); open(); }
    };
    document.addEventListener('mouseout', onLeave);
  }
})();
