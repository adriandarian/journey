import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/use-media-query'
import { AppShell } from './app-shell'
import { MobileInspectorSheet } from './mobile-inspector-sheet'
import { NavigationRail } from './navigation-rail'
import { OfflineStatus } from './offline-status'
import { SearchCommand } from './search-command'
import { StoryInspector } from './story-inspector'
import { TopCommandBar } from './top-command-bar'
import { traceExtent, buildTraceModel } from '../map/trace-model'
import {
  chooseBranch,
  completeStep,
  deriveProgress,
} from '../progress/progress-engine'
import { usePreferences } from '../progress/use-preferences'
import { useProgress } from '../progress/use-progress'
import {
  AtlasSelectionProvider,
  useAtlasSelection,
} from '../state/atlas-selection'
import type { GameAdapter } from '../content/game-adapter'
import type { ContentPack } from '../model/schema'
import type { WorkspaceSearch } from '../routing/workspace-search'
import type { AtlasEntity } from '../state/atlas-selection'

const LazyMapViewport = lazy(() =>
  import('../map/map-viewport').then((module) => ({
    default: module.MapViewport,
  })),
)
const LazyThreadGraph = lazy(() =>
  import('../thread/thread-graph').then((module) => ({
    default: module.ThreadGraph,
  })),
)
const LazyNarrativeTimeline = lazy(() =>
  import('../timeline/narrative-timeline').then((module) => ({
    default: module.NarrativeTimeline,
  })),
)

const FILTER_OPTIONS = [
  { id: 'objectives', title: 'Objectives' },
  { id: 'lore', title: 'Lore' },
  { id: 'loot', title: 'Treasure' },
  { id: 'event', title: 'World events' },
  { id: 'secret', title: 'Secrets' },
]

const EMPTY_PROGRESS = { completed: [], choices: {} }

export interface AtlasWorkspaceProps {
  adapter: GameAdapter
  pack: ContentPack
  games: Array<{ slug: string; title: string }>
  resolvedWorld: string
  resolvedLayer: string
  recoveryMessage?: string
  search: WorkspaceSearch
  onGameChange: (slug: string) => void
  updateSearch: (patch: Partial<WorkspaceSearch>, replace?: boolean) => void
}

function AtlasWorkspaceContent(props: AtlasWorkspaceProps) {
  const [hydrated, setHydrated] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const layersReturnFocus = useRef<HTMLElement | null>(null)
  const detailsReturnFocus = useRef<HTMLElement | null>(null)
  const { preferences, update: updatePreferences } = usePreferences()
  const portrait = useMediaQuery(
    '(max-width: 800px) and (orientation: portrait)',
  )
  const { select: setSelection } = useAtlasSelection()
  const progressQuery = useProgress(props.pack.manifest.id)
  const stored = hydrated ? (progressQuery.data ?? EMPTY_PROGRESS) : EMPTY_PROGRESS
  const derived = useMemo(
    () => deriveProgress(props.pack, stored),
    [props.pack, stored],
  )
  const requestedThreadId = props.pack.threads.some(
    (thread) => thread.id === props.search.thread,
  )
    ? props.search.thread
    : undefined
  const firstThreadId =
    props.pack.threads.length > 0 ? props.pack.threads[0].id : ''
  const threadId = requestedThreadId ?? firstThreadId
  const trace = useMemo(
    () => buildTraceModel(props.pack, derived, threadId),
    [derived, props.pack, threadId],
  )
  const requestedStepId = trace.nodes.some(
    (node) => node.id === props.search.step,
  )
    ? props.search.step
    : undefined
  const selectedStepId =
    requestedStepId ??
    trace.nodes.find((node) => node.state === 'current')?.id ??
    trace.nodes.find((node) => node.state === 'available')?.id ??
    trace.nodes[0]?.id
  const branchKinds = useMemo(
    () =>
      new Map(
        trace.segments
          .filter(
            (segment) =>
              segment.kind === 'choice' || segment.kind === 'optional',
          )
          .map(
            (segment) =>
              [segment.to.id, segment.kind] as [string, 'choice' | 'optional'],
          ),
      ),
    [trace.segments],
  )

  let invalidEntityMessage: string | undefined
  if (!props.pack.regions.some((region) => region.id === props.search.region)) {
    invalidEntityMessage =
      'That region is unavailable. Showing the nearest valid region.'
  } else if (props.search.thread && !requestedThreadId) {
    invalidEntityMessage =
      'That storyline is unavailable. Showing the nearest valid storyline.'
  } else if (
    props.search.step &&
    !props.pack.steps.some((step) => step.id === props.search.step)
  ) {
    invalidEntityMessage =
      'That story step is unavailable. Showing the nearest valid thread step.'
  } else if (
    props.search.discovery &&
    !props.pack.discoveries.some((item) => item.id === props.search.discovery)
  ) {
    invalidEntityMessage =
      'That discovery is unavailable. Showing its parent thread.'
  } else if (
    props.search.location &&
    !props.pack.locations.some((item) => item.id === props.search.location)
  ) {
    invalidEntityMessage =
      'That location is unavailable. Showing its parent region.'
  }
  const [recoveryNotice, setRecoveryNotice] = useState(
    props.recoveryMessage ?? invalidEntityMessage,
  )

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    const message = props.recoveryMessage ?? invalidEntityMessage
    if (message) setRecoveryNotice(message)
  }, [invalidEntityMessage, props.recoveryMessage])

  useEffect(() => {
    const patch: Partial<WorkspaceSearch> = {}
    if (props.search.world !== props.resolvedWorld) {
      patch.world = props.resolvedWorld
    }
    if (props.search.layer !== props.resolvedLayer) {
      patch.layer = props.resolvedLayer
    }
    if (
      !props.pack.regions.some((region) => region.id === props.search.region)
    ) {
      patch.region = props.pack.regions[0]?.id ?? props.search.region
    }
    if (props.search.thread && !requestedThreadId) patch.thread = threadId
    if (
      props.search.step &&
      !props.pack.steps.some((step) => step.id === props.search.step)
    ) {
      patch.step = selectedStepId
    }
    if (
      props.search.discovery &&
      !props.pack.discoveries.some((item) => item.id === props.search.discovery)
    ) {
      patch.discovery = undefined
    }
    if (
      props.search.location &&
      !props.pack.locations.some((item) => item.id === props.search.location)
    ) {
      patch.location = undefined
    }
    if (Object.keys(patch).length > 0) props.updateSearch(patch, true)
  }, [props, requestedThreadId, selectedStepId, threadId])

  useEffect(() => {
    setSelection(
      props.search.discovery
        ? { kind: 'discovery', id: props.search.discovery }
        : props.search.location
          ? { kind: 'location', id: props.search.location }
          : selectedStepId
            ? { kind: 'step', id: selectedStepId }
            : undefined,
    )
  }, [
    props.search.discovery,
    props.search.location,
    selectedStepId,
    setSelection,
  ])

  function selectStep(stepId: string) {
    props.updateSearch(
      {
        thread: threadId,
        step: stepId,
        discovery: undefined,
        location: undefined,
      },
      false,
    )
  }

  function selectEntity(entity: AtlasEntity) {
    if (entity.kind === 'step') {
      selectStep(entity.id)
      return
    }
    if (entity.kind === 'discovery') {
      const discovery = props.pack.discoveries.find(
        (item) => item.id === entity.id,
      )
      props.updateSearch(
        {
          step: discovery?.relevantStepIds[0],
          discovery: entity.id,
          location: undefined,
        },
        false,
      )
      return
    }
    const step = props.pack.steps.find((item) => item.locationId === entity.id)
    props.updateSearch(
      { step: step?.id, discovery: undefined, location: entity.id },
      false,
    )
  }

  const viewport =
    props.search.mode === 'map' ? (
      <Suspense fallback={<p role="status">Loading map…</p>}>
        <LazyMapViewport
          pack={props.pack}
          trace={trace}
          selectedStepId={selectedStepId}
          selectedDiscoveryId={props.search.discovery}
          selectedLocationId={props.search.location}
          motionPreference={preferences.motion}
          filters={props.search.filters}
          onSelect={selectEntity}
          camera={{
            center: { x: props.search.cx, y: props.search.cy },
            zoom: props.search.zoom,
          }}
          onCameraChange={(camera) =>
            props.updateSearch(
              {
                cx: camera.center.x,
                cy: camera.center.y,
                zoom: camera.zoom,
              },
              true,
            )
          }
        />
      </Suspense>
    ) : props.search.mode === 'thread' ? (
      <Suspense fallback={<p role="status">Laying out story thread…</p>}>
        <LazyThreadGraph
          model={trace}
          selectedStepId={selectedStepId}
          direction={portrait ? 'DOWN' : 'RIGHT'}
          motionPreference={preferences.motion}
          onSelect={selectStep}
        />
      </Suspense>
    ) : (
      <Suspense fallback={<p role="status">Loading timeline…</p>}>
        <LazyNarrativeTimeline
          nodes={trace.nodes}
          branchKinds={branchKinds}
          selectedStepId={selectedStepId}
          onSelect={selectStep}
        />
      </Suspense>
    )

  const inspector = (
    <StoryInspector
      pack={props.pack}
      trace={trace}
      derived={derived}
      selectedStepId={selectedStepId}
      selectedDiscoveryId={props.search.discovery}
      onSelect={selectStep}
      onComplete={(stepId) =>
        progressQuery.save.mutate(completeStep(props.pack, stored, stepId))
      }
      onChoose={(group, stepId) =>
        progressQuery.save.mutate(
          chooseBranch(props.pack, stored, group, stepId),
        )
      }
    />
  )
  const selectedTitle = trace.nodes.find(
    (node) => node.id === selectedStepId,
  )?.title

  return (
    <div
      data-testid="atlas-workspace"
      data-hydrated={hydrated}
      data-motion-preference={preferences.motion}
      data-label-density={preferences.labelDensity}
      data-compact-panels={preferences.compactPanels}
    >
      {recoveryNotice ? (
        <Alert className="fixed top-16 left-1/2 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2">
          <AlertTitle>View recovered</AlertTitle>
          <AlertDescription>{recoveryNotice}</AlertDescription>
        </Alert>
      ) : null}
      <AppShell
        commandBar={
          <TopCommandBar
            gameSlug={props.pack.manifest.slug}
            games={props.games}
            mode={props.search.mode}
            preferences={preferences}
            status={
              <OfflineStatus
                fetchStatus="idle"
                hasData
                isStale={
                  props.pack.manifest.version < props.adapter.manifest.version
                }
                isPartial={false}
              />
            }
            onGameChange={(slug) => {
              updatePreferences({ lastGame: slug })
              props.onGameChange(slug)
            }}
            onPreferencesChange={updatePreferences}
            onModeChange={(mode) => props.updateSearch({ mode }, false)}
            onSearch={() => setSearchOpen(true)}
            onTraceStory={() => {
              const fallbackTarget =
                trace.nodes.length > 0 ? trace.nodes[0] : undefined
              const target =
                trace.nodes.find(
                  (node) =>
                    node.state === 'current' || node.state === 'available',
                ) ?? fallbackTarget
              const bounds = traceExtent(trace)
              if (target && bounds) {
                const span = Math.max(
                  bounds.maxX - bounds.minX,
                  bounds.maxY - bounds.minY,
                  0.2,
                )
                props.updateSearch(
                  {
                    mode: 'map',
                    thread: threadId,
                    step: target.id,
                    cx: (bounds.minX + bounds.maxX) / 2,
                    cy: (bounds.minY + bounds.maxY) / 2,
                    zoom: Math.min(4, Math.max(0.75, 0.8 / span)),
                  },
                  false,
                )
              }
            }}
            onLayers={() => {
              layersReturnFocus.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null
              setLayersOpen(true)
            }}
            onCopyLink={() => {
              void navigator.clipboard.writeText(location.href).then(
                () => setCopyStatus('Link copied'),
                () => setCopyStatus('Could not copy link'),
              )
            }}
            onZoomIn={() =>
              props.updateSearch(
                { zoom: Math.min(8, props.search.zoom * 1.25) },
                false,
              )
            }
            onZoomOut={() =>
              props.updateSearch(
                { zoom: Math.max(0.5, props.search.zoom / 1.25) },
                false,
              )
            }
            onResetView={() =>
              props.updateSearch({ cx: 0.5, cy: 0.5, zoom: 1 }, false)
            }
          />
        }
        navigation={
          <NavigationRail
            region={props.search.region}
            threadId={threadId}
            filters={props.search.filters}
            regions={props.pack.regions.map(({ id, title }) => ({ id, title }))}
            threads={props.pack.threads.map(({ id, title }) => ({ id, title }))}
            filterOptions={FILTER_OPTIONS}
            completed={derived.completedCount}
            total={derived.totalCount}
            onRegionChange={(region) => props.updateSearch({ region }, false)}
            onThreadChange={(thread) =>
              props.updateSearch({ thread, step: undefined }, false)
            }
            onFiltersChange={(filters) =>
              props.updateSearch({ filters }, false)
            }
          />
        }
        viewport={viewport}
        inspector={inspector}
      />
      {portrait ? (
        <div className="portrait-trace-summary">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {selectedTitle ?? 'Choose a story step'}
            </p>
            <p className="text-xs text-muted-foreground">
              {derived.completedCount} of {derived.totalCount}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={(event) => {
              detailsReturnFocus.current = event.currentTarget
              setDetailsOpen(true)
            }}
          >
            Open details
          </Button>
        </div>
      ) : null}
      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        search={(text) => props.adapter.search({ text, kinds: [] })}
        onSelect={(result) =>
          selectEntity({ kind: result.kind, id: result.id })
        }
      />
      <MobileInspectorSheet
        open={layersOpen}
        onOpenChange={setLayersOpen}
        returnFocusRef={layersReturnFocus}
        title="Layers and filters"
      >
        <NavigationRail
          region={props.search.region}
          threadId={threadId}
          filters={props.search.filters}
          regions={props.pack.regions.map(({ id, title }) => ({ id, title }))}
          threads={props.pack.threads.map(({ id, title }) => ({ id, title }))}
          filterOptions={FILTER_OPTIONS}
          completed={derived.completedCount}
          total={derived.totalCount}
          onRegionChange={(region) => props.updateSearch({ region }, false)}
          onThreadChange={(thread) =>
            props.updateSearch({ thread, step: undefined }, false)
          }
          onFiltersChange={(filters) => props.updateSearch({ filters }, false)}
        />
      </MobileInspectorSheet>
      <MobileInspectorSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        returnFocusRef={detailsReturnFocus}
        title="Story details"
      >
        {inspector}
      </MobileInspectorSheet>
      <p role="status" className="sr-only">
        {copyStatus}
      </p>
    </div>
  )
}

export function AtlasWorkspace(props: AtlasWorkspaceProps) {
  return (
    <AtlasSelectionProvider>
      <AtlasWorkspaceContent {...props} />
    </AtlasSelectionProvider>
  )
}
