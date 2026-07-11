import { useEffect, useState } from 'react'
import {
  defaultPreferences,
  preferencesRepository,
} from './preferences-repository'
import type { AtlasPreferences } from './preferences-repository'

export function usePreferences() {
  const [preferences, setPreferences] = useState(defaultPreferences)

  useEffect(() => setPreferences(preferencesRepository.get()), [])

  function update(patch: Partial<AtlasPreferences>) {
    setPreferences(preferencesRepository.save(patch))
  }

  return { preferences, update }
}
