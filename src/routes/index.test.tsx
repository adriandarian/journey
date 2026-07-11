import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IndexScreen } from './index'

describe('IndexScreen', () => {
  it('identifies the product and default game', () => {
    render(<IndexScreen />)

    expect(
      screen.getByRole('heading', { name: 'Progression Atlas' }),
    ).toBeVisible()
    expect(screen.getByText('Where Winds Meet')).toBeVisible()
  })
})
