import { beforeEach, expect, it } from 'vitest'
import {
  defaultPreferences,
  preferencesRepository,
} from './preferences-repository'

beforeEach(() => localStorage.clear())

it('round-trips compact UI preferences', () => {
  preferencesRepository.save({
    motion: 'reduced',
    labelDensity: 'compact',
    compactPanels: true,
  })

  expect(preferencesRepository.get()).toMatchObject({
    motion: 'reduced',
    labelDensity: 'compact',
    compactPanels: true,
  })
})

it('recovers from malformed storage', () => {
  localStorage.setItem('progression-atlas:preferences:v1', '{')

  expect(preferencesRepository.get()).toEqual(defaultPreferences)
})
