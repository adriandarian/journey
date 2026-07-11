import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { whereWindsMeetAdapter } from '../content/where-winds-meet/adapter'
import { whereWindsMeetSeedPack } from '../content/where-winds-meet/seed-pack'
import { normalizeWorkspaceSearch } from '../routing/workspace-search'
import { AtlasWorkspace } from './atlas-workspace'

it('keeps inspector navigation synchronized with workspace search', async () => {
  const updateSearch = vi.fn()
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const search = normalizeWorkspaceSearch({
    mode: 'timeline',
    thread: 'main-story',
    step: 'first-echo',
  })

  render(
    <QueryClientProvider client={queryClient}>
      <AtlasWorkspace
        adapter={whereWindsMeetAdapter}
        pack={whereWindsMeetSeedPack}
        games={[{ slug: 'where-winds-meet', title: 'Where Winds Meet' }]}
        resolvedWorld="qinghe"
        resolvedLayer="surface"
        search={search}
        onGameChange={vi.fn()}
        updateSearch={updateSearch}
      />
    </QueryClientProvider>,
  )

  expect(
    await screen.findByRole('heading', { name: 'The First Echo' }),
  ).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(updateSearch).toHaveBeenCalledWith(
    expect.objectContaining({ step: 'village-in-need' }),
    false,
  )
})
