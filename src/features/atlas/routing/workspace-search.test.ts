import { describe, expect, it } from 'vitest'
import { normalizeWorkspaceSearch } from './workspace-search'

describe('workspace search', () => {
  it('clamps camera values and preserves committed selection', () => {
    expect(
      normalizeWorkspaceSearch({
        mode: 'map',
        thread: 'main-story',
        step: 'river-crossing',
        cx: 2,
        cy: -1,
        zoom: 99,
        filters: ['lore', 'secret'],
      }),
    ).toEqual({
      mode: 'map',
      world: 'qinghe',
      layer: 'surface',
      region: 'qinghe',
      thread: 'main-story',
      step: 'river-crossing',
      cx: 1,
      cy: 0,
      zoom: 8,
      filters: ['lore', 'secret'],
    })
  })
})
