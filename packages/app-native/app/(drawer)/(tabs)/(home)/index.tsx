import { FarcasterTrendingFeed } from "@nook/app/features/farcaster/cast-feed/trending-feed";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { HEADER_HEIGHT, PagerLayout } from "../../../../components/PagerLayout";
import { useAuth } from "@nook/app/context/auth";
import { UserFilterType } from "@nook/common/types";

export default function HomeScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const { session } = useAuth();

  if (!session?.fid) return null;

  return (
    <PagerLayout
      title="Home"
      pages={[
        {
          name: "Following",
          component: (
            <FarcasterFilteredFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              filter={{
                users: {
                  type: UserFilterType.FOLLOWING,
                  data: {
                    fid: session?.fid,
                  },
                },
              }}
            />
          ),
        },
        {
          name: "For you",
          component: (
            <FarcasterFilteredFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              api={`https://graph.cast.k3l.io/casts/personalized/popular/${session?.fid}`}
              filter={{}}
            />
          ),
        },
        {
          name: "Trending",
          component: (
            <FarcasterTrendingFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
            />
          ),
        },
      ]}
    />
  );
}
