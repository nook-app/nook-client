import { SheetType, useSheet } from '@/context/sheet'
import { View, Text, YStack, XStack } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/context/auth'
import { stringToColor } from '@/utils'
import { Label } from '../Label'
import { useUser } from '@/hooks/useUser'
import { UserAvatar } from '../UserAvatar'
import { PowerBadge } from '../PowerBadge'

export const FeedInfoSheet = () => {
  const insets = useSafeAreaInsets()
  const { sheet } = useSheet(SheetType.FeedInfo)
  const { feeds } = useAuth()
  const { user } = useUser('13659')

  const feed = feeds.find((f) => f.id === sheet.initialState?.feedId)

  return (
    <BaseSheet sheet={sheet}>
      <BottomSheetView
        style={{
          paddingTop: sheet.fullscreen ? insets.top : 0,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <YStack paddingHorizontal="$4" paddingTop="$3" paddingBottom="$6" gap="$6">
          <YStack gap="$2">
            <Label>Feed Info</Label>
            <XStack gap="$3" alignItems="center">
              <View
                borderRadius="$4"
                width="$5"
                height="$5"
                backgroundColor={stringToColor(feed?.name || '')}
                overflow="hidden"
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color="white"
                  fontWeight="700"
                  fontSize="$7"
                  textTransform="uppercase"
                >
                  {feed?.name.charAt(0)}
                </Text>
              </View>
              <YStack>
                <Text fontWeight="700" fontSize="$8" color="$mauve12">
                  {feed?.name}
                </Text>
                {user && (
                  <XStack alignItems="center" gap="$1.5">
                    <UserAvatar pfp={user.pfp} size="$1" />
                    <Text flexShrink={1} numberOfLines={1}>
                      <Text fontWeight="600" color="$mauve12">
                        {`${user.displayName || user.username || `!${user.fid}`} `}
                      </Text>
                      <PowerBadge fid={user.fid} />
                      <Text fontWeight="500" color="$mauve11" flexWrap="wrap">
                        {user.username ? ` @${user.username}` : ` !${user.fid}`}
                      </Text>
                    </Text>
                  </XStack>
                )}
              </YStack>
            </XStack>
          </YStack>
          <YStack gap="$4">
            <YStack gap="$2">
              <Label>Feed Source</Label>
              <Text fontSize="$5" fontWeight="500">
                https://nook-agent-template.fly.dev/feed
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </BottomSheetView>
    </BaseSheet>
  )
}
