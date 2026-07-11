import {
  Color,
  OrthographicCamera,
  Scene,
  TOUCH,
  Vector3,
  WebGLRenderer,
} from 'three'
import { MapControls } from 'three/addons/controls/MapControls.js'
import { createMapFrame } from '../../model/coordinates'
import { AtlasPicker } from './picker'
import { createMapSurface } from './map-surface'
import { createPoiLayer } from './poi-layer'
import { createRouteLayer } from './route-layer'
import { TracePlaybackController } from './trace-playback-controller'
import { withDevelopmentStressPois } from '../test-stress-content'
import type { Point2 } from '../../model/coordinates'
import type { ContentPack } from '../../model/schema'
import type { AtlasEntity } from '../../state/atlas-selection'
import type { TraceModel } from '../trace-model'

export interface ProjectedTraceNode {
  id: string
  x: number
  y: number
}

export interface SceneController {
  focus: (point: Point2, zoom?: number) => void
  reset: () => void
  requestRender: () => void
  updateTrace: (trace: TraceModel) => void
  updateFilters: (filters: string[]) => void
  setSelected: (selection?: AtlasEntity, focus?: boolean) => void
  setCamera: (camera: { center: Point2; zoom: number }) => void
  setReducedMotion: (reducedMotion: boolean) => void
  setPaused: (paused: boolean) => void
  dispose: () => void
}

export async function createSceneController(options: {
  canvas: HTMLCanvasElement
  imageUrl: string
  sourceWidth: number
  sourceHeight: number
  pack: ContentPack
  traceModel: TraceModel
  filters: string[]
  initialCamera: { center: Point2; zoom: number }
  reducedMotion: boolean
  onReady: () => void
  onContextLost: () => void
  onSelect: (entity: AtlasEntity) => void
  onCameraChange: (camera: { center: Point2; zoom: number }) => void
  onProjectionChange: (nodes: ProjectedTraceNode[]) => void
  onVisiblePoiCount: (count: number) => void
}): Promise<SceneController> {
  const renderPack = withDevelopmentStressPois(options.pack)
  const frame = createMapFrame({
    sourceWidth: options.sourceWidth,
    sourceHeight: options.sourceHeight,
    worldWidth: 16,
  })
  const contextAttributes: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    depth: true,
    powerPreference: 'high-performance',
  }
  const context =
    options.canvas.getContext('webgl2', contextAttributes) ??
    options.canvas.getContext('webgl', contextAttributes)
  if (!context) throw new Error('WebGL is unavailable')
  const renderer = new WebGLRenderer({
    canvas: options.canvas,
    context,
  })
  renderer.setClearColor(new Color('#071116'))
  renderer.setPixelRatio(
    Math.min(
      devicePixelRatio,
      matchMedia('(max-width: 800px)').matches ? 1.5 : 2,
    ),
  )

  const scene = new Scene()
  const camera = new OrthographicCamera(
    -8,
    8,
    frame.worldHeight / 2,
    -frame.worldHeight / 2,
    0.01,
    100,
  )
  const initialWorld = frame.normalizedToWorld(options.initialCamera.center)
  camera.position.set(initialWorld.x, initialWorld.y, 10)
  camera.zoom = options.initialCamera.zoom

  const controls = new MapControls(camera, options.canvas)
  controls.target.set(initialWorld.x, initialWorld.y, 0)
  controls.enableRotate = false
  controls.screenSpacePanning = true
  controls.minZoom = 0.5
  controls.maxZoom = 8
  controls.touches.ONE = TOUCH.PAN
  controls.touches.TWO = TOUCH.DOLLY_PAN

  const surface = await createMapSurface({
    imageUrl: options.imageUrl,
    worldWidth: frame.worldWidth,
    worldHeight: frame.worldHeight,
  })
  scene.add(surface)

  const routeLayer = createRouteLayer(frame)
  const poiLayer = createPoiLayer(frame)
  scene.add(routeLayer.object, poiLayer.object)
  const picker = new AtlasPicker()
  const playback = new TracePlaybackController()
  const locations = new Map(
    renderPack.locations.map((location) => [location.id, location]),
  )
  const steps = new Map(renderPack.steps.map((step) => [step.id, step]))
  const discoveries = new Map(
    renderPack.discoveries.map((discovery) => [discovery.id, discovery]),
  )

  let trace = options.traceModel
  let filters = [...options.filters]
  let selectedKey: string | undefined
  let queued = false
  let firstFrame = true
  let disposed = false
  let paused = false
  let reducedMotion = options.reducedMotion
  let pointerStart: Point2 | undefined
  let lastZoomBucket = camera.zoom < 1.25 ? 'clustered' : 'detail'

  function visibleDiscoveryKinds() {
    return new Set(filters.filter((filter) => filter !== 'objectives'))
  }

  function updatePoiLayer() {
    const visibleKinds = visibleDiscoveryKinds()
    poiLayer.update(renderPack, visibleKinds, camera.zoom)
    options.onVisiblePoiCount(
      renderPack.discoveries.filter((item) => visibleKinds.has(item.kind))
        .length,
    )
  }

  function projectPoint(point: Point2, width: number, height: number) {
    const world = frame.normalizedToWorld(point)
    const projected = new Vector3(world.x, world.y, 0).project(camera)
    return {
      x: (projected.x * 0.5 + 0.5) * width,
      y: (-projected.y * 0.5 + 0.5) * height,
    }
  }

  function publishProjection(width: number, height: number) {
    const projectedNodes = trace.nodes
      .map((node) => ({
        id: node.id,
        ...projectPoint(node.point, width, height),
      }))
      .filter(
        (node) =>
          node.x >= -24 &&
          node.x <= width + 24 &&
          node.y >= -24 &&
          node.y <= height + 24,
      )
    options.onProjectionChange(projectedNodes)

    const picks = projectedNodes.map((node) => ({
      id: `step:${node.id}`,
      x: node.x,
      y: node.y,
    }))
    for (const discovery of renderPack.discoveries) {
      if (!filters.includes(discovery.kind)) continue
      const location = locations.get(discovery.locationId)
      if (!location) continue
      const screen = projectPoint(location.point, width, height)
      picks.push({ id: `discovery:${discovery.id}`, ...screen })
    }
    picker.rebuild(picks)
  }

  function render() {
    queued = false
    if (disposed || paused) return

    const width = Math.max(options.canvas.clientWidth, 1)
    const height = Math.max(options.canvas.clientHeight, 1)
    renderer.setSize(width, height, false)
    const halfHeight = frame.worldHeight / 2
    const halfWidth = halfHeight * (width / height)
    camera.left = -halfWidth
    camera.right = halfWidth
    camera.top = halfHeight
    camera.bottom = -halfHeight
    camera.updateProjectionMatrix()

    const zoomBucket = camera.zoom < 1.25 ? 'clustered' : 'detail'
    if (zoomBucket !== lastZoomBucket) {
      lastZoomBucket = zoomBucket
      updatePoiLayer()
    }

    renderer.render(scene, camera)
    publishProjection(width, height)

    if (firstFrame) {
      firstFrame = false
      options.onReady()
    }
  }

  function requestRender() {
    if (queued || disposed || paused) return
    queued = true
    requestAnimationFrame(render)
  }

  function focusPoint(point: Point2, zoom = 2, animate = false) {
    const world = frame.normalizedToWorld(point)
    const nextZoom = Math.min(8, Math.max(0.5, zoom))
    if (!animate) {
      controls.target.set(world.x, world.y, 0)
      camera.position.set(world.x, world.y, 10)
      camera.zoom = nextZoom
      camera.updateProjectionMatrix()
      requestRender()
      return
    }

    const fromX = camera.position.x
    const fromY = camera.position.y
    const fromZoom = camera.zoom
    playback.play({
      from: 0,
      to: 1,
      duration: 850,
      reducedMotion,
      update(value) {
        const x = fromX + (world.x - fromX) * value
        const y = fromY + (world.y - fromY) * value
        controls.target.set(x, y, 0)
        camera.position.set(x, y, 10)
        camera.zoom = fromZoom + (nextZoom - fromZoom) * value
        camera.updateProjectionMatrix()
        requestRender()
      },
    })
  }

  function pointForSelection(selection: AtlasEntity): Point2 | undefined {
    if (selection.kind === 'location') {
      return locations.get(selection.id)?.point
    }
    if (selection.kind === 'discovery') {
      const discovery = discoveries.get(selection.id)
      return discovery ? locations.get(discovery.locationId)?.point : undefined
    }
    const step = steps.get(selection.id)
    return step?.locationId ? locations.get(step.locationId)?.point : undefined
  }

  function updateTrace(nextTrace: TraceModel) {
    trace = nextTrace
    routeLayer.update(trace)
    routeLayer.object.visible = filters.includes('objectives')
    playback.play({
      from: 0,
      to: trace.nodes.length,
      duration: 750,
      reducedMotion,
      update(value) {
        routeLayer.setProgress(value)
        requestRender()
      },
    })
    requestRender()
  }

  function updateFilters(nextFilters: string[]) {
    filters = [...nextFilters]
    routeLayer.object.visible = filters.includes('objectives')
    updatePoiLayer()
    requestRender()
  }

  function handleControlEnd() {
    const center = frame.worldToNormalized({
      x: controls.target.x,
      y: controls.target.y,
      z: 0,
    })
    options.onCameraChange({ center, zoom: camera.zoom })
  }

  function pointerPosition(event: PointerEvent) {
    const bounds = options.canvas.getBoundingClientRect()
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  }

  function handlePointerDown(event: PointerEvent) {
    pointerStart = pointerPosition(event)
  }

  function handlePointerUp(event: PointerEvent) {
    const point = pointerPosition(event)
    if (
      !pointerStart ||
      Math.hypot(point.x - pointerStart.x, point.y - pointerStart.y) >= 5
    ) {
      pointerStart = undefined
      return
    }
    pointerStart = undefined
    const radius = matchMedia('(pointer: coarse)').matches ? 24 : 12
    const pick = picker.nearest(point, radius)
    if (!pick) return
    const separator = pick.id.indexOf(':')
    const kind = pick.id.slice(0, separator)
    const id = pick.id.slice(separator + 1)
    if (kind === 'step' || kind === 'discovery') {
      options.onSelect({ kind, id })
    }
  }

  controls.addEventListener('change', requestRender)
  controls.addEventListener('end', handleControlEnd)
  options.canvas.addEventListener('pointerdown', handlePointerDown)
  options.canvas.addEventListener('pointerup', handlePointerUp)
  const resizeObserver = new ResizeObserver(requestRender)
  resizeObserver.observe(options.canvas)
  const handleContextLost = () => options.onContextLost()
  options.canvas.addEventListener('webglcontextlost', handleContextLost, {
    once: true,
  })

  updatePoiLayer()
  updateTrace(trace)
  requestRender()

  return {
    focus(point, zoom = 2) {
      focusPoint(point, zoom)
    },
    reset() {
      focusPoint({ x: 0.5, y: 0.5 }, 1)
    },
    requestRender,
    updateTrace,
    updateFilters,
    setSelected(selection, shouldFocus = true) {
      const key = selection ? `${selection.kind}:${selection.id}` : undefined
      if (key === selectedKey) return
      selectedKey = key
      routeLayer.setSelected(
        selection?.kind === 'step' ? selection.id : undefined,
      )
      if (selection && shouldFocus) {
        const point = pointForSelection(selection)
        if (point) focusPoint(point, 2.35, true)
      }
      requestRender()
    },
    setCamera(nextCamera) {
      focusPoint(nextCamera.center, nextCamera.zoom)
    },
    setReducedMotion(nextReducedMotion) {
      reducedMotion = nextReducedMotion
      if (reducedMotion) playback.cancel()
    },
    setPaused(nextPaused) {
      paused = nextPaused
      if (paused) playback.cancel()
      else requestRender()
    },
    dispose() {
      disposed = true
      playback.cancel()
      resizeObserver.disconnect()
      options.canvas.removeEventListener('pointerdown', handlePointerDown)
      options.canvas.removeEventListener('pointerup', handlePointerUp)
      options.canvas.removeEventListener('webglcontextlost', handleContextLost)
      controls.removeEventListener('change', requestRender)
      controls.removeEventListener('end', handleControlEnd)
      controls.dispose()
      routeLayer.dispose()
      poiLayer.dispose()
      surface.userData.dispose?.()
      renderer.forceContextLoss()
      renderer.dispose()
    },
  }
}
