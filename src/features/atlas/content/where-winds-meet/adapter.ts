import { whereWindsMeetSeedPack } from './seed-pack'
import type { GameAdapter, SearchResult } from '../game-adapter'

export const whereWindsMeetAdapter: GameAdapter = {
  manifest: whereWindsMeetSeedPack.manifest,
  defaultWorldId: 'qinghe',
  defaultLayerId: 'surface',
  defaultRegionId: 'qinghe',
  worldIds: ['qinghe'],
  layerIds: ['surface'],
  async loadWorld(worldId) {
    if (worldId !== 'qinghe') throw new Error(`Unknown world: ${worldId}`)
    return whereWindsMeetSeedPack
  },
  async search(query) {
    const needle = query.text.trim().toLocaleLowerCase()
    const results: SearchResult[] = [
      ...whereWindsMeetSeedPack.steps.map((step) => ({
        id: step.id,
        kind: 'step' as const,
        title: step.title,
      })),
      ...whereWindsMeetSeedPack.discoveries.map((item) => ({
        id: item.id,
        kind: 'discovery' as const,
        title: item.title,
      })),
      ...whereWindsMeetSeedPack.locations.map((item) => ({
        id: item.id,
        kind: 'location' as const,
        title: item.label ?? item.id,
      })),
    ]

    return results.filter((result) => {
      const kindMatch =
        query.kinds.length === 0 || query.kinds.includes(result.kind)
      return kindMatch && result.title.toLocaleLowerCase().includes(needle)
    })
  },
}
