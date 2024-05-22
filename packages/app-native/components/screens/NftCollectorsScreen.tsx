import { useLocalSearchParams } from "expo-router";
import { CollapsibleHeaderLayout } from "../CollapsibleHeaderLayout";
import {
  NftCollectors,
  NftFarcasterCollectors,
  NftFollowingCollectors,
} from "@nook/app/features/nft/nft-collectors";
import { HEADER_HEIGHT } from "../PagerLayout";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNft } from "@nook/app/hooks/useNft";

export default function NftCollectorsScreen({
  defaultIndex,
}: { defaultIndex: number }) {
  const { nftId } = useLocalSearchParams();
  const { nft } = useNft(nftId as string);
  const paddingBottom = useBottomTabBarHeight();

  if (!nft.nft_id) return null;

  return (
    <CollapsibleHeaderLayout
      title={`${nft.name ? `${nft.name} ` : ""}Collectors`}
      pages={[
        {
          name: "Following",
          component: (
            <NftFollowingCollectors
              req={{
                nftId: nft.nft_id,
              }}
              paddingTop={HEADER_HEIGHT}
              paddingBottom={paddingBottom}
            />
          ),
        },
        {
          name: "On Farcaster",
          component: (
            <NftFarcasterCollectors
              req={{
                nftId: nft.nft_id,
              }}
              paddingTop={HEADER_HEIGHT}
              paddingBottom={paddingBottom}
            />
          ),
        },
        {
          name: "All Collectors",
          component: (
            <NftCollectors
              req={{
                nftId: nft.nft_id,
              }}
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
