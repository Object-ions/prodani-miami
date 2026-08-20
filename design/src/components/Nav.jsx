import React from 'react'
import { motion } from 'framer-motion'
import { Icon, useStuck } from '../lib.jsx'

const CLAIMS = [
  'Free local delivery in Miami over $75',
  'Baked in small batches — never mass-produced',
  '70+ five-star reviews',
  'No added sugar. Ever.',
]

export default function Nav({ count, onCart }) {
  const stuck = useStuck()
  const [i, setI] = React.useState(0)
  const first = React.useRef(true)
  const [pop, setPop] = React.useState(0)

  // bump the cart pill whenever the count changes (but not on first paint)
  React.useEffect(() => {
    if (first.current) { first.current = false; return }
    setPop((p) => p + 1)
  }, [count])

  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % CLAIMS.length), 4200)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <div className="announce" role="status" aria-live="polite">
        <motion.div
          key={i}
          className="announce__track"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        >
          <span className="announce__dot" />
          <span className="label">{CLAIMS[i]}</span>
        </motion.div>
      </div>

      <header className="nav" data-stuck={stuck}>
        <div className="wrap nav__in">
          <a href="#top" className="nav__logo" aria-label="ProDani Miami — home">prodani</a>
          <nav className="nav__links" aria-label="Primary">
            {['Shop', 'Meet Your Baker', 'Nutrition', 'Contact'].map((l) => (
              <a key={l} className="nav__link" href={'#' + l.toLowerCase().replace(/\s+/g, '-')}>{l}</a>
            ))}
          </nav>
          <div className="nav__right">
            <button className="icon-btn icon-btn--ghost" aria-label="Search"><Icon.search /></button>
            <button className="icon-btn icon-btn--ghost" aria-label="Account"><Icon.user /></button>
            <motion.button
              className="nav__cart" onClick={onCart}
              aria-label={`Open cart, ${count} items`}
              animate={pop ? { scale: [1, 1.14, 1], rotate: [0, -4, 0] } : undefined}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              key={pop}
            >
              Cart <span className="nav__count">{count}</span>
            </motion.button>
          </div>
        </div>
      </header>
    </>
  )
}
