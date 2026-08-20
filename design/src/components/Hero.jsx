import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Icon, EASE } from '../lib.jsx'

export default function Hero({ cakes }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  /* One reveal per line, not per letter. The wall arrives as two calm moves
     instead of sixteen springy ones. */
  const Line = ({ text, delay }) => (
    <span className="giant__line">
      <span className="giant__mask">
        <motion.span
          className="giant__ch"
          initial={reduce ? false : { y: '104%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 1, delay, ease: EASE }}
        >
          {text}
        </motion.span>
      </span>
    </span>
  )

  return (
    <section className="hero" ref={ref} id="top">
      {/* a single cake, sitting behind the type */}
      <motion.div
        className="hero__cake"
        style={reduce ? undefined : { y: artY }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
        aria-hidden="true"
      >
        <img src={cakes[0]?.img} alt="" />
      </motion.div>

      <div className="wrap hero__in">
        <motion.p
          className="hero__kicker"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        >
          The power of protein. The joy of cake.
        </motion.p>

        <h1 className="giant">
          <Line text="Bite into" delay={0.25} />
          <Line text="Balance" delay={0.38} />
        </h1>

        <motion.div
          className="hero__foot"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
        >
          <a className="btn btn--pink" href="#shop">Shop the collection <Icon.arrow /></a>
          <p className="hero__note">0g added sugar · 20g protein · gluten-free</p>
        </motion.div>
      </div>

      <div className="scallop" aria-hidden="true" />
    </section>
  )
}
