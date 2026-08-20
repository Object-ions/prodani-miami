import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/* Seamless infinite marquee: two identical tracks, translate one full width. */
export default function Marquee({ items, speed = 34 }) {
  const reduce = useReducedMotion()
  const Track = ({ ariaHidden }) => (
    <div className="marquee__track" aria-hidden={ariaHidden || undefined}>
      {items.map((t, i) => (
        <React.Fragment key={i}>
          <span className="mono">{t}</span>
          <span className="marquee__sep" aria-hidden="true">✦</span>
        </React.Fragment>
      ))}
    </div>
  )

  if (reduce) {
    return <div className="marquee"><Track /></div>
  }

  return (
    <div className="marquee">
      <motion.div
        style={{ display: 'flex', flex: '0 0 auto' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        <Track />
        <Track ariaHidden />
      </motion.div>
    </div>
  )
}
