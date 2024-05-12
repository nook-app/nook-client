import {
  NotificationsAllFeed,
  NotificationsMentionsFeed,
  NotificationsPriorityFeed,
} from "@nook/app/features/notifications/notifications-tabs";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { HEADER_HEIGHT, PagerLayout } from "../../../../components/PagerLayout";
import { useAuth } from "@nook/app/context/auth";

export default function NotificationsScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const { session } = useAuth();

  if (!session?.fid) return null;

  return (
    <PagerLayout
      title="Notifications"
      pages={[
        {
          name: "Following",
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
