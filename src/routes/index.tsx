import { createFileRoute, redirect } from '@tanstack/react-router'
import { DEFAULT_FILTERS } from '@/features/atlas/routing/workspace-search'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/games/$gameSlug',
      params: { gameSlug: 'where-winds-meet' },
      search: {
        mode: 'map',
        world: 'qinghe',
        layer: 'surface',
        region: 'qinghe',
        filters: DEFAULT_FILTERS,
        cx: 0.5,
        cy: 0.5,
        zoom: 1,
      },
    })
  },
})
