import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Feed } from '@/types'
import { makeRequestJson } from '@/utils/api'

export const useFeed = (feedId: string) => {
  const queryClient = useQueryClient()
  const initialData = queryClient.getQueryData<Feed>(['feed', feedId])

  const {
    data: feed,
    isLoading,
    isError,
    refetch,
  } = useQuery<Feed>({
    queryKey: ['feed', feedId],
    queryFn: () => makeRequestJson(`/feeds/${feedId}`),
    initialData,
    enabled: !initialData && !!feedId,
  })

  return {
    feed,
    isLoading,
    isError,
    refetch,
  }
}
