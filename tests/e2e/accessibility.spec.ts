import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { waitForAtlas } from './helpers'

test('supports keyboard tracing and has no serious axe violations', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(
    '/games/where-winds-meet?mode=map&world=qinghe&layer=surface&region=qinghe&thread=main-story&step=river-crossing',
  )
  await waitForAtlas(page)

  await page.getByRole('button', { name: 'Next' }).press('Enter')
  await expect(page).toHaveURL(/step=stonewake-pass/)
  await expect(page.getByTestId('map-viewport')).toHaveAttribute(
    'data-motion',
    'reduced',
  )
  const results = await new AxeBuilder({ page }).analyze()
  expect(
    results.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact ?? ''),
    ),
  ).toEqual([])
})
