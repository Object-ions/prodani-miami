export const choreography = {
  duration: 1,
  scrub: 0.65,
  stops: [0, 0.28, 0.55, 0.92],
  boundaries: [0.20, 0.45, 0.78],
  labels: ['The craving', 'The good stuff', 'The plot twist', 'Your cake'],
  desktopDpr: 1.7,
  mobileDpr: 1.4,
} as const

export interface MotionState {
  progress: number
  pointerX: number
  pointerY: number
  paused: boolean
}

export const clamp = (x: number) => Math.max(0, Math.min(1, x))
export const mix = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export function random(seed = 817) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}
