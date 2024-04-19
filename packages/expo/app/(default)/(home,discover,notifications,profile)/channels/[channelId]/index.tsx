import { LoadingScreen } from '@/components/LoadingScreen'
import { UserAvatar } from '@/components/UserAvatar'
import { FarcasterFeedPanel } from '@/components/farcaster/FarcasterFeedPanel'
import { Panels } from '@/components/panels/Panels'
import { useChannel } from '@/hooks/useChannel'
import { Channel, ChannelFilterType, PanelDisplay, UserFilterType } from '@/types'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { Text, View, XStack } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { ArrowLeft, MoreHorizontal, Search } from '@tamagui/lucide-icons'
import { useCastFeed } from '@/hooks/useCastFeed'
import { SheetType, useSheets } from '@/context/sheet'
import { IconButton } from '@/components/IconButton'
import { useAuth } from '@/context/auth'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useCurrentTabScrollY } from 'react-native-collapsible-tab-view'
import { useImageColors } from '@/hooks/useImageColors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/context/theme'
import { LinearGradient } from '@tamagui/linear-gradient'
import { ChannelHeader } from '@/components/farcaster/FarcasterChannelHeader'

const RenderChannelHeader = ({ channel }: { channel: Channel }) => {
  const { openSheet } = useSheets()
  const scrollY = useCurrentTabScrollY()
  const colors = useImageColors(channel.imageUrl)

  const insets = useSafeAreaInsets()
  const { colorScheme } = useTheme()

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [0, 0, 1],
      Extrapolation.CLAMP
    )

    return {
      opacity,
    }
  })
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <View
              height="$9"
              paddingTop={insets.top}
              paddingHorizontal="$3"
              backgroundColor="$color1"
              justifyContent="center"
            >
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    flex: 1,
                  },
                  headerTitleStyle,
                ]}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={[
                    colors.backgroundColor,
                    colors.primaryColor,
                    colors.secondaryColor,
                    colors.backgroundColor,
                    colors.primaryColor,
                  ]}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    flex: 1,
                    opacity: 0.5,
                  }}
                />
                <BlurView
                  intensity={100}
                  tint={colorScheme}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    flex: 1,
                  }}
                />
              </Animated.View>
              <XStack alignItems="center" justifyContent="space-between">
                <IconButton onPress={() => router.back()}>
                  <ArrowLeft size={16} color="white" />
                </IconButton>
                <Animated.View style={[headerTitleStyle]}>
                  <XStack gap="$1.5" alignItems="center">
                    <View borderRadius="$10" overflow="hidden">
                      <UserAvatar pfp={channel.imageUrl} size="$1" />
                    </View>
                    <View flexShrink={1}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        fontWeight="600"
                        fontSize="$5"
                        color="$mauve12"
                      >
                        {channel.name}
                      </Text>
                    </View>
                  </XStack>
                </Animated.View>
                <XStack gap="$2">
                  <IconButton
                    href={{
                      pathname: '/search/[query]',
                      params: { channelId: channel.channelId, parentUrl: channel.url },
                    }}
                  >
                    <Search size={16} color="white" />
                  </IconButton>
                  <IconButton
                    onPress={() =>
                      openSheet(SheetType.ChannelAction, {
                        channelId: channel.channelId,
                      })
                    }
                  >
                    <MoreHorizontal size={16} color="white" />
                  </IconButton>
                </XStack>
              </XStack>
            </View>
          ),
        }}
      />
      <ChannelHeader channel={channel} />
    </>
  )
}

export default function ChannelScreen() {
  const { channelId } = useLocalSearchParams()
  const { channel } = useChannel(channelId as string)

  if (!channel) {
    return <LoadingScreen />
  }

  return (
    <View flex={1}>
      <Panels
        renderHeader={() => <RenderChannelHeader channel={channel} />}
        panels={[
          {
            name: 'Latest',
            panel: <LatestPanel url={channel.url} />,
          },
          {
            name: 'Media',
            panel: <MediaPanel url={channel.url} />,
          },
        ]}
        defaultIndex={0}
      />
    </View>
  )
}

const ForYouPanel = ({ url }: { url: string }) => {
  const tabBarHeight = useBottomTabBarHeight()
  const { session } = useAuth()
  const { fetchPage } = useCastFeed({
    users: {
      type: UserFilterType.POWER_BADGE,
      data: {
        badge: true,
        fid: session?.fid,
      },
    },
    channels: {
      type: ChannelFilterType.CHANNEL_URLS,
      data: {
        urls: [url],
      },
    },
  })

  return (
    <FarcasterFeedPanel
      paddingBottom={tabBarHeight}
      keys={['channelForYou', url as string]}
      fetch={fetchPage}
      asTabs
    />
  )
}

export const LatestPanel = ({ url }: { url: string }) => {
  const tabBarHeight = useBottomTabBarHeight()
  const { fetchPage } = useCastFeed({
    channels: {
      type: ChannelFilterType.CHANNEL_URLS,
      data: {
        urls: [url],
      },
    },
  })

  return (
    <FarcasterFeedPanel
      paddingBottom={tabBarHeight}
      keys={['channelLatest', url as string]}
      fetch={fetchPage}
      asTabs
    />
  )
}

export const MediaPanel = ({ url }: { url: string }) => {
  const tabBarHeight = useBottomTabBarHeight()
  const { fetchPage } = useCastFeed({
    channels: {
      type: ChannelFilterType.CHANNEL_URLS,
      data: {
        urls: [url],
      },
    },
    contentTypes: ['image', 'video'],
  })

  return (
    <FarcasterFeedPanel
      paddingBottom={tabBarHeight}
      keys={['channelMedia', url as string]}
      fetch={fetchPage}
      display={PanelDisplay.GRID}
      asTabs
    />
  )
}
