import { useAuth } from "@nook/app/context/auth";
import { ListType } from "@nook/common/types";
import { ManageListFeed } from "@nook/app/features/list/manage-list";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";
import { View } from "@nook/app-ui";

export default function ListsManageScreen() {
  const { session } = useAuth();
  const paddingBottom = useBottomTabBarHeight();
  const { user, channel } = useLocalSearchParams();

  if (!session?.fid) return null;

  if (user) {
    return (
      <View flex={1} backgroundColor="$color1">
        <ManageListFeed
          filter={{ type: ListType.USERS, userId: session.id }}
          paddingBottom={paddingBottom}
          user={JSON.parse(user as string)}
        />
      </View>
    );
  }

  if (channel) {
    return (
      <View flex={1} backgroundColor="$color1">
        <ManageListFeed
          filter={{ type: ListType.PARENT_URLS, userId: session.id }}
          paddingBottom={paddingBottom}
          channel={JSON.parse(channel as string)}
        />
      </View>
    );
  }

  return <></>;
}
