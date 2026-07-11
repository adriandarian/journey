import { expect, it } from 'vitest'
import { AtlasPicker } from './picker'

it('returns the nearest selectable mark inside the coarse-pointer radius', () => {
  const picker = new AtlasPicker()
  picker.rebuild([
    { id: 'a', x: 10, y: 10 },
    { id: 'b', x: 30, y: 30 },
  ])

  expect(picker.nearest({ x: 14, y: 12 }, 12)?.id).toBe('a')
  expect(picker.nearest({ x: 100, y: 100 }, 12)).toBeUndefined()
})
