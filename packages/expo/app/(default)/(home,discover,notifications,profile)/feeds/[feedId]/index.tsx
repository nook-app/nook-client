import { FarcasterFeedPanel } from '@/components/farcaster/FarcasterFeedPanel'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useCastFeed } from '@/hooks/useCastFeed'
import { useFeed } from '@/hooks/useFeed'
import { useAuth } from '@/context/auth'
import { useDrawer } from '@/context/drawer'
import { AlignJustify, Info, Search } from '@tamagui/lucide-icons'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { Spinner, Text, View, XStack, YStack, useTheme as useTamaguiTheme } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/context/theme'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useScroll } from '@/context/scroll'
import { IconButton } from '@/components/IconButton'
import { SheetType, useSheets } from '@/context/sheet'

export default function FeedScreen() {
  const { feedId } = useLocalSearchParams()
  const { feed } = useFeed(feedId as string)

  const height = useBottomTabBarHeight()
  const { fetchPage } = useCastFeed(feed?.filter || {}, feed?.api)
  const { session } = useAuth()
  const { onOpen } = useDrawer()
  const insets = useSafeAreaInsets()
  const { colorScheme } = useTheme()
  const { showFeedOverlay, setShowFeedOverlay } = useScroll()
  const theme = useTamaguiTheme()
  const { openSheet } = useSheets()

  const headerHeight = useSharedValue(showFeedOverlay ? 94 : 0)
  const headerPaddingTop = useSharedValue(showFeedOverlay ? insets.top : 0)

  useEffect(() => {
    headerHeight.value = withTiming(showFeedOverlay ? 94 : 0, { duration: 300 })
    headerPaddingTop.value = withTiming(showFeedOverlay ? insets.top : 0, {
      duration: 300,
    })
  }, [showFeedOverlay])

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      paddingTop: headerPaddingTop.value,
      opacity: withTiming(showFeedOverlay ? 1 : 0, { duration: 300 }),
    }
  })

  if (!session?.fid || !feed?.filter)
    return (
      <YStack flex={1} backgroundColor="$color1">
        <Spinner size="large" />
      </YStack>
    )

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          header: () => (
            <Animated.View
              style={[
                animatedHeaderStyle,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderBottomWidth: 1,
                  borderBottomColor: theme.color3.val,
                  alignItems: 'center',
                  paddingHorizontal: 8,
                },
              ]}
            >
              <View
                backgroundColor="$color1"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  flex: 1,
                }}
                opacity={0.5}
              />
              <BlurView
                intensity={50}
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
              <XStack gap="$2" width="$7">
                <IconButton onPress={onOpen}>
                  <AlignJustify size={16} color="white" />
                </IconButton>
              </XStack>
              <Text fontSize="$5" fontWeight="600" color="$mauve12">
                {feed.name}
              </Text>
              <XStack gap="$2" width="$7" justifyContent="flex-end">
                {/* <IconButton
                  onPress={() =>
                    openSheet(SheetType.FeedInfo, {
                      feedId: feed.id,
                    })
                  }
                >
                  <Info size={16} color="white" />
                </IconButton> */}
                <IconButton href={{ pathname: '/search/[query]' }}>
                  <Search size={16} color="white" />
                </IconButton>
              </XStack>
            </Animated.View>
          ),
        }}
      />
      <View flex={1} backgroundColor="$color1">
        <FarcasterFeedPanel
          keys={['feedCasts', feed.id]}
          fetch={fetchPage}
          paddingTop={94}
          paddingBottom={height}
          setOverlay={setShowFeedOverlay}
          display={feed.display}
        />
      </View>
    </>
  )
}
