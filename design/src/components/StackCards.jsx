import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

/**
 * Scroll-stacking cards.
 *
 * Adapted from the supplied stacking-card component. Two departures:
 *  - Tailwind classes replaced with this project's CSS (no Tailwind here).
 *  - No Lenis. The demo wraps the whole document in smooth-scroll, which would
 *    hijack scrolling site-wide and fight the page's other scroll-linked
 *    animations. The stack mechanic is sticky + useScroll and needs no help.
 *
 * Each card pins to the top of the viewport and scales down as the next one
 * rides over it, so they gather into a deck.
 */
function Card({ i, item, progress, range, targetScale }) {
  const container = useRef(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  })

  // 1.6 magnified the crop so hard that the cake overflowed the frame on the way in.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.25, 1])
  const scale = useTransform(progress, range, [1, targetScale])

  return (
    <div className="stack__slot" ref={container}>
      <motion.div
        className="stack__card"
        style={{
          backgroundColor: item.color,
          color: item.textColor || 'var(--cocoa)',
          scale: reduce ? 1 : scale,
          top: `calc(-6vh + ${i * 26}px)`,
        }}
      >
        <div className="stack__body">
          <div className="stack__text">
            <span className="stack__figure">{item.figure}</span>
            <h3 className="stack__title">{item.title}</h3>
            <p className="stack__desc">{item.description}</p>
            <a className="stack__link" href="#shop">
              {item.cta || 'Shop the collection'}
              <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-hidden="true">
                <path
                  d="M21.5303 6.53033C21.8232 6.23744 21.8232 5.76256 21.5303 5.46967L16.7574 0.696699C16.4645 0.403806 15.9896 0.403806 15.6967 0.696699C15.4038 0.989592 15.4038 1.46447 15.6967 1.75736L19.9393 6L15.6967 10.2426C15.4038 10.5355 15.4038 11.0104 15.6967 11.3033C15.9896 11.5962 16.4645 11.5962 16.7574 11.3033L21.5303 6.53033ZM0 6.75L21 6.75V5.25L0 5.25L0 6.75Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>

          <div className="stack__media">
            <motion.div className="stack__media-inner" style={{ scale: reduce ? 1 : imageScale }}>
              {/* The product shots are 620px squares dropped into a ~1.65:1 slot, so
                  `cover` discards about 40% of the height. Centring that crop lands it on
                  the backdrop — the cake sits in the lower half of every one of these
                  photos (centre around 68% down), which is why it kept getting cut off at
                  the bottom. Bias the crop down onto the subject; `focus` lets any card
                  whose photo is framed differently override it. */}
              <img
                src={item.img}
                alt=""
                aria-hidden="true"
                loading="lazy"
                style={{ objectPosition: item.focus || '50% 88%' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function StackCards({ items, heading, eyebrow, id }) {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  })

  return (
    <section className="stack" ref={container} id={id}>
      {(heading || eyebrow) && (
        <div className="wrap stack__head">
          {heading}
          {eyebrow && <span className="sec__eyebrow label">{eyebrow}</span>}
        </div>
      )}
      {items.map((item, i) => (
        <Card
          key={item.figure + i}
          i={i}
          item={item}
          progress={scrollYProgress}
          range={[i * (1 / items.length), 1]}
          targetScale={1 - (items.length - i) * 0.045}
        />
      ))}
    </section>
  )
}
