import { deleteDB, openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { StoredProgress } from './progress-engine'

interface AtlasDB extends DBSchema {
  progress: {
    key: string
    value: {
      gameId: string
      value: StoredProgress
      updatedAt: string
      version: 1
    }
  }
}

const databaseName = 'progression-atlas'
let databasePromise: Promise<IDBPDatabase<AtlasDB>> | undefined

async function database() {
  databasePromise ??= openDB<AtlasDB>(databaseName, 1, {
    upgrade(db) {
      db.createObjectStore('progress', { keyPath: 'gameId' })
    },
  })
  return databasePromise
}

export const progressRepository = {
  async get(gameId: string): Promise<StoredProgress> {
    const record = await (await database()).get('progress', gameId)
    return record?.value ?? { completed: [], choices: {} }
  },
  async save(gameId: string, value: StoredProgress): Promise<void> {
    await (
      await database()
    ).put('progress', {
      gameId,
      value,
      updatedAt: new Date().toISOString(),
      version: 1,
    })
  },
}

export async function resetProgressDatabase(): Promise<void> {
  const db = await databasePromise
  db?.close()
  databasePromise = undefined
  await deleteDB(databaseName)
}
