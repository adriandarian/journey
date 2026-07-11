import type { ReactNode } from 'react'

interface AppShellProps {
  commandBar: ReactNode
  navigation: ReactNode
  viewport: ReactNode
  inspector: ReactNode
}

export function AppShell({
  commandBar,
  navigation,
  viewport,
  inspector,
}: AppShellProps) {
  return (
    <div className="atlas-shell">
      <header className="atlas-command">{commandBar}</header>
      <nav aria-label="Atlas navigation" className="atlas-navigation">
        {navigation}
      </nav>
      <main aria-label="World map" className="atlas-viewport">
        {viewport}
      </main>
      <aside aria-label="Story inspector" className="atlas-inspector">
        {inspector}
      </aside>
    </div>
  )
}
