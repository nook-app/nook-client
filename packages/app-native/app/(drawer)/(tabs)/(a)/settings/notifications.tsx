import { ScrollView } from "@nook/app-ui";
import { NotificationSettings } from "@nook/app/features/settings/notification-settings";

export default function NotificationsSettingsScreen() {
  return (
    <ScrollView backgroundColor="$color1">
      <NotificationSettings />
    </ScrollView>
  );
}
