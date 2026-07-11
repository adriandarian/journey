import { describe, expect, it } from 'vitest'
import { whereWindsMeetSeedPack } from '../content/where-winds-meet/seed-pack'
import { deriveProgress } from '../progress/progress-engine'
import { buildTraceModel } from './trace-model'

describe('buildTraceModel', () => {
  it('keeps the primary route, choice branch, state, and order distinct', () => {
    const progress = deriveProgress(whereWindsMeetSeedPack, {
      completed: [
        'first-echo',
        'village-in-need',
        'into-the-wilds',
        'bamboo-shade',
      ],
      current: 'river-crossing',
      choices: {},
    })
    const model = buildTraceModel(
      whereWindsMeetSeedPack,
      progress,
      'main-story',
    )

    expect(
      model.nodes.find((node) => node.id === 'river-crossing')?.state,
    ).toBe('current')
    expect(model.segments.some((segment) => segment.kind === 'choice')).toBe(
      true,
    )
    expect(model.nodes[0]?.order).toBe(1)
  })
})
