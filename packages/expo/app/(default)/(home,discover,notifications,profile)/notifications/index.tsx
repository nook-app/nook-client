import { useAuth } from '@/context/auth'
import { useNotifications } from '@/context/notifications'
import { NotificationPreferences } from '@/types'
import { fetchNotificationsForUser, updateNotificationPreferences } from '@/utils/api'
import { Stack } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useQueryClient } from '@tanstack/react-query'
import {
  ScrollView,
  Text,
  View,
  XStack,
  YStack,
  useTheme as useTamaguiTheme,
} from 'tamagui'
import {
  AtSign,
  BellPlus,
  Heart,
  MessageSquare,
  MessageSquareQuote,
  Settings,
} from '@tamagui/lucide-icons'
import { haptics } from '@/utils/haptics'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import PagerView from 'react-native-pager-view'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView as RNScrollView } from 'react-native'
import { useTheme } from '@/context/theme'
import { FarcasterNotificationsPanel } from '@/components/farcaster/FarcasterNotificationsPanel'
import { IconButton } from '@/components/IconButton'
import { useScroll } from '@/context/scroll'
import { Label } from '@/components/Label'
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons'

export default function NotificationsScreen() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const { count, preferences, registerForPushNotificationsAsync } = useNotifications()
  const ref = useRef<PagerView>(null)
  const scrollViewRef = useRef<RNScrollView>(null)
  const [page, setPage] = useState(0)
  const [itemWidths, setItemWidths] = useState<number[]>([])
  const insets = useSafeAreaInsets()
  const { colorScheme } = useTheme()
  const theme = useTamaguiTheme()
  const paddingBottom = useBottomTabBarHeight()
  const { showNotificationsOverlay } = useScroll()
  const [types, setTypes] = useState<string[] | undefined>()

  const headerHeight = useSharedValue(showNotificationsOverlay ? 94 : 0)
  const headerPaddingTop = useSharedValue(showNotificationsOverlay ? insets.top : 0)
  const typeBarHeight = useSharedValue(page === 2 ? 50 : 0)

  useEffect(() => {
    headerHeight.value = withTiming(
      showNotificationsOverlay ? (page < 2 ? 94 : 144) : 0,
      { duration: 300 }
    )
    headerPaddingTop.value = withTiming(showNotificationsOverlay ? insets.top : 0, {
      duration: 300,
    })
  }, [page, showNotificationsOverlay])

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      paddingTop: headerPaddingTop.value,
      opacity: withTiming(showNotificationsOverlay ? 1 : 0, { duration: 300 }),
    }
  })

  const animatedTypeBarStyle = useAnimatedStyle(() => {
    return {
      height: typeBarHeight.value,
    }
  })

  useEffect(() => {
    const sumWidths = itemWidths.slice(0, page).reduce((a, b) => a + b, 0)
    scrollViewRef.current?.scrollTo({ x: sumWidths, animated: true })
    typeBarHeight.value = withTiming(page === 2 ? 50 : 0, { duration: 300 })
  }, [page])

  useEffect(() => {
    if (count > 0) {
      queryClient.refetchQueries({
        queryKey: ['notifications', 'priority', session?.fid || ''],
      })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'mentions', session?.fid || ''],
      })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'all', session?.fid || '', types?.join(',') || ''],
      })
    }
  }, [count])

  const toggleNotifications = async () => {
    if (preferences?.disabled) {
      await registerForPushNotificationsAsync()
      return
    }

    const data = {
      disabled: false,
      onlyPowerBadge: true,
      receive: !preferences?.receive,
      subscriptions: [],
    }

    await updateNotificationPreferences(data)
    queryClient.setQueryData<NotificationPreferences>(
      ['notificationsPreferences', session?.fid],
      (prev) => {
        if (!prev) return
        return {
          ...prev,
          disabled: data.disabled,
          onlyPowerBadge: data.onlyPowerBadge,
          receive: data.receive,
        }
      }
    )
    haptics.notificationSuccess()
  }

  const panels = [
    {
      name: 'Priority',
      component: (
        <FarcasterNotificationsPanel
          keys={['notifications', 'priority', session?.fid || '']}
          fetch={({ pageParam }) =>
            fetchNotificationsForUser(
              { fid: session?.fid || '', priority: true },
              pageParam
            )
          }
          paddingBottom={paddingBottom}
          paddingTop={94}
        />
      ),
    },
    {
      name: 'Mentions',
      component: (
        <FarcasterNotificationsPanel
          keys={['notifications', 'mentions', session?.fid || '']}
          fetch={({ pageParam }) =>
            fetchNotificationsForUser(
              { fid: session?.fid || '', types: ['MENTION', 'QUOTE', 'REPLY'] },
              pageParam
            )
          }
          paddingBottom={paddingBottom}
          paddingTop={94}
        />
      ),
    },
    {
      name: 'All',
      component: (
        <FarcasterNotificationsPanel
          keys={['notifications', 'all', session?.fid || '', types?.join(',') || '']}
          fetch={({ pageParam }) =>
            fetchNotificationsForUser({ fid: session?.fid || '', types }, pageParam)
          }
          paddingTop={144}
          paddingBottom={paddingBottom}
        />
      ),
    },
  ]

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
                  borderBottomWidth: 1,
                  borderBottomColor: theme.color3.val,
                  paddingHorizontal: 8,
                },
              ]}
            >
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
              <XStack justifyContent="space-between" alignItems="center" flex={1}>
                <XStack flex={1}>
                  <View maxWidth="85%">
                    <ScrollView
                      horizontal
                      ref={scrollViewRef}
                      showsHorizontalScrollIndicator={false}
                    >
                      <XStack alignItems="center" padding="$2" gap="$3">
                        {panels.map((panel, index) => {
                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={() => {
                                ref.current?.setPage(index)
                              }}
                              onLayout={(event) => {
                                const { width } = event.nativeEvent.layout
                                setItemWidths((currentWidths) => {
                                  const newWidths = [...currentWidths]
                                  newWidths[index] = width
                                  return newWidths
                                })
                              }}
                            >
                              <Text
                                fontSize="$5"
                                fontWeight="600"
                                color="$mauve12"
                                opacity={page === index ? 1 : 0.5}
                              >
                                {panel.name}
                              </Text>
                            </TouchableOpacity>
                          )
                        })}
                      </XStack>
                    </ScrollView>
                  </View>
                </XStack>
                <XStack gap="$2">
                  {!preferences?.receive && (
                    <IconButton onPress={toggleNotifications}>
                      <BellPlus size={16} color="white" />
                    </IconButton>
                  )}
                  <IconButton
                    href={{
                      pathname: '/settings/notifications',
                    }}
                  >
                    <Settings size={16} color="white" />
                  </IconButton>
                </XStack>
              </XStack>
              {page === 2 && (
                <Animated.View style={[animatedTypeBarStyle]}>
                  <XStack padding="$2" justifyContent="space-around" alignItems="center">
                    <View width={32} height={32}>
                      <IconButton onPress={() => setTypes(undefined)}>
                        <View
                          width={16}
                          height={16}
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Text
                            color={types ? theme.mauve11.val : 'white'}
                            fontSize="$2"
                            fontWeight="600"
                          >
                            All
                          </Text>
                        </View>
                      </IconButton>
                    </View>
                    <View width={32} height={32}>
                      <IconButton onPress={() => setTypes(['LIKE'])}>
                        <Heart
                          size={16}
                          color={types?.includes('LIKE') ? 'white' : '$mauve9'}
                        />
                      </IconButton>
                    </View>
                    <View width={32} height={32}>
                      <IconButton onPress={() => setTypes(['RECAST'])}>
                        <FontAwesome6
                          name="retweet"
                          size={16}
                          color={types?.includes('RECAST') ? 'white' : theme.mauve9.val}
                        />
                      </IconButton>
                    </View>
                    <View width={32} height={32}>
                      <IconButton onPress={() => setTypes(['FOLLOW'])}>
                        <FontAwesome
                          name="user"
                          size={16}
                          color={types?.includes('FOLLOW') ? 'white' : theme.mauve9.val}
                        />
                      </IconButton>
                    </View>
                    <View width={32} height={32}>
                      <IconButton onPress={() => setTypes(['REPLY'])}>
                        <MessageSquare
                          size={16}
                          color={types?.includes('REPLY') ? 'white' : theme.mauve9.val}
                        />
                      </IconButton>
                    </View>
                    <View width={32} height={32}>
                      <IconButton onPress={() => setTypes(['MENTION'])}>
                        <AtSign
                          size={16}
                          color={types?.includes('MENTION') ? 'white' : theme.mauve9.val}
                        />
                      </IconButton>
                    </View>
                    <View width={32} height={32}>
                      <IconButton onPress={() => setTypes(['QUOTE'])}>
                        <MessageSquareQuote
                          size={16}
                          color={types?.includes('QUOTE') ? 'white' : theme.mauve9.val}
                        />
                      </IconButton>
                    </View>
                  </XStack>
                </Animated.View>
              )}
            </Animated.View>
          ),
        }}
      />
      <YStack flex={1} backgroundColor="$color1">
        <PagerView
          ref={ref}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setPage(e.nativeEvent.position)}
        >
          {panels.map((panel, index) => (
            <View key={index + 1}>{panel.component}</View>
          ))}
        </PagerView>
      </YStack>
    </>
  )
}
