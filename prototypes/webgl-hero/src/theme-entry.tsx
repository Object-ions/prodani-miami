/** Shopify theme build: mounts the cake story into the `prodani-3d-hero` section. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Experience } from './components/Experience'
import { configure } from './assets'
import './styles.css'
import './theme-overrides.css'

const host = document.querySelector<HTMLElement>('[data-pd3d]')
if (host) {
  const { cocoa, detail, product, shop, next } = host.dataset
  configure({ cocoaTexture: cocoa, cakeDetail: detail }, { product, shop })
  createRoot(host).render(<StrictMode><Experience embedded skipTarget={next} /></StrictMode>)
}
