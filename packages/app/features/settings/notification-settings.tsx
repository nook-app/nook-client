import { NookText, Switch, Text, XStack, YStack } from "@nook/app-ui";
import { useAuth } from "../../context/auth";
import { useNotifications } from "../../context/notifications";
import { updateNotificationPreferences } from "../../api/settings/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { haptics } from "../../utils/haptics";

export const NotificationSettings = () => {
  const { settings, session } = useAuth();
  const { registerForPushNotificationsAsync } = useNotifications();
  const queryClient = useQueryClient();

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
