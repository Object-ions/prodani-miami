import React from 'react'
import { Reveal, Squiggle, SpinBadge, Icon } from '../lib.jsx'
import IMAGES from '../data/images.json'

// Falls back to the live CDN when images.json is empty (i.e. `npm run setup`
// has not been run), so the app works straight after `npm install`.
const STORY_IMG = IMAGES.__story
  || 'https://prodanimiami.com/cdn/shop/collections/PRODANI_09.01.23_N.A_218_of_323.jpg?width=1200'
const BAKER_IMG = IMAGES.__baker
  || 'https://prodanimiami.com/cdn/shop/files/DSC04869_1.jpg?width=900'

const PILLARS = [
  ['Batch',   'Small batches, never mass-produced. Every cake is baked to order in Miami.'],
  ['Sugar',   'None added — sweetness comes from fruit and the ingredients themselves.'],
  ['Flour',   'Gluten-free by design, not by substitution. Coconut flour, not filler.'],
  ['Protein', 'Whey concentrate and isolate. Real macros, printed honestly.'],
]

/* Chocolate mid-band. The hero owns "bite into balance" now, so this one
   carries the other half of the brand line instead of repeating it — and hands
   off to the baker's own story rather than dead-ending in empty brown. */
export function Shout() {
  return (
    <section className="shout" id="nutrition">
      <div className="wrap shout__in on-dark">
        <div className="shout__text">
          <Reveal>
            <h2 className="d-script shout__script">Where sweet<br />meets balance</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede">
              Desserts that support your lifestyle, not work against it. High-protein,
              low-sugar treats made to satisfy cravings while staying mindful of how your
              body feels — because indulgence should feel satisfying, not heavy.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <a className="btn btn--pink shout__cta" href="#meet-your-baker">
              Meet your baker <Icon.arrow />
            </a>
          </Reveal>
        </div>

        <Reveal className="shout__media" delay={0.15} y={36}>
          <div className="shout__frame">
            <img src={BAKER_IMG} alt="A ProDani strawberry short cake, served" loading="lazy" />
          </div>
          <SpinBadge className="shout__badge" text="dessert you can feel good about ✦ " speed={26} />
        </Reveal>
      </div>
    </section>
  )
}

export default function Story() {
  return (
    <section className="sec" id="meet-your-baker">
      <div className="wrap">
        <Reveal className="sec__head" style={{ marginBottom: 'clamp(30px,4vw,52px)' }}>
          <div>
            <h2 className="d-script sec__title">Meet your baker</h2>
            <Squiggle />
          </div>
          <span className="sec__eyebrow label">Miami · since 2023</span>
        </Reveal>

        <div className="story__in">
          <div className="story__text">
            <Reveal>
              <p className="lede" style={{ color: 'var(--cocoa)', fontSize: 'clamp(1.15rem,1.7vw,1.4rem)', fontWeight: 600 }}>
                I'm Daniel, the brain and brawn behind Pro Dani Miami. Let me give you the
                lowdown on how this sweet adventure began.
              </p>
              <p className="lede" style={{ marginTop: 18 }}>
                As a personal trainer, I've always had one foot in the fitness world and the
                other in the world of tempting treats. I'd see my clients struggle to satisfy
                their sweet tooth while staying on track with their health and fitness goals.
                It got me thinking: why isn't there a bakery that offers cakes and muffins
                that are not only delicious but also high in protein, gluten-free, and low
                in sugar?
              </p>
              <p className="lede" style={{ marginTop: 18 }}>
                That's when the lightbulb moment struck, and Pro Dani Miami was born. Our
                cakes and muffins are my labor of love, crafted with top-notch ingredients
                and a dash of passion. I'm a stickler for quality, so rest assured, each bite
                is a testament to our dedication to excellence.
              </p>
              <p className="lede" style={{ marginTop: 18 }}>
                Whether you're a fitness fanatic, have dietary restrictions, or just
                appreciate a good treat, we've got something special in store for you — where
                indulgence meets wellness, and sweet cravings become a wholesome delight.
              </p>
            </Reveal>

            <ul className="story__list">
              {PILLARS.map(([n, t], i) => (
                <Reveal as="li" key={n} delay={i * 0.06}>
                  <b>{n}</b><span>{t}</span>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal className="story__media" delay={0.1} y={36}>
            <img src={STORY_IMG} alt="A ProDani Miami protein cake, freshly baked" loading="lazy" />
            <div className="story__stamp" style={{ transform: 'rotate(-9deg)' }}>
              Baked<br />in<br />Miami
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
