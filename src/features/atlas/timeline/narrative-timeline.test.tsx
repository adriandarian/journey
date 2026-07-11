import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { NarrativeTimeline } from './narrative-timeline'

it('selects a step and exposes branch meaning without hover', async () => {
  const onSelect = vi.fn()
  render(
    <NarrativeTimeline
      nodes={[
        {
          id: 'a',
          title: 'A',
          order: 1,
          point: { x: 0, y: 0 },
          state: 'completed',
        },
        {
          id: 'b',
          title: 'B',
          order: 2,
          point: { x: 1, y: 1 },
          state: 'current',
        },
      ]}
      branchKinds={new Map<string, 'choice' | 'optional'>([['b', 'choice']])}
      selectedStepId="a"
      onSelect={onSelect}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: /B.*choice/i }))
  expect(onSelect).toHaveBeenCalledWith('b')
})
