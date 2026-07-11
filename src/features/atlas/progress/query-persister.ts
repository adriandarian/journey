import { openDB } from 'idb'
import type {
  PersistedClient,
  Persister,
} from '@tanstack/query-persist-client-core'

const databaseName = 'progression-atlas-query-cache'
const storeName = 'cache'
const key = 'content-v1'

async function cacheDatabase() {
  return openDB(databaseName, 1, {
    upgrade(db) {
      db.createObjectStore(storeName)
    },
  })
}

export function createAtlasQueryPersister(): Persister {
  return {
    async persistClient(client: PersistedClient) {
      await (await cacheDatabase()).put(storeName, client, key)
    },
    async restoreClient() {
      return (await cacheDatabase()).get(storeName, key)
    },
    async removeClient() {
      await (await cacheDatabase()).delete(storeName, key)
    },
  }
}
