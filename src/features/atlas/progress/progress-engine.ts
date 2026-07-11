import type { ContentPack, ProgressState } from '../model/schema'

export interface StoredProgress {
  completed: string[]
  choices: Record<string, string>
  current?: string
}

export interface DerivedProgress {
  states: Record<string, ProgressState>
  completedCount: number
  totalCount: number
}

export function deriveProgress(
  pack: ContentPack,
  stored: StoredProgress,
): DerivedProgress {
  const completed = new Set(stored.completed)
  const states: Record<string, ProgressState> = {}

  for (const step of pack.steps) {
    if (completed.has(step.id)) {
      states[step.id] = 'completed'
      continue
    }

    const choiceEdges = pack.edges.filter(
      (edge) => edge.to === step.id && edge.kind === 'choice',
    )
    const excluded = choiceEdges.some((edge) => {
      const selected = edge.choiceGroup
        ? stored.choices[edge.choiceGroup]
        : undefined
      return selected !== undefined && selected !== step.id
    })
    if (excluded) {
      states[step.id] = 'excluded'
      continue
    }

    const required = pack.edges.filter(
      (edge) => edge.to === step.id && edge.kind === 'required',
    )
    const optional = pack.edges.filter(
      (edge) => edge.to === step.id && edge.kind === 'optional',
    )
    const requiredMet = required.every((edge) => completed.has(edge.from))
    const choiceAvailable = choiceEdges.some((edge) =>
      completed.has(edge.from),
    )
    const optionalAvailable = optional.some((edge) =>
      completed.has(edge.from),
    )
    const isRoot =
      required.length === 0 &&
      choiceEdges.length === 0 &&
      optional.length === 0

    states[step.id] =
      requiredMet &&
      (isRoot ||
        required.length > 0 ||
        choiceAvailable ||
        optionalAvailable)
        ? 'available'
        : 'locked'
  }

  if (stored.current && states[stored.current] === 'available') {
    states[stored.current] = 'current'
  }

  const completedCount = pack.steps.filter((step) =>
    completed.has(step.id),
  ).length
  return { states, completedCount, totalCount: pack.steps.length }
}

export function completeStep(
  pack: ContentPack,
  stored: StoredProgress,
  stepId: string,
): StoredProgress {
  if (!pack.steps.some((step) => step.id === stepId)) {
    throw new Error(`Unknown step: ${stepId}`)
  }

  const state = deriveProgress(pack, stored).states[stepId]
  if (state !== 'available' && state !== 'current') {
    throw new Error(`Cannot complete ${state} step: ${stepId}`)
  }

  const completed = Array.from(new Set([...stored.completed, stepId]))
  const choices = { ...stored.choices }
  for (const edge of pack.edges) {
    if (
      edge.kind === 'choice' &&
      edge.to === stepId &&
      edge.choiceGroup
    ) {
      choices[edge.choiceGroup] = stepId
    }
  }

  return { ...stored, completed, choices }
}

export function chooseBranch(
  pack: ContentPack,
  stored: StoredProgress,
  choiceGroup: string,
  stepId: string,
): StoredProgress {
  const valid = pack.edges.some(
    (edge) =>
      edge.kind === 'choice' &&
      edge.choiceGroup === choiceGroup &&
      edge.to === stepId,
  )
  if (!valid) throw new Error(`Invalid choice ${stepId} for ${choiceGroup}`)

  const state = deriveProgress(pack, stored).states[stepId]
  if (state !== 'available' && state !== 'current') {
    throw new Error(`Cannot choose ${state} branch: ${stepId}`)
  }

  return {
    ...stored,
    choices: { ...stored.choices, [choiceGroup]: stepId },
  }
}
