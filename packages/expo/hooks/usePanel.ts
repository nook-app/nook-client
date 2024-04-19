import { useAuth } from '@/context/auth'
import { Panel, PanelRequest } from '@/types'
import { makeRequestJson } from '@/utils/api'

export const usePanel = (panel: Panel) => {
  const { session, user } = useAuth()
  const handleFetchPage = async ({ pageParam }: { pageParam?: string }) => {
    return await makeRequestJson(`/panels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...panel,
        fid: session?.fid!,
        cursor: pageParam,
        context: {
          viewerFid: session?.fid,
          mutedUsers: user?.mutedUsers,
          mutedChannels: user?.mutedChannels,
          mutedWords: user?.mutedWords,
        },
      } as PanelRequest),
    })
  }

  return {
    fetchPage: handleFetchPage,
  }
}
