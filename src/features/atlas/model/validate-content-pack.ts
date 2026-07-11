import type { ContentPack } from './schema'

export interface ValidationReport {
  errors: string[]
  warnings: string[]
}

export function validateContentPack(pack: ContentPack): ValidationReport {
  const errors: string[] = []
  const warnings: string[] = []
  const stepIds = new Set(pack.steps.map((step) => step.id))
  const sourceIds = new Set(pack.sources.map((source) => source.id))
  const mapIds = new Set(pack.maps.map((map) => map.id))
  const worldIds = new Set(pack.worlds.map((world) => world.id))
  const layerIds = new Set(pack.layers.map((layer) => layer.id))
  const locationIds = new Set(pack.locations.map((location) => location.id))
  const threadIds = new Set(pack.threads.map((thread) => thread.id))
  const rewardIds = new Set(pack.rewards.map((reward) => reward.id))

  function reportDuplicates(label: string, values: string[]) {
    const seen = new Set<string>()
    for (const value of values) {
      if (seen.has(value)) errors.push(`Duplicate ${label} id: ${value}`)
      seen.add(value)
    }
  }

  reportDuplicates('step', pack.steps.map((item) => item.id))
  reportDuplicates('edge', pack.edges.map((item) => item.id))
  reportDuplicates('location', pack.locations.map((item) => item.id))
  reportDuplicates('discovery', pack.discoveries.map((item) => item.id))
  reportDuplicates('world', pack.worlds.map((item) => item.id))
  reportDuplicates('map', pack.maps.map((item) => item.id))
  reportDuplicates('layer', pack.layers.map((item) => item.id))
  reportDuplicates('region', pack.regions.map((item) => item.id))
  reportDuplicates('thread', pack.threads.map((item) => item.id))
  reportDuplicates('quest', pack.quests.map((item) => item.id))
  reportDuplicates('reward', pack.rewards.map((item) => item.id))
  reportDuplicates('source', pack.sources.map((item) => item.id))

  for (const world of pack.worlds) {
    if (!sourceIds.has(world.sourceId)) {
      errors.push(`Unknown source ${world.sourceId} for world ${world.id}`)
    }
  }

  for (const map of pack.maps) {
    if (!worldIds.has(map.worldId)) {
      errors.push(`Unknown world ${map.worldId} for map ${map.id}`)
    }
    if (!sourceIds.has(map.sourceId)) {
      errors.push(`Unknown source ${map.sourceId} for map ${map.id}`)
    }
    for (const layerId of map.layerIds) {
      if (!layerIds.has(layerId)) {
        errors.push(`Unknown layer ${layerId} for map ${map.id}`)
      }
    }
  }

  for (const layer of pack.layers) {
    if (!mapIds.has(layer.mapId)) {
      errors.push(`Unknown map ${layer.mapId} for layer ${layer.id}`)
    }
    if (!sourceIds.has(layer.sourceId)) {
      errors.push(`Unknown source ${layer.sourceId} for layer ${layer.id}`)
    }
  }

  for (const region of pack.regions) {
    if (!worldIds.has(region.worldId)) {
      errors.push(`Unknown world ${region.worldId} for region ${region.id}`)
    }
    if (!mapIds.has(region.mapId)) {
      errors.push(`Unknown map ${region.mapId} for region ${region.id}`)
    }
    if (!sourceIds.has(region.sourceId)) {
      errors.push(`Unknown source ${region.sourceId} for region ${region.id}`)
    }
  }

  for (const location of pack.locations) {
    if (!mapIds.has(location.mapId)) {
      errors.push(`Unknown map ${location.mapId} for location ${location.id}`)
    }
    if (!sourceIds.has(location.sourceId)) {
      errors.push(`Unknown source ${location.sourceId} for location ${location.id}`)
    }
  }

  for (const step of pack.steps) {
    if (!sourceIds.has(step.sourceId)) {
      errors.push(`Unknown source ${step.sourceId} for step ${step.id}`)
    }
    if (!threadIds.has(step.threadId)) {
      errors.push(`Unknown thread ${step.threadId} for step ${step.id}`)
    }
    if (step.locationId && !locationIds.has(step.locationId)) {
      errors.push(`Unknown location ${step.locationId} for step ${step.id}`)
    }
    for (const rewardId of step.rewardIds) {
      if (!rewardIds.has(rewardId)) {
        errors.push(`Unknown reward ${rewardId} for step ${step.id}`)
      }
    }
  }

  for (const thread of pack.threads) {
    if (!sourceIds.has(thread.sourceId)) {
      errors.push(`Unknown source ${thread.sourceId} for thread ${thread.id}`)
    }
    for (const stepId of thread.stepIds) {
      if (!stepIds.has(stepId)) {
        errors.push(`Unknown step ${stepId} in thread ${thread.id}`)
      }
    }
  }

  for (const quest of pack.quests) {
    if (!threadIds.has(quest.threadId)) {
      errors.push(`Unknown thread ${quest.threadId} for quest ${quest.id}`)
    }
    if (!sourceIds.has(quest.sourceId)) {
      errors.push(`Unknown source ${quest.sourceId} for quest ${quest.id}`)
    }
    for (const stepId of quest.stepIds) {
      if (!stepIds.has(stepId)) {
        errors.push(`Unknown step ${stepId} for quest ${quest.id}`)
      }
    }
  }

  for (const edge of pack.edges) {
    if (!stepIds.has(edge.from) || !stepIds.has(edge.to)) {
      errors.push(`Unknown step reference in edge ${edge.id}`)
    }
    if (!sourceIds.has(edge.sourceId)) {
      errors.push(`Unknown source ${edge.sourceId} for edge ${edge.id}`)
    }
    if (edge.kind === 'choice' && !edge.choiceGroup) {
      errors.push(`Choice edge requires choiceGroup: ${edge.id}`)
    }
  }

  const choiceGroups = new Map<string, number>()
  for (const edge of pack.edges) {
    if (edge.kind === 'choice' && edge.choiceGroup) {
      choiceGroups.set(
        edge.choiceGroup,
        (choiceGroups.get(edge.choiceGroup) ?? 0) + 1,
      )
    }
  }
  for (const [group, count] of choiceGroups) {
    if (count < 2) {
      errors.push(`Choice group requires at least two branches: ${group}`)
    }
  }

  for (const discovery of pack.discoveries) {
    if (!locationIds.has(discovery.locationId)) {
      errors.push(
        `Unknown location ${discovery.locationId} for discovery ${discovery.id}`,
      )
    }
    if (!sourceIds.has(discovery.sourceId)) {
      errors.push(
        `Unknown source ${discovery.sourceId} for discovery ${discovery.id}`,
      )
    }
    for (const stepId of discovery.relevantStepIds) {
      if (!stepIds.has(stepId)) {
        errors.push(`Unknown step ${stepId} for discovery ${discovery.id}`)
      }
    }
  }

  for (const reward of pack.rewards) {
    if (!sourceIds.has(reward.sourceId)) {
      errors.push(`Unknown source ${reward.sourceId} for reward ${reward.id}`)
    }
  }

  const requiredEdges = pack.edges.filter((edge) => edge.kind === 'required')
  const outgoing = new Map<string, string[]>()
  for (const edge of requiredEdges) {
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to])
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const path: string[] = []

  function visit(id: string): void {
    if (visiting.has(id)) {
      const start = path.indexOf(id)
      errors.push(
        `Required progression contains a cycle: ${[
          ...path.slice(start),
          id,
        ].join(' -> ')}`,
      )
      return
    }
    if (visited.has(id)) return

    visiting.add(id)
    path.push(id)
    for (const next of outgoing.get(id) ?? []) visit(next)
    path.pop()
    visiting.delete(id)
    visited.add(id)
  }

  for (const step of pack.steps) visit(step.id)

  return { errors, warnings }
}
