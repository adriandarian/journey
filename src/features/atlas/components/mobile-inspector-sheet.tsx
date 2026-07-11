import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { ReactNode, RefObject } from 'react'

export function MobileInspectorSheet(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocusRef: RefObject<HTMLElement | null>
  title: string
  children: ReactNode
}) {
  const portrait = useMediaQuery(
    '(max-width: 800px) and (orientation: portrait)',
  )
  const closeLabel =
    props.title === 'Story details'
      ? 'Close details'
      : `Close ${props.title.toLocaleLowerCase()}`

  function changeOpen(open: boolean) {
    props.onOpenChange(open)
    if (!open) {
      requestAnimationFrame(() => props.returnFocusRef.current?.focus())
    }
  }

  if (portrait) {
    return (
      <Drawer
        open={props.open}
        onOpenChange={changeOpen}
        repositionInputs={false}
      >
        <DrawerContent className="!max-h-[55dvh]">
          <DrawerHeader>
            <DrawerTitle>{props.title}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="mx-auto mt-2">
                {closeLabel}
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="min-h-0 overflow-auto">{props.children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={props.open} onOpenChange={changeOpen}>
      <SheetContent side="right" className="w-[min(22rem,88vw)]">
        <SheetHeader>
          <SheetTitle>{props.title}</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 overflow-auto">{props.children}</div>
      </SheetContent>
    </Sheet>
  )
}
