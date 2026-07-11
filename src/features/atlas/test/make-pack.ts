import { parseContentPack } from '../model/schema'
import type { ContentPack, DependencyEdge } from '../model/schema'

type PackOverrides = Omit<Partial<ContentPack>, 'edges'> & {
  edges?: Array<Omit<DependencyEdge, 'sourceId'> & { sourceId?: string }>
}

export function makePack(overrides: PackOverrides = {}): ContentPack {
  const base: ContentPack = {
    manifest: {
      id: 'test',
      slug: 'test',
      title: 'Test Game',
      version: 1,
      adapterVersion: 1,
      capabilities: ['worlds', 'layers', 'regions', 'threads', 'discoveries'],
      theme: { primary: '#65c5a8', branch: '#d86c4a' },
      attribution: 'Original test fixture',
      disclaimer: 'Test data only',
    },
    worlds: [{ id: 'world', title: 'World', sourceId: 'source' }],
    maps: [
      {
        id: 'map',
        worldId: 'world',
        width: 1000,
        height: 1000,
        imageUrl: '/map.webp',
        coordinateSystem: 'normalized-image',
        tileManifestUrl: '/tiles.json',
        layerIds: ['surface'],
        sourceId: 'source',
      },
    ],
    regions: [
      {
        id: 'region',
        worldId: 'world',
        mapId: 'map',
        title: 'Region',
        sourceId: 'source',
      },
    ],
    layers: [
      {
        id: 'surface',
        mapId: 'map',
        title: 'Surface',
        kind: 'surface',
        sourceId: 'source',
      },
    ],
    locations: [],
    threads: [
      {
        id: 'main',
        title: 'Main',
        kind: 'main',
        stepIds: ['a', 'b'],
        sourceId: 'source',
      },
    ],
    quests: [
      {
        id: 'quest',
        threadId: 'main',
        title: 'Quest',
        stepIds: ['a', 'b'],
        sourceId: 'source',
      },
    ],
    steps: [
      {
        id: 'a',
        threadId: 'main',
        title: 'A',
        summary: 'First',
        rewardIds: [],
        sourceId: 'source',
      },
      {
        id: 'b',
        threadId: 'main',
        title: 'B',
        summary: 'Second',
        rewardIds: [],
        sourceId: 'source',
      },
    ],
    edges: [
      {
        id: 'a-b',
        from: 'a',
        to: 'b',
        kind: 'required',
        sourceId: 'source',
      },
    ],
    discoveries: [],
    rewards: [],
    sources: [
      {
        id: 'source',
        kind: 'user-authored',
        reference: 'Test fixture',
        contributor: 'Tests',
        confidence: 'schematic',
        verifiedAt: '2026-07-11',
        permission: 'Original fixture',
        contentVersion: 1,
      },
    ],
  }

  const edges = (overrides.edges ?? base.edges).map((edge) => ({
    ...edge,
    sourceId: edge.sourceId ?? 'source',
  }))

  return parseContentPack({ ...base, ...overrides, edges })
}
