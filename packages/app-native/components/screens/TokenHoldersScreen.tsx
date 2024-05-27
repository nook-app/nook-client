import { useLocalSearchParams } from "expo-router";
import { CollapsibleHeaderLayout } from "../CollapsibleHeaderLayout";
import { HEADER_HEIGHT } from "../PagerLayout";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useToken } from "@nook/app/hooks/useToken";
import {
  FarcasterTokenHolders,
  FollowingTokenHolders,
  TokenHolders,
} from "@nook/app/features/token/token-holders";

export default function NftCollectorsScreen({
  defaultIndex,
}: { defaultIndex: number }) {
  const { tokenId } = useLocalSearchParams();
  const { token } = useToken(tokenId as string);
  const paddingBottom = useBottomTabBarHeight();

  if (!token) return null;

  return (
    <CollapsibleHeaderLayout
      title={`${token.symbol || token.name} Holders`}
      pages={[
        {
          name: "Following",
          component: (
            <FollowingTokenHolders
              token={token}
              paddingTop={HEADER_HEIGHT}
              paddingBottom={paddingBottom}
            />
          ),
        },
        {
          name: "On Farcaster",
          component: (
            <FarcasterTokenHolders
              token={token}
              paddingTop={HEADER_HEIGHT}
              paddingBottom={paddingBottom}
            />
          ),
        },
        {
          name: "All Collectors",
          component: (
            <TokenHolders
              token={token}
              paddingTop={HEADER_HEIGHT}
              paddingBottom={paddingBottom}
            />
          ),
        },
      ]}
      defaultIndex={defaultIndex}
    />
  );
}
