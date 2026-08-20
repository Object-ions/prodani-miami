import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Reveal, Icon, money, TIER, EASE } from '../lib.jsx'

function Card({ p, i, onAdd }) {
  const single = !p.img2
  return (
    <motion.article
      layout
      className={'card' + (single ? ' card--single' : '')}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.55, delay: Math.min(i, 11) * 0.035, ease: EASE }}
    >
      <div className="card__media">
        <div className="card__badges">
          {p.vegan && <span className="badge badge--vegan">Vegan</span>}
          {!p.available && <span className="badge badge--out">Sold out</span>}
        </div>
        <img className="card__img card__img--main" src={p.img} alt={p.name} loading="lazy" width="600" height="600" />
        {p.img2 && (
          <img className="card__img card__img--alt" src={p.img2} alt="" aria-hidden="true" loading="lazy" width="600" height="600" />
        )}
      </div>

      <div className="card__tier mono">
        <i style={{ background: TIER[p.cat] }} />{p.cat}
      </div>
      <h3 className="card__name">{p.name}</h3>
      <p className="card__blurb">{p.blurb}</p>

      <div className="card__foot">
        <span className="card__price"><b>{money(p.price)}</b></span>
        <div className="card__actions">
          <button className="icon-btn" aria-label={`Quick view ${p.name}`}><Icon.eye /></button>
          <button
            className="icon-btn"
            onClick={() => onAdd(p)}
            disabled={!p.available}
            aria-label={`Add ${p.name} to cart`}
            style={!p.available ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
          >
            <Icon.plus />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default function Shop({ products, onAdd }) {
  const [tab, setTab] = useState('All')

  const tabs = useMemo(() => {
    const base = ['All', 'Personal', 'Family', 'Muffins', 'Vegan']
    return base.map((t) => ({
      id: t,
      n: t === 'All' ? products.length
        : t === 'Vegan' ? products.filter((p) => p.vegan).length
        : products.filter((p) => p.cat === t).length,
    }))
  }, [products])

  const shown = useMemo(() => {
    if (tab === 'All') return products
    if (tab === 'Vegan') return products.filter((p) => p.vegan)
    return products.filter((p) => p.cat === tab)
  }, [products, tab])

  return (
    <section className="sec" id="shop">
      <div className="wrap">
        <Reveal className="sec__head">
          <h2 className="d3" style={{ margin: 0 }}>The ProDani collection</h2>
          <span className="sec__num mono">{products.length} recipes · baked to order</span>
        </Reveal>

        {/* oversized serif filter row — the move that makes David's grid feel editorial */}
        <LayoutGroup>
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
                {tab === t.id && (
                  <motion.span
                    layoutId="filter-bar"
                    className="filter__bar"
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                )}
              </button>
            ))}
          </div>
        </LayoutGroup>

        <div className="count mono" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'product' : 'products'}
        </div>

        <motion.div layout className="grid">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <Card key={p.id} p={p} i={i} onAdd={onAdd} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
