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
      '.pd-story__media', '.pd-story__text',
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

    /* ---- Muffin stamp: pops in like a sticker being slapped on ---- */
    var stamp = document.querySelector('.pd-story__stamp');
    if (stamp) {
      gsap.set(stamp, { scale: 0.5, autoAlpha: 0, rotation: -30 });
      ScrollTrigger.create({
        trigger: stamp, start: 'top 92%', once: true,
        onEnter: function () {
          gsap.to(stamp, { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.6, ease: 'back.out(2)', overwrite: true });
        }
      });
    }

    /* ---- PDP: media + info entrance, macros pop ---- */
    var productInfo = document.querySelector('.product__media-wrapper');
    if (productInfo) {
      var infoCol = document.querySelector('.product__info-wrapper');
      var ptl = gsap.timeline({ defaults: { ease: EASE } });
      ptl.from(productInfo, { y: RISE, autoAlpha: 0, duration: 0.8 }, 0.1);
      if (infoCol) ptl.from(infoCol, { y: RISE, autoAlpha: 0, duration: 0.8 }, 0.25);
      var macros = gsap.utils.toArray('.pd-macro');
      if (macros.length) {
        gsap.set(macros, { y: 16, autoAlpha: 0 });
        ScrollTrigger.batch(macros, {
          start: 'top 92%', once: true,
          onEnter: function (batch) {
            gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.5, ease: EASE, stagger: 0.07, overwrite: true });
          }
        });
      }
    }

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

    /* ---- Build a Box: the main event gets the richest moment ---- */
    var box = document.querySelector('[data-pd-box]');
    if (box) {
      // Entrance: size chips pop in like choices being dealt
      var sizes = gsap.utils.toArray(box.querySelectorAll('.pd-box__size'));
      if (sizes.length) {
        gsap.set(sizes, { scale: 0.85, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: sizes[0], start: 'top 88%', once: true,
          onEnter: function () {
            gsap.to(sizes, {
              scale: 1, autoAlpha: 1, duration: 0.55,
              ease: 'back.out(1.6)', stagger: 0.09, overwrite: true
            });
          }
        });
      }

      // Flavor tiles cascade in tighter than the generic grids
      var flavors = gsap.utils.toArray(box.querySelectorAll('.pd-box__flavor'));
      if (flavors.length) {
        gsap.set(flavors, { y: 24, autoAlpha: 0 });
        ScrollTrigger.batch(flavors, {
          start: 'top 90%', once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              y: 0, autoAlpha: 1, duration: 0.6, ease: EASE,
              stagger: 0.06, overwrite: true
            });
          }
        });
      }

      // Every add/remove bumps the "n of m selected" counter
      var elSel = box.querySelector('[data-pd-selected]');
      var countWrap = box.querySelector('.pd-box__count');
      if (elSel && countWrap) {
        // refresh() rewrites the text on every interaction — only bump when
        // the number actually changed
        var lastCount = elSel.textContent;
        new MutationObserver(function () {
          if (elSel.textContent === lastCount) return;
          lastCount = elSel.textContent;
          gsap.fromTo(countWrap,
            { scale: 1.16, transformOrigin: 'left center' },
            { scale: 1, duration: 0.45, ease: 'back.out(2.2)', overwrite: true });
        }).observe(elSel, { childList: true, characterData: true, subtree: true });
      }

      // One celebratory pulse when the box completes and the CTA unlocks
      var elAdd = box.querySelector('.pd-box__add');
      if (elAdd) {
        var wasReady = !elAdd.disabled;
        new MutationObserver(function () {
          var ready = !elAdd.disabled;
          if (ready && !wasReady) {
            gsap.fromTo(elAdd, { scale: 1 }, {
              scale: 1.045, duration: 0.16, yoyo: true, repeat: 1,
              ease: 'power2.inOut', overwrite: true
            });
          }
          wasReady = ready;
        }).observe(elAdd, { attributes: true, attributeFilter: ['disabled'] });
      }
    }

    /* Trigger positions drift as images and fonts land */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
