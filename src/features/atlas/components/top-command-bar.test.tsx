import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TopCommandBar } from './top-command-bar'

describe('TopCommandBar', () => {
  it('provides a dedicated portrait mode navigation surface', () => {
    render(
      <TopCommandBar
        gameSlug="where-winds-meet"
        games={[{ slug: 'where-winds-meet', title: 'Where Winds Meet' }]}
        mode="map"
        preferences={{
          color: 'dark',
          motion: 'system',
          labelDensity: 'comfortable',
          compactPanels: false,
          lastGame: 'where-winds-meet',
        }}
        onGameChange={vi.fn()}
        onPreferencesChange={vi.fn()}
        onModeChange={vi.fn()}
        onSearch={vi.fn()}
        onTraceStory={vi.fn()}
        onLayers={vi.fn()}
        onCopyLink={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onResetView={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('radiogroup', { name: 'Mobile atlas view' }),
    ).toBeInTheDocument()
  })
})
