import { expect, test } from '@playwright/test'

test('traces, completes, switches modes, and restores selection from the URL', async ({
  page,
}) => {
  await page.goto(
    '/games/where-winds-meet?mode=map&world=qinghe&layer=surface&region=qinghe&thread=main-story&step=first-echo',
  )

  await expect(
    page.getByRole('heading', { name: 'The First Echo' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Complete step' }).click()
  await expect(page.getByText('1 of 20')).toBeVisible()
  await page.getByRole('radio', { name: 'Thread' }).click()
  await expect(page).toHaveURL(/mode=thread/)
  await expect(
    page.getByRole('button', { name: /The First Echo/ }),
  ).toHaveAttribute('aria-current', 'step')
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'The First Echo' }),
  ).toBeVisible()
})

test('recovers an obsolete URL entity without blanking the atlas', async ({
  page,
}) => {
  await page.goto(
    '/games/where-winds-meet?mode=map&world=qinghe&thread=missing-thread&step=missing-step',
  )

  await expect(page.getByText('View recovered')).toBeVisible()
  await expect(page.getByTestId('map-viewport')).toBeVisible()
  await expect(page).toHaveURL(/thread=main-story/)
  await expect(page).not.toHaveURL(/missing-step/)
})
