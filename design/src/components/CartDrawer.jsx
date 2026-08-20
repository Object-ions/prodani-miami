import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon, money, EASE } from '../lib.jsx'

export default function CartDrawer({ open, items, onClose, onQty }) {
  const panel = useRef(null)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  // lock scroll + close on Escape while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    panel.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="scrim"
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
          <motion.aside
            className="drawer"
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            <div className="drawer__head">
              <b>Your cart ({items.reduce((s, i) => s + i.qty, 0)})</b>
              <button className="icon-btn icon-btn--ghost" onClick={onClose} aria-label="Close cart"><Icon.close /></button>
            </div>

            <div className="drawer__body">
              {items.length === 0 && (
                <p className="drawer__empty mono">Nothing here yet.</p>
              )}
              <AnimatePresence initial={false}>
                {items.map((i) => (
                  <motion.div
                    key={i.id}
                    className="line"
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <img src={i.img} alt="" />
                    <div>
                      <div className="line__n">{i.name}</div>
                      <div className="line__m">{i.cat} · {money(i.price)}</div>
                    </div>
                    <div className="qty">
                      <button onClick={() => onQty(i.id, -1)} aria-label={`Decrease ${i.name}`}><Icon.minus /></button>
                      <span>{i.qty}</span>
                      <button onClick={() => onQty(i.id, +1)} aria-label={`Increase ${i.name}`}><Icon.plus /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="drawer__foot">
              <div className="drawer__row">
                <span style={{ fontWeight: 700 }}>Subtotal</span>
                <b>{money(subtotal)}</b>
              </div>
              <p style={{ color: 'var(--ink-faint)', margin: 0, fontSize: 12.5, fontWeight: 600 }}>
                Free local delivery over $75 · Taxes at checkout
              </p>
              <button className="btn" disabled={!items.length} style={!items.length ? { opacity: 0.4 } : undefined}>
                Checkout <Icon.arrow />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
