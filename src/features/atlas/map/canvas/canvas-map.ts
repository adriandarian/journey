import type { Point2 } from '../../model/coordinates'
import type { AtlasEntity } from '../../state/atlas-selection'
import type { TraceModel } from '../trace-model'

export interface CanvasPickItem {
  entity: AtlasEntity
  point: Point2
}

export class CanvasMap {
  private readonly context: CanvasRenderingContext2D
  private image?: HTMLImageElement

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas2D is unavailable')
    this.context = context
  }

  async load(imageUrl: string): Promise<void> {
    const image = new Image()
    image.src = imageUrl
    await image.decode()
    this.image = image
  }

  resize(): { width: number; height: number } {
    const ratio = Math.min(globalThis.devicePixelRatio || 1, 1.5)
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight
    this.canvas.width = Math.round(width * ratio)
    this.canvas.height = Math.round(height * ratio)
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0)
    return { width, height }
  }

  draw(
    trace: TraceModel,
    selectedStepId?: string,
    marks: CanvasPickItem[] = [],
  ): void {
    const { width, height } = this.resize()
    this.context.clearRect(0, 0, width, height)
    if (this.image) this.context.drawImage(this.image, 0, 0, width, height)

    for (const segment of trace.segments) {
      this.context.beginPath()
      segment.points.forEach((point, index) => {
        const x = point.x * width
        const y = point.y * height
        if (index === 0) this.context.moveTo(x, y)
        else this.context.lineTo(x, y)
      })
      this.context.strokeStyle =
        segment.kind === 'choice'
          ? '#d86c4a'
          : segment.kind === 'optional' ||
              segment.to.state === 'locked' ||
              segment.to.state === 'excluded'
            ? '#596263'
            : '#65c5a8'
      this.context.lineWidth =
        segment.kind === 'optional' ? 2 : segment.kind === 'choice' ? 3 : 4
      this.context.stroke()
    }

    const choiceTargets = new Set(
      trace.segments
        .filter((segment) => segment.kind === 'choice')
        .map((segment) => segment.to.id),
    )
    const optionalTargets = new Set(
      trace.segments
        .filter((segment) => segment.kind === 'optional')
        .map((segment) => segment.to.id),
    )
    for (const node of trace.nodes) {
      this.context.beginPath()
      const x = node.point.x * width
      const y = node.point.y * height
      const radius = node.id === selectedStepId ? 10 : 7
      if (choiceTargets.has(node.id)) {
        this.context.moveTo(x, y - radius)
        this.context.lineTo(x + radius, y)
        this.context.lineTo(x, y + radius)
        this.context.lineTo(x - radius, y)
        this.context.closePath()
      } else if (optionalTargets.has(node.id)) {
        this.context.moveTo(x, y - radius)
        this.context.lineTo(x + radius, y + radius)
        this.context.lineTo(x - radius, y + radius)
        this.context.closePath()
      } else {
        this.context.arc(x, y, radius, 0, Math.PI * 2)
      }
      this.context.fillStyle =
        node.state === 'locked' || node.state === 'excluded'
          ? '#596263'
          : '#287d68'
      this.context.fill()
      this.context.strokeStyle = '#e8e0d2'
      this.context.stroke()
      if (node.state === 'locked' || node.state === 'excluded') {
        this.context.beginPath()
        this.context.moveTo(x - 3, y - 3)
        this.context.lineTo(x + 3, y + 3)
        this.context.moveTo(x + 3, y - 3)
        this.context.lineTo(x - 3, y + 3)
        this.context.stroke()
      }
    }

    for (const mark of marks.filter((item) => item.entity.kind !== 'step')) {
      const x = mark.point.x * width
      const y = mark.point.y * height
      this.context.beginPath()
      this.context.arc(
        x,
        y,
        mark.entity.kind === 'discovery' ? 5 : 4,
        0,
        Math.PI * 2,
      )
      this.context.fillStyle =
        mark.entity.kind === 'discovery' ? '#d8cfb7' : '#9ea7a3'
      this.context.fill()
    }
  }

  hitTest(
    items: CanvasPickItem[],
    point: Point2,
    radius: number,
  ): AtlasEntity | undefined {
    const hits = items
      .map((item) => ({
        entity: item.entity,
        distance: Math.hypot(
          item.point.x * this.canvas.clientWidth - point.x,
          item.point.y * this.canvas.clientHeight - point.y,
        ),
      }))
      .filter((entry) => entry.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
    return hits[0]?.entity
  }

  exportPng(): string {
    return this.canvas.toDataURL('image/png')
  }

  dispose(): void {
    this.image = undefined
  }
}
