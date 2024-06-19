import { useLocalSearchParams } from "expo-router";
import { useNftCollection } from "@nook/app/hooks/useNftCollection";
import { CollapsibleHeaderLayout } from "../CollapsibleHeaderLayout";
import {
  NftCollectionCollectors,
  NftCollectionFarcasterCollectors,
  NftCollectionFollowingCollectors,
} from "@nook/app/features/nft/nft-collection-collectors";
import { HEADER_HEIGHT } from "../PagerLayout";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function NftCollectionCollectorsScreen({
  defaultIndex,
}: { defaultIndex: number }) {
  const { collectionId } = useLocalSearchParams();
  const { collection } = useNftCollection(collectionId as string);
  const paddingBottom = useBottomTabBarHeight();

  if (!collection.collection_id) return null;

  return (
    <CollapsibleHeaderLayout
      title={`${collection.name ? `${collection.name} ` : ""}Collectors`}
      pages={[
        {
          name: "Following",
          component: (
            <NftCollectionFollowingCollectors
              req={{
                collectionId: collection.collection_id,
              }}
              paddingTop={HEADER_HEIGHT}
              paddingBottom={paddingBottom}
            />
          ),
        },
        {
          name: "On Farcaster",
          component: (
            <NftCollectionFarcasterCollectors
              req={{
                collectionId: collection.collection_id,
              }}
              paddingTop={HEADER_HEIGHT}
              paddingBottom={paddingBottom}
            />
          ),
        },
        {
          name: "All Collectors",
          component: (
            <NftCollectionCollectors
              req={{
                collectionId: collection.collection_id,
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
