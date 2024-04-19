import { useToastController } from '@tamagui/toast'
import { useQueryClient } from '@tanstack/react-query'
import { useCast } from './useCast'
import { FarcasterCast } from '@/types'
import { haptics } from '@/utils/haptics'
import { submitReactionAdd, submitReactionRemove } from '@/utils/api'
import { useAuth } from '@/context/auth'
import { SheetType, useSheets } from '@/context/sheet'

export enum CastAction {
  LikeCast,
  UnlikeCast,
  RecastCast,
  UnrecastCast,
}

const ACTION = {
  [CastAction.LikeCast]: {
    transform: (cast: FarcasterCast) => ({
      ...cast,
      engagement: {
        ...cast.engagement,
        likes: cast.engagement.likes + 1,
      },
      context: {
        ...cast.context,
        liked: true,
      },
    }),
    execute: (cast: FarcasterCast) =>
      submitReactionAdd({
        reactionType: 1,
        targetFid: cast.user.fid,
        targetHash: cast.hash,
      }),
  },
  [CastAction.UnlikeCast]: {
    transform: (cast: FarcasterCast) => ({
      ...cast,
      engagement: {
        ...cast.engagement,
        likes: cast.engagement.likes - 1,
      },
      context: {
        ...cast.context,
        liked: false,
      },
    }),
    execute: (cast: FarcasterCast) =>
      submitReactionRemove({
        reactionType: 1,
        targetFid: cast.user.fid,
        targetHash: cast.hash,
      }),
  },
  [CastAction.RecastCast]: {
    transform: (cast: FarcasterCast) => ({
      ...cast,
      engagement: {
        ...cast.engagement,
        recasts: cast.engagement.recasts + 1,
      },
      context: {
        ...cast.context,
        recasted: true,
      },
    }),
    execute: (cast: FarcasterCast) =>
      submitReactionAdd({
        reactionType: 2,
        targetFid: cast.user.fid,
        targetHash: cast.hash,
      }),
  },
  [CastAction.UnrecastCast]: {
    transform: (cast: FarcasterCast) => ({
      ...cast,
      engagement: {
        ...cast.engagement,
        recasts: cast.engagement.recasts - 1,
      },
      context: {
        ...cast.context,
        recasted: false,
      },
    }),
    execute: (cast: FarcasterCast) =>
      submitReactionRemove({
        reactionType: 2,
        targetFid: cast.user.fid,
        targetHash: cast.hash,
      }),
  },
}

export const useCastActions = (hash: string) => {
  const { cast } = useCast(hash)
  const queryClient = useQueryClient()
  const toast = useToastController()
  const { openSheet } = useSheets()
  const { signer } = useAuth()

  const dispatch = async (action: CastAction) => {
    if (!cast) return
    if (signer?.state !== 'completed') {
      openSheet(SheetType.EnableSigner)
      return
    }

    const castBeforeUpdate = cast

    // Optimistic update
    const castAfterUpdate = ACTION[action].transform(castBeforeUpdate)
    queryClient.setQueryData(['cast', hash], castAfterUpdate)
    haptics.notificationSuccess()

    // Execute action
    let error: string | undefined
    try {
      const response = await ACTION[action].execute(castBeforeUpdate)
      if ('message' in response) {
        error = response.message
      }
    } catch (e) {
      error = 'An error occurred. Try again later.'
    }

    if (error) {
      toast.show(error)
      queryClient.setQueryData(['cast', hash], castBeforeUpdate)
      haptics.notificationError()
    }
  }

  return {
    dispatch,
  }
}
