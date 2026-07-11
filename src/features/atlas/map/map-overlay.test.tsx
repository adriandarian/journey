import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MapOverlay } from './map-overlay'
import type { TraceModel } from './trace-model'

describe('MapOverlay', () => {
  it('keeps locked steps numbered instead of replacing them with crosses', () => {
    const node = {
      id: 'locked-step',
      title: 'Stonewake Pass',
      order: 7,
      point: { x: 0.5, y: 0.5 },
      state: 'locked' as const,
    }
    const trace: TraceModel = { nodes: [node], segments: [] }

    render(
      <MapOverlay
        trace={trace}
        screenNodes={[{ node, screen: { x: 100, y: 100 } }]}
        selectedStepId="locked-step"
        onSelect={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: '7. Stonewake Pass, locked',
      }),
    ).toHaveTextContent('7')
  })
})
