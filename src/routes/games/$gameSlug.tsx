import { createFileRoute, notFound } from '@tanstack/react-router'
import { useMemo } from 'react'
import { getGameAdapter } from '@/features/atlas/content/game-adapter'
import '@/features/atlas/content/register-games'
import { validateContentPack } from '@/features/atlas/model/validate-content-pack'
import { normalizeWorkspaceSearch } from '@/features/atlas/routing/workspace-search'
import { AppShell } from '@/features/atlas/components/app-shell'
import { MapViewport } from '@/features/atlas/map/map-viewport'
import { buildTraceModel } from '@/features/atlas/map/trace-model'
import { deriveProgress } from '@/features/atlas/progress/progress-engine'
import type { AtlasEntity } from '@/features/atlas/state/atlas-selection'

export const Route = createFileRoute('/games/$gameSlug')({
  validateSearch: normalizeWorkspaceSearch,
  loaderDeps: ({ search }) => ({
    world: search.world,
    layer: search.layer,
  }),
  loader: async ({ params, deps, context }) => {
    const adapter = getGameAdapter(params.gameSlug)
    if (!adapter) throw notFound()

    const world = adapter.worldIds.includes(deps.world)
      ? deps.world
      : adapter.defaultWorldId
    const layer = adapter.layerIds.includes(deps.layer)
      ? deps.layer
      : adapter.defaultLayerId
    const pack = await context.queryClient.ensureQueryData({
      queryKey: [
        'content-pack',
        adapter.manifest.slug,
        world,
        adapter.manifest.version,
      ],
      queryFn: async () => {
        const candidate = await adapter.loadWorld(world)
        const report = validateContentPack(candidate)
        if (report.errors.length > 0) {
          throw new Error(`Invalid content pack: ${report.errors.join('; ')}`)
        }
        return candidate
      },
      networkMode: 'offlineFirst',
    })
    const recoveryMessage =
      [
        world === deps.world
          ? undefined
          : `That world is unavailable. Showing ${world} instead.`,
        layer === deps.layer
          ? undefined
          : `That layer is unavailable. Showing ${layer} instead.`,
      ]
        .filter(Boolean)
        .join(' ') || undefined

    return {
      pack,
      resolvedWorld: world,
      resolvedLayer: layer,
      recoveryMessage,
    }
  },
  component: GameWorkspaceRoute,
})

export function GameWorkspaceRoute() {
  const { pack } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const progress = useMemo(
    () =>
      deriveProgress(pack, {
        completed: [],
        choices: {},
        current: 'first-echo',
      }),
    [pack],
  )
  const trace = useMemo(
    () => buildTraceModel(pack, progress, search.thread ?? 'main-story'),
    [pack, progress, search.thread],
  )

  function selectEntity(entity: AtlasEntity) {
    void navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        step: entity.kind === 'step' ? entity.id : undefined,
        discovery: entity.kind === 'discovery' ? entity.id : undefined,
        location: entity.kind === 'location' ? entity.id : undefined,
      }),
    })
  }

  return (
    <AppShell
      commandBar={
        <div className="flex h-full items-center px-4 font-serif text-xl">
          Progression Atlas
        </div>
      }
      navigation={<div className="p-4">Main story</div>}
      viewport={
        <MapViewport
          pack={pack}
          trace={trace}
          selectedStepId={search.step}
          selectedDiscoveryId={search.discovery}
          selectedLocationId={search.location}
          motionPreference="system"
          filters={search.filters}
          camera={{
            center: { x: search.cx, y: search.cy },
            zoom: search.zoom,
          }}
          onSelect={selectEntity}
          onCameraChange={(camera) => {
            void navigate({
              replace: true,
              search: (previous) => ({
                ...previous,
                cx: Number(camera.center.x.toFixed(4)),
                cy: Number(camera.center.y.toFixed(4)),
                zoom: Number(camera.zoom.toFixed(2)),
              }),
            })
          }}
        />
      }
      inspector={<div className="p-4">Select a story step</div>}
    />
  )
}
