import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from './app-shell'

describe('AppShell', () => {
  it('keeps the map primary and exposes synchronized support regions', () => {
    render(
      <AppShell
        commandBar={<div>Commands</div>}
        navigation={<div>Stories</div>}
        viewport={<div>World map</div>}
        inspector={<div>River Crossing</div>}
      />,
    )

    expect(screen.getByRole('main', { name: 'World map' })).toBeVisible()
    expect(
      screen.getByRole('navigation', { name: 'Atlas navigation' }),
    ).toBeVisible()
    expect(
      screen.getByRole('complementary', { name: 'Story inspector' }),
    ).toBeVisible()
  })
})
