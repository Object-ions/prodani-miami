import React from 'react'
import { Reveal, Squiggle } from '../lib.jsx'

/* Verbatim from the store's Judge.me widget. */
const REVIEWS = [
  {
    q: 'I felt the love in every bite',
    body: 'Simply delicious, 100% clean, absolutely healthy. Real protein. This is what they serve in heaven when you want something good and tasty.',
    who: 'Itamar',
  },
  {
    q: "Can't stop eating this cake",
    body: 'The cake is absolutely delicious, and the chocolate is incredibly rich and indulgent — every bite is pure perfection.',
    who: 'Shalom',
  },
  {
    q: 'The healthiest dessert ever',
    body: '10/10. The white chocolate one is a must.',
    who: 'Shai',
  },
]

export default function Reviews() {
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec__head" style={{ marginBottom: 8 }}>
          <div>
            <h2 className="d-script sec__title">70+ five-star reviews</h2>
            <Squiggle />
          </div>
          <span className="sec__eyebrow label">Verified · Judge.me</span>
        </Reveal>

        <div className="rev__grid">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.who} className="rev" delay={i * 0.09}>
              <div className="rev__stars" aria-label="5 out of 5 stars">★★★★★</div>
              <blockquote className="rev__q" style={{ margin: 0 }}>“{r.q}”</blockquote>
              <p className="rev__body" style={{ margin: 0 }}>{r.body}</p>
              <div className="rev__who">
                <span className="rev__av" aria-hidden="true">{r.who[0]}</span>
                <div>
                  <div className="rev__name">{r.who}</div>
                  <div className="rev__ver">Verified buyer</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
