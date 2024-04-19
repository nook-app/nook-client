import { SheetType, useSheet } from '@/context/sheet'
import { Text, YStack, Spinner, XStack, Separator, View } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { useAuth } from '@/context/auth'
import { ReactNode, useEffect, useState } from 'react'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { fetchCastFromHub, submitCastRemove } from '@/utils/api'
import { useCast } from '@/hooks/useCast'
import { useToastController } from '@tamagui/toast'
import { haptics } from '@/utils/haptics'
import { useUser } from '@/hooks/useUser'
import { UserAction, useUserActions } from '@/hooks/useUserActions'
import { Label } from '../Label'
import { UserAvatar } from '../UserAvatar'
import { TouchableOpacity } from 'react-native-gesture-handler'
import {
  Copy,
  Trash,
  UserMinus,
  UserPlus,
  Image as ImageIcon,
  VolumeX,
  Volume2,
} from '@tamagui/lucide-icons'
import * as Clipboard from 'expo-clipboard'
import { Image } from 'expo-image'
import { Linking } from 'react-native'
import { useChannelActions } from '@/hooks/useChannelActions'
import { useQueryClient } from '@tanstack/react-query'

export const CastMenuSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.CastAction)
  const { cast } = useCast(sheet.initialState?.hash || '')
  const insets = useSafeAreaInsets()
  const { session, signer, user: authUser } = useAuth()
  const [isPolling, setIsPolling] = useState(false)
  const toast = useToastController()
  const { user } = useUser(cast?.user?.fid || '')
  const { user: app } = useUser(cast?.appFid || '')
  const { dispatch } = useUserActions(cast?.user.fid || '')
  const { muteChannel, unmuteChannel } = useChannelActions()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (sheet.initialState?.hash) {
      if (!cast) {
        toast.show('Post deleted')
        closeSheet(SheetType.CastAction)
        haptics.notificationSuccess()
      }
      setIsPolling(false)
    }
  }, [sheet.initialState?.hash, cast])

  const pollRefresh = async () => {
    if (!signer || !session || !sheet.initialState?.hash) return
    let currentAttempts = 0
    let maxAttempts = 60

    let cast
    while (currentAttempts < maxAttempts && cast) {
      currentAttempts++
      cast = await fetchCastFromHub(sheet.initialState.hash)
      if (!cast) break
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    if (cast) {
      toast.show('Error deleting cast')
      haptics.notificationError()
    } else {
      toast.show('Post deleted')
      closeSheet(SheetType.CastAction)
      haptics.notificationSuccess()
      queryClient.setQueryData(['cast', sheet.initialState.hash], undefined)
    }

    setIsPolling(false)
  }

  const handleDelete = async () => {
    if (!signer || !session || !sheet.initialState?.hash) return
    setIsPolling(true)
    try {
      await submitCastRemove({
        hash: sheet.initialState.hash,
      })
      await pollRefresh()
    } catch (e) {
      toast.show((e as Error).message)
      setIsPolling(false)
      haptics.notificationError()
    }
  }

  return (
    <BaseSheet sheet={sheet}>
      <BottomSheetView
        style={{
          paddingBottom: insets.bottom,
        }}
      >
        <YStack paddingHorizontal="$6" gap="$2">
          {app && (
            <XStack gap="$3" alignItems="center" justifyContent="center">
              <UserAvatar pfp={app.pfp} size="$1" />
              <Label>{`Casted with ${
                app?.displayName || app?.username || `!${app?.fid}`
              }`}</Label>
            </XStack>
          )}
          <XStack justifyContent="center" gap="$2">
            <ShareItem
              label="Copy Link"
              onPress={() => {
                Clipboard.setStringAsync(
                  `https://nook.social/casts/${sheet.initialState?.hash}`
                )
                toast.show('Copied link')
              }}
            >
              <Copy size={20} color="white" />
            </ShareItem>
            <ShareItem
              label="Image"
              onPress={() => {
                Linking.openURL(
                  `https://client.warpcast.com/v2/cast-image?castHash=${sheet.initialState?.hash}`
                )
              }}
            >
              <ImageIcon size={20} color="white" />
            </ShareItem>
            <ShareItem
              label="Warpcast"
              onPress={() =>
                Linking.openURL(
                  `https://warpcast.com/~/conversations/${sheet.initialState?.hash}`
                )
              }
            >
              <Image
                source={require('@/assets/warpcast.png')}
                tintColor={'white'}
                style={{ width: 24, height: 24 }}
              />
            </ShareItem>
          </XStack>
          <Separator />
        </YStack>
        <YStack
          paddingHorizontal="$6"
          paddingVertical="$4"
          justifyContent="center"
          gap="$5"
        >
          {cast?.channel && authUser?.mutedChannels?.includes(cast.channel.url) && (
            <TouchableOpacity
              onPress={async () => {
                await unmuteChannel(cast.channel!)
                closeSheet(SheetType.CastAction)
              }}
              disabled={isPolling}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <XStack gap="$3" alignItems="center">
                <Volume2 size={20} color="$mauve12" />
                <Text fontSize="$5" fontWeight="500" color="$mauve12">
                  Unmute Channel
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
          {cast?.channel && !authUser?.mutedChannels?.includes(cast.channel.url) && (
            <TouchableOpacity
              onPress={async () => {
                await muteChannel(cast.channel!)
                closeSheet(SheetType.CastAction)
              }}
              disabled={isPolling}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <XStack gap="$3" alignItems="center">
                <VolumeX size={20} color="$mauve12" />
                <Text fontSize="$5" fontWeight="500" color="$mauve12">
                  Mute Channel
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
          {user &&
            session?.fid !== user?.fid &&
            authUser?.mutedUsers?.includes(user.fid) && (
              <TouchableOpacity
                onPress={async () => {
                  dispatch(UserAction.UnmuteUser)
                  closeSheet(SheetType.CastAction)
                }}
                disabled={isPolling}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <XStack gap="$3" alignItems="center">
                  <Volume2 size={20} color="$mauve12" />
                  <Text fontSize="$5" fontWeight="500" color="$mauve12">
                    Unmute User
                  </Text>
                </XStack>
              </TouchableOpacity>
            )}
          {user &&
            session?.fid !== user?.fid &&
            !authUser?.mutedUsers?.includes(user.fid) && (
              <TouchableOpacity
                onPress={async () => {
                  dispatch(UserAction.MuteUser)
                  closeSheet(SheetType.CastAction)
                }}
                disabled={isPolling}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <XStack gap="$3" alignItems="center">
                  <VolumeX size={20} color="$mauve12" />
                  <Text fontSize="$5" fontWeight="500" color="$mauve12">
                    Mute User
                  </Text>
                </XStack>
              </TouchableOpacity>
            )}
          {user && session?.fid !== user?.fid && user.context?.following && (
            <TouchableOpacity
              onPress={async () => {
                dispatch(UserAction.UnfollowUser)
                closeSheet(SheetType.CastAction)
              }}
              disabled={isPolling}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <XStack gap="$3" alignItems="center">
                <UserMinus size={20} color="$mauve12" />
                <Text fontSize="$5" fontWeight="500" color="$mauve12">
                  Unfollow User
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
          {user && session?.fid !== user?.fid && !user.context?.following && (
            <TouchableOpacity
              onPress={async () => {
                dispatch(UserAction.FollowUser)
                closeSheet(SheetType.CastAction)
              }}
              disabled={isPolling}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <XStack gap="$3" alignItems="center">
                <UserPlus size={20} color="$mauve12" />
                <Text fontSize="$5" fontWeight="500" color="$mauve12">
                  Follow User
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
          {session?.fid === cast?.user.fid && (
            <TouchableOpacity onPress={handleDelete} disabled={isPolling}>
              <XStack gap="$3" alignItems="center">
                {isPolling ? <Spinner /> : <Trash size={20} color="$red9" />}
                <Text fontSize="$5" fontWeight="500" color="$red9">
                  Delete Cast
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
        </YStack>
      </BottomSheetView>
    </BaseSheet>
  )
}

const ShareItem = ({
  label,
  children,
  onPress,
}: {
  label: string
  children: ReactNode
  onPress: () => void
}) => {
  return (
    <XStack padding="$2" justifyContent="center">
      <TouchableOpacity onPress={onPress}>
        <YStack alignItems="center" gap="$1.5">
          <View
            width="$4"
            height="$4"
            borderRadius="$12"
            alignItems="center"
            justifyContent="center"
            backgroundColor="$color6"
          >
            {children}
          </View>
          <Text fontSize="$2" fontWeight="500" color="$mauve12">
            {label}
          </Text>
        </YStack>
      </TouchableOpacity>
    </XStack>
  )
}
