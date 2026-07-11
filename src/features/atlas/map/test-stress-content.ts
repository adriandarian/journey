import type { ContentPack } from '../model/schema'

export function withDevelopmentStressPois(pack: ContentPack): ContentPack {
  if (!import.meta.env.DEV || typeof localStorage === 'undefined') return pack

  const count = Number(localStorage.getItem('atlas:e2e-poi-count') ?? 0)
  if (
    !Number.isInteger(count) ||
    count <= pack.discoveries.length ||
    pack.discoveries.length === 0
  ) {
    return pack
  }
  const base = pack.discoveries[0]

  return {
    ...pack,
    discoveries: Array.from({ length: count }, (_, index) => ({
      ...base,
      id: `e2e-stress-poi-${index}`,
      title: `Stress point ${index + 1}`,
      kind: 'lore' as const,
    })),
  }
}
