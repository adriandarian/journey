import { useEffect, useMemo, useRef, useState } from 'react'
import { MapOverlay } from './map-overlay'
import type { Point2 } from '../model/coordinates'
import type { ContentPack } from '../model/schema'
import type { AtlasEntity } from '../state/atlas-selection'
import type { TraceModel } from './trace-model'
import type {
  ProjectedTraceNode,
  SceneController,
} from './three/scene-controller'

export interface MapViewportProps {
  pack: ContentPack
  trace: TraceModel
  selectedStepId?: string
  selectedDiscoveryId?: string
  selectedLocationId?: string
  motionPreference: 'system' | 'reduced'
  filters: string[]
  camera: { center: Point2; zoom: number }
  onSelect: (entity: AtlasEntity) => void
  onCameraChange: (camera: { center: Point2; zoom: number }) => void
}

export function MapViewport(props: MapViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controllerRef = useRef<SceneController | undefined>(undefined)
  const onSelectRef = useRef(props.onSelect)
  const onCameraChangeRef = useRef(props.onCameraChange)
  const [ready, setReady] = useState(false)
  const [lost, setLost] = useState(false)
  const [paused, setPaused] = useState(false)
  const [systemReducedMotion, setSystemReducedMotion] = useState(false)
  const [projectedNodes, setProjectedNodes] = useState<ProjectedTraceNode[]>([])
  const map = props.pack.maps[0]
  const reducedMotion =
    props.motionPreference === 'reduced' || systemReducedMotion
  const serializedFilters = props.filters.join('|')

  onSelectRef.current = props.onSelect
  onCameraChangeRef.current = props.onCameraChange

  const selection = useMemo<AtlasEntity | undefined>(() => {
    if (props.selectedStepId) {
      return { kind: 'step', id: props.selectedStepId }
    }
    if (props.selectedDiscoveryId) {
      return { kind: 'discovery', id: props.selectedDiscoveryId }
    }
    if (props.selectedLocationId) {
      return { kind: 'location', id: props.selectedLocationId }
    }
    return undefined
  }, [
    props.selectedDiscoveryId,
    props.selectedLocationId,
    props.selectedStepId,
  ])

  const screenNodes = useMemo(() => {
    const projectionById = new Map(
      projectedNodes.map((node) => [node.id, node]),
    )
    const branchKinds = new Map<string, 'choice' | 'optional'>()
    for (const segment of props.trace.segments) {
      if (segment.kind === 'choice' || segment.kind === 'optional') {
        branchKinds.set(segment.to.id, segment.kind)
      }
    }
    return props.trace.nodes.flatMap((node) => {
      const screen = projectionById.get(node.id)
      return screen
        ? [{ node, screen, branchKind: branchKinds.get(node.id) }]
        : []
    })
  }, [projectedNodes, props.trace])

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const update = () => setPaused(document.visibilityState === 'hidden')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    const lifecycle = new AbortController()
    let cleanup = () => {}

    void import('./three/scene-controller')
      .then(async ({ createSceneController }) => {
        if (!canvasRef.current || lifecycle.signal.aborted) return
        const controller = await createSceneController({
          canvas: canvasRef.current,
          imageUrl: map.imageUrl,
          sourceWidth: map.width,
          sourceHeight: map.height,
          pack: props.pack,
          traceModel: props.trace,
          filters: props.filters,
          initialCamera: props.camera,
          reducedMotion,
          onReady: () => setReady(true),
          onContextLost: () => setLost(true),
          onSelect: (entity) => onSelectRef.current(entity),
          onCameraChange: (camera) => onCameraChangeRef.current(camera),
          onProjectionChange: setProjectedNodes,
        })
        // Effect cleanup can abort while scene creation awaits texture loading.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (lifecycle.signal.aborted) {
          controller.dispose()
          return
        }
        controllerRef.current = controller
        controller.setSelected(selection)
        controller.setPaused(paused)
        cleanup = () => {
          controllerRef.current = undefined
          controller.dispose()
        }
      })
      .catch(() => setLost(true))

    return () => {
      lifecycle.abort()
      cleanup()
    }
  }, [map.height, map.imageUrl, map.width, props.pack])

  useEffect(() => {
    controllerRef.current?.updateTrace(props.trace)
  }, [props.trace])

  useEffect(() => {
    controllerRef.current?.updateFilters(props.filters)
  }, [serializedFilters])

  useEffect(() => {
    controllerRef.current?.setSelected(selection)
  }, [selection])

  useEffect(() => {
    controllerRef.current?.setCamera(props.camera)
  }, [props.camera])

  useEffect(() => {
    controllerRef.current?.setReducedMotion(reducedMotion)
  }, [reducedMotion])

  useEffect(() => {
    controllerRef.current?.setPaused(paused)
  }, [paused])

  return (
    <section
      data-testid="map-viewport"
      data-render-ready={ready}
      data-context-lost={lost}
      data-motion={reducedMotion ? 'reduced' : 'full'}
      data-scene-paused={paused}
      aria-label={`Interactive map for ${props.pack.manifest.title}`}
      aria-describedby="map-instructions"
      className="relative size-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        data-renderer="three"
        aria-hidden="true"
        className="size-full touch-none"
      />
      <MapOverlay
        trace={props.trace}
        screenNodes={screenNodes}
        selectedStepId={props.selectedStepId}
        onSelect={(stepId) => props.onSelect({ kind: 'step', id: stepId })}
      />
      <p id="map-instructions" className="sr-only">
        Drag to pan, use the wheel or a pinch gesture to zoom, and activate a
        numbered story step to inspect it.
      </p>
    </section>
  )
}
