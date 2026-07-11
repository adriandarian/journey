import { describe, expect, it } from 'vitest'
import { makePack } from '../test/make-pack'
import { chooseBranch, completeStep, deriveProgress } from './progress-engine'

describe('progress engine', () => {
  it('unlocks only required successors after completion', () => {
    const pack = makePack()
    const stored = completeStep(pack, { completed: [], choices: {} }, 'a')
    const derived = deriveProgress(pack, stored)

    expect(derived.states.a).toBe('completed')
    expect(derived.states.b).toBe('available')
  })

  it('refuses to complete a locked step', () => {
    const pack = makePack()

    expect(() =>
      completeStep(pack, { completed: [], choices: {} }, 'b'),
    ).toThrow('Cannot complete locked step: b')
  })

  it('reveals an optional branch only after its source is completed', () => {
    const pack = makePack({
      edges: [{ id: 'a-b', from: 'a', to: 'b', kind: 'optional' }],
    })

    expect(
      deriveProgress(pack, { completed: [], choices: {} }).states.b,
    ).toBe('locked')
    expect(
      deriveProgress(pack, { completed: ['a'], choices: {} }).states.b,
    ).toBe('available')
  })

  it('excludes the unchosen member of a choice group', () => {
    const pack = makePack({
      steps: [
        {
          id: 'a',
          threadId: 'main',
          title: 'A',
          summary: 'A',
          rewardIds: [],
          sourceId: 'source',
        },
        {
          id: 'left',
          threadId: 'main',
          title: 'Left',
          summary: 'Left',
          rewardIds: [],
          sourceId: 'source',
        },
        {
          id: 'right',
          threadId: 'main',
          title: 'Right',
          summary: 'Right',
          rewardIds: [],
          sourceId: 'source',
        },
      ],
      edges: [
        {
          id: 'a-left',
          from: 'a',
          to: 'left',
          kind: 'choice',
          choiceGroup: 'road',
        },
        {
          id: 'a-right',
          from: 'a',
          to: 'right',
          kind: 'choice',
          choiceGroup: 'road',
        },
      ],
    })

    const derived = deriveProgress(pack, {
      completed: ['a'],
      choices: { road: 'left' },
    })

    expect(derived.states.left).toBe('available')
    expect(derived.states.right).toBe('excluded')
  })

  it('commits an unchosen choice group when its available branch is completed', () => {
    const pack = makePack({
      steps: [
        {
          id: 'a',
          threadId: 'main',
          title: 'A',
          summary: 'A',
          rewardIds: [],
          sourceId: 'source',
        },
        {
          id: 'left',
          threadId: 'main',
          title: 'Left',
          summary: 'Left',
          rewardIds: [],
          sourceId: 'source',
        },
        {
          id: 'right',
          threadId: 'main',
          title: 'Right',
          summary: 'Right',
          rewardIds: [],
          sourceId: 'source',
        },
      ],
      edges: [
        {
          id: 'a-left',
          from: 'a',
          to: 'left',
          kind: 'choice',
          choiceGroup: 'road',
        },
        {
          id: 'a-right',
          from: 'a',
          to: 'right',
          kind: 'choice',
          choiceGroup: 'road',
        },
      ],
    })

    const completed = completeStep(
      pack,
      { completed: ['a'], choices: {} },
      'left',
    )

    expect(completed.choices.road).toBe('left')
  })

  it('refuses a branch choice before its predecessor is completed', () => {
    const pack = makePack({
      steps: [
        {
          id: 'a',
          threadId: 'main',
          title: 'A',
          summary: 'A',
          rewardIds: [],
          sourceId: 'source',
        },
        {
          id: 'left',
          threadId: 'main',
          title: 'Left',
          summary: 'Left',
          rewardIds: [],
          sourceId: 'source',
        },
      ],
      edges: [
        {
          id: 'a-left',
          from: 'a',
          to: 'left',
          kind: 'choice',
          choiceGroup: 'road',
        },
      ],
    })

    expect(() =>
      chooseBranch(pack, { completed: [], choices: {} }, 'road', 'left'),
    ).toThrow('Cannot choose locked branch: left')
  })
})
