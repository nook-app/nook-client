import { LoadingScreen } from '@/components/LoadingScreen'
import { FarcasterUserPanel } from '@/components/farcaster/FarcasterUserPanel'
import { Panels } from '@/components/panels/Panels'
import { useUser } from '@/hooks/useUser'
import { fetchUserFollowers, fetchUserFollowing } from '@/utils/api'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { View, XStack } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { IconButton } from '@/components/IconButton'
import { ArrowLeft, MoreHorizontal, Search } from '@tamagui/lucide-icons'
import { UserAvatar } from '@/components/UserAvatar'
import { Text } from 'tamagui'
import { PowerBadge } from '@/components/PowerBadge'
import { SheetType, useSheets } from '@/context/sheet'

export default function UserScreen() {
  const { fid } = useLocalSearchParams()
  const { user } = useUser(fid as string)
  const height = useBottomTabBarHeight()
  const { openSheet } = useSheets()

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <View flex={1} backgroundColor="$color1" paddingBottom={height}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <IconButton onPress={() => router.back()}>
              <ArrowLeft size={16} color="white" />
            </IconButton>
          ),
          headerTitle: () => (
            <XStack gap="$1.5" alignItems="center">
              <View borderRadius="$10" overflow="hidden">
                <UserAvatar pfp={user.pfp} size="$1" />
              </View>
              <View flexShrink={1}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  fontWeight="600"
                  fontSize="$5"
                  color="$mauve12"
                >
                  {user.displayName || user.username || `!${user.fid}`}
                </Text>
              </View>
              <PowerBadge fid={user.fid} />
            </XStack>
          ),
          headerRight: () => (
            <XStack gap="$2">
              <IconButton href={{ pathname: '/search/[query]', params: { fid } }}>
                <Search size={16} color="white" />
              </IconButton>
              <IconButton
                onPress={() => openSheet(SheetType.UserAction, { fid: fid as string })}
              >
                <MoreHorizontal size={16} color="white" />
              </IconButton>
            </XStack>
          ),
        }}
      />
      <Panels
        panels={[
          {
            name: 'Following',
            panel: (
              <FarcasterUserPanel
                keys={['userFollowing', fid as string]}
                fetch={({ pageParam }) => fetchUserFollowing(fid as string, pageParam)}
                asTabs
              />
            ),
          },
          {
            name: 'Followers',
            panel: (
              <FarcasterUserPanel
                keys={['userFollowers', fid as string]}
                fetch={({ pageParam }) => fetchUserFollowers(fid as string, pageParam)}
                asTabs
              />
            ),
          },
        ]}
        defaultIndex={0}
      />
    </View>
  )
}
