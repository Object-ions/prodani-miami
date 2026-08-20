import React from 'react'
import { Reveal, CountUp, Squiggle, SpinBadge } from '../lib.jsx'
import IMAGES from '../data/images.json'

const PILLARS = [
  ['Batch',   'Small batches, never mass-produced. Every cake is baked to order in Miami.'],
  ['Sugar',   'None added — sweetness comes from fruit and the ingredients themselves.'],
  ['Flour',   'Gluten-free by design, not by substitution. Coconut flour, not filler.'],
  ['Protein', 'Whey concentrate and isolate. Real macros, printed honestly.'],
]

const STATS = [
  { n: 20,  suffix: 'g', label: 'Protein in a personal cake — a protein bar, in cake form.' },
  { n: 0,   suffix: 'g', label: 'Added sugar across the whole range. Nothing refined, nothing hidden.' },
  { n: 27,  suffix: '',  label: 'Recipes in rotation, including a full vegan line.' },
  { n: 4.9, suffix: '★', dec: 1, label: 'Average rating from more than seventy verified reviews.' },
]

/* Chocolate mid-band. The hero owns "bite into balance" now, so this one
   carries the other half of the brand line instead of repeating it. */
export function Shout() {
  return (
    <section className="shout" id="nutrition">
      <div className="wrap shout__in on-dark">
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
        <SpinBadge className="shout__badge" text="dessert you can feel good about ✦ " speed={26} />
      </div>
    </section>
  )
}

export function Stats() {
  return (
    <section className="sec stats">
      <div className="wrap stats__grid">
        {STATS.map((s, i) => (
          <Reveal key={s.label} className="stat" delay={i * 0.08}>
            <b><CountUp to={s.n} decimals={s.dec || 0} />{s.suffix}</b>
            <span>{s.label}</span>
          </Reveal>
        ))}
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
                ProDani was born from a simple question — why should enjoying dessert mean
                giving up on your health goals?
              </p>
              <p className="lede" style={{ marginTop: 18 }}>
                We make high-protein, gluten-free, low-sugar desserts that actually taste like
                dessert. Every cake and muffin is made in small batches from carefully selected
                ingredients, balancing flavour, texture and nutrition without shortcuts.
              </p>
              <p className="lede" style={{ marginTop: 18 }}>
                It's for people who train hard, live intentionally, or simply want something
                sweet that doesn't come with regret. Indulgence should feel satisfying, not heavy.
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
            <img src={IMAGES.__story} alt="Dani of ProDani Miami with a freshly baked protein cake" loading="lazy" />
            <div className="story__stamp" style={{ transform: 'rotate(-9deg)' }}>
              Baked<br />in<br />Miami
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
