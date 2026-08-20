import React from 'react'
import { motion } from 'framer-motion'
import { Icon, useStuck, EASE } from '../lib.jsx'

const CLAIMS = [
  'Free local delivery in Miami over $75',
  'Baked in small batches — never mass-produced',
  '70+ five-star reviews',
  'No added sugar. Ever.',
]

export default function Nav({ count, onCart }) {
  const stuck = useStuck()
  const [i, setI] = React.useState(0)

  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % CLAIMS.length), 4200)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      {/* rotating announcement — one line, no layout shift */}
      <div className="announce" role="status" aria-live="polite">
        <motion.div
          key={i}
          className="announce__track"
          initial={{ opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <span className="announce__dot" />
          <span className="mono">{CLAIMS[i]}</span>
        </motion.div>
      </div>

      <header className="nav" data-stuck={stuck}>
        <div className="wrap nav__in">
          <a href="#top" className="nav__logo" aria-label="ProDani Miami — home">
            Pro<em>Dani</em>
          </a>
          <nav className="nav__links" aria-label="Primary">
            {['Shop', 'Our Story', 'Nutrition', 'Stockists'].map((l) => (
              <a key={l} className="nav__link" href={'#' + l.toLowerCase().replace(/\s/g, '-')}>{l}</a>
            ))}
          </nav>
          <div className="nav__right">
            <button className="icon-btn" aria-label="Search"><Icon.search /></button>
            <button className="icon-btn" aria-label="Account"><Icon.user /></button>
            <button className="nav__cart" onClick={onCart} aria-label={`Open cart, ${count} items`}>
              <span className="mono">Cart</span>
              <span className="nav__count">{count}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
