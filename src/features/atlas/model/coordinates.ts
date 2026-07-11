import { scaleLinear } from 'd3-scale'

export interface Point2 {
  x: number
  y: number
}

export interface WorldPoint {
  x: number
  y: number
  z: number
}

export function createMapFrame(options: {
  sourceWidth: number
  sourceHeight: number
  worldWidth: number
}) {
  const worldHeight =
    options.worldWidth * (options.sourceHeight / options.sourceWidth)
  const xScale = scaleLinear(
    [0, 1],
    [-options.worldWidth / 2, options.worldWidth / 2],
  )
  const yScale = scaleLinear([0, 1], [worldHeight / 2, -worldHeight / 2])

  return {
    worldWidth: options.worldWidth,
    worldHeight,
    normalizedToWorld(point: Point2): WorldPoint {
      return { x: xScale(point.x), y: yScale(point.y), z: 0 }
    },
    worldToNormalized(point: WorldPoint): Point2 {
      return { x: xScale.invert(point.x), y: yScale.invert(point.y) }
    },
    createViewportTransform(view: {
      center: Point2
      zoom: number
      width: number
      height: number
    }) {
      const centerWorld = {
        x: xScale(view.center.x),
        y: yScale(view.center.y),
      }
      const safeHeight = Math.max(view.height, 1)
      const visibleHeight = worldHeight / view.zoom
      const visibleWidth = visibleHeight * (view.width / safeHeight)

      return {
        normalizedToScreen(point: Point2): Point2 {
          const world = { x: xScale(point.x), y: yScale(point.y) }
          return {
            x: ((world.x - centerWorld.x) / visibleWidth + 0.5) * view.width,
            y:
              (0.5 - (world.y - centerWorld.y) / visibleHeight) *
              view.height,
          }
        },
        screenToNormalized(point: Point2): Point2 {
          const worldX =
            centerWorld.x + (point.x / view.width - 0.5) * visibleWidth
          const worldY =
            centerWorld.y +
            (0.5 - point.y / safeHeight) * visibleHeight
          return { x: xScale.invert(worldX), y: yScale.invert(worldY) }
        },
      }
    },
  }
}

export type MapFrame = ReturnType<typeof createMapFrame>
