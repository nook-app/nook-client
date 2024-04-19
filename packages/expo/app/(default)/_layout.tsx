import { Redirect, Tabs, usePathname } from 'expo-router'
import { ElementType, memo, useCallback, useEffect } from 'react'
import { Bell, LayoutGrid, Plus, Search } from '@tamagui/lucide-icons'
import { Avatar, Text, View, useTheme as useTamaguiTheme } from 'tamagui'
import { useAuth } from '@/context/auth'
import { SheetType, useSheets } from '@/context/sheet'
import { useNotifications } from '@/context/notifications'
import { useUser } from '@/hooks/useUser'
import { UserAvatar } from '@/components/UserAvatar'
import { Drawer } from 'react-native-drawer-layout'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { useWindowDimensions } from 'react-native'
import { useDrawer } from '@/context/drawer'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/context/theme'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useScroll } from '@/context/scroll'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDebouncedNavigate } from '@/hooks/useDebouncedNavigate'

export default function TabLayout() {
  const { width } = useWindowDimensions()
  const { open, onOpen, onClose } = useDrawer()
  const { session } = useAuth()
  const pathname = usePathname()

  if (!session?.fid) {
    return <Redirect href="/login" />
  }

  return (
    <Drawer
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      renderDrawerContent={() => <Sidebar />}
      drawerType="back"
      statusBarAnimation="slide"
      swipeEdgeWidth={160}
      swipeMinDistance={0}
      drawerStyle={{
        width: width * 0.8,
      }}
      swipeEnabled={pathname.startsWith('/nooks') || pathname.startsWith('/feeds')}
    >
      <MemoTabs />
    </Drawer>
  )
}

const MemoTabs = memo(() => {
  const theme = useTamaguiTheme()
  const { openSheet } = useSheets()
  const { markNotificationsRead } = useNotifications()
  const { showNookOverlay, showFeedOverlay, showNotificationsOverlay } = useScroll()

  const pathname = usePathname()

  const isNotificationsPath = ['/notifications'].includes(pathname)
  const isNooksPath = pathname.includes('/nooks')
  const isFeedsPath = pathname.includes('/feeds')

  const showTabBar =
    !(isNotificationsPath || isNooksPath || isFeedsPath) ||
    (isNooksPath && showNookOverlay) ||
    (isFeedsPath && showFeedOverlay) ||
    (isNotificationsPath && showNotificationsOverlay)

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'red',
        headerShown: false,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          borderTopWidth: 0.25,
          borderTopColor: theme.color3.val,
          position: 'absolute',
          opacity: showTabBar ? 1 : 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={LayoutGrid} focusType="fill" />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(discover)"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={Search} focusType="stroke" />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="dummy"
        options={{
          title: 'Create',
          tabBarIcon: () => <TabBarCreateButton />,
          tabBarShowLabel: false,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault()
          },
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ focused }) => <TabBarNotificationIcon focused={focused} />,
          tabBarShowLabel: false,
        }}
        listeners={{
          tabPress: (e) => {
            markNotificationsRead()
          },
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabBarUserImage focused={focused} />,
          tabBarShowLabel: false,
        }}
        listeners={{
          tabPress: (e) => {},
          tabLongPress: (e) => {
            openSheet(SheetType.SwitchAccount)
          },
        }}
      />
    </Tabs>
  )
})

const TabBarBackground = memo(() => {
  const { colorScheme } = useTheme()

  return (
    <BlurView
      intensity={50}
      tint={colorScheme}
      style={{
        flex: 1,
      }}
    >
      <View backgroundColor="$color1" flex={1} opacity={0.5} />
    </BlurView>
  )
})

const TabBarCreateButton = memo(() => {
  const pathname = usePathname()
  const { navigate } = useDebouncedNavigate()

  const onPress = useCallback(() => {
    const channelId = pathname.startsWith('/channels')
      ? pathname.split('/')[2]
      : undefined
    navigate(
      {
        pathname: `/create/post`,
        params: { channelId },
      },
      {
        segments: true,
      }
    )
  }, [pathname])

  return (
    <TouchableOpacity
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={onPress}
    >
      <View
        backgroundColor="$color9"
        borderRadius="$10"
        height="$2.5"
        width="$2.5"
        alignItems="center"
        justifyContent="center"
      >
        <Plus size={20} color="white" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  )
})

const TabBarIcon = memo(
  ({
    focused,
    icon: Icon,
    focusType,
  }: {
    focused: boolean
    icon: ElementType
    focusType: 'stroke' | 'fill'
  }) => {
    const theme = useTamaguiTheme()
    const style = focused
      ? {
          color: '$mauve12',
          strokeWidth: focusType === 'stroke' ? 3 : 2,
          fill: focusType === 'fill' ? theme.mauve12.val : 'transparent',
        }
      : {
          color: '$mauve12',
          strokeWidth: 2,
          fill: 'transparent',
        }

    return (
      <View
        borderRadius="$10"
        padding="$2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon
          size={20}
          color={style.color}
          strokeWidth={style.strokeWidth}
          fill={style.fill}
        />
      </View>
    )
  }
)

const TabBarUserImage = memo(({ focused }: { focused: boolean }) => {
  const { session } = useAuth()
  const { user } = useUser(session?.fid || '')

  return (
    <Avatar
      circular
      size="$2"
      {...(focused
        ? {
            borderRadius: '$10',
            borderWidth: '$0.5',
            borderColor: '$mauve12',
          }
        : {})}
    >
      <UserAvatar pfp={user?.pfp} size="$2" />
    </Avatar>
  )
})

const TabBarNotificationIcon = memo(({ focused }: { focused: boolean }) => {
  const theme = useTamaguiTheme()
  const { count } = useNotifications()

  const boxSize = count > 99 ? 12 : count > 9 ? 18 : 16

  return (
    <View>
      <View
        borderRadius="$10"
        padding="$2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Bell
          size={20}
          color="$mauve12"
          strokeWidth={2}
          fill={focused ? theme.mauve12.val : 'transparent'}
        />
      </View>
      {count > 0 && (
        <View
          position="absolute"
          backgroundColor="$red9"
          borderRadius="$10"
          right={0}
          justifyContent="center"
          alignItems="center"
          width={boxSize}
          height={boxSize}
        >
          <Text fontWeight="600" fontSize={count > 9 ? 10 : '$1'} color="white">
            {count > 99 ? '' : count}
          </Text>
        </View>
      )}
    </View>
  )
})
