import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function OfflineStatus(props: {
  fetchStatus: 'fetching' | 'paused' | 'idle'
  hasData: boolean
  isStale: boolean
  isPartial: boolean
}) {
  const offline =
    typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean' &&
    !navigator.onLine
  const state =
    offline || props.fetchStatus === 'paused'
      ? 'Offline'
      : props.isPartial
        ? 'Partial'
        : props.isStale
          ? 'Stale'
          : props.hasData
            ? 'Cached'
            : undefined

  if (!state || state === 'Cached') {
    return state ? (
      <span className="text-xs text-muted-foreground">Cached</span>
    ) : null
  }

  const message =
    state === 'Offline'
      ? 'No current connection. The last valid atlas remains available.'
      : state === 'Partial'
        ? 'The map is available, but one supporting content source failed.'
        : 'This atlas is older than the current content-pack version.'
  return (
    <Alert>
      <AlertTitle>{state}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
