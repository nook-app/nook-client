import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FarcasterUser } from '@/types'
import { fetchUser } from '@/utils/api'

export const useUser = (fid: string) => {
  const queryClient = useQueryClient()
  const initialData = queryClient.getQueryData<FarcasterUser>(['user', fid])

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user', fid],
    queryFn: () => fetchUser(fid),
    initialData,
    enabled: !initialData && !!fid,
  })

  return {
    user,
    isLoading,
    isError,
    refetch,
  }
}
