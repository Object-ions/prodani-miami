import React from 'react'
import TextPath from './TextPath.jsx'

/* A gentle wave, echoing the squiggle rules used under the section headings.
   Start and end sit at the same y (88) so the loop seam is invisible.

   The path runs the full 0–1600, but VIEW only shows 16–1584. That 16-unit inset on
   each side is deliberate: the ribbon is a stroke, so its butt caps are cut square to
   the tangent, and the wave is sloping where it ends — so each cap is a diagonal that
   leaves a ~7-unit bare wedge in the corner. Hiding the caps outside the viewBox is
   what keeps the ribbon running edge to edge. */
const WAVE = 'M0 88 C 200 52 400 52 600 88 S 1000 124 1200 88 S 1400 52 1600 88'
const VIEW = '16 0 1568 158'

export default function Marquee({
  items,
  speed = 26,
  reverse = false,
  className = '',
  // Default: the ribbon caps a cocoa section. Pass fillAbove={null} to let whatever
  // sits behind — the hero video, say — run all the way down to the lettering.
  fillAbove = 'var(--cocoa)',
  fillBelow,
}) {
  // Long enough to overrun the path, so TextPath fits it and the loop is seamless.
  const SEP = '  ✦  '
  const text = items.join(SEP) + SEP

  return (
    <div className={`marquee ${className}`.trim()}>
      <TextPath
        text={text}
        path={WAVE}
        viewBox={VIEW}
        duration={speed}
        reversed={reverse}
        fontSize="44px"
        fontFamily="Konnect, sans-serif"
        fontWeight={700}
        letterSpacing="0.01em"
        ribbonColor="var(--pink)"
        ribbonWidth={78}
        ribbonOffset={-12}
        fillAbove={fillAbove || undefined}
        fillBelow={fillBelow || undefined}
      />
    </div>
  )
}
