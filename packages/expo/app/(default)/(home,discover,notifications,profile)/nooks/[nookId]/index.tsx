import { useAuth } from '@/context/auth'
import { useDrawer } from '@/context/drawer'
import { AlignJustify, Search } from '@tamagui/lucide-icons'
import { Stack, useLocalSearchParams } from 'expo-router'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import PagerView from 'react-native-pager-view'
import {
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
  useTheme as useTamaguiTheme,
} from 'tamagui'
import { ScrollView as RNScrollView } from 'react-native'
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
import { Panel } from '@/components/panels/Panel'
import { Panel as PanelType } from '@/types'

export default function Home() {
  const { session, nooks, metadata } = useAuth()
  const { nookId } = useLocalSearchParams()
  const ref = useRef<PagerView>(null)
  const scrollViewRef = useRef<RNScrollView>(null)
  const { onOpen } = useDrawer()
  const [page, setPage] = useState(0)
  const [itemWidths, setItemWidths] = useState<number[]>([])
  const insets = useSafeAreaInsets()
  const { colorScheme } = useTheme()
  const { showNookOverlay, setShowNookOverlay } = useScroll()
  const theme = useTamaguiTheme()

  const headerHeight = useSharedValue(showNookOverlay ? 94 : 0)
  const headerPaddingTop = useSharedValue(showNookOverlay ? insets.top : 0)

  useEffect(() => {
    headerHeight.value = withTiming(showNookOverlay ? 94 : 0, { duration: 300 })
    headerPaddingTop.value = withTiming(showNookOverlay ? insets.top : 0, {
      duration: 300,
    })
  }, [showNookOverlay])

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      paddingTop: headerPaddingTop.value,
      opacity: withTiming(showNookOverlay ? 1 : 0, { duration: 300 }),
    }
  })

  useEffect(() => {
    setShowNookOverlay(true)
    const sumWidths = itemWidths.slice(0, page).reduce((a, b) => a + b, 0)
    scrollViewRef.current?.scrollTo({ x: sumWidths, animated: true })
  }, [page])

  const nook = useMemo(() => nooks.find((nook) => nook.id === nookId), [nookId, nooks])
  const nookOrder = metadata?.order?.find((order) => order[0] === nookId)

  const panels = nookOrder
    ? (nookOrder[1]
        .map((id) => nook?.panels.find((panel) => panel.id === id))
        .filter(Boolean) as PanelType[])
    : nook?.panels

  const components =
    panels?.map((panel) => ({
      name: panel.name,
      component: <Panel panel={panel} />,
    })) || []

  if (!session?.fid)
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
                  borderBottomWidth: 0.25,
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
              <XStack flex={1} alignItems="center" gap="$2">
                <IconButton onPress={onOpen}>
                  <AlignJustify size={16} color="white" />
                </IconButton>
                <View maxWidth="85%">
                  <ScrollView
                    horizontal
                    ref={scrollViewRef}
                    showsHorizontalScrollIndicator={false}
                  >
                    <XStack alignItems="center" padding="$2" gap="$3">
                      {components.map((component, index) => {
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
                              {component.name}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </XStack>
                  </ScrollView>
                </View>
              </XStack>
              <View>
                <IconButton href={{ pathname: '/search/[query]' }}>
                  <Search size={16} color="white" />
                </IconButton>
              </View>
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
          onPageScroll={(e) =>
            setPage(Math.round(e.nativeEvent.offset + e.nativeEvent.position))
          }
        >
          {components.map((component, index) => (
            <LazyLoadView key={index + 1} index={index} currentIndex={page}>
              {component.component}
            </LazyLoadView>
          ))}
        </PagerView>
      </YStack>
    </>
  )
}

const LazyLoadView = ({
  currentIndex,
  index,
  children,
}: { currentIndex: number; index: number; children: ReactNode }) => {
  const [rendered, setRendered] = useState(false)
  const isActive = indexIsActive(currentIndex, index)

  useEffect(() => {
    if (isActive && !rendered) setRendered(true)
  }, [isActive, rendered])

  if (!rendered) {
    return (
      <View key={index + 1}>
        <Spinner />
      </View>
    )
  }

  return (
    <View key={index + 1} flex={1}>
      {children}
    </View>
  )
}

function indexIsActive(currentIndex: number, myIndex: number) {
  return (
    currentIndex == myIndex || currentIndex - 1 == myIndex || currentIndex + 1 == myIndex
  )
}
