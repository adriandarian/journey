import type { ContentPack } from '../model/schema'

export interface SearchQuery {
  text: string
  kinds: string[]
}

export interface SearchResult {
  id: string
  kind: 'step' | 'discovery' | 'location'
  title: string
}

export interface GameAdapter {
  manifest: ContentPack['manifest']
  defaultWorldId: string
  defaultLayerId: string
  defaultRegionId: string
  worldIds: string[]
  layerIds: string[]
  loadWorld: (worldId: string) => Promise<ContentPack>
  search: (query: SearchQuery) => Promise<SearchResult[]>
}

const registry = new Map<string, GameAdapter>()

export function registerGame(adapter: GameAdapter): void {
  registry.set(adapter.manifest.slug, adapter)
}

export function getGameAdapter(slug: string): GameAdapter | undefined {
  return registry.get(slug)
}

export function listGames(): GameAdapter[] {
  return [...registry.values()].sort((a, b) =>
    a.manifest.title.localeCompare(b.manifest.title),
  )
}
