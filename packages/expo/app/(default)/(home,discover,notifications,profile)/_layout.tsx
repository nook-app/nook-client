import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function ShelfLayout({ segment }: { segment: string }) {
  if (segment === '(home)') {
    return <HomeStack />
  }
  if (segment === '(discover)') {
    return <DiscoverStack />
  }
  if (segment === '(notifications)') {
    return <NotificationsStack />
  }
  if (segment === '(profile)') {
    return <ProfileStack />
  }
  return null
}

const ProfileStack = () => {
  const theme = useTheme()
  return (
    <Stack>
      <Stack.Screen
        name="profile/index"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="users/[fid]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="channels/[channelId]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="casts/[hash]"
        options={{
          title: 'Post',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="create/post"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="~"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          animationDuration: 200,
        }}
      />
    </Stack>
  )
}

const NotificationsStack = () => {
  const theme = useTheme()
  return (
    <Stack>
      <Stack.Screen
        name="notifications/index"
        options={{
          title: 'Notifications',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="users/[fid]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="channels/[channelId]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="casts/[hash]"
        options={{
          title: 'Post',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="create/post"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="~"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          animationDuration: 200,
        }}
      />
    </Stack>
  )
}

const DiscoverStack = () => {
  const theme = useTheme()
  return (
    <Stack>
      <Stack.Screen
        name="discover/index"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="search/[query]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="users/[fid]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="channels/[channelId]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="casts/[hash]"
        options={{
          title: 'Post',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="create/post"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="~"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          animationDuration: 200,
        }}
      />
    </Stack>
  )
}

const HomeStack = () => {
  const theme = useTheme()
  return (
    <Stack>
      <Stack.Screen
        name="nooks/[nookId]/index"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="nooks/[nookId]/settings"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="feeds/[feedId]/index"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="feeds/[feedId]/settings"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="search/[query]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="users/[fid]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="channels/[channelId]"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="casts/[hash]"
        options={{
          title: 'Post',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          headerShown: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="create/post"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="~"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          presentation: 'fullScreenModal',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          animationDuration: 200,
        }}
      />
    </Stack>
  )
}
