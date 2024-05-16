import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { HEADER_HEIGHT, PagerLayout } from "../../../../components/PagerLayout";
import { useAuth } from "@nook/app/context/auth";
import { UserFilterType } from "@nook/common/types";
import { IconButton } from "../../../../components/IconButton";
import { NookText, View } from "@nook/app-ui";
import { DrawerToggleButton } from "../../../../components/DrawerToggleButton";
import { Link } from "@nook/app/components/link";
import { Search } from "@tamagui/lucide-icons";
import { CreateActionButton } from "../../../../components/ActionButton";

export default function HomeScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const { session } = useAuth();

  if (!session?.fid) return null;

  return (
    <>
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
              Home
            </NookText>
            <Link
              href={{
                pathname: "/search",
              }}
              unpressable
            >
              <IconButton icon={Search} />
            </Link>
          </View>
        }
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
              <FarcasterFilteredFeed
                paddingBottom={paddingBottom}
                paddingTop={HEADER_HEIGHT}
                api="https://api.neynar.com/v2/farcaster/feed/trending"
                filter={{}}
              />
            ),
          },
        ]}
      />
      <CreateActionButton />
    </>
  );
}
