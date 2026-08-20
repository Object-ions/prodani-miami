import React, { useRef, useId, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

/**
 * Text running along an SVG path, looping seamlessly.
 *
 * Ported from the TypeScript/Tailwind original to plain JSX + the project's own
 * CSS (this app has no Tailwind). Two changes beyond the port:
 *   - `fontFamily` is a prop rather than hardcoded "sans-serif", so the brand face
 *     can be used. It is applied to BOTH the visible text and the hidden measuring
 *     text — they must match or getComputedTextLength() lies and the fitting breaks.
 *   - Honours prefers-reduced-motion by not starting the timeline.
 */
export default function TextPath({
  text = 'Your text goes here',
  path,
  className = '',
  duration = 21,
  reversed = false,
  fontSize = '17px',
  fontFamily = 'sans-serif',
  fontWeight = 500,
  letterSpacing = 'normal',
  viewBox = '0 0 240 240',
  pathScale = 1,
  preserveAspectRatio,
  // Optional ribbon: the same path drawn as a thick stroke behind the text, so the
  // background hugs the lettering instead of sitting in a rectangle behind it.
  ribbonColor,
  ribbonWidth = 0,
  ribbonOffset = 0,
  // Optional solid fill covering everything ABOVE the ribbon. Lets the section
  // above end on the same wave the ribbon follows, instead of a straight edge.
  fillAbove,
}) {
  const viewBoxWidth = Number(viewBox.split(/[\s,]+/)[2]) || 0
  // Sit the fill's lower edge exactly on the ribbon's top edge.
  const fillOffset = ribbonOffset - ribbonWidth / 2
  const id = useId()
  const pathId = `text-path-curve-${id.replace(/:/g, '')}`

  const containerRef = useRef(null)
  const pathRef = useRef(null)
  const textPath1Ref = useRef(null)
  const textPath2Ref = useRef(null)
  const measureRef = useRef(null)

  const [textLengthLimit, setTextLengthLimit] = useState(undefined)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!pathRef.current || !measureRef.current) return

    const measure = () => {
      const pathLen = pathRef.current.getTotalLength()
      const textLen = measureRef.current.getComputedTextLength()
      setTextLengthLimit(textLen > pathLen ? pathLen : undefined)
      setIsReady(true)
    }

    measure()

    // Webfonts land after first paint; re-measure once they do or the text is
    // fitted against fallback metrics and jumps.
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {})
  }, [text, path, fontSize, fontFamily, fontWeight, letterSpacing])

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'none', duration } })

      tl.fromTo(
        textPath1Ref.current,
        { attr: { startOffset: '0%' } },
        { attr: { startOffset: reversed ? '-100%' : '100%' } },
        0,
      )
      tl.fromTo(
        textPath2Ref.current,
        { attr: { startOffset: reversed ? '100%' : '-100%' } },
        { attr: { startOffset: '0%' } },
        0,
      )
    },
    { scope: containerRef, dependencies: [reversed, duration] },
  )

  const textAttrs = {
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
  }

  return (
    <div ref={containerRef} className={`textpath ${className}`}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio={preserveAspectRatio}
        xmlns="http://www.w3.org/2000/svg"
        className="textpath__svg"
        style={{ transform: `scale(${pathScale})` }}
        role="img"
        aria-label={text}
      >
        <defs>
          <path ref={pathRef} id={pathId} d={path} />
        </defs>

        {fillAbove && (
          <path
            className="textpath__fill"
            d={`${path} L${viewBoxWidth} 0 L0 0 Z`}
            transform={`translate(0 ${fillOffset})`}
            fill={fillAbove}
          />
        )}

        {ribbonColor && ribbonWidth > 0 && (
          <path
            className="textpath__ribbon"
            d={path}
            transform={`translate(0 ${ribbonOffset})`}
            stroke={ribbonColor}
            strokeWidth={ribbonWidth}
            strokeLinecap="butt"
          />
        )}

        {/* hidden, purely to measure the natural text length */}
        <text
          ref={measureRef}
          fill="none"
          stroke="none"
          visibility="hidden"
          aria-hidden="true"
          {...textAttrs}
        >
          {text}
        </text>

        <text fill="currentColor" style={{ opacity: isReady ? 1 : 0 }} {...textAttrs}>
          <textPath
            ref={textPath1Ref}
            href={`#${pathId}`}
            startOffset="0%"
            textLength={textLengthLimit}
            lengthAdjust="spacingAndGlyphs"
          >
            {text}
          </textPath>
          <textPath
            ref={textPath2Ref}
            href={`#${pathId}`}
            startOffset={reversed ? '100%' : '-100%'}
            textLength={textLengthLimit}
            lengthAdjust="spacingAndGlyphs"
          >
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  )
}

TextPath.displayName = 'TextPath'
