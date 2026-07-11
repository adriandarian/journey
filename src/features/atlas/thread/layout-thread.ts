import ELK from 'elkjs/lib/elk.bundled.js'
import type { ElkNode } from 'elkjs/lib/elk-api'

export interface ThreadLayoutInput {
  nodes: Array<{ id: string; width: number; height: number }>
  edges: Array<{ id: string; from: string; to: string; kind: string }>
}

export async function layoutThread(
  input: ThreadLayoutInput,
  direction: 'RIGHT' | 'DOWN',
) {
  const elk = new ELK()
  const inputGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.layered.spacing.nodeNodeBetweenLayers': '56',
      'elk.spacing.nodeNode': '28',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.edgeRouting': 'ORTHOGONAL',
    },
    children: input.nodes,
    edges: input.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.from],
      targets: [edge.to],
      labels: [{ text: edge.kind, width: 48, height: 18 }],
    })),
  }
  const graph = await elk.layout(inputGraph)

  return {
    width: graph.width ?? 0,
    height: graph.height ?? 0,
    nodes: graph.children ?? [],
    edges: graph.edges ?? [],
  }
}
