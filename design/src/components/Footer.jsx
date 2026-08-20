import React from 'react'
import { Reveal, Icon, BleedWord } from '../lib.jsx'

const COLS = [
  ['Shop', ['Personal cakes', 'Family cakes', 'Muffins', 'Vegan range', 'Gift cards']],
  ['Company', ['Meet your baker', 'Our story', 'Nutrition', 'Wholesale', 'Contact']],
  ['Help', ['Delivery', 'Storage & shelf life', 'Allergens', 'Returns', 'FAQ']],
]

export default function Footer() {
  return (
    <>
      <BleedWord text="Delicious" />

      <section className="band">
        <div className="wrap">
          <Reveal>
            <h2 className="d-script">Where sweet meets balance</h2>
            <p className="lede">
              Baked to order in Miami and delivered cold. Order by Thursday for weekend delivery.
            </p>
            <a className="btn" href="#shop">Start your order <Icon.arrow /></a>
          </Reveal>
        </div>
      </section>

      <footer className="foot" id="contact">
        <div className="wrap">
          <div className="foot__top">
            <div>
              <h4>ProDani Miami</h4>
              <p className="lede" style={{ fontSize: 14.5, maxWidth: '30ch', margin: 0 }}>
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

          <div className="foot__word" aria-hidden="true">prodani</div>

          <div className="foot__bar">
            <span>© {new Date().getFullYear()} ProDani Miami</span>
            <span>Design concept · not a live store</span>
          </div>
        </div>
      </footer>
    </>
  )
}
