import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Icon, SpinBadge } from '../lib.jsx'

/* Cake photos cropped into the type wall. Two sit behind the letters, one in
   front — that overlap is what gives the flat type real depth. */
const CAKES = [
  { k: 'a', x: '67%',  y: '-6%',  s: 306, rot: -8, z: 1, d: 0 },
  { k: 'b', x: '58%',  y: '66%',  s: 176, rot: 9,  z: 3, d: 1.4 },
]

/* Deterministic sprinkle field — no Math.random, so it never re-shuffles. */
const SPRINKLES = Array.from({ length: 26 }, (_, i) => {
  const x = (i * 37.6) % 100
  const y = (i * 61.3) % 100
  // push anything landing in the middle band out toward an edge
  const edgeX = x > 26 && x < 74 ? (x < 50 ? x - 24 : x + 24) : x
  return {
    x: edgeX, y,
    w: 16 + (i % 4) * 7,
    h: 7 + (i % 3) * 2,
    rot: (i * 53) % 180,
    c: ['#FDC3D4', '#FFFBE5', '#F79CBB', '#E58BAE'][i % 4],
    d: (i % 7) * 0.4,
  }
})

export default function Hero({ cakes }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const typeY = useTransform(scrollYProgress, [0, 1], ['0%', '-16%'])
  const artY  = useTransform(scrollYProgress, [0, 1], ['0%', '26%'])

  const line = { hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } } }
  const glyph = {
    hidden: { y: '110%', rotate: -6 },
    show:   { y: '0%', rotate: 0, transition: { type: 'spring', stiffness: 220, damping: 20 } },
  }

  const Word = ({ text }) => (
    <motion.span className="giant__line" variants={line} initial="hidden" animate="show">
      {[...text].map((ch, i) => (
        <span className="giant__mask" key={i}>
          <motion.span className="giant__ch" variants={glyph}>
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )

  return (
    <section className="hero" ref={ref} id="top">
      {/* sprinkles */}
      <div className="sprinkles" aria-hidden="true">
        {SPRINKLES.map((s, i) => (
          <motion.i
            key={i}
            style={{ left: s.x + '%', top: s.y + '%', width: s.w, height: s.h,
                     background: s.c, rotate: s.rot, borderRadius: 999 }}
            animate={reduce ? undefined : { y: [0, -26, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: s.d }}
          />
        ))}
      </div>

      {/* cake photos cropped into the wall */}
      <motion.div className="hero__cakes" style={reduce ? undefined : { y: artY }} aria-hidden="true">
        {CAKES.map((c, i) => (
          <motion.div
            key={c.k}
            className="hero__cake"
            style={{ left: c.x, top: c.y, width: c.s, height: c.s, zIndex: c.z }}
            initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: c.rot, y: reduce ? 0 : [0, -16, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.6 + i * 0.16 },
              scale:   { type: 'spring', stiffness: 200, damping: 15, delay: 0.6 + i * 0.16 },
              rotate:  { type: 'spring', stiffness: 200, damping: 15, delay: 0.6 + i * 0.16 },
              y:       { duration: 7 + i * 1.6, repeat: Infinity, ease: 'easeInOut', delay: c.d },
            }}
          >
            <img src={cakes[i]?.img} alt="" />
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="wrap hero__in" style={reduce ? undefined : { y: typeY }}>
        <motion.p
          className="hero__kicker"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          The power of protein. The joy of cake.
        </motion.p>

        <h1 className="giant">
          <Word text="Bite into" />
          <Word text="Balance" />
        </h1>

        <motion.div
          className="hero__foot"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95 }}
        >
          <a className="btn btn--pink" href="#shop">Shop the collection <Icon.arrow /></a>
          <ul className="hero__facts">
            {['0g added sugar', '20g protein', 'Gluten-free', 'Baked to order'].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <SpinBadge className="hero__badge" />
      <div className="scallop" aria-hidden="true" />
    </section>
  )
}
