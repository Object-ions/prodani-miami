import React from 'react'
import { Reveal, Icon } from '../lib.jsx'

const COLS = [
  ['Shop', ['Personal cakes', 'Family cakes', 'Muffins', 'Vegan range', 'Gift cards']],
  ['Company', ['Our story', 'Meet your baker', 'Nutrition', 'Wholesale', 'Contact']],
  ['Help', ['Delivery', 'Storage & shelf life', 'Allergens', 'Returns', 'FAQ']],
]

export default function Footer() {
  return (
    <>
      {/* closing CTA */}
      <section className="band">
        <div className="band__glow" />
        <div className="wrap">
          <Reveal>
            <h2 className="d2" style={{ margin: '0 0 22px' }}>
              Where sweet meets <em style={{ fontStyle: 'italic', color: 'var(--caramel)' }}>balance</em>.
            </h2>
            <p className="lede" style={{ margin: '0 auto 34px', maxWidth: '46ch' }}>
              Baked to order in Miami and delivered cold. Order by Thursday for weekend delivery.
            </p>
            <a className="btn" href="#shop">Start your order <Icon.arrow /></a>
          </Reveal>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <div className="foot__top">
            <div>
              <h4>ProDani Miami</h4>
              <p className="lede" style={{ fontSize: 14, maxWidth: '30ch', margin: 0 }}>
                High-protein, gluten-free desserts. Small batch, Miami-made, no added sugar.
              </p>
            </div>
            {COLS.map(([h, links]) => (
              <div key={h}>
                <h4>{h}</h4>
                <ul>{links.map((l) => <li key={l}><a href="#shop">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>

          <div className="foot__word" aria-hidden="true">ProDani</div>

          <div className="foot__bar mono">
            <span>© {new Date().getFullYear()} ProDani Miami</span>
            <span>Design concept · not a live store</span>
          </div>
        </div>
      </footer>
    </>
  )
}
