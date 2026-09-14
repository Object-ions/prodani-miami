import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function progress(page: Page, p: number) {
  await page.evaluate(value => {
    const story = document.querySelector<HTMLElement>('.experience')!
    window.scrollTo({ top: story.offsetTop + (story.offsetHeight - innerHeight) * value, behavior: 'instant' })
  }, p)
  await page.waitForTimeout(1300)
}
async function load(page: Page) {
  await page.goto('/')
  await expect(page.locator('.experience')).toHaveAttribute('data-renderer', 'webgl')
  await page.getByRole('button', { name: 'Pause ambient motion' }).click()
  await page.mouse.move(0, 0)
  await page.waitForTimeout(500)
}

for (const [name, width, height] of [
  ['large-desktop', 1920, 1080], ['laptop', 1280, 720],
  ['tablet', 768, 1024], ['mobile', 390, 844],
] as const) {
  test(`${name}: all four acts, usable CTAs, no overflow or console errors`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()) })
    const failed: string[] = []
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()) })
    await load(page)
    for (const [act, p] of [0, 0.30, 0.61, 0.96].entries()) {
      await progress(page, p)
      await expect(page.locator('.experience')).toHaveAttribute('data-act', String(act))
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      expect(overflow).toBe(false)
      if (act === 0 || act === 3) {
        const button = page.getByRole('link', { name: 'Taste the plot twist' })
        await expect(button).toBeVisible()
        const box = await button.boundingBox()
        expect(box!.y).toBeGreaterThan(0)
        expect(box!.y + box!.height).toBeLessThanOrEqual(height)
        await button.click({ trial: true })
      }
      await page.screenshot({ path: `artifacts/${name}-act-${act + 1}.png` })
    }
    await progress(page, 0)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(errors).toEqual([])
    expect(failed).toEqual([])
  })
}

test('scrubbing backward restores the same WebGL composition', async ({ page }) => {
  await load(page)
  await progress(page, 0.3)
  const style = '.copy-track, .copy-track * { visibility: hidden !important; }'
  const textBefore = await page.locator('.ingredients-copy').getAttribute('style')
  // Isolate the actual scene; Chromium can rasterize identical DOM text differently
  // when its compositing layer is recreated after being hidden.
  const before = await page.locator('canvas').screenshot({ style })
  await progress(page, 0.96)
  await progress(page, 0.3)
  const after = await page.locator('canvas').screenshot({ style })
  expect(before.equals(after)).toBe(true)
  expect(await page.locator('.ingredients-copy').getAttribute('style')).toBe(textBefore)
})

test('chapter navigation, meet CTA, replay and keyboard focus work', async ({ page }) => {
  await load(page)
  await page.getByRole('link', { name: 'Meet the cake', exact: true }).click()
  await expect(page.locator('.experience')).toHaveAttribute('data-act', '3')
  await page.waitForTimeout(1400)
  await page.getByRole('link', { name: 'One more time?' }).click()
  await expect(page.locator('.experience')).toHaveAttribute('data-act', '0')
  await page.getByRole('button', { name: 'The good stuff', exact: true }).click()
  await expect(page.locator('.experience')).toHaveAttribute('data-act', '1')
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.activeElement?.matches(':focus-visible'))).toBe(true)
  await expect(page.getByRole('link', { name: 'Shop the good stuff' })).toHaveAttribute('href', 'https://prodanimiami.com/collections/all')
})

test('reduced motion uses real photography with no long scroll or WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('.experience')).toHaveAttribute('data-renderer', 'static')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Taste the plot twist' })).toBeVisible()
  expect(await page.locator('.experience').evaluate(element => element.clientHeight)).toBeLessThan(1000)
  await page.screenshot({ path: 'artifacts/reduced-motion-mobile.png' })
})

test('unavailable WebGL and lost context fall back without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  await page.goto('/')
  await expect(page.locator('.experience')).toHaveAttribute('data-renderer', 'static')
  await expect(page.locator('.static-cake img')).toBeVisible()
  await page.screenshot({ path: 'artifacts/webgl-unavailable.png' })
  expect(errors).toEqual([])
})

test('context loss preserves the conversion path', async ({ page }) => {
  await load(page)
  await progress(page, 0.96)
  await page.locator('canvas').evaluate(canvas => {
    (canvas as HTMLCanvasElement).getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext()
  })
  await expect(page.locator('.experience')).toHaveAttribute('data-renderer', 'static')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Taste the plot twist' })).toBeVisible()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('resizing an already paused scene redraws it in the mobile composition', async ({ page }) => {
  await load(page)
  await progress(page, 0.96)
  await page.waitForTimeout(1000)
  await page.setViewportSize({ width: 390, height: 844 })
  await progress(page, 0.96)
  await expect(page.locator('.experience')).toHaveAttribute('data-renderer', 'webgl')
  const width = await page.locator('canvas').evaluate(canvas => canvas.clientWidth)
  expect(width).toBe(390)
  await page.screenshot({ path: 'artifacts/resized-mobile.png' })
  await page.getByRole('link', { name: 'Taste the plot twist' }).click({ trial: true })
})

test('opening and reveal pass automated accessibility checks', async ({ page }) => {
  await load(page)
  for (const p of [0, 0.96]) {
    await progress(page, p)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations).toEqual([])
  }
})
