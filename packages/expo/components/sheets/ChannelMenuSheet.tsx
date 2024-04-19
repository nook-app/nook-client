import { SheetType, useSheet } from '@/context/sheet'
import { Text, YStack, XStack, View, Separator } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { useAuth } from '@/context/auth'
import { ReactNode, useState } from 'react'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { VolumeX, Volume2, Copy } from '@tamagui/lucide-icons'
import { useChannel } from '@/hooks/useChannel'
import { useChannelActions } from '@/hooks/useChannelActions'
import * as Clipboard from 'expo-clipboard'
import { useToastController } from '@tamagui/toast'
import { Linking } from 'react-native'
import { Image } from 'expo-image'

export const ChannelMenuSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.ChannelAction)
  const { channel } = useChannel(sheet.initialState?.channelId || '')
  const insets = useSafeAreaInsets()
  const { user: authUser } = useAuth()
  const [isPolling] = useState(false)
  const { muteChannel, unmuteChannel } = useChannelActions()
  const toast = useToastController()

  return (
    <BaseSheet sheet={sheet}>
      <BottomSheetView
        style={{
          paddingBottom: insets.bottom,
        }}
      >
        <YStack paddingHorizontal="$6" gap="$2">
          <XStack justifyContent="center" gap="$2">
            <ShareItem
              label="Copy Link"
              onPress={() => {
                Clipboard.setStringAsync(
                  `https://nook.social/channels/${sheet.initialState?.channelId}`
                )
                toast.show('Copied link')
              }}
            >
              <Copy size={20} color="white" />
            </ShareItem>
            <ShareItem
              label="Warpcast"
              onPress={() =>
                Linking.openURL(
                  `https://warpcast.com/~/channel/${sheet.initialState?.channelId}`
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
          {channel && authUser?.mutedChannels?.includes(channel.url) && (
            <TouchableOpacity
              onPress={async () => {
                await unmuteChannel(channel)
                closeSheet(SheetType.ChannelAction)
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
          {channel && !authUser?.mutedChannels?.includes(channel.url) && (
            <TouchableOpacity
              onPress={async () => {
                await muteChannel(channel)
                closeSheet(SheetType.ChannelAction)
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
