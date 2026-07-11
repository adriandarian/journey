import { extent } from 'd3-array'
import type {
  ContentPack,
  DependencyEdge,
  ProgressState,
} from '../model/schema'
import type { DerivedProgress } from '../progress/progress-engine'

export interface TraceNode {
  id: string
  title: string
  order: number
  point: { x: number; y: number }
  state: ProgressState
}

export interface TraceSegment {
  id: string
  from: TraceNode
  to: TraceNode
  kind: DependencyEdge['kind']
  points: Array<{ x: number; y: number }>
}

export interface TraceModel {
  nodes: TraceNode[]
  segments: TraceSegment[]
}

export function buildTraceModel(
  pack: ContentPack,
  progress: DerivedProgress,
  threadId: string,
): TraceModel {
  const thread = pack.threads.find((item) => item.id === threadId)
  if (!thread) return { nodes: [], segments: [] }

  const locations = new Map(
    pack.locations.map((location) => [location.id, location]),
  )
  const steps = new Map(pack.steps.map((step) => [step.id, step]))
  const nodes = thread.stepIds.flatMap((id, index) => {
    const step = steps.get(id)
    const location = step?.locationId
      ? locations.get(step.locationId)
      : undefined
    return step && location
      ? [
          {
            id,
            title: step.title,
            order: index + 1,
            point: location.point,
            state: progress.states[id],
          },
        ]
      : []
  })
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const segments = pack.edges.flatMap((edge) => {
    const from = nodeById.get(edge.from)
    const to = nodeById.get(edge.to)
    if (!from || !to || edge.kind === 'context' || edge.kind === 'unlocks') {
      return []
    }
    return [
      {
        id: edge.id,
        from,
        to,
        kind: edge.kind,
        points: edge.route ?? [from.point, to.point],
      },
    ]
  })

  return { nodes, segments }
}

export function traceExtent(model: TraceModel) {
  const x = extent(model.nodes, (node) => node.point.x)
  const y = extent(model.nodes, (node) => node.point.y)
  return x[0] === undefined || y[0] === undefined
    ? undefined
    : { minX: x[0], maxX: x[1], minY: y[0], maxY: y[1] }
}
