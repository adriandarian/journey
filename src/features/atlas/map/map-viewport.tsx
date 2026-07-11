import { useEffect, useMemo, useRef, useState } from 'react'
import { WebglFallbackNotice } from '../components/webgl-fallback-notice'
import { CanvasMap } from './canvas/canvas-map'
import { MapOverlay } from './map-overlay'
import type { Point2 } from '../model/coordinates'
import type { ContentPack } from '../model/schema'
import type { AtlasEntity } from '../state/atlas-selection'
import type { TraceModel } from './trace-model'
import type { CanvasPickItem } from './canvas/canvas-map'
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
  const threeCanvasRef = useRef<HTMLCanvasElement>(null)
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null)
  const controllerRef = useRef<SceneController | undefined>(undefined)
  const onSelectRef = useRef(props.onSelect)
  const onCameraChangeRef = useRef(props.onCameraChange)
  const [ready, setReady] = useState(false)
  const [lost, setLost] = useState(false)
  const [rendererMode, setRendererMode] = useState<'three' | 'canvas'>('three')
  const [paused, setPaused] = useState(false)
  const [visiblePoiCount, setVisiblePoiCount] = useState(0)
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

  const fallbackMarks = useMemo<CanvasPickItem[]>(() => {
    const locations = new Map(
      props.pack.locations.map((location) => [location.id, location]),
    )
    return [
      ...props.trace.nodes.map((node) => ({
        entity: { kind: 'step' as const, id: node.id },
        point: node.point,
      })),
      ...props.pack.discoveries.flatMap((discovery) => {
        if (!props.filters.includes(discovery.kind)) return []
        const location = locations.get(discovery.locationId)
        return location
          ? [
              {
                entity: { kind: 'discovery' as const, id: discovery.id },
                point: location.point,
              },
            ]
          : []
      }),
      ...props.pack.locations.map((location) => ({
        entity: { kind: 'location' as const, id: location.id },
        point: location.point,
      })),
    ]
  }, [props.filters, props.pack.discoveries, props.pack.locations, props.trace])

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
    if (!props.filters.includes('objectives')) return []
    const selectedOrder =
      props.trace.nodes.find((node) => node.id === props.selectedStepId)
        ?.order ?? 1
    const lowerOrder = Math.max(1, selectedOrder - 5)
    const upperOrder = Math.max(7, selectedOrder + 2)
    return props.trace.nodes.flatMap((node) => {
      if (node.order < lowerOrder || node.order > upperOrder) return []
      const screen = projectionById.get(node.id)
      return screen
        ? [{ node, screen, branchKind: branchKinds.get(node.id) }]
        : []
    })
  }, [projectedNodes, props.filters, props.selectedStepId, props.trace])

  function activateFallback() {
    setReady(false)
    setLost(true)
    setRendererMode('canvas')
  }

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
    if (rendererMode !== 'three') return
    const lifecycle = new AbortController()
    let cleanup = () => {}

    void import('./three/scene-controller')
      .then(async ({ createSceneController }) => {
        if (!threeCanvasRef.current || lifecycle.signal.aborted) return
        const controller = await createSceneController({
          canvas: threeCanvasRef.current,
          imageUrl: map.imageUrl,
          sourceWidth: map.width,
          sourceHeight: map.height,
          pack: props.pack,
          traceModel: props.trace,
          filters: props.filters,
          initialCamera: props.camera,
          reducedMotion,
          onReady: () => setReady(true),
          onContextLost: activateFallback,
          onSelect: (entity) => onSelectRef.current(entity),
          onCameraChange: (camera) => onCameraChangeRef.current(camera),
          onProjectionChange: setProjectedNodes,
          onVisiblePoiCount: setVisiblePoiCount,
        })
        // Effect cleanup can abort while scene creation awaits texture loading.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (lifecycle.signal.aborted) {
          controller.dispose()
          return
        }
        controllerRef.current = controller
        controller.setSelected(selection, false)
        controller.setPaused(paused)
        cleanup = () => {
          controllerRef.current = undefined
          controller.dispose()
        }
      })
      .catch(activateFallback)

    return () => {
      lifecycle.abort()
      cleanup()
    }
  }, [map.height, map.imageUrl, map.width, props.pack, rendererMode])

  useEffect(() => {
    if (rendererMode !== 'canvas' || !fallbackCanvasRef.current) return
    const canvas = fallbackCanvasRef.current
    const fallback = new CanvasMap(canvas)
    let disposed = false
    let pointerStart: Point2 | undefined

    const publishProjection = () => {
      setProjectedNodes(
        props.trace.nodes.map((node) => ({
          id: node.id,
          x: node.point.x * canvas.clientWidth,
          y: node.point.y * canvas.clientHeight,
        })),
      )
    }
    const draw = () => {
      fallback.draw(props.trace, props.selectedStepId, fallbackMarks)
      publishProjection()
      setReady(true)
    }
    const pointFor = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    }
    const handlePointerDown = (event: PointerEvent) => {
      pointerStart = pointFor(event)
    }
    const handlePointerUp = (event: PointerEvent) => {
      const point = pointFor(event)
      if (
        !pointerStart ||
        Math.hypot(point.x - pointerStart.x, point.y - pointerStart.y) >= 5
      ) {
        pointerStart = undefined
        return
      }
      pointerStart = undefined
      const radius = matchMedia('(pointer: coarse)').matches ? 24 : 12
      const entity = fallback.hitTest(fallbackMarks, point, radius)
      if (entity) onSelectRef.current(entity)
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointerup', handlePointerUp)
    const resizeObserver = new ResizeObserver(draw)
    resizeObserver.observe(canvas)
    draw()
    void fallback
      .load(map.imageUrl)
      .then(() => {
        if (!disposed) draw()
      })
      .catch(() => {
        if (!disposed) draw()
      })

    return () => {
      disposed = true
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointerup', handlePointerUp)
      fallback.dispose()
    }
  }, [
    fallbackMarks,
    map.imageUrl,
    props.selectedStepId,
    props.trace,
    rendererMode,
  ])

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
      data-visible-pois={visiblePoiCount}
      aria-label={`Interactive map for ${props.pack.manifest.title}`}
      aria-describedby="map-instructions"
      className="relative size-full overflow-hidden"
    >
      {rendererMode === 'three' ? (
        <canvas
          ref={threeCanvasRef}
          data-renderer="three"
          aria-hidden="true"
          className="size-full touch-none"
        />
      ) : (
        <canvas
          ref={fallbackCanvasRef}
          data-testid="canvas-map"
          data-renderer="canvas"
          aria-hidden="true"
          className="size-full touch-none"
        />
      )}
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
      {rendererMode === 'canvas' ? <WebglFallbackNotice /> : null}
    </section>
  )
}
