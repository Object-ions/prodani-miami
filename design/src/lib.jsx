import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/* ---------- shared easing ---------- */
export const EASE = [0.22, 1, 0.36, 1]

/* ---------- scroll reveal ----------
   One primitive used everywhere so the whole page shares a rhythm. */
export function Reveal({ children, delay = 0, y = 26, as = 'div', ...rest }) {
  const M = motion[as] || motion.div
  const reduce = useReducedMotion()
  return (
    <M
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </M>
  )
}

/* ---------- word-by-word display reveal ----------
   Each word rides up behind a mask. Reads as typesetting, not as a "web animation". */
export function WordsUp({ text, className = '', delay = 0, stagger = 0.055 }) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  if (reduce) return <span className={className}>{text}</span>
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.95, delay: delay + i * stagger, ease: EASE }}
            dangerouslySetInnerHTML={{ __html: w + (i < words.length - 1 ? '&nbsp;' : '') }}
          />
        </span>
      ))}
    </span>
  )
}

/* ---------- count-up, triggered once on scroll ---------- */
export function CountUp({ to, suffix = '', prefix = '', decimals = 0, duration = 1500 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) { setN(to); return }
    let raf, start
    const tick = (t) => {
      if (!start) start = t
      const p = Math.min((t - start) / duration, 1)
      // easeOutExpo — fast then settles, matches the page's motion feel
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setN(to * e)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, reduce])

  return <span ref={ref}>{prefix}{n.toFixed(decimals)}{suffix}</span>
}

/* ---------- icons ---------- */
const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const Icon = {
  plus:  () => <svg viewBox="0 0 24 24" {...s}><path d="M12 5v14M5 12h14"/></svg>,
  minus: () => <svg viewBox="0 0 24 24" {...s}><path d="M5 12h14"/></svg>,
  eye:   () => <svg viewBox="0 0 24 24" {...s}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>,
  bag:   () => <svg viewBox="0 0 24 24" {...s}><path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>,
  close: () => <svg viewBox="0 0 24 24" {...s}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  arrow: () => <svg viewBox="0 0 24 24" {...s}><path d="M5 12h13M12 5l7 7-7 7"/></svg>,
  search:() => <svg viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>,
  user:  () => <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>,
}

/* ---------- money ---------- */
export const money = (n) => '$' + n.toFixed(2)

/* ---------- hand-drawn squiggle rule ----------
   Sits under script headings so the section head reads as drawn, not ruled. */
export function Squiggle({ width = 190 }) {
  const reduce = useReducedMotion()
  return (
    <svg className="squiggle" viewBox="0 0 190 16" width={width} height={16}
         fill="none" aria-hidden="true" preserveAspectRatio="none">
      <motion.path
        d="M2 9C14 2 26 2 38 9s24 7 36 0 24-7 36 0 24 7 36 0 24-7 40 0"
        stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.9, ease: EASE }}
      />
    </svg>
  )
}

/* Rotating circular stamp — words chase their own tail around a circle.
   The one piece of pure decoration on the page, and it earns its place. */
export function SpinBadge({ className = '', text = 'no added sugar ✦ high protein ✦ gluten free ✦ small batch ✦ ', speed = 22 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={'spin-badge ' + className}
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 1.2 }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <path id="spin-badge-path" fill="none"
                d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text><textPath href="#spin-badge-path" startOffset="0">{text}</textPath></text>
      </motion.svg>
      <span className="spin-badge__core">🧁</span>
    </motion.div>
  )
}

/* ---------- the oversized cropped word ----------
   Scrolls slowly against the page so it reads as a moving banner, not a static slab. */
export function BleedWord({ text, speed = 26 }) {
  const reduce = useReducedMotion()
  const Row = ({ hidden }) => (
    <span className="bleed__word" aria-hidden={hidden || undefined}
          style={{ paddingRight: '0.12em' }}>{text}</span>
  )
  if (reduce) return <div className="bleed"><Row /></div>
  return (
    <div className="bleed">
      <motion.div
        style={{ display: 'flex', flex: '0 0 auto' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        <div style={{ display: 'flex', flex: '0 0 auto' }}><Row /><Row hidden /></div>
        <div style={{ display: 'flex', flex: '0 0 auto' }} aria-hidden="true"><Row hidden /><Row hidden /></div>
      </motion.div>
    </div>
  )
}

/* ---------- sticky-state hook ---------- */
export function useStuck(threshold = 8) {
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const on = () => setStuck(window.scrollY > threshold)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [threshold])
  return stuck
}
