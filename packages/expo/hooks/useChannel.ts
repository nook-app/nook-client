import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Channel } from '@/types'
import { fetchChannel, fetchChannelByUrl } from '@/utils/api'

export const useChannel = (id: string) => {
  const queryClient = useQueryClient()
  const initialData = queryClient.getQueryData<Channel>(['channel', id])

  const {
    data: channel,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['channel', id],
    queryFn: () => fetchChannel(id),
    initialData,
    enabled: !initialData && !!id,
  })

  return {
    channel,
    isLoading,
    isError,
    refetch,
  }
}

export const useChannelByUrl = (url: string) => {
  const queryClient = useQueryClient()
  const initialData = queryClient.getQueryData<Channel>(['channel', url])

  const {
    data: channel,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['channel', url],
    queryFn: () => fetchChannelByUrl(url),
    initialData,
    enabled: !initialData && !!url,
  })

  return {
    channel,
    isLoading,
    isError,
    refetch,
  }
}
