import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  getGameAdapter,
  listGames,
} from '@/features/atlas/content/game-adapter'
import '@/features/atlas/content/register-games'
import { validateContentPack } from '@/features/atlas/model/validate-content-pack'
import { normalizeWorkspaceSearch } from '@/features/atlas/routing/workspace-search'
import { AtlasWorkspace } from '@/features/atlas/components/atlas-workspace'

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
  const { pack, resolvedWorld, resolvedLayer, recoveryMessage } =
    Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const params = Route.useParams()
  const adapter = getGameAdapter(params.gameSlug)
  if (!adapter) return null

  return (
    <AtlasWorkspace
      adapter={adapter}
      pack={pack}
      games={listGames().map(({ manifest }) => ({
        slug: manifest.slug,
        title: manifest.title,
      }))}
      resolvedWorld={resolvedWorld}
      resolvedLayer={resolvedLayer}
      recoveryMessage={recoveryMessage}
      search={search}
      onGameChange={(gameSlug) => {
        const game = listGames().find(
          ({ manifest }) => manifest.slug === gameSlug,
        )
        if (!game) return
        void navigate({
          to: '/games/$gameSlug',
          params: { gameSlug },
          search: {
            ...search,
            world: game.defaultWorldId,
            layer: game.defaultLayerId,
            region: game.defaultRegionId,
            thread: undefined,
            step: undefined,
            discovery: undefined,
            location: undefined,
            cx: 0.5,
            cy: 0.5,
            zoom: 1,
          },
        })
      }}
      updateSearch={(patch, replace) => {
        void navigate({
          search: (previous) => ({ ...previous, ...patch }),
          replace,
        })
      }}
    />
  )
}
