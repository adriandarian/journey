import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { progressRepository } from './progress-repository'
import type { StoredProgress } from './progress-engine'

export function progressQueryKey(gameId: string) {
  return ['progress', gameId] as const
}

export function useProgress(gameId: string) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: progressQueryKey(gameId),
    queryFn: () => progressRepository.get(gameId),
    networkMode: 'always',
  })
  const save = useMutation({
    mutationFn: (value: StoredProgress) =>
      progressRepository.save(gameId, value),
    onSuccess: (_, value) =>
      queryClient.setQueryData(progressQueryKey(gameId), value),
  })

  return { ...query, save }
}
