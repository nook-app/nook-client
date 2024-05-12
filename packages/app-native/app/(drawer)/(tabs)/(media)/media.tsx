import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { HEADER_HEIGHT, PagerLayout } from "../../../../components/PagerLayout";
import { useAuth } from "@nook/app/context/auth";
import { Display, UserFilterType } from "@nook/common/types";
import { NookText, View } from "@nook/app-ui";
import { DrawerToggleButton } from "../../../../components/DrawerToggleButton";

export default function MediaScreen() {
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
            Media
          </NookText>
          <View width="$2.5" />
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
                contentTypes: ["image", "video"],
              }}
              displayMode={Display.MEDIA}
            />
          ),
        },
        {
          name: "Latest",
          component: (
            <FarcasterFilteredFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              filter={{
                users: {
                  type: UserFilterType.POWER_BADGE,
                  data: {
                    badge: true,
                  },
                },
                contentTypes: ["image", "video"],
              }}
              displayMode={Display.MEDIA}
            />
          ),
        },
      ]}
    />
  );
}
