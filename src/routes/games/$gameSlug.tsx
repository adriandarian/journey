import { createFileRoute, notFound } from '@tanstack/react-router'
import { getGameAdapter } from '@/features/atlas/content/game-adapter'
import '@/features/atlas/content/register-games'
import { validateContentPack } from '@/features/atlas/model/validate-content-pack'
import { normalizeWorkspaceSearch } from '@/features/atlas/routing/workspace-search'

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
      adapter,
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
  return (
    <main aria-label={`${pack.manifest.title} progression workspace`}>
      {pack.manifest.title}
    </main>
  )
}
