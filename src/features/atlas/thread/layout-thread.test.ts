import { expect, it } from 'vitest'
import { layoutThread } from './layout-thread'

it('lays out a choice graph in a stable layered direction', async () => {
  const result = await layoutThread(
    {
      nodes: [
        { id: 'a', width: 180, height: 56 },
        { id: 'left', width: 180, height: 56 },
        { id: 'right', width: 180, height: 56 },
      ],
      edges: [
        { id: 'a-left', from: 'a', to: 'left', kind: 'choice' },
        { id: 'a-right', from: 'a', to: 'right', kind: 'choice' },
      ],
    },
    'RIGHT',
  )

  expect(
    result.nodes.every(
      (node) => Number.isFinite(node.x) && Number.isFinite(node.y),
    ),
  ).toBe(true)
  expect(result.edges).toHaveLength(2)
})
