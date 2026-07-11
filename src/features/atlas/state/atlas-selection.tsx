import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type AtlasEntity = {
  kind: 'step' | 'discovery' | 'location'
  id: string
}

interface AtlasSelectionValue {
  selection?: AtlasEntity
  previewed?: AtlasEntity
  select: (value?: AtlasEntity) => void
  preview: (value?: AtlasEntity) => void
}

const AtlasSelectionContext = createContext<AtlasSelectionValue | null>(null)

export function AtlasSelectionProvider({ children }: { children: ReactNode }) {
  const [selection, select] = useState<AtlasEntity>()
  const [previewed, preview] = useState<AtlasEntity>()
  const value = useMemo(
    () => ({ selection, previewed, select, preview }),
    [selection, previewed],
  )

  return (
    <AtlasSelectionContext.Provider value={value}>
      {children}
    </AtlasSelectionContext.Provider>
  )
}

export function useAtlasSelection(): AtlasSelectionValue {
  const value = useContext(AtlasSelectionContext)
  if (!value) {
    throw new Error(
      'useAtlasSelection must be used inside AtlasSelectionProvider',
    )
  }
  return value
}
