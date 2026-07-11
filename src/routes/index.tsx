import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: IndexScreen })

export function IndexScreen() {
  return (
    <main>
      <h1>Progression Atlas</h1>
      <p>Where Winds Meet</p>
    </main>
  )
}
