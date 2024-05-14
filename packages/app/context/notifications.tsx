import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";
import { AppState, Platform } from "react-native";
import Constants from "expo-constants";
import {
  FarcasterFollowNotification,
  FarcasterLikeNotification,
  FarcasterMentionNotification,
  FarcasterPostNotification,
  FarcasterQuoteNotification,
  FarcasterRecastNotification,
  FarcasterReplyNotification,
  NotificationType,
} from "@nook/common/types";
import { router } from "expo-router";
import { Href } from "expo-router/build/link/href";
import {
  createNotificationUser,
  deleteNotificationsUser,
} from "../api/settings/notifications";

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type NotificationsContextType = {
  registerForPushNotificationsAsync: () => Promise<void>;
};

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

type SheetProviderProps = {
  children: ReactNode;
};

export const NotificationsProvider = ({ children }: SheetProviderProps) => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const notificationListener = useRef<ExpoNotifications.Subscription>();
  const responseListener = useRef<ExpoNotifications.Subscription>();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        ExpoNotifications.setBadgeCountAsync(0);
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const registerForPushNotificationsAsync = useCallback(async () => {
    if (Platform.OS === "android") {
      ExpoNotifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: ExpoNotifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (!Device.isDevice) {
      return;
    }

    const { status: existingStatus } =
      await ExpoNotifications.getPermissionsAsync();
    if (existingStatus !== "granted") {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      if (status !== "granted") {
        await deleteNotificationsUser();
        queryClient.invalidateQueries({
          queryKey: ["settings", session?.fid],
        });
      }
    }

    const pushToken = await ExpoNotifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas.projectId,
    });

    const token = pushToken?.data;
    if (!token) {
      return;
    }

    await createNotificationUser(token);
    queryClient.invalidateQueries({
      queryKey: ["settings", session?.fid],
    });
  }, [session, queryClient]);

  useEffect(() => {
    if (!session?.fid) return;

    registerForPushNotificationsAsync();

    // notification received
    notificationListener.current =
      ExpoNotifications.addNotificationReceivedListener((notification) => {});

    // on notification click
    responseListener.current =
      ExpoNotifications.addNotificationResponseReceivedListener((response) => {
        const type = response.notification.request.content.data
          .type as NotificationType;
        let navigationPath: Href | undefined;
        switch (type) {
          case NotificationType.POST: {
            const data = response.notification.request.content
              .data as FarcasterPostNotification;
            navigationPath = {
              pathname: "/casts/[hash]",
              params: { hash: data.data.hash },
            };
            break;
          }
          case NotificationType.MENTION: {
            const data = response.notification.request.content
              .data as FarcasterMentionNotification;
            navigationPath = {
              pathname: "/casts/[hash]",
              params: { hash: data.data.hash },
            };
            break;
          }
          case NotificationType.REPLY: {
            const data = response.notification.request.content
              .data as FarcasterReplyNotification;
            navigationPath = {
              pathname: "/casts/[hash]",
              params: { hash: data.data.hash },
            };
            break;
          }
          case NotificationType.LIKE: {
            const data = response.notification.request.content
              .data as FarcasterLikeNotification;
            navigationPath = {
              pathname: "/casts/[hash]",
              params: { hash: data.data.targetHash },
            };
            break;
          }
          case NotificationType.RECAST: {
            const data = response.notification.request.content
              .data as FarcasterRecastNotification;
            navigationPath = {
              pathname: "/casts/[hash]",
              params: { hash: data.data.targetHash },
            };
            break;
          }
          case NotificationType.QUOTE: {
            const data = response.notification.request.content
              .data as FarcasterQuoteNotification;
            navigationPath = {
              pathname: "/casts/[hash]",
              params: { hash: data.data.hash },
            };
            break;
          }
          case NotificationType.FOLLOW: {
            const data = response.notification.request.content
              .data as FarcasterFollowNotification;
            navigationPath = {
              pathname: "/users/[fid]",
              params: { fid: data.sourceFid },
            };
            break;
          }
        }

        router.push(navigationPath);
      });

    return () => {
      if (notificationListener.current) {
        ExpoNotifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        ExpoNotifications.removeNotificationSubscription(
          responseListener.current,
        );
      }
    };
  }, [session, registerForPushNotificationsAsync]);

  return (
    <NotificationsContext.Provider
      value={{
        registerForPushNotificationsAsync,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};
