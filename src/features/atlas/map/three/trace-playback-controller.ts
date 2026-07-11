import { interpolateNumber } from 'd3-interpolate'

export class TracePlaybackController {
  private frame?: number

  play(options: {
    from: number
    to: number
    duration: number
    reducedMotion: boolean
    update: (value: number) => void
  }) {
    this.cancel()
    if (options.reducedMotion) {
      options.update(options.to)
      return
    }

    const start = performance.now()
    const interpolate = interpolateNumber(options.from, options.to)
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / options.duration)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      options.update(interpolate(eased))
      if (t < 1) this.frame = requestAnimationFrame(tick)
    }
    this.frame = requestAnimationFrame(tick)
  }

  cancel() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame)
    this.frame = undefined
  }
}
