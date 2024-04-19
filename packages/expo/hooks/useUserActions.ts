import { useQueryClient } from '@tanstack/react-query'
import { FarcasterUser, User } from '@/types'
import { muteUser, submitLinkAdd, submitLinkRemove, unmuteUser } from '@/utils/api'
import { useAuth } from '@/context/auth'
import { haptics } from '@/utils/haptics'
import { useToastController } from '@tamagui/toast'
import { SheetType, useSheets } from '@/context/sheet'
import { useUser } from './useUser'

export enum UserAction {
  FollowUser,
  UnfollowUser,
  MuteUser,
  UnmuteUser,
}

export const useUserActions = (fid?: string) => {
  const queryClient = useQueryClient()
  const toast = useToastController()
  const { openSheet } = useSheets()
  const { signer, session } = useAuth()
  const { user } = useUser(fid || '')
  const { user: actionUser } = useUser(session?.fid || '')

  const followUser = async (user: FarcasterUser) => {
    if (!user || !actionUser) return
    if (signer?.state !== 'completed') {
      openSheet(SheetType.EnableSigner)
      return
    }

    const sourceUserBeforeUpdate = actionUser
    const userBeforeUpdate = user

    // Optimistic update
    queryClient.setQueryData(['user', user.fid], {
      ...user,
      engagement: {
        ...user.engagement,
        followers: user.engagement.followers + 1,
      },
      context: {
        ...user.context,
        following: true,
      },
    })
    haptics.notificationSuccess()

    // Execute action
    let error: string | undefined
    try {
      const response = await submitLinkAdd({
        linkType: 'follow',
        targetFid: user.fid,
      })
      if ('message' in response) {
        error = response.message
      }
    } catch (e) {
      error = 'An error occurred. Try again later.'
    }

    if (error) {
      toast.show(error)
      queryClient.setQueryData(['user', user.fid], userBeforeUpdate)
      queryClient.setQueryData(['user', actionUser.fid], sourceUserBeforeUpdate)
      haptics.notificationError()
    }
  }

  const unfollowUser = async (user: FarcasterUser) => {
    if (!user || !actionUser) return
    if (signer?.state !== 'completed') {
      openSheet(SheetType.EnableSigner)
      return
    }

    const sourceUserBeforeUpdate = actionUser
    const userBeforeUpdate = user

    // Optimistic update
    queryClient.setQueryData(['user', user.fid], {
      ...user,
      engagement: {
        ...user.engagement,
        followers: user.engagement.followers - 1,
      },
      context: {
        ...user.context,
        following: false,
      },
    })
    haptics.notificationSuccess()

    // Execute action
    let error: string | undefined
    try {
      const response = await submitLinkRemove({
        linkType: 'follow',
        targetFid: user.fid,
      })
      if ('message' in response) {
        error = response.message
      }
    } catch (e) {
      error = 'An error occurred. Try again later.'
    }

    if (error) {
      toast.show(error)
      queryClient.setQueryData(['user', user.fid], userBeforeUpdate)
      queryClient.setQueryData(['user', actionUser.fid], sourceUserBeforeUpdate)
      haptics.notificationError()
    }
  }

  const handleMuteUser = async (user: FarcasterUser) => {
    try {
      await muteUser(user.fid)
      queryClient.setQueryData<User>(['authUser', session?.fid], (data) => {
        if (!data) return
        if (data.mutedUsers.includes(user.fid)) return data
        return {
          ...data,
          mutedUsers: [...data.mutedUsers, user.fid],
        }
      })
      toast.show('User muted')
      haptics.selection()
    } catch (e) {
      toast.show('Failed to mute user')
    }
  }

  const handleUnmuteUser = async (user: FarcasterUser) => {
    try {
      await unmuteUser(user.fid)
      queryClient.setQueryData<User>(['authUser', session?.fid], (data) => {
        if (!data) return
        return {
          ...data,
          mutedUsers: data.mutedUsers.filter((fid) => fid !== user.fid),
        }
      })
      toast.show('User unmuted')
      haptics.selection()
    } catch (e) {
      toast.show('Failed to unmute user')
    }
  }

  const dispatch = async (action: UserAction) => {
    if (!actionUser || !user) return

    switch (action) {
      case UserAction.MuteUser:
        await handleMuteUser(user)
        break
      case UserAction.UnmuteUser:
        await handleUnmuteUser(user)
        break
      case UserAction.FollowUser:
        await followUser(user)
        break
      case UserAction.UnfollowUser:
        await unfollowUser(user)
        break
    }
  }

  return {
    dispatch,
    muteUser: handleMuteUser,
    unmuteUser: handleUnmuteUser,
  }
}
