import type { TraceNode } from '../map/trace-model'

export function NarrativeTimeline(props: {
  nodes: TraceNode[]
  branchKinds: Map<string, 'choice' | 'optional'>
  selectedStepId?: string
  onSelect: (stepId: string) => void
}) {
  return (
    <ol className="timeline-list" aria-label="Narrative timeline">
      {props.nodes.map((node) => {
        const branchKind = props.branchKinds.get(node.id)
        const selected = props.selectedStepId === node.id
        return (
          <li key={node.id} className="timeline-item">
            <button
              type="button"
              aria-current={selected ? 'step' : undefined}
              aria-label={`${node.title}, ${branchKind ? `${branchKind}, ` : ''}${node.state}`}
              onClick={() => props.onSelect(node.id)}
              className="min-h-12 border-l-2 border-border px-4 py-3 text-left data-[selected=true]:border-primary"
              data-selected={selected}
            >
              <span aria-hidden="true">
                {branchKind === 'choice'
                  ? '◇'
                  : branchKind === 'optional'
                    ? '△'
                    : node.state === 'completed'
                      ? '✓'
                      : node.order}
              </span>
              <strong className="ml-2">{node.title}</strong>
              <span className="ml-2 text-muted-foreground">
                {branchKind === 'choice'
                  ? 'Choice · '
                  : branchKind === 'optional'
                    ? 'Optional · '
                    : ''}
                {node.state}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
