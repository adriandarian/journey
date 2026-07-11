import { describe, expect, it } from 'vitest'
import { makePack } from '../test/make-pack'
import { validateContentPack } from './validate-content-pack'

describe('validateContentPack', () => {
  it('reports a cycle in required progression edges', () => {
    const pack = makePack({
      edges: [
        { id: 'a-b', from: 'a', to: 'b', kind: 'required' },
        { id: 'b-a', from: 'b', to: 'a', kind: 'required' },
      ],
    })

    expect(validateContentPack(pack).errors).toContain(
      'Required progression contains a cycle: a -> b -> a',
    )
  })

  it('rejects a choice group with no alternative', () => {
    const pack = makePack({
      edges: [
        {
          id: 'a-b',
          from: 'a',
          to: 'b',
          kind: 'choice',
          choiceGroup: 'road',
        },
      ],
    })

    expect(validateContentPack(pack).errors).toContain(
      'Choice group requires at least two branches: road',
    )
  })
})
