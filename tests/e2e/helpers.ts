import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function waitForAtlas(page: Page) {
  await expect(page.getByTestId('atlas-workspace')).toHaveAttribute(
    'data-hydrated',
    'true',
  )
}
