import { useAuth } from '@/context/auth'
import { FarcasterFeedFilter } from '@/types'
import { fetchCastFeed } from '@/utils/api'

export const useCastFeed = (filter: FarcasterFeedFilter, api?: string) => {
  const { session, user } = useAuth()
  const handleFetchPage = async ({ pageParam }: { pageParam?: string }) => {
    return await fetchCastFeed({
      api,
      filter,
      cursor: pageParam,
      context: {
        viewerFid: session?.fid,
        mutedUsers: user?.mutedUsers,
        mutedChannels: user?.mutedChannels,
        mutedWords: user?.mutedWords,
      },
    })
  }

  return {
    fetchPage: handleFetchPage,
  }
}
