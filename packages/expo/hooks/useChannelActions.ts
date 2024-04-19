import { useQueryClient } from '@tanstack/react-query'
import { Channel, User } from '@/types'
import { muteChannel, unmuteChannel } from '@/utils/api'
import { useAuth } from '@/context/auth'
import { haptics } from '@/utils/haptics'
import { useToastController } from '@tamagui/toast'

export const useChannelActions = () => {
  const queryClient = useQueryClient()
  const toast = useToastController()
  const { session } = useAuth()

  const handleMuteChannel = async (channel: Channel) => {
    if (!channel) return

    try {
      await muteChannel(channel.url)
      queryClient.setQueryData<User>(['authUser', session?.fid], (data) => {
        if (!data) return
        if (data.mutedChannels.includes(channel.url)) return data
        return {
          ...data,
          mutedChannels: [...data.mutedChannels, channel.url],
        }
      })
      toast.show('Channel muted')
      haptics.selection()
    } catch (e) {
      toast.show('Failed to mute channel')
    }
  }

  const handleUnmuteChannel = async (channel: Channel) => {
    if (!channel) return

    try {
      await unmuteChannel(channel.url)
      queryClient.setQueryData<User>(['authUser', session?.fid], (data) => {
        if (!data) return
        return {
          ...data,
          mutedChannels: data.mutedChannels.filter((url) => url !== channel.url),
        }
      })
      toast.show('Channel unmuted')
      haptics.selection()
    } catch (e) {
      toast.show('Failed to unmute channel')
    }
  }

  return {
    muteChannel: handleMuteChannel,
    unmuteChannel: handleUnmuteChannel,
  }
}
