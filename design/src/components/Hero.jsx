import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { WordsUp, Icon } from '../lib.jsx'

const STICKERS = [
  { t: '20g protein',    x: '-3%',  y: '17%', rot: -7, d: 0 },
  { t: 'No added sugar', x: '66%',  y: '4%',  rot:  6, d: 0.4 },
  { t: 'Gluten-free',    x: '72%',  y: '70%', rot: -5, d: 0.8 },
  { t: 'Small batch',    x: '-6%',  y: '68%', rot:  8, d: 1.2 },
]

const BLOBS = [
  { c: '#FDC3D4', w: 420, x: '4%',  y: '8%',  d: 0 },
  { c: '#F79CBB', w: 300, x: '82%', y: '62%', d: 2 },
  { c: '#FFFBE5', w: 240, x: '46%', y: '-8%', d: 4 },
]

export default function Hero({ product }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])

  return (
    <section className="hero" ref={ref} id="top">
      {/* soft drifting colour blobs */}
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="hero__blob"
          style={{ background: b.c, width: b.w, height: b.w, left: b.x, top: b.y }}
          animate={reduce ? undefined : { x: [0, 22, -14, 0], y: [0, -18, 14, 0] }}
          transition={{ duration: 18 + i * 4, repeat: Infinity, ease: 'easeInOut', delay: b.d }}
        />
      ))}

      <div className="wrap hero__in">
        <div>
          <motion.div
            className="hero__eyebrow label"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          >
            🧁 Baked fresh in Miami
          </motion.div>

          <h1 className="d-hero hero__title">
            <WordsUp text="The power of protein." delay={0.2} />{' '}
            <em><WordsUp text="The joy of cake." delay={0.45} /></em>
          </h1>

          <motion.p
            className="lede hero__lede"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            High-protein, gluten-free desserts baked in small batches — no added sugar,
            minimal ingredients, mindful calories. Dessert you can feel good about.
          </motion.p>

          <motion.div
            className="hero__cta"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.92 }}
          >
            <a className="btn btn--pink" href="#shop">Shop the collection <Icon.arrow /></a>
            <a className="btn btn--cream" href="#meet-your-baker">Meet your baker</a>
          </motion.div>

          <motion.div
            className="hero__facts"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.05 }}
          >
            {[['27', 'Recipes in rotation'], ['0g', 'Added sugar'], ['4.9★', 'From 70+ reviews']].map(([b, s]) => (
              <div className="hero__fact" key={s}><b>{b}</b><span>{s}</span></div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="hero__art"
          style={reduce ? undefined : { y: artY }}
          initial={{ opacity: 0, scale: 0.86, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.25 }}
        >
          <div className="hero__disc" />
          <motion.div
            className="hero__ring"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="hero__photo"
            animate={reduce ? undefined : { y: [0, -13, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={product.img} alt={`${product.name} — ProDani Miami`} />
          </motion.div>

          {STICKERS.map((s) => (
            <motion.div
              key={s.t}
              className="sticker"
              style={{ left: s.x, top: s.y }}
              initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: s.rot, y: reduce ? 0 : [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.4, delay: 1 + s.d * 0.18 },
                scale:   { type: 'spring', stiffness: 380, damping: 13, delay: 1 + s.d * 0.18 },
                rotate:  { type: 'spring', stiffness: 380, damping: 13, delay: 1 + s.d * 0.18 },
                y:       { duration: 4.5 + s.d, repeat: Infinity, ease: 'easeInOut', delay: s.d },
              }}
            >
              <i />{s.t}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="scallop" aria-hidden="true" />
    </section>
  )
}
