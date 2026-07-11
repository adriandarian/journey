import { expect, it, vi } from 'vitest'
import { CanvasMap } from './canvas-map'
import type { TraceModel } from '../trace-model'

it('uses the same normalized coordinates for drawing and picking', () => {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D
  const canvas = {
    clientWidth: 200,
    clientHeight: 100,
    width: 0,
    height: 0,
    getContext: () => context,
    toDataURL: () => 'data:image/png;base64,atlas',
  } as unknown as HTMLCanvasElement
  const trace: TraceModel = {
    nodes: [
      {
        id: 'a',
        title: 'A',
        order: 1,
        point: { x: 0.5, y: 0.5 },
        state: 'available',
      },
    ],
    segments: [],
  }
  const map = new CanvasMap(canvas)

  map.draw(trace, 'a')

  expect(
    map.hitTest(
      [{ entity: { kind: 'step', id: 'a' }, point: { x: 0.5, y: 0.5 } }],
      { x: 102, y: 48 },
      12,
    ),
  ).toEqual({ kind: 'step', id: 'a' })
  expect(map.exportPng()).toContain('data:image/png')
})
