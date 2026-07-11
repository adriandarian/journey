import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
} from 'three'
import type { Object3D } from 'three'

export async function createMapSurface(options: {
  imageUrl: string
  worldWidth: number
  worldHeight: number
}): Promise<Object3D> {
  const texture = await new TextureLoader().loadAsync(options.imageUrl)
  texture.colorSpace = SRGBColorSpace
  const geometry = new PlaneGeometry(options.worldWidth, options.worldHeight)
  const material = new MeshBasicMaterial({ map: texture })
  const mesh = new Mesh(geometry, material)
  mesh.position.z = -0.1
  mesh.userData.dispose = () => {
    geometry.dispose()
    material.dispose()
    texture.dispose()
  }
  return mesh
}
