import { useUser } from "@nook/app/hooks/useUser";
import { useLocalSearchParams } from "expo-router";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { UserFilterType } from "@nook/common/types";
import { Loading } from "@nook/app/components/loading";
import { View } from "@nook/app-ui";

export default function UserFeedScreen() {
  const { username } = useLocalSearchParams();
  const { user } = useUser(username as string);

  if (!user) return <Loading />;

  return (
    <View flex={1} backgroundColor="$color1">
      <FarcasterFilteredFeed
        filter={{
          users: {
            type: UserFilterType.FOLLOWING,
            data: {
              fid: user?.fid,
            },
          },
        }}
      />
    </View>
  );
}
