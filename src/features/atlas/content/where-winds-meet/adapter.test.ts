import { describe, expect, it } from 'vitest'
import { validateContentPack } from '../../model/validate-content-pack'
import { whereWindsMeetAdapter } from './adapter'

describe('whereWindsMeetAdapter', () => {
  it('loads a 20-step thread with choice, lock, rejoin, discoveries, and provenance', async () => {
    const pack = await whereWindsMeetAdapter.loadWorld('qinghe')
    const kinds = new Set(pack.edges.map((edge) => edge.kind))

    expect(pack.steps).toHaveLength(20)
    expect([...kinds]).toEqual(
      expect.arrayContaining([
        'required',
        'optional',
        'choice',
        'rejoins',
        'context',
      ]),
    )
    expect(pack.discoveries.length).toBeGreaterThanOrEqual(8)
    expect(validateContentPack(pack).errors).toEqual([])
    expect(
      pack.sources.every((source) => source.confidence === 'schematic'),
    ).toBe(true)
  })
})
