import { useLocalSearchParams } from "expo-router";
import { FarcasterUserFollowers } from "@nook/app/features/farcaster/user-profile/user-followers";
import { FarcasterUserFollowing } from "@nook/app/features/farcaster/user-profile/user-following";
import { FarcasterUserMutuals } from "@nook/app/features/farcaster/user-profile/user-mutuals";
import { useUser } from "@nook/app/hooks/useUser";
import { View } from "@nook/app-ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CollapsibleHeaderLayout } from "../CollapsibleHeaderLayout";

export default function UserFollowingScreen() {
  const { username } = useLocalSearchParams();
  const { user } = useUser(username as string);
  const insets = useSafeAreaInsets();

  if (!user) return null;

  return (
    <View paddingTop={insets.top} flexGrow={1} backgroundColor="$color1">
      <CollapsibleHeaderLayout
        title={user.displayName || (username as string)}
        pages={[
          {
            name: "Followers you know",
            component: (
              <FarcasterUserMutuals username={username as string} asTabs />
            ),
          },
          {
            name: "Followers",
            component: (
              <FarcasterUserFollowers username={username as string} asTabs />
            ),
          },
          {
            name: "Following",
            component: (
              <FarcasterUserFollowing username={username as string} asTabs />
            ),
          },
        ]}
        defaultIndex={2}
      />
    </View>
  );
}
