import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Icon, EASE } from '../lib.jsx'
import VIDEO from '../data/video.json'

// Falls back to the storefront's own CDN when `npm run setup` hasn't inlined the
// compressed copy. That fallback is the original 5.5 MB file — fine for local
// dev, not what should ship.
const SRC = VIDEO.mp4 || 'https://cdn.shopify.com/videos/c/o/v/5cb3aeadf0864053899148b99e96d5ff.mp4'
const POSTER = VIDEO.poster || undefined

export default function Hero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // The footage drifts slower than the page, so the type feels like it sits in front.
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14])

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
      <motion.div
        className="hero__video"
        style={reduce ? undefined : { y: videoY, scale: videoScale }}
        aria-hidden="true"
      >
        {reduce ? (
          POSTER && <img src={POSTER} alt="" />
        ) : (
          <video
            src={SRC}
            poster={POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          />
        )}
      </motion.div>

      {/* Keeps the pink legible over moving footage without washing it out. */}
      <div className="hero__scrim" aria-hidden="true" />

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
    </section>
  )
}
