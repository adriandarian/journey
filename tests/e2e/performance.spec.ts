import { expect, test } from '@playwright/test'
import { waitForAtlas } from './helpers'

test('loads one bounded map renderer only when Map mode is entered', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.addInitScript(() => {
    const canvases = new WeakSet<HTMLCanvasElement>()
    let count = 0
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      options?: unknown,
    ) {
      if ((type === 'webgl' || type === 'webgl2') && !canvases.has(this)) {
        canvases.add(this)
        count += 1
      }
      return Reflect.apply(original, this, [type, options])
    } as typeof original
    Object.defineProperty(window, '__atlasWebglCount', { get: () => count })
  })
  await page.goto(
    '/games/where-winds-meet?mode=timeline&world=qinghe&layer=surface&region=qinghe',
  )
  await waitForAtlas(page)

  const routeChunkLoadedBeforeMapMode = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .some((entry) => entry.name.includes('map-viewport')),
  )
  expect(routeChunkLoadedBeforeMapMode).toBe(false)
  await page.getByRole('radio', { name: 'Map' }).click()
  const canvas = page.locator('canvas[data-renderer="three"]')
  await expect(canvas).toBeVisible()
  const metrics = await canvas.evaluate((element) => {
    const canvasElement = element as HTMLCanvasElement
    return {
      webglContextCount: (
        window as unknown as Window & { __atlasWebglCount: number }
      ).__atlasWebglCount,
      width: canvasElement.width,
      cssWidth: canvasElement.clientWidth,
    }
  })

  expect(metrics.webglContextCount).toBeLessThanOrEqual(1)
  expect(metrics.width).toBeLessThanOrEqual(Math.ceil(metrics.cssWidth * 2))
  await page.getByRole('radio', { name: 'Thread' }).click()
  await expect(page.locator('canvas[data-renderer="three"]')).toHaveCount(0)
})

test('pauses scene work and renders the 12k POI stress fixture', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() =>
    localStorage.setItem('atlas:e2e-poi-count', '12000'),
  )
  await page.goto(
    '/games/where-winds-meet?mode=map&world=qinghe&layer=surface&region=qinghe',
  )
  await waitForAtlas(page)

  await expect(page.getByTestId('map-viewport')).toHaveAttribute(
    'data-motion',
    'reduced',
  )
  await expect(page.getByTestId('map-viewport')).toHaveAttribute(
    'data-visible-pois',
    '12000',
  )
  const longTaskTotalMs = await page.evaluate(() =>
    performance
      .getEntriesByType('longtask')
      .reduce((total, entry) => total + entry.duration, 0),
  )
  expect(longTaskTotalMs).toBeLessThan(250)
})
