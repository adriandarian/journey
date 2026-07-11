export interface AtlasPreferences {
  color: 'dark'
  motion: 'system' | 'reduced'
  labelDensity: 'comfortable' | 'compact'
  compactPanels: boolean
  lastGame: string
}

export const defaultPreferences: AtlasPreferences = {
  color: 'dark',
  motion: 'system',
  labelDensity: 'comfortable',
  compactPanels: false,
  lastGame: 'where-winds-meet',
}

const key = 'progression-atlas:preferences:v1'

function getPreferences(): AtlasPreferences {
  if (typeof localStorage === 'undefined') return defaultPreferences

  try {
    return {
      ...defaultPreferences,
      ...JSON.parse(localStorage.getItem(key) ?? '{}'),
    }
  } catch {
    return defaultPreferences
  }
}

export const preferencesRepository = {
  get: getPreferences,
  save(patch: Partial<AtlasPreferences>): AtlasPreferences {
    const next = { ...getPreferences(), ...patch }
    localStorage.setItem(key, JSON.stringify(next))
    return next
  },
}
