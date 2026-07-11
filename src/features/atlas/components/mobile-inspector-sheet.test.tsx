import { useRef, useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { MobileInspectorSheet } from './mobile-inspector-sheet'

function SheetHarness() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Open layers
      </button>
      <MobileInspectorSheet
        open={open}
        onOpenChange={setOpen}
        returnFocusRef={triggerRef}
        title="Layers and filters"
      >
        Layer controls
      </MobileInspectorSheet>
    </>
  )
}

it('closes by keyboard and restores focus to its opener', async () => {
  render(<SheetHarness />)
  const trigger = screen.getByRole('button', { name: 'Open layers' })

  await userEvent.click(trigger)
  expect(
    screen.getByRole('heading', { name: 'Layers and filters' }),
  ).toBeVisible()
  await userEvent.keyboard('{Escape}')

  await waitFor(() => expect(trigger).toHaveFocus())
})
