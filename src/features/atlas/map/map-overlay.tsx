import { cn } from '@/lib/utils'
import type { Point2 } from '../model/coordinates'
import type { TraceModel, TraceNode } from './trace-model'

export interface ScreenTraceNode {
  node: TraceNode
  screen: Point2
  branchKind?: 'choice' | 'optional'
}

export function MapOverlay(props: {
  trace: TraceModel
  screenNodes: ScreenTraceNode[]
  selectedStepId?: string
  onSelect: (stepId: string) => void
}) {
  const selected = props.trace.nodes.find(
    (node) => node.id === props.selectedStepId,
  )

  return (
    <div className="pointer-events-none absolute inset-0">
      {props.screenNodes.map(({ node, screen, branchKind }) => (
        <button
          key={node.id}
          type="button"
          aria-label={`${node.order}. ${node.title}, ${branchKind ? `${branchKind}, ` : ''}${node.state}`}
          aria-current={node.id === props.selectedStepId ? 'step' : undefined}
          data-state={node.state}
          data-branch={branchKind}
          onClick={() => props.onSelect(node.id)}
          className={cn(
            'pointer-events-auto absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center',
            branchKind === 'choice' && 'rotate-45',
          )}
          style={{ left: screen.x, top: screen.y }}
        >
          <span
            className={cn(
              'grid size-8 place-items-center rounded-full border bg-card/90 text-xs shadow-md',
              node.state === 'completed' &&
                'border-primary bg-primary/20 text-primary',
              (node.state === 'available' || node.state === 'current') &&
                'border-primary text-primary',
              (node.state === 'locked' || node.state === 'excluded') &&
                'border-border text-muted-foreground',
              branchKind === 'optional' &&
                'rounded-sm border-[#c8a96b] text-[#c8a96b]',
              branchKind === 'choice' &&
                '-rotate-45 rounded-sm border-accent text-accent',
            )}
          >
            {node.state === 'completed'
              ? '✓'
              : node.state === 'excluded'
                ? '×'
                : node.order}
          </span>
        </button>
      ))}
      {selected ? (
        <div className="absolute bottom-4 left-4 border border-border bg-card/95 px-3 py-2">
          <strong>
            {selected.order}. {selected.title}
          </strong>
          <span className="ml-2 text-muted-foreground">{selected.state}</span>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {props.trace.nodes.length} story steps. Selected{' '}
        {selected?.title ?? 'none'}.
      </p>
    </div>
  )
}
