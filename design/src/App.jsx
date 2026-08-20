import React, { useCallback, useMemo, useState } from 'react'
import catalog from './data/catalog.json'
import IMAGES from './data/images.json'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import Shop from './components/Shop.jsx'
import Story, { Shout } from './components/Story.jsx'
import StackCards from './components/StackCards.jsx'
import Reviews from './components/Reviews.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'

const CLAIMS = ['high protein', 'no sugar added', 'gluten free', 'small batch', 'miami made']

const TREATS = ['carrot cake', 'banana bread', 'chocolate fudge', 'dubai dream', 'hazelnut']

/* The four proof points, as a stacking deck. Each pairs a figure with a real cake. */
const STAT_CARDS = [
  { figure: '20g', handle: 'strawberry-short-cake',
    title: 'Protein in a personal cake',
    description: 'The same protein as a bar, in the shape of an actual dessert. No chalk, no aftertaste.',
    cta: 'Shop personal cakes', color: '#FDC3D4' },
  { figure: '0g', handle: 'carrot-cake-copy',
    title: 'Added sugar. Across everything.',
    description: 'Sweetness comes from fruit and the ingredients themselves — nothing refined, nothing hidden.',
    cta: 'See the ingredients', color: '#FFFBE5' },
  { figure: '27', handle: 'chocolate-banana-cake',
    title: 'Recipes in rotation',
    description: 'Personal cakes, family cakes and muffins — including a full vegan line.',
    cta: 'Browse all 27', color: '#48312A', textColor: '#FBF5E8' },
  { figure: '4.9★', handle: 'banana-bread',
    title: 'From 70+ verified reviews',
    description: 'Every one left by someone who actually ordered. Read them before you decide.',
    cta: 'Read the reviews', color: '#F79CBB' },
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

  const statCards = useMemo(
    () => STAT_CARDS.map((c) => ({
      ...c,
      img: (products.find((p) => p.handle === c.handle) || products[0]).img,
    })),
    [products]
  )

  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      <a className="skip" href="#shop">Skip to products</a>
      <Nav count={count} onCart={() => setOpen(true)} />
      <main id="main">
        <Hero />
        <Marquee items={CLAIMS} />
        <Shop products={products} onAdd={add} />
        <Shout />
        <Marquee items={TREATS} speed={38} reverse />
        <StackCards
          id="why"
          items={statCards}
          eyebrow="Four reasons"
          heading={<h2 className="d-script sec__title">What makes prodani different</h2>}
        />
        <Story />
        <Reviews />
      </main>
      <Footer />
      <CartDrawer open={open} items={cart} onClose={() => setOpen(false)} onQty={qty} />
    </>
  )
}
