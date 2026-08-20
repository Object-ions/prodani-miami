import React, { useCallback, useMemo, useState } from 'react'
import catalog from './data/catalog.json'
import IMAGES from './data/images.json'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import Shop from './components/Shop.jsx'
import Story, { Stats, Shout } from './components/Story.jsx'
import Reviews from './components/Reviews.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'

const CLAIMS = [
  'high protein', 'non GMO', 'gluten free', 'no sugar added',
  'high fibre', 'low calorie', 'small batch', 'miami made',
]

const TREATS = [
  'carrot cake', 'banana bread', 'chocolate fudge', 'cinnamon apple',
  'dubai dream', 'pumpkin muffins', 'strawberry & vanilla', 'hazelnut',
]

export default function App() {
  const [cart, setCart] = useState([])
  const [open, setOpen] = useState(false)

  // Swap in base64 images so the page renders with zero network requests.
  const products = useMemo(
    () => catalog.map((p) => ({
      ...p,
      img:  IMAGES[p.handle] || p.img,
      img2: IMAGES[p.handle + '__2'] || p.img2,
    })),
    []
  )

  // Three photos for the hero collage — visually distinct so the wall reads varied.
  const heroCakes = useMemo(() => {
    const want = ['strawberry-short-cake', 'chocolate-banana-cake', 'carrot-cake-copy']
    const picked = want.map((h) => products.find((p) => p.handle === h)).filter(Boolean)
    const rest = products.filter((p) => !picked.includes(p))
    return [...picked, ...rest].slice(0, 3)
  }, [products])

  const add = useCallback((p) => {
    setCart((c) => {
      const hit = c.find((i) => i.id === p.id)
      return hit
        ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { ...p, qty: 1 }]
    })
    setOpen(true)
  }, [])

  const qty = useCallback((id, d) => {
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0)
    )
  }, [])

  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      <a className="skip" href="#shop">Skip to products</a>
      <Nav count={count} onCart={() => setOpen(true)} />
      <main id="main">
        <Hero cakes={heroCakes} />
        <Marquee items={CLAIMS} />
        <Shop products={products} onAdd={add} />
        <Shout />
        <Marquee items={TREATS} speed={38} reverse cocoa />
        <Stats />
        <Story />
        <Reviews />
      </main>
      <Footer />
      <CartDrawer open={open} items={cart} onClose={() => setOpen(false)} onQty={qty} />
    </>
  )
}
