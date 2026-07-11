import RBush from 'rbush'

interface PickItem {
  id: string
  x: number
  y: number
}

interface IndexedPick extends PickItem {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export class AtlasPicker {
  private readonly tree = new RBush<IndexedPick>()

  rebuild(items: PickItem[]): void {
    this.tree.clear()
    this.tree.load(
      items.map((item) => ({
        ...item,
        minX: item.x,
        minY: item.y,
        maxX: item.x,
        maxY: item.y,
      })),
    )
  }

  nearest(
    point: { x: number; y: number },
    radius: number,
  ): PickItem | undefined {
    const candidates = this.tree.search({
      minX: point.x - radius,
      minY: point.y - radius,
      maxX: point.x + radius,
      maxY: point.y + radius,
    })

    return candidates
      .map((candidate) => ({
        candidate,
        distance: Math.hypot(candidate.x - point.x, candidate.y - point.y),
      }))
      .filter((entry) => entry.distance <= radius)
      .sort((a, b) => a.distance - b.distance)[0]?.candidate
  }
}
