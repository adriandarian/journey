import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function WebglFallbackNotice() {
  return (
    <Alert className="absolute top-3 left-3 w-auto max-w-[min(28rem,calc(100%-1.5rem))]">
      <AlertTitle>Compatibility map active</AlertTitle>
      <AlertDescription>
        WebGL is unavailable; navigation and selection remain available.
      </AlertDescription>
    </Alert>
  )
}
