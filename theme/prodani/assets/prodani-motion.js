/* ProDani motion layer — GSAP + ScrollTrigger (self-hosted in assets).
   Philosophy: editorial restraint. One entrance choreography on the hero,
   once-only scroll reveals everywhere else, nothing loops, nothing bounces
   except the claim badges. All motion sits behind prefers-reduced-motion;
   initial hidden states are set from JS only, so with JS disabled or GSAP
   missing the page renders complete and static.
   The marquee, bleed word and stack deck ship their own motion — untouched. */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.Shopify && window.Shopify.designMode) return; // editor: no motion

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var EASE = 'power3.out';
    var RISE = 28;

    /* ---- Hero entrance: video settles, type rises line by line ---- */
    var hero = document.querySelector('.pd-hero');
    if (hero) {
      var media = hero.querySelector('.pd-hero__video video, .pd-hero__video img');
      var kicker = hero.querySelector('.pd-hero__kicker');
      var lines = hero.querySelectorAll('.pd-giant__line');
      var foot = hero.querySelector('.pd-hero__foot');
      var tl = gsap.timeline({ defaults: { ease: EASE } });
      // CSS holds the video at scale(1.06); settle down to it from 1.12
      if (media) tl.from(media, { scale: 1.12, duration: 2.6, ease: 'power2.out' }, 0);
      if (kicker) tl.from(kicker, { y: 22, autoAlpha: 0, duration: 0.7 }, 0.15);
      if (lines.length) tl.from(lines, { y: 56, autoAlpha: 0, duration: 0.9, stagger: 0.14 }, 0.3);
      if (foot) tl.from(foot, { y: 22, autoAlpha: 0, duration: 0.7 }, 0.75);
    }

    /* ---- Once-only reveals for section furniture ---- */
    gsap.utils.toArray([
      '.pd-sec-head',
      '.pd-story__media', '.pd-story__text', '.pd-story__stamp',
      '.pd-shout__frame', '.pd-shout__text',
      '.pd-badges__heading',
      '.pd-box__bar',
      '.pd-shop__foot',
      '.pd-collection__rowhead'
    ].join(',')).forEach(function (el) {
      gsap.from(el, {
        y: RISE, autoAlpha: 0, duration: 0.8, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });

    /* ---- Card grids: batched, staggered ---- */
    [
      { sel: '.pd-card', y: RISE },
      { sel: '.pd-review', y: RISE },
      { sel: '.pd-box__curated-card', y: RISE }
    ].forEach(function (group) {
      var els = gsap.utils.toArray(group.sel);
      if (!els.length) return;
      gsap.set(els, { y: group.y, autoAlpha: 0 });
      ScrollTrigger.batch(els, {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            y: 0, autoAlpha: 1, duration: 0.7, ease: EASE,
            stagger: 0.08, overwrite: true
          });
        }
      });
    });

    /* ---- Claim badges: the one playful moment ---- */
    var badges = gsap.utils.toArray('.pd-badge-item');
    if (badges.length) {
      gsap.set(badges, { scale: 0.82, autoAlpha: 0 });
      ScrollTrigger.batch(badges, {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.4)',
            stagger: 0.07, overwrite: true
          });
        }
      });
    }

    /* Trigger positions drift as images and fonts land */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
