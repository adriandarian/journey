import { expect, test } from '@playwright/test'
import { waitForAtlas } from './helpers'

test('keeps the map visible while portrait details are open', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-portrait')
  await page.goto(
    '/games/where-winds-meet?mode=map&world=qinghe&layer=surface&region=qinghe&thread=main-story&step=river-crossing',
  )
  await waitForAtlas(page)

  const map = page.getByTestId('map-viewport')
  await expect(map).toBeVisible()
  await page.getByRole('button', { name: 'Open details' }).click()
  const sheet = page.getByRole('dialog', { name: 'Story details' })
  await expect(sheet).toBeVisible()
  const sheetBounds = await sheet.boundingBox()
  expect(sheetBounds?.height).toBeLessThanOrEqual(911 * 0.56)
  await expect(map).toBeInViewport()
  await page.getByRole('button', { name: 'Close details' }).click()
  await expect(page.getByRole('button', { name: 'Open details' })).toBeFocused()
})

test('uses a compact landscape inspector instead of stacked rails', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-landscape')
  await page.goto(
    '/games/where-winds-meet?mode=map&world=qinghe&layer=surface&region=qinghe&thread=main-story&step=river-crossing',
  )
  await waitForAtlas(page)

  await expect(
    page.getByRole('navigation', { name: 'Atlas navigation' }),
  ).toBeHidden()
  await expect(
    page.getByRole('complementary', { name: 'Story inspector' }),
  ).toBeVisible()
  await expect(page.getByTestId('map-viewport')).toBeVisible()
})
