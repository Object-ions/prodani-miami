import { ArrowUpRight } from '@phosphor-icons/react'
import { assets, links } from '../assets'

export function Editorial() {
  return <section className="editorial" id="our-story" aria-labelledby="story-heading">
    <div className="editorial-photo"><img src={assets.cakePhoto} width="1080" height="1080" alt="ProDani chocolate fudge being poured over a rich slice of chocolate cake" loading="lazy" /><span className="photo-note">Yes, it tastes that good.</span></div>
    <div className="editorial-copy">
      <p className="eyebrow">A LITTLE MIAMI. A LOT OF HEART.</p>
      <h2 id="story-heading">A sweet tooth.<br />A sweeter idea.</h2>
      <p>ProDani began with one delicious question: what if the cake you craved could fit the life you loved?</p>
      <p>Dani brought a personal trainer’s perspective to the kitchen. The result? A little more balance. All the joy of cake.</p>
      <a className="text-link" href={links.baker}>Meet your baker <ArrowUpRight size={19} aria-hidden="true" /></a>
    </div>
    <footer><a href="#top" className="footer-brand">Made with love. In Miami.</a><a href={links.shop}>Find your next craving <ArrowUpRight size={17} aria-hidden="true" /></a><span>© {new Date().getFullYear()} ProDani Miami</span></footer>
  </section>
}
