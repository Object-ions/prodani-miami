import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/* Seamless loop in Damion — the brand's own script face. */
export default function Marquee({ items, speed = 30, reverse = false, cocoa = false }) {
  const cls = 'marquee' + (cocoa ? ' marquee--cocoa' : '')
  const reduce = useReducedMotion()
  const Track = ({ hidden }) => (
    <div className="marquee__track" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <React.Fragment key={i}>
          <span>{t}</span>
          <span className="marquee__sep" aria-hidden="true">●</span>
        </React.Fragment>
      ))}
    </div>
  )
  if (reduce) return <div className={cls}><Track /></div>
  return (
    <div className={cls}>
      <motion.div
        style={{ display: 'flex', flex: '0 0 auto' }}
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        <Track /><Track hidden />
      </motion.div>
    </div>
  )
}
