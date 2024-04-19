import {
  fetchNotificationUser,
  fetchNotificationsCount,
  markNotificationsRead,
} from '@/utils/api'
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './auth'
import * as Device from 'expo-device'
import * as ExpoNotifications from 'expo-notifications'
import { AppState, Platform } from 'react-native'
import Constants from 'expo-constants'
import { createNotificationUser, deleteNotificationsUser } from '@/utils/api'
import {
  FarcasterFollowNotification,
  FarcasterLikeNotification,
  FarcasterMentionNotification,
  FarcasterPostNotification,
  FarcasterQuoteNotification,
  FarcasterRecastNotification,
  FarcasterReplyNotification,
  NotificationPreferences,
  NotificationType,
} from '@/types'
import { router } from 'expo-router'
import { Href } from 'expo-router/build/link/href'

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

type NotificationsContextType = {
  count: number
  preferences?: NotificationPreferences
  registerForPushNotificationsAsync: () => Promise<void>
  markNotificationsRead: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
)

type SheetProviderProps = {
  children: ReactNode
}

export const NotificationsProvider = ({ children }: SheetProviderProps) => {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const notificationListener = useRef<ExpoNotifications.Subscription>()
  const responseListener = useRef<ExpoNotifications.Subscription>()
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        ExpoNotifications.setBadgeCountAsync(0)
      }
      setAppState(nextAppState)
    })

    return () => {
      subscription.remove()
    }
  }, [appState])

  const registerForPushNotificationsAsync = useCallback(async () => {
    if (!session?.fid) return

    if (Platform.OS === 'android') {
      ExpoNotifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: ExpoNotifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }

    if (!Device.isDevice) {
      return
    }

    const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync()
    if (existingStatus !== 'granted') {
      const { status } = await ExpoNotifications.requestPermissionsAsync()
      if (status !== 'granted') {
        await deleteNotificationsUser()
        queryClient.setQueryData<NotificationPreferences | undefined>(
          ['notificationsPreferences', session?.fid],
          (prev) => {
            if (!prev) return
            return {
              ...prev,
              disabled: true,
            }
          }
        )
      }
    }

    const pushToken = await ExpoNotifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas.projectId,
    })

    const token = pushToken?.data
    if (!token) {
      return
    }

    await createNotificationUser(token)
    queryClient.refetchQueries({ queryKey: ['notificationsPreferences', session?.fid] })
  }, [session, queryClient])

  useEffect(() => {
    if (!session?.fid) return

    registerForPushNotificationsAsync()

    // notification received
    notificationListener.current = ExpoNotifications.addNotificationReceivedListener(
      (notification) => {}
    )

    // on notification click
    responseListener.current = ExpoNotifications.addNotificationResponseReceivedListener(
      (response) => {
        const type = response.notification.request.content.data.type as NotificationType
        let navigationPath: Href | undefined
        switch (type) {
          case NotificationType.POST: {
            const data = response.notification.request.content
              .data as FarcasterPostNotification
            navigationPath = {
              pathname: `/casts/[hash]`,
              params: { hash: data.data.hash },
            }
            break
          }
          case NotificationType.MENTION: {
            const data = response.notification.request.content
              .data as FarcasterMentionNotification
            navigationPath = {
              pathname: `/casts/[hash]`,
              params: { hash: data.data.hash },
            }
            break
          }
          case NotificationType.REPLY: {
            const data = response.notification.request.content
              .data as FarcasterReplyNotification
            navigationPath = {
              pathname: `/casts/[hash]`,
              params: { hash: data.data.hash },
            }
            break
          }
          case NotificationType.LIKE: {
            const data = response.notification.request.content
              .data as FarcasterLikeNotification
            navigationPath = {
              pathname: `/casts/[hash]`,
              params: { hash: data.data.targetHash },
            }
            break
          }
          case NotificationType.RECAST: {
            const data = response.notification.request.content
              .data as FarcasterRecastNotification
            navigationPath = {
              pathname: `/casts/[hash]`,
              params: { hash: data.data.targetHash },
            }
            break
          }
          case NotificationType.QUOTE: {
            const data = response.notification.request.content
              .data as FarcasterQuoteNotification
            navigationPath = {
              pathname: `/casts/[hash]`,
              params: { hash: data.data.hash },
            }
            break
          }
          case NotificationType.FOLLOW: {
            const data = response.notification.request.content
              .data as FarcasterFollowNotification
            navigationPath = {
              pathname: `/users/[fid]`,
              params: { fid: data.sourceFid },
            }
            break
          }
        }

        router.push(navigationPath)
      }
    )

    return () => {
      if (notificationListener.current) {
        ExpoNotifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        ExpoNotifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [session])

  const { data: preferences } = useQuery({
    queryKey: ['notificationsPreferences', session?.fid],
    queryFn: fetchNotificationUser,
    enabled: !!session?.fid,
  })

  const { data, refetch } = useQuery<{ count: number }>({
    queryKey: ['notificationsCount', session?.fid],
    queryFn: fetchNotificationsCount,
    enabled: !!session?.fid,
    refetchInterval: 30000,
  })

  const mutate = useCallback(async () => {
    await markNotificationsRead()
    await refetch()
  }, [markNotificationsRead, refetch])

  return (
    <NotificationsContext.Provider
      value={{
        count: data?.count || 0,
        preferences,
        registerForPushNotificationsAsync,
        markNotificationsRead: mutate,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
