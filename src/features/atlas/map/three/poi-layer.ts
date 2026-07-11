import * as THREE from 'three'
import type { MapFrame } from '../../model/coordinates'
import type { ContentPack } from '../../model/schema'

export interface PoiLayer {
  object: THREE.Group
  update: (pack: ContentPack, visibleKinds: Set<string>, zoom: number) => void
  dispose: () => void
}

export function createPoiLayer(frame: MapFrame): PoiLayer {
  const object = new THREE.Group()
  const colors: Record<string, string> = {
    lore: '#b8b4a8',
    secret: '#d8cfb7',
    loot: '#b89b63',
    puzzle: '#a89ab5',
    boss: '#b75d50',
    merchant: '#9aa99f',
    abode: '#8f9da6',
    event: '#d86c4a',
  }

  function dispose() {
    object.traverse((child) => {
      if (child instanceof THREE.InstancedMesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
    object.clear()
  }

  return {
    object,
    update(pack, visibleKinds, zoom) {
      dispose()
      const locations = new Map(
        pack.locations.map((location) => [location.id, location]),
      )

      for (const kind of visibleKinds) {
        const items = pack.discoveries.filter((item) => item.kind === kind)
        if (items.length === 0) continue

        const points = items.flatMap((item) => {
          const location = locations.get(item.locationId)
          return location ? [{ ids: [item.id], point: location.point }] : []
        })
        const marks =
          zoom < 1.25
            ? [
                ...points
                  .reduce((buckets, item) => {
                    const key = `${Math.floor(item.point.x * 24)}:${Math.floor(
                      item.point.y * 14,
                    )}`
                    const bucket = buckets.get(key) ?? []
                    bucket.push(item)
                    buckets.set(key, bucket)
                    return buckets
                  }, new Map<string, typeof points>())
                  .values(),
              ].map((bucket) => ({
                ids: bucket.flatMap((item) => item.ids),
                point: {
                  x:
                    bucket.reduce((sum, item) => sum + item.point.x, 0) /
                    bucket.length,
                  y:
                    bucket.reduce((sum, item) => sum + item.point.y, 0) /
                    bucket.length,
                },
              }))
            : points
        const geometry = new THREE.CircleGeometry(0.055, 10)
        const material = new THREE.MeshBasicMaterial({
          color: colors[kind] ?? '#9ea7a3',
        })
        const mesh = new THREE.InstancedMesh(geometry, material, marks.length)
        const matrix = new THREE.Matrix4()
        marks.forEach((mark, index) => {
          const world = frame.normalizedToWorld(mark.point)
          const scale = Math.min(2.2, 1 + Math.log2(mark.ids.length) * 0.28)
          matrix.compose(
            new THREE.Vector3(world.x, world.y, 0.06),
            new THREE.Quaternion(),
            new THREE.Vector3(scale, scale, 1),
          )
          mesh.setMatrixAt(index, matrix)
        })
        mesh.instanceMatrix.needsUpdate = true
        mesh.userData = {
          kind: 'poi-group',
          entityIds: marks.map((mark) => mark.ids),
        }
        object.add(mesh)
      }
    },
    dispose,
  }
}
