import { z } from 'zod'

export const DEFAULT_FILTERS = [
  'objectives',
  'lore',
  'loot',
  'event',
  'secret',
]

const schema = z.object({
  mode: z.enum(['map', 'thread', 'timeline']).catch('map'),
  world: z.string().catch('qinghe'),
  layer: z.string().catch('surface'),
  region: z.string().catch('qinghe'),
  thread: z.string().optional(),
  step: z.string().optional(),
  discovery: z.string().optional(),
  location: z.string().optional(),
  filters: z.array(z.string()).catch(DEFAULT_FILTERS),
  cx: z.coerce.number().catch(0.5),
  cy: z.coerce.number().catch(0.5),
  zoom: z.coerce.number().catch(1),
})

export type WorkspaceSearch = z.infer<typeof schema>

export function normalizeWorkspaceSearch(input: unknown): WorkspaceSearch {
  const value = schema.parse(input)
  const clamp = (number: number, min: number, max: number) =>
    Math.min(max, Math.max(min, number))

  return {
    ...value,
    cx: Number(clamp(value.cx, 0, 1).toFixed(4)),
    cy: Number(clamp(value.cy, 0, 1).toFixed(4)),
    zoom: Number(clamp(value.zoom, 0.5, 8).toFixed(2)),
  }
}
