import {
  NotificationsAllFeed,
  NotificationsMentionsFeed,
  NotificationsPriorityFeed,
} from "@nook/app/features/notifications/notifications-tabs";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { HEADER_HEIGHT, PagerLayout } from "../../../../components/PagerLayout";
import { useAuth } from "@nook/app/context/auth";
import { NookText, View } from "@nook/app-ui";
import { DrawerToggleButton } from "../../../../components/DrawerToggleButton";

export default function NotificationsScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const { session } = useAuth();

  if (!session?.fid) return null;

  return (
    <PagerLayout
      title={
        <View
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingVertical="$2"
        >
          <DrawerToggleButton />
          <NookText fontSize="$5" fontWeight="600">
            Notifications
          </NookText>
          <View width="$2.5" />
        </View>
      }
      pages={[
        {
          name: "Priority",
          component: (
            <NotificationsPriorityFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              fid={session.fid}
            />
          ),
        },
        {
          name: "Mentions",
          component: (
            <NotificationsMentionsFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              fid={session.fid}
            />
          ),
        },
        {
          name: "All",
          component: (
            <NotificationsAllFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              fid={session.fid}
            />
          ),
        },
      ]}
    />
  );
}
