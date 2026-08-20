import React from 'react'
import { Reveal, CountUp } from '../lib.jsx'
import IMAGES from '../data/images.json'

const PILLARS = [
  ['Batch',   'Small batches, never mass-produced. Every cake is baked to order in Miami.'],
  ['Sugar',   'None added — sweetness comes from fruit and the ingredients themselves.'],
  ['Flour',   'Gluten-free by design, not by substitution. Coconut flour, not filler.'],
  ['Protein', 'Whey concentrate and isolate. Real macros, printed honestly.'],
]

const STATS = [
  { n: 20, suffix: 'g', label: 'Protein in a personal cake — the same as a protein bar, in cake form.' },
  { n: 0,  suffix: 'g', label: 'Added sugar across the entire range. Nothing refined, nothing hidden.' },
  { n: 27, suffix: '',  label: 'Recipes in rotation, including a full vegan line.' },
  { n: 4.9, suffix: '★', dec: 1, label: 'Average rating from more than seventy verified reviews.' },
]

export function Stats() {
  return (
    <section className="stats" id="nutrition">
      <div className="wrap stats__grid">
        {STATS.map((s, i) => (
          <Reveal key={s.label} className="stat" delay={i * 0.08}>
            <b><CountUp to={s.n} decimals={s.dec || 0} /><i>{s.suffix}</i></b>
            <span>{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default function Story() {
  return (
    <section className="sec" id="our-story">
      <div className="wrap">
        <Reveal className="sec__head" style={{ marginBottom: 'clamp(36px,5vw,66px)' }}>
          <h2 className="d3" style={{ margin: 0 }}>Bite into balance</h2>
          <span className="sec__num mono">Miami · since 2023</span>
        </Reveal>

        <div className="story__in">
          <div className="story__text">
            <Reveal>
              <p className="lede" style={{ color: 'var(--cream)', fontSize: 'clamp(1.1rem,1.6vw,1.35rem)' }}>
                ProDani was born from a simple question — why should enjoying dessert mean
                giving up on your health goals?
              </p>
              <p className="lede" style={{ marginTop: 20 }}>
                We make high-protein, gluten-free, low-sugar desserts that actually taste like
                dessert. Every cake and muffin is made in small batches from carefully selected
                ingredients, balancing flavour, texture and nutrition without shortcuts.
              </p>
              <p className="lede" style={{ marginTop: 20 }}>
                It's for people who train hard, live intentionally, or simply want something
                sweet that doesn't come with regret. Indulgence should feel satisfying, not heavy.
              </p>
            </Reveal>

            <ul className="story__list">
              {PILLARS.map(([n, t], i) => (
                <Reveal as="li" key={n} delay={i * 0.07}>
                  <b>{n}</b><span>{t}</span>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal className="story__media" delay={0.1} y={40}>
            <img
              src={IMAGES.__story}
              alt="Dani of ProDani Miami with a freshly baked protein cake"
              loading="lazy"
            />
            <div className="story__stamp">
              Baked<br />in<br />Miami
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
