import { line } from 'd3-shape'
import { animate, stagger } from 'animejs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { layoutThread } from './layout-thread'
import type { TraceModel } from '../map/trace-model'

export interface ThreadGraphProps {
  model: TraceModel
  selectedStepId?: string
  direction: 'RIGHT' | 'DOWN'
  motionPreference: 'system' | 'reduced'
  onSelect: (stepId: string) => void
}

export function ThreadGraph({
  model,
  selectedStepId,
  direction,
  motionPreference,
  onSelect,
}: ThreadGraphProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [layout, setLayout] =
    useState<Awaited<ReturnType<typeof layoutThread>>>()
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    void layoutThread(
      {
        nodes: model.nodes.map((node) => ({
          id: node.id,
          width: 180,
          height: 56,
        })),
        edges: model.segments.map((segment) => ({
          id: segment.id,
          from: segment.from.id,
          to: segment.to.id,
          kind: segment.kind,
        })),
      },
      direction,
    ).then((value) => {
      if (active) setLayout(value)
    })
    return () => {
      active = false
    }
  }, [direction, model, revision])

  useEffect(() => {
    if (!layout || !svgRef.current) return
    const targets = svgRef.current.querySelectorAll('.thread-animate')
    const reduced =
      motionPreference === 'reduced' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      targets.forEach((target) => {
        ;(target as SVGElement).style.opacity = '1'
      })
      return
    }
    const animation = animate(targets, {
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 300,
      delay: stagger(14),
      ease: 'out(3)',
    })
    return () => {
      animation.cancel()
    }
  }, [layout, motionPreference])

  if (!layout) return <p role="status">Laying out story thread…</p>

  const byId = new Map(model.nodes.map((node) => [node.id, node]))

  return (
    <section
      ref={sectionRef}
      className="size-full overflow-auto"
      aria-label="Story thread"
    >
      <div className="sticky top-0 left-0 flex gap-2 p-2">
        <Button
          variant="outline"
          onClick={() => setRevision((value) => value + 1)}
        >
          Reset graph
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const selected = selectedStepId
              ? sectionRef.current?.querySelector<HTMLButtonElement>(
                  `[data-step-id="${CSS.escape(selectedStepId)}"]`,
                )
              : undefined
            selected?.scrollIntoView({ block: 'center', inline: 'center' })
            selected?.focus()
          }}
          disabled={!selectedStepId}
        >
          Focus selected
        </Button>
      </div>
      <svg
        ref={svgRef}
        width={layout.width}
        height={layout.height}
        role="group"
        aria-label="Quest dependency graph"
      >
        {layout.edges.map((edge) => {
          const section = edge.sections?.[0]
          if (!section) return null
          const points = [
            section.startPoint,
            ...(section.bendPoints ?? []),
            section.endPoint,
          ]
          const kind = edge.labels?.[0]?.text ?? 'required'
          const path = line<{ x: number; y: number }>()
            .x((point) => point.x)
            .y((point) => point.y)(points)
          return (
            <path
              key={edge.id}
              className="thread-animate"
              d={path ?? undefined}
              fill="none"
              stroke={
                kind === 'choice'
                  ? '#d86c4a'
                  : kind === 'optional' || kind === 'rejoins'
                    ? '#c8a96b'
                    : '#65c5a8'
              }
              strokeDasharray={
                kind === 'optional' || kind === 'rejoins' ? '6 6' : undefined
              }
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        {layout.nodes.map((node) => {
          const traceNode = byId.get(node.id)
          if (!traceNode) return null
          const selected = traceNode.id === selectedStepId
          return (
            <foreignObject
              key={node.id}
              className="thread-animate"
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
            >
              <button
                type="button"
                aria-current={selected ? 'step' : undefined}
                aria-label={`${traceNode.title}, ${traceNode.state}`}
                data-step-id={traceNode.id}
                onClick={() => onSelect(traceNode.id)}
                className="size-full border border-border bg-card px-3 text-left text-sm data-[selected=true]:border-primary"
                data-selected={selected}
              >
                <strong>
                  {traceNode.order}. {traceNode.title}
                </strong>
                <span className="block text-muted-foreground">
                  {traceNode.state}
                </span>
              </button>
            </foreignObject>
          )
        })}
      </svg>
    </section>
  )
}
