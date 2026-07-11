import { expect, test } from '@playwright/test'

test('renders a nonblank Three.js map and reports readiness', async ({
  page,
}) => {
  await page.goto(
    '/games/where-winds-meet?mode=map&world=qinghe&layer=surface&region=qinghe',
  )

  const viewport = page.getByTestId('map-viewport')
  await expect(viewport).toHaveAttribute('data-render-ready', 'true')
  const canvas = viewport.locator('canvas')
  await expect(canvas).toBeVisible()
  const image = await canvas.screenshot()

  expect(image.byteLength).toBeGreaterThan(10_000)
})
