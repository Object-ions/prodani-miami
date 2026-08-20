import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { WordsUp, Icon, EASE } from '../lib.jsx'

/* film-grain overlay, generated inline so nothing is fetched */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E\")"

const CHIPS = [
  { t: '20g protein',    x: '2%',  y: '20%', d: 0 },
  { t: 'No added sugar', x: '68%', y: '9%',  d: 0.5 },
  { t: 'Gluten-free',    x: '74%', y: '72%', d: 1 },
  { t: 'Small batch',    x: '-2%', y: '66%', d: 1.5 },
]

export default function Hero({ product }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // gentle parallax — the art drifts slower than the copy
  const artY  = useTransform(scrollYProgress, [0, 1], ['0%', '17%'])
  const artS  = useTransform(scrollYProgress, [0, 1], [1, 1.07])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-9%'])
  const fade  = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  return (
    <section className="hero" ref={ref} id="top">
      <div className="hero__glow" />
      <div className="hero__grain" style={{ backgroundImage: GRAIN }} />

      <div className="wrap hero__in">
        {/* ---- copy ---- */}
        <motion.div style={reduce ? undefined : { y: copyY, opacity: fade }}>
          <motion.div
            className="hero__eyebrow mono"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <span />Miami · Est. 2023
          </motion.div>

          <h1 className="d1 hero__title" style={{ margin: 0 }}>
            <WordsUp text="The power of protein." delay={0.25} />
            <br />
            <em><WordsUp text="The joy of cake." delay={0.5} /></em>
          </h1>

          <motion.p
            className="lede hero__lede"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease: EASE }}
          >
            High-protein, gluten-free desserts baked in small batches — no added sugar,
            minimal ingredients, mindful calories. Dessert you can feel good about.
          </motion.p>

          <motion.div
            className="hero__cta"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1, ease: EASE }}
          >
            <a className="btn" href="#shop">Shop the collection <Icon.arrow /></a>
            <a className="btn btn--ghost" href="#our-story">Meet your baker</a>
          </motion.div>

          <motion.div
            className="hero__facts"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.15 }}
          >
            {[['27', 'Recipes in rotation'], ['0g', 'Added sugar'], ['4.9★', 'From 70+ reviews']].map(([b, s]) => (
              <div className="hero__fact" key={s}>
                <b>{b}</b><span className="mono">{s}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ---- art ---- */}
        <motion.div
          className="hero__art"
          style={reduce ? undefined : { y: artY, scale: artS }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, delay: 0.3, ease: EASE }}
        >
          <div className="hero__disc" />
          <div className="hero__ring" />
          <div className="hero__ring hero__ring--2" />

          <motion.div
            className="hero__plate"
            animate={reduce ? undefined : { y: [0, -14, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              className="hero__img"
              src={product.img}
              alt={`${product.name} — ${product.cat.toLowerCase()} size, ProDani Miami`}
            />
          </motion.div>

          {CHIPS.map((c) => (
            <motion.div
              key={c.t}
              className="chip mono"
              style={{ left: c.x, top: c.y }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: reduce ? 0 : [0, -9, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 1.1 + c.d * 0.16 },
                scale:   { duration: 0.6, delay: 1.1 + c.d * 0.16, ease: EASE },
                y:       { duration: 5 + c.d, repeat: Infinity, ease: 'easeInOut', delay: c.d },
              }}
            >
              <i />{c.t}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
