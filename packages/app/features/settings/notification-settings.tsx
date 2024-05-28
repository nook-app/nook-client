import { NookText, Switch, Text, XStack, YStack } from "@nook/app-ui";
import { useAuth } from "../../context/auth";
import {
  createNotificationUser,
  deleteNotificationsUser,
  updateNotificationPreferences,
} from "../../api/settings/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { haptics } from "../../utils/haptics";
import { useCallback } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";
import Constants from "expo-constants";

export const NotificationSettings = () => {
  const { settings, session } = useAuth();
  const queryClient = useQueryClient();

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

  const toggleNotifications = async () => {
    if (settings?.notifications?.disabled) {
      await registerForPushNotificationsAsync();
      return;
    }

    if (!settings?.notifications) {
      return;
    }

    const data = {
      disabled: false,
      onlyPowerBadge: true,
      receive: !settings.notifications.receive,
      subscriptions: [],
    };

    await updateNotificationPreferences(data);
    queryClient.invalidateQueries({ queryKey: ["settings", session?.fid] });
    haptics.notificationSuccess();
  };

  return (
    <YStack gap="$4" padding="$2.5">
      <NookText muted>Manage the kinds of notifications you receive.</NookText>
      <XStack gap="$4" justifyContent="space-between">
        <YStack flex={1}>
          <Text color="$mauve12" fontWeight="600">
            Receive Notifications
          </Text>
          <Text color="$mauve11">
            Only receive notifications from users you follow or users with a
            power badge.
          </Text>
        </YStack>
        <Switch
          defaultChecked={settings?.notifications?.receive}
          onCheckedChange={toggleNotifications}
        >
          <Switch.Thumb backgroundColor="white" />
        </Switch>
      </XStack>
    </YStack>
  );
};
