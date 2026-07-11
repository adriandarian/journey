import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  AtlasSelectionProvider,
  useAtlasSelection,
} from './atlas-selection'

describe('atlas selection', () => {
  it('commits one selected entity for every view', () => {
    const { result } = renderHook(() => useAtlasSelection(), {
      wrapper: AtlasSelectionProvider,
    })

    act(() => result.current.select({ kind: 'step', id: 'river-crossing' }))
    expect(result.current.selection).toEqual({
      kind: 'step',
      id: 'river-crossing',
    })

    act(() =>
      result.current.preview({ kind: 'discovery', id: 'river-tablet' }),
    )
    expect(result.current.selection).toEqual({
      kind: 'step',
      id: 'river-crossing',
    })
    expect(result.current.previewed).toEqual({
      kind: 'discovery',
      id: 'river-tablet',
    })
  })
})
