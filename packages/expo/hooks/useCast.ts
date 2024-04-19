import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FarcasterCast } from '@/types'
import { fetchCastFromHub } from '@/utils/api'

export const useCast = (hash: string) => {
  const queryClient = useQueryClient()
  const initialData = queryClient.getQueryData<FarcasterCast>(['cast', hash])

  const {
    data: cast,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['cast', hash],
    queryFn: async () => {
      const cast = await fetchCastFromHub(hash)
      return cast || null
    },
    initialData,
    enabled: !initialData && !!hash,
  })

  return {
    cast,
    isLoading,
    isError,
    refetch,
  }
}
