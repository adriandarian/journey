import { z } from 'zod'

export const normalizedPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})

export const sourceRecordSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    'manually-observed',
    'user-authored',
    'licensed',
    'official-reference',
    'inferred',
  ]),
  reference: z.string().min(1),
  contributor: z.string().min(1),
  verifiedAt: z.iso.date(),
  confidence: z.enum(['exact', 'approximate', 'schematic', 'unverified']),
  permission: z.string().min(1),
  contentVersion: z.number().int().positive(),
})

export const dependencyKindSchema = z.enum([
  'required',
  'optional',
  'choice',
  'unlocks',
  'rejoins',
  'context',
])

export const progressStateSchema = z.enum([
  'unseen',
  'discovered',
  'available',
  'current',
  'completed',
  'locked',
  'missed',
  'excluded',
])

export const contentPackSchema = z.object({
  manifest: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    version: z.number().int().positive(),
    adapterVersion: z.number().int().positive(),
    capabilities: z.array(
      z.enum(['worlds', 'layers', 'regions', 'threads', 'discoveries']),
    ),
    theme: z.object({
      primary: z.string().min(1),
      branch: z.string().min(1),
    }),
    attribution: z.string().min(1),
    disclaimer: z.string().min(1),
  }),
  worlds: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        sourceId: z.string().min(1),
      }),
    )
    .min(1),
  maps: z
    .array(
      z.object({
        id: z.string().min(1),
        worldId: z.string().min(1),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        imageUrl: z.string().min(1),
        coordinateSystem: z.literal('normalized-image'),
        tileManifestUrl: z.string().min(1),
        layerIds: z.array(z.string()).min(1),
        sourceId: z.string().min(1),
      }),
    )
    .min(1),
  regions: z.array(
    z.object({
      id: z.string().min(1),
      worldId: z.string().min(1),
      mapId: z.string().min(1),
      title: z.string().min(1),
      bounds: z.array(normalizedPointSchema).min(3).optional(),
      sourceId: z.string().min(1),
    }),
  ),
  layers: z
    .array(
      z.object({
        id: z.string().min(1),
        mapId: z.string().min(1),
        title: z.string().min(1),
        kind: z.enum(['surface', 'underground', 'interior', 'dream', 'other']),
        sourceId: z.string().min(1),
      }),
    )
    .min(1),
  locations: z.array(
    z.object({
      id: z.string().min(1),
      mapId: z.string().min(1),
      label: z.string().optional(),
      point: normalizedPointSchema,
      sourceId: z.string().min(1),
    }),
  ),
  threads: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      kind: z.enum(['main', 'side', 'wandering', 'character', 'faction', 'event']),
      stepIds: z.array(z.string()),
      sourceId: z.string().min(1),
    }),
  ),
  quests: z.array(
    z.object({
      id: z.string().min(1),
      threadId: z.string().min(1),
      title: z.string().min(1),
      stepIds: z.array(z.string()).min(1),
      sourceId: z.string().min(1),
    }),
  ),
  steps: z.array(
    z.object({
      id: z.string().min(1),
      threadId: z.string().min(1),
      title: z.string().min(1),
      summary: z.string().min(1),
      locationId: z.string().optional(),
      rewardIds: z.array(z.string()).default([]),
      sourceId: z.string().min(1),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string().min(1),
      from: z.string().min(1),
      to: z.string().min(1),
      kind: dependencyKindSchema,
      route: z.array(normalizedPointSchema).optional(),
      choiceGroup: z.string().optional(),
      sourceId: z.string().min(1),
    }),
  ),
  discoveries: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      kind: z.enum([
        'lore',
        'secret',
        'loot',
        'puzzle',
        'boss',
        'merchant',
        'abode',
        'event',
      ]),
      locationId: z.string().min(1),
      relevantStepIds: z.array(z.string()),
      sourceId: z.string().min(1),
    }),
  ),
  rewards: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        kind: z.enum([
          'item',
          'currency',
          'ability',
          'unlock',
          'reputation',
          'outcome',
        ]),
        sourceId: z.string().min(1),
      }),
    )
    .default([]),
  sources: z.array(sourceRecordSchema).min(1),
})

export type ContentPack = z.infer<typeof contentPackSchema>
export type QuestStep = ContentPack['steps'][number]
export type DependencyEdge = ContentPack['edges'][number]
export type ProgressState = z.infer<typeof progressStateSchema>
export type SourceRecord = z.infer<typeof sourceRecordSchema>

export function parseContentPack(input: unknown): ContentPack {
  return contentPackSchema.parse(input)
}
