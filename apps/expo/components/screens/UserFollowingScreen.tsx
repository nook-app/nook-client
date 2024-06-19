import { useLocalSearchParams } from "expo-router";
import { FarcasterUserFollowers } from "@nook/app/features/farcaster/user-profile/user-followers";
import { FarcasterUserFollowing } from "@nook/app/features/farcaster/user-profile/user-following";
import { FarcasterUserMutuals } from "@nook/app/features/farcaster/user-profile/user-mutuals";
import { useUser } from "@nook/app/hooks/useUser";
import { CollapsibleHeaderLayout } from "../CollapsibleHeaderLayout";

export default function UserFollowingScreen() {
  const { username } = useLocalSearchParams();
  const { user } = useUser(username as string);

  if (!user) return null;

  return (
    <CollapsibleHeaderLayout
      title={user.displayName || (username as string)}
      pages={[
        {
          name: "Followers you know",
          component: <FarcasterUserMutuals fid={user.fid} asTabs />,
        },
        {
          name: "Followers",
          component: <FarcasterUserFollowers fid={user.fid} asTabs />,
        },
        {
          name: "Following",
          component: <FarcasterUserFollowing fid={user.fid} asTabs />,
        },
      ]}
      defaultIndex={2}
    />
  );
}
