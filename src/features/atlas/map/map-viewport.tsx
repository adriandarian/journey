import { useEffect, useRef, useState } from 'react'
import type { ContentPack } from '../model/schema'

export function MapViewport({ pack }: { pack: ContentPack }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [lost, setLost] = useState(false)
  const map = pack.maps[0]

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
          onReady: () => setReady(true),
          onContextLost: () => setLost(true),
        })
        // Effect cleanup can abort while scene creation awaits texture loading.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (lifecycle.signal.aborted) {
          controller.dispose()
          return
        }
        cleanup = () => controller.dispose()
      })
      .catch(() => setLost(true))

    return () => {
      lifecycle.abort()
      cleanup()
    }
  }, [map.height, map.imageUrl, map.width])

  return (
    <section
      data-testid="map-viewport"
      data-render-ready={ready}
      data-context-lost={lost}
      className="relative size-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        data-renderer="three"
        aria-hidden="true"
        className="size-full touch-none"
      />
      <p className="sr-only">Interactive map for {pack.manifest.title}</p>
    </section>
  )
}
