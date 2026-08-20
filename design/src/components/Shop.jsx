import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal, Icon, money, Squiggle } from '../lib.jsx'

function Card({ p, i, onAdd }) {
  return (
    <motion.article
      layout
      className={'card' + (p.img2 ? '' : ' card--single')}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: Math.min(i, 11) * 0.04 }}
    >
      <div className="card__media">
        <div className="card__badges">
          {p.vegan && <span className="badge badge--vegan">Vegan</span>}
          {!p.available && <span className="badge badge--out">Sold out</span>}
        </div>
        <img className="card__img card__img--main" src={p.img} alt={p.name} loading="lazy" width="600" height="600" />
        {p.img2 && <img className="card__img card__img--alt" src={p.img2} alt="" aria-hidden="true" loading="lazy" width="600" height="600" />}
      </div>

      <div className="card__cat">{p.cat}</div>
      <h3 className="card__name">{p.name}</h3>
      <p className="card__blurb">{p.blurb}</p>

      <div className="card__foot">
        <span className="card__price">{money(p.price)}</span>
        <div className="card__actions">
          <button className="icon-btn icon-btn--ghost" aria-label={`Quick view ${p.name}`}><Icon.eye /></button>
          <button
            className="icon-btn"
            onClick={() => onAdd(p)}
            disabled={!p.available}
            aria-label={`Add ${p.name} to cart`}
            style={!p.available ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          ><Icon.plus /></button>
        </div>
      </div>
    </motion.article>
  )
}

export default function Shop({ products, onAdd }) {
  const [tab, setTab] = useState('All')

  const tabs = useMemo(() => ['All', 'Personal', 'Family', 'Muffins', 'Vegan'].map((t) => ({
    id: t,
    n: t === 'All' ? products.length
      : t === 'Vegan' ? products.filter((p) => p.vegan).length
      : products.filter((p) => p.cat === t).length,
  })), [products])

  const shown = useMemo(() => {
    if (tab === 'All') return products
    if (tab === 'Vegan') return products.filter((p) => p.vegan)
    return products.filter((p) => p.cat === tab)
  }, [products, tab])

  return (
    <section className="sec" id="shop">
      <div className="wrap">
        <Reveal className="sec__head">
          <div>
            <h2 className="d-script sec__title">The prodani collection</h2>
            <Squiggle />
          </div>
          <span className="sec__eyebrow label">{products.length} recipes · baked to order</span>
        </Reveal>

        <div className="filters" role="tablist" aria-label="Filter products">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className="filter"
              data-on={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.id}<sup>{t.n}</sup>
            </button>
          ))}
        </div>

        <div className="count" aria-live="polite">
          Showing {shown.length} {shown.length === 1 ? 'treat' : 'treats'}
        </div>

        <motion.div layout className="grid">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => <Card key={p.id} p={p} i={i} onAdd={onAdd} />)}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
