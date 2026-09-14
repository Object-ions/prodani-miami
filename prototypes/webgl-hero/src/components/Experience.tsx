import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play } from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Header } from './Header'
import { Editorial } from './Editorial'
import { assets, links } from '../assets'
import { choreography } from '../animation/config'
import type { MotionState } from '../animation/config'

gsap.registerPlugin(ScrollTrigger)

export function Experience({ embedded = false, skipTarget }: { embedded?: boolean, skipTarget?: string }) {
  const story = useRef<HTMLElement>(null)
  const canvasHost = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Awaited<ReturnType<typeof import('../scene/createScene').createScene>> | null>(null)
  const motion = useRef<MotionState>({ progress: 0, pointerX: 0, pointerY: 0, paused: false })
  const restoreHero = useRef(false)
  const [mode, setMode] = useState<'loading' | 'webgl' | 'static'>('loading')
  const [paused, setPaused] = useState(false)
  const [reduce, setReduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const staticMode = mode === 'static' || reduce
  // The storefront's sticky nav covers the top 60px; the stage pins just below it.
  const offset = embedded ? 60 : 0

  const rememberPosition = useCallback(() => {
    const bounds = story.current?.getBoundingClientRect()
    restoreHero.current = !!bounds && bounds.top < 0 && bounds.bottom > 0
  }, [])

  useLayoutEffect(() => {
    if (staticMode && restoreHero.current) {
      // Context loss can collapse several viewports; keep the current product in view.
      window.scrollTo({ top: story.current?.offsetTop ?? 0, behavior: 'instant' })
      restoreHero.current = false
    }
  }, [staticMode])

  const jump = useCallback((progress: number) => {
    const element = story.current
    if (!element) return
    const top = element.getBoundingClientRect().top + window.scrollY - offset
    const distance = element.offsetHeight - window.innerHeight + offset
    window.scrollTo({ top: top + Math.max(0, distance) * progress, behavior: reduce ? 'instant' : 'smooth' })
  }, [reduce, offset])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { if (query.matches) rememberPosition(); setReduce(query.matches) }
    query.addEventListener('change', change)
    return () => query.removeEventListener('change', change)
  }, [rememberPosition])

  useEffect(() => {
    let cancelled = false
    let dispose: (() => void) | undefined
    if (reduce || new URLSearchParams(window.location.search).get('webgl') === 'off') return
    const host = canvasHost.current!
    async function boot() {
      try {
        const [{ createScene }] = await Promise.all([
          import('../scene/createScene'),
          document.fonts.ready,
        ])
        if (cancelled) return
        const scene = await createScene(host, motion.current, () => {
          rememberPosition()
          sceneRef.current?.dispose()
          sceneRef.current = null
          setMode('static')
        })
        if (cancelled) { scene.dispose(); return }
        sceneRef.current = scene
        dispose = () => { scene.dispose(); sceneRef.current = null }
        scene.render(0)
        setMode('webgl')
      } catch (error) {
        if (import.meta.env.DEV) console.info('Using the photographic presentation:', error)
        if (!cancelled) { rememberPosition(); setMode('static') }
      }
    }
    void boot()
    return () => { cancelled = true; dispose?.() }
  }, [reduce, rememberPosition])

  useEffect(() => {
    const element = story.current!
    const stage = element.querySelector<HTMLElement>('.stage')!
    const panels = gsap.utils.toArray<HTMLElement>('.act-copy', element)
    const labels = gsap.utils.toArray<HTMLElement>('.act-label', element)
    const nav = gsap.utils.toArray<HTMLButtonElement>('.chapter-button', element)
    const forcedStatic = new URLSearchParams(window.location.search).get('webgl') === 'off'
    if (staticMode || forcedStatic) {
      element.dataset.act = '3'
      panels.forEach((panel, i) => { panel.inert = i !== 3; panel.setAttribute('aria-hidden', String(i !== 3)) })
      return
    }
    let previousAct = -1
    let inView = true
    let lastProgress = -1
    let idleFrames = 0
    let alive = true
    function updateAct() {
      const p = motion.current.progress
      const act = p < 0.20 ? 0 : p < 0.45 ? 1 : p < 0.78 ? 2 : 3
      element.style.setProperty('--progress', String(p))
      if (act !== previousAct) {
        element.dataset.act = String(act)
        panels.forEach((panel, i) => { panel.inert = i !== act; panel.setAttribute('aria-hidden', String(i !== act)) })
        nav.forEach((button, i) => button.setAttribute('aria-current', i === act ? 'step' : 'false'))
        previousAct = act
      }
    }
    const context = gsap.context(() => {
      // Keep text on the same compositing path in either scroll direction.
      gsap.set([...panels, ...labels], { force3D: true })
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 26 })
      gsap.set(labels.slice(1), { autoAlpha: 0, y: 15 })
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: element, start: `top top+=${offset}`, end: 'bottom bottom', scrub: choreography.scrub, invalidateOnRefresh: true },
        onUpdate: updateAct,
      })
      timeline.to(motion.current, { progress: 1, duration: 1, ease: 'none' }, 0)
      const boundaries = choreography.boundaries
      boundaries.forEach((at, i) => {
        timeline.to(panels[i], { autoAlpha: 0, y: -26, duration: 0.035, ease: 'power1.in' }, at - 0.025)
        timeline.to(panels[i + 1], { autoAlpha: 1, y: 0, duration: 0.045, ease: 'power2.out' }, at + 0.006)
        timeline.to(labels[i], { autoAlpha: 0, y: -15, duration: 0.025 }, at - 0.02)
        timeline.to(labels[i + 1], { autoAlpha: 1, y: 0, duration: 0.04 }, at + 0.01)
      })
      timeline.to('.pink-world', { scale: 1.18, rotation: 12, duration: 0.42, ease: 'sine.inOut' }, 0.08)
      timeline.to('.pink-world', { scale: 1, rotation: -6, duration: 0.32, ease: 'sine.inOut' }, 0.60)
      timeline.fromTo('.reveal-facts', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.09 }, 0.81)
      updateAct()
    }, element)
    const tick = (time: number, delta: number) => {
      if (!alive || !inView || document.hidden) return
      const current = motion.current
      if (current.paused && lastProgress === current.progress) {
        idleFrames++
        if (idleFrames > 30) return
      } else idleFrames = 0
      lastProgress = current.progress
      sceneRef.current?.render(time, delta)
    }
    gsap.ticker.add(tick)
    const intersection = new IntersectionObserver(entries => { inView = entries[0].isIntersecting }, { threshold: 0 })
    intersection.observe(stage)
    const visibility = () => {
      if (document.hidden) gsap.ticker.remove(tick)
      else { idleFrames = 0; gsap.ticker.add(tick) }
    }
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      motion.current.pointerX = event.clientX / window.innerWidth * 2 - 1
      motion.current.pointerY = event.clientY / window.innerHeight * 2 - 1
    }
    const leave = () => { motion.current.pointerX = 0; motion.current.pointerY = 0 }
    document.addEventListener('visibilitychange', visibility)
    stage.addEventListener('pointermove', pointer, { passive: true })
    stage.addEventListener('pointerleave', leave)
    return () => {
      alive = false
      context.revert()
      gsap.ticker.remove(tick)
      intersection.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      stage.removeEventListener('pointermove', pointer)
      stage.removeEventListener('pointerleave', leave)
    }
  }, [staticMode, offset])

  const togglePause = () => {
    motion.current.paused = !motion.current.paused
    setPaused(motion.current.paused)
    sceneRef.current?.render(0)
  }
  const meet = (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); jump(0.94) }
  const forcedStatic = new URLSearchParams(window.location.search).get('webgl') === 'off'
  const isStatic = staticMode || forcedStatic

  // Inside the storefront the theme supplies the <main>, header and the sections that follow.
  const Shell = embedded ? 'div' : 'main'
  return <>
    <a className="skip-link" href={skipTarget ?? '#our-story'}>Skip the cake animation</a>
    <Shell id="top">
      <section ref={story} className={`experience${isStatic ? ' is-static' : ''}`} aria-label="The story of your chocolate fudge cake" data-act={isStatic ? '3' : '0'} data-renderer={isStatic ? 'static' : mode}>
        <div className="stage">
          {!embedded && <Header onMeet={meet} />}
          <div className="pink-world" aria-hidden="true"><div className="world-ring" /></div>
          <div className="world-caption" aria-hidden="true">a little unexpected.</div>
          <div ref={canvasHost} className="canvas-host" role="img" aria-label="A rectangular chocolate cake assembles from floating cocoa crumbs, cake components and a glossy fudge coating." />
          {mode === 'loading' && !isStatic && <div className="loading" role="status"><span className="loading-mark">p</span><span>Something good is coming together.</span></div>}
          {isStatic && <figure className="static-cake"><img src={assets.cakeDetail} alt="Rich chocolate fudge cake with a smooth chocolate coating and a soft cocoa crumb" width="1000" height="1000" /></figure>}
          <div className="copy-track">
            <div className="act-copy intro-copy">
              <p className="eyebrow">MIAMI’S NOT-SO-GUILTY PLEASURE</p>
              <h1><span>CAKE,</span><span>WITH A</span><span className="pink-type">PLOT TWIST.</span></h1>
              <p className="support">Rich chocolate fudge. 20g of protein.<br />No added sugar. All the main-character energy.</p>
              <div className="actions"><a className="cake-button" href={links.product}>Taste the plot twist <ArrowUpRight size={20} aria-hidden="true" /></a><a href="#cake" className="text-link" onClick={meet}>Meet the cake <ArrowDown size={17} aria-hidden="true" /></a></div>
            </div>
            <div className="act-copy ingredients-copy" aria-hidden="true" inert>
              <p className="eyebrow">LET’S TAKE IT FROM THE TOP</p>
              <h2>GOOD <br />THINGS.<br /><span className="pink-type">IN MOTION.</span></h2>
              <p className="support">Cocoa. Coconut flour. A little kitchen magic.<br />Every delicious part has a part to play.</p>
              <div className="ingredient-notes"><span>Organic cocoa powder</span><span>Organic coconut flour</span><span>Whey protein</span></div>
            </div>
            <div className="act-copy assembly-copy" aria-hidden="true" inert>
              <p className="eyebrow">HERE COMES THE PLOT TWIST</p>
              <h2>IT ALL <br />COMES<br /><span className="pink-type">TOGETHER.</span></h2>
              <p className="support">Soft cake. Rich fudge.<br />A very delicious change of plans.</p>
              <p className="script-note">Wait for it…</p>
            </div>
            <div className="act-copy final-copy" id="cake" aria-hidden={!isStatic} inert={!isStatic}>
              <p className="eyebrow">PERSONAL CHOCOLATE FUDGE CAKE</p>
              <h2>ALL CAKE.<br /><span className="pink-type">ALL YOU.</span></h2>
              <p className="support">Deeply chocolate. Perfectly personal.<br />Your everyday deserves a little plot twist.</p>
              <div className="actions"><a className="cake-button" href={links.product}>Taste the plot twist <ArrowUpRight size={20} aria-hidden="true" /></a></div>
              <a className="replay text-link" href="#top" onClick={event => { event.preventDefault(); jump(0) }}>One more time? <ArrowRight size={17} aria-hidden="true" /></a>
            </div>
          </div>
          <div className="product-caption" aria-hidden="true">
            <p className="act-label">A chocolate-fudge daydream.</p>
            <p className="act-label">Every crumb has a calling.</p>
            <p className="act-label">A little delicious gravity.</p>
            <p className="act-label">Your personal happy place.</p>
          </div>
          <div className="reveal-facts" aria-label="Product facts"><div><strong>20<span>g</span></strong><span>PROTEIN PER CAKE</span></div><div><strong>0<span>g</span></strong><span>ADDED SUGAR</span></div><div className="word-fact"><strong>Gluten<br />free.</strong><span>BAKED IN MIAMI</span></div></div>
          <div className="story-footer">
            <div className="story-invitation"><span>GOOD THINGS COME TOGETHER</span><span>Keep going. It gets fudgier. <ArrowDown size={14} aria-hidden="true" /></span></div>
            <nav className="chapters" aria-label="Cake story chapters">{choreography.labels.map((label, index) => <button type="button" className="chapter-button" key={label} onClick={() => jump(choreography.stops[index])} aria-current={index === 0 ? 'step' : 'false'}><span className="chapter-line" /><span>{label}</span></button>)}</nav>
            <button type="button" className="motion-toggle" onClick={togglePause} aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'} aria-pressed={paused}>{paused ? <Play size={15} weight="fill" /> : <Pause size={15} weight="fill" />}</button>
          </div>
        </div>
      </section>
      {!embedded && <Editorial />}
    </Shell>
  </>
}
