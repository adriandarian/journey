import { beforeEach, describe, expect, it } from 'vitest'
import {
  progressRepository,
  resetProgressDatabase,
} from './progress-repository'

describe('progressRepository', () => {
  beforeEach(async () => resetProgressDatabase())

  it('round-trips completion and branch choices by game', async () => {
    const progress = {
      completed: ['first-echo'],
      choices: { road: 'lost-courier' },
    }

    await progressRepository.save('wwm', progress)

    await expect(progressRepository.get('wwm')).resolves.toEqual(progress)
  })
})
