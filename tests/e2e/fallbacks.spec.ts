import { expect, test } from '@playwright/test'

test('uses Canvas only when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      options?: unknown,
    ) {
      if (type === 'webgl2' || type === 'webgl') return null
      return Reflect.apply(original, this, [type, options])
    } as typeof original
  })
  await page.goto(
    '/games/where-winds-meet?mode=map&world=qinghe&layer=surface&region=qinghe',
  )

  await expect(page.getByText('Compatibility map active')).toBeVisible()
  await expect(page.getByTestId('canvas-map')).toBeVisible()
  await expect(page.locator('canvas[data-renderer="three"]')).toHaveCount(0)
})
