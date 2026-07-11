import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { OfflineStatus } from './offline-status'

it.each([
  [
    { fetchStatus: 'idle', hasData: true, isStale: false, isPartial: false },
    'Cached',
  ],
  [
    { fetchStatus: 'idle', hasData: true, isStale: true, isPartial: false },
    'Stale',
  ],
  [
    { fetchStatus: 'idle', hasData: true, isStale: false, isPartial: true },
    'Partial',
  ],
  [
    { fetchStatus: 'paused', hasData: true, isStale: false, isPartial: false },
    'Offline',
  ],
] as const)('renders the %s operational state', (props, label) => {
  render(<OfflineStatus {...props} />)
  expect(screen.getByText(label)).toBeVisible()
})
