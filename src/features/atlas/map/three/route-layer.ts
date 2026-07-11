import * as THREE from 'three'
import type { MapFrame } from '../../model/coordinates'
import type { TraceModel } from '../trace-model'

export interface RouteLayer {
  object: THREE.Group
  update: (model: TraceModel) => void
  setSelected: (stepId?: string) => void
  setProgress: (value: number) => void
  dispose: () => void
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose())
      } else {
        child.material.dispose()
      }
    }
  })
}

export function createRouteLayer(frame: MapFrame): RouteLayer {
  const object = new THREE.Group()
  let selectedStepId: string | undefined
  let progress = 0

  function applyState() {
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      if (child.userData.kind === 'node') {
        child.scale.setScalar(
          child.userData.stepId === selectedStepId ? 1.55 : 1,
        )
      }
      if (
        child.userData.kind === 'segment' &&
        child.material instanceof THREE.MeshBasicMaterial
      ) {
        child.material.opacity = child.userData.order <= progress ? 1 : 0.3
      }
    })
  }

  return {
    object,
    update(model) {
      for (const child of [...object.children]) {
        object.remove(child)
        disposeObject(child)
      }

      for (const segment of model.segments) {
        const points = segment.points.map((point) => {
          const world = frame.normalizedToWorld(point)
          return new THREE.Vector3(world.x, world.y, 0.04)
        })
        const curve = new THREE.CatmullRomCurve3(points)
        const geometry = new THREE.TubeGeometry(
          curve,
          Math.max(8, points.length * 10),
          segment.kind === 'optional' ? 0.022 : 0.035,
          6,
          false,
        )
        const locked =
          segment.to.state === 'locked' || segment.to.state === 'excluded'
        const color =
          segment.kind === 'choice'
            ? '#d86c4a'
            : segment.kind === 'optional'
              ? '#c8a96b'
              : locked
                ? '#596263'
                : '#65c5a8'
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.userData = {
          kind: 'segment',
          segmentId: segment.id,
          order: segment.to.order,
        }
        object.add(mesh)
      }

      const choiceTargets = new Set(
        model.segments
          .filter((segment) => segment.kind === 'choice')
          .map((segment) => segment.to.id),
      )
      const optionalTargets = new Set(
        model.segments
          .filter((segment) => segment.kind === 'optional')
          .map((segment) => segment.to.id),
      )

      for (const node of model.nodes) {
        const geometry = new THREE.CircleGeometry(
          0.115,
          choiceTargets.has(node.id)
            ? 4
            : optionalTargets.has(node.id)
              ? 3
              : 24,
        )
        if (choiceTargets.has(node.id)) geometry.rotateZ(Math.PI / 4)
        const color = choiceTargets.has(node.id)
          ? '#d86c4a'
          : optionalTargets.has(node.id)
            ? '#c8a96b'
            : node.state === 'locked' || node.state === 'excluded'
              ? '#596263'
              : node.state === 'current'
                ? '#e8e0d2'
                : '#287d68'
        const material = new THREE.MeshBasicMaterial({ color })
        const mesh = new THREE.Mesh(geometry, material)
        const world = frame.normalizedToWorld(node.point)
        mesh.position.set(world.x, world.y, 0.08)
        mesh.userData = { kind: 'node', stepId: node.id, order: node.order }
        object.add(mesh)
      }
      applyState()
    },
    setSelected(stepId) {
      selectedStepId = stepId
      applyState()
    },
    setProgress(value) {
      progress = value
      applyState()
    },
    dispose() {
      disposeObject(object)
      object.clear()
    },
  }
}
