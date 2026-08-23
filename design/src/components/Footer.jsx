import React from 'react'
import { Reveal, Icon, BleedWord } from '../lib.jsx'
import IMAGES from '../data/images.json'

/* Footer laid out after the supplied Footer9 component: nav columns on the left,
   a rail on the right carrying a signup card and a follow bar, then the oversized
   wordmark, then a legal strip. Ported to this project's own CSS and palette —
   there is no Tailwind here, and the icons come from our own set rather than
   lucide, so the footer stays on-brand instead of importing another design. */

const COLS = [
  ['Shop', ['Personal cakes', 'Family cakes', 'Muffins', 'Vegan range', 'Gift cards']],
  ['Company', ['Meet your baker', 'Our story', 'Nutrition', 'Wholesale', 'Contact']],
  ['Help', ['Delivery', 'Storage & shelf life', 'Allergens', 'Returns', 'FAQ']],
]

/* Both taken from the live store's own theme settings (social_instagram_link /
   social_facebook_link), not guessed — Facebook has no vanity handle, it is a
   numeric profile link. Tracking params (igshid / mibextid) stripped. */
const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/prodanimiami', Glyph: Icon.instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61550592411869', Glyph: Icon.facebook },
]

const LEGAL = ['Privacy', 'Terms', 'Accessibility']

const SIGNUP_IMG = IMAGES['strawberry-short-cake'] || ''

export default function Footer() {
  return (
    <>
      <BleedWord text="Delicious" />

      <section className="band">
        <div className="wrap">
          <Reveal>
            <h2 className="d-script">Where sweet meets balance</h2>
            <p className="lede">
              Baked to order in Miami and delivered cold. Order by Thursday for weekend delivery.
            </p>
            <a className="btn" href="#shop">Start your order <Icon.arrow /></a>
          </Reveal>
        </div>
      </section>

      <footer className="foot" id="contact">
        <div className="wrap">
          <div className="foot__grid">
            <div className="foot__cols">
              {COLS.map(([h, links]) => (
                <nav key={h} aria-label={h}>
                  <h4 className="foot__colhead">{h}</h4>
                  <ul>{links.map((l) => <li key={l}><a href="#shop">{l}</a></li>)}</ul>
                </nav>
              ))}
            </div>

            <div className="foot__rail">
              <div className="foot__card">
                {SIGNUP_IMG && (
                  <div className="foot__card-media">
                    <img src={SIGNUP_IMG} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                )}
                <h3 className="foot__card-title">First dibs on new bakes</h3>
                <p className="foot__card-copy">
                  New flavours, restocks and the odd Miami pop-up. Once a month, nothing else.
                </p>
                <form className="foot__form" onSubmit={(e) => e.preventDefault()}>
                  <label htmlFor="foot-email" className="sr-only">Email address</label>
                  <input id="foot-email" type="email" placeholder="Enter your email" autoComplete="email" />
                  <button type="submit">Subscribe</button>
                </form>
              </div>

              <div className="foot__social">
                <span className="foot__social-label">Follow us</span>
                <div className="foot__social-links">
                  {SOCIALS.map(({ label, href, Glyph }) => (
                    <a key={label} href={href} aria-label={label}
                       target="_blank" rel="noopener noreferrer">
                      <Glyph />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <svg className="foot__word" viewBox="-13 -66 321 92" aria-hidden="true" focusable="false">
            <text x="0" y="0">prodani</text>
          </svg>

          <div className="foot__bar">
            <span>© {new Date().getFullYear()} ProDani Miami</span>
            <nav className="foot__legal" aria-label="Legal">
              {LEGAL.map((l) => <a key={l} href="#contact">{l}</a>)}
            </nav>
            <span className="foot__credit">
              Designed and developed by{' '}
              <a href="https://switchcasestudio.com" target="_blank" rel="noopener noreferrer">
                Switch Case Studio
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
