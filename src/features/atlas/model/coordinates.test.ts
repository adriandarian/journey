import { describe, expect, it } from 'vitest'
import { createMapFrame } from './coordinates'

describe('map coordinates', () => {
  it('round-trips normalized and world coordinates', () => {
    const frame = createMapFrame({
      sourceWidth: 3840,
      sourceHeight: 2160,
      worldWidth: 16,
    })
    const point = { x: 0.27, y: 0.74 }
    const world = frame.normalizedToWorld(point)

    expect(frame.worldToNormalized(world).x).toBeCloseTo(point.x, 8)
    expect(frame.worldToNormalized(world).y).toBeCloseTo(point.y, 8)
  })

  it('keeps the map aspect ratio in world units', () => {
    const frame = createMapFrame({
      sourceWidth: 3840,
      sourceHeight: 2160,
      worldWidth: 16,
    })

    expect(frame.worldHeight).toBe(9)
  })

  it('round-trips screen and normalized coordinates for one camera state', () => {
    const frame = createMapFrame({
      sourceWidth: 3840,
      sourceHeight: 2160,
      worldWidth: 16,
    })
    const viewport = frame.createViewportTransform({
      center: { x: 0.5, y: 0.5 },
      zoom: 2,
      width: 1000,
      height: 500,
    })
    const point = { x: 0.64, y: 0.33 }
    const screen = viewport.normalizedToScreen(point)

    expect(viewport.screenToNormalized(screen).x).toBeCloseTo(point.x, 8)
    expect(viewport.screenToNormalized(screen).y).toBeCloseTo(point.y, 8)
  })
})
