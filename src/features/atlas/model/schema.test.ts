import { describe, expect, it } from 'vitest'
import { parseContentPack } from './schema'

describe('parseContentPack', () => {
  it('rejects out-of-bounds normalized coordinates', () => {
    expect(() =>
      parseContentPack({
        manifest: {
          id: 'wwm',
          slug: 'where-winds-meet',
          title: 'Where Winds Meet',
          version: 1,
          adapterVersion: 1,
          capabilities: ['worlds', 'layers'],
          theme: { primary: '#65c5a8', branch: '#d86c4a' },
          attribution: 'Original schematic content',
          disclaimer: 'Unofficial companion',
        },
        worlds: [{ id: 'qinghe', title: 'Qinghe', sourceId: 'source-1' }],
        maps: [
          {
            id: 'qinghe',
            worldId: 'qinghe',
            width: 3840,
            height: 2160,
            imageUrl: '/map.webp',
            coordinateSystem: 'normalized-image',
            tileManifestUrl: '/tiles.json',
            layerIds: ['surface'],
            sourceId: 'source-1',
          },
        ],
        regions: [],
        layers: [
          {
            id: 'surface',
            mapId: 'qinghe',
            title: 'Surface',
            kind: 'surface',
            sourceId: 'source-1',
          },
        ],
        locations: [
          {
            id: 'ferry',
            mapId: 'qinghe',
            point: { x: 1.2, y: 0.5 },
            sourceId: 'source-1',
          },
        ],
        threads: [],
        quests: [],
        steps: [],
        edges: [],
        discoveries: [],
        sources: [
          {
            id: 'source-1',
            kind: 'user-authored',
            reference: 'Schema test fixture',
            contributor: 'Tests',
            confidence: 'schematic',
            verifiedAt: '2026-07-11',
            permission: 'Original fixture',
            contentVersion: 1,
          },
        ],
      }),
    ).toThrow()
  })
})
