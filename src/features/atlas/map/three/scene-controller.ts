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
import { createMapSurface } from './map-surface'
import type { Point2 } from '../../model/coordinates'

export interface SceneController {
  focus: (point: Point2, zoom?: number) => void
  reset: () => void
  requestRender: () => void
  dispose: () => void
}

export async function createSceneController(options: {
  canvas: HTMLCanvasElement
  imageUrl: string
  sourceWidth: number
  sourceHeight: number
  onReady: () => void
  onContextLost: () => void
}): Promise<SceneController> {
  const frame = createMapFrame({
    sourceWidth: options.sourceWidth,
    sourceHeight: options.sourceHeight,
    worldWidth: 16,
  })
  const renderer = new WebGLRenderer({
    canvas: options.canvas,
    antialias: true,
    powerPreference: 'high-performance',
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
  camera.position.set(0, 0, 10)

  const controls = new MapControls(camera, options.canvas)
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

  let queued = false
  let firstFrame = true
  let disposed = false

  function render() {
    queued = false
    if (disposed) return

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
    renderer.render(scene, camera)

    if (firstFrame) {
      firstFrame = false
      options.onReady()
    }
  }

  function requestRender() {
    if (queued || disposed) return
    queued = true
    requestAnimationFrame(render)
  }

  controls.addEventListener('change', requestRender)
  const resizeObserver = new ResizeObserver(requestRender)
  resizeObserver.observe(options.canvas)
  const handleContextLost = () => options.onContextLost()
  options.canvas.addEventListener('webglcontextlost', handleContextLost, {
    once: true,
  })
  requestRender()

  return {
    focus(point, zoom = 2) {
      const world = frame.normalizedToWorld(point)
      controls.target.copy(new Vector3(world.x, world.y, 0))
      camera.position.set(world.x, world.y, 10)
      camera.zoom = Math.min(8, Math.max(0.5, zoom))
      camera.updateProjectionMatrix()
      requestRender()
    },
    reset() {
      controls.target.set(0, 0, 0)
      camera.position.set(0, 0, 10)
      camera.zoom = 1
      camera.updateProjectionMatrix()
      requestRender()
    },
    requestRender,
    dispose() {
      disposed = true
      resizeObserver.disconnect()
      options.canvas.removeEventListener('webglcontextlost', handleContextLost)
      controls.dispose()
      surface.userData.dispose?.()
      renderer.forceContextLoss()
      renderer.dispose()
    },
  }
}
