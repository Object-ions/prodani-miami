import React from 'react'
import TextPath from './TextPath.jsx'

/* A gentle wave, echoing the squiggle rules used under the section headings.
   Start and end sit at the same y (60) so the loop seam is invisible. */
const WAVE = 'M0 88 C 200 52 400 52 600 88 S 1000 124 1200 88 S 1400 52 1600 88'

export default function Marquee({ items, speed = 26, reverse = false }) {
  // Long enough to overrun the path, so TextPath fits it and the loop is seamless.
  const SEP = '\u00A0\u00A0✦\u00A0\u00A0'
  const text = items.join(SEP) + SEP

  return (
    <div className="marquee">
      <TextPath
        text={text}
        path={WAVE}
        viewBox="0 0 1600 158"
        duration={speed}
        reversed={reverse}
        fontSize="44px"
        fontFamily="Konnect, sans-serif"
        fontWeight={700}
        letterSpacing="0.01em"
        ribbonColor="var(--pink)"
        ribbonWidth={78}
        ribbonOffset={-12}
        fillAbove="var(--cocoa)"
      />
    </div>
  )
}
