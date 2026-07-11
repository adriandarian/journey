import { describe, expect, it } from 'vitest'
import { getContext } from './root-provider'

describe('atlas query client', () => {
  it('uses offline-first bounded cache defaults', () => {
    const options = getContext().queryClient.getDefaultOptions()

    expect(options.queries).toMatchObject({
      networkMode: 'offlineFirst',
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
    })
    expect(options.mutations).toMatchObject({ networkMode: 'offlineFirst' })
  })
})
