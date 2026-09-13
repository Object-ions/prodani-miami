import { ArrowUpRight } from '@phosphor-icons/react'
import { assets, links } from '../assets'

export function Header({ onMeet }: { onMeet: (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return <header className="site-header">
    <a className="brand" href="#top" aria-label="ProDani Miami home"><img src={assets.wordmark} width="160" height="52" alt="ProDani" /><span>MIAMI</span></a>
    <nav aria-label="Main navigation">
      <a href="#cake" onClick={onMeet}>The cake</a>
      <a href="#our-story">Our story</a>
    </nav>
    <a className="header-cta" href={links.shop}>Shop the good stuff <ArrowUpRight size={17} weight="bold" aria-hidden="true" /></a>
  </header>
}
