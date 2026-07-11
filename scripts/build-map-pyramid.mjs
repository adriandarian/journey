import { mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const input = resolve(
  'public/games/where-winds-meet/maps/qinghe/source.webp',
)
const output = resolve(
  'public/games/where-winds-meet/maps/qinghe/tiles',
)
const tileSize = 512
const metadata = await sharp(input).metadata()
const levels = [
  { level: 0, width: 960, height: 540 },
  { level: 1, width: 1920, height: 1080 },
  { level: 2, width: 3840, height: 2160 },
]

if (!metadata.width || !metadata.height) {
  throw new Error('Map dimensions are unavailable')
}
if (metadata.width !== 3840 || metadata.height !== 2160) {
  throw new Error('Source map must be 3840 x 2160')
}

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })

for (const level of levels) {
  const raster = await sharp(input).resize(level.width, level.height).toBuffer()

  for (let y = 0; y < level.height; y += tileSize) {
    for (let x = 0; x < level.width; x += tileSize) {
      const width = Math.min(tileSize, level.width - x)
      const height = Math.min(tileSize, level.height - y)

      await sharp(raster)
        .extract({ left: x, top: y, width, height })
        .webp({ quality: 88 })
        .toFile(
          resolve(
            output,
            `${level.level}-${x / tileSize}-${y / tileSize}.webp`,
          ),
        )
    }
  }
}
