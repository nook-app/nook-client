import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { SimpleHashCollection } from "@nook/common/types";
import { NookText, Popover, XStack } from "@nook/app-ui";
import { CollapsibleGradientLayout } from "../CollapsibleGradientLayout";
import { Loading } from "@nook/app/components/loading";
import { IconButton } from "../IconButton";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { memo, useCallback, useState } from "react";
import { useNftCollection } from "@nook/app/hooks/useNftCollection";
import { NftCollectionMenu } from "@nook/app/features/nft/nft-collection-menu";
import { NftCollectionHeader } from "@nook/app/features/nft/nft-collection-header";
import { CollectionNftsFeed } from "@nook/app/features/nft/nft-feed";

export default function NftCollectionScreen() {
  const { collectionId } = useLocalSearchParams();
  const { collection } = useNftCollection(collectionId as string);

  if (!collection) return <Loading />;

  return (
    <CollapsibleGradientLayout
      title={<Title collection={collection} />}
      src={collection.image_url || collection.name}
      header={<NftCollectionHeader collection={collection} disableMenu />}
      pages={[
        {
          name: "Activity",
          component: <></>,
        },
        {
          name: "Items",
          component: (
            <CollectionNftsFeed collectionId={collectionId as string} asTabs />
          ),
        },
      ]}
      right={<Menu collection={collection} />}
    />
  );
}

const Menu = memo(({ collection }: { collection: SimpleHashCollection }) => {
  const [showMenu, setShowMenu] = useState(false);

  useFocusEffect(useCallback(() => setShowMenu(true), []));

  return (
    <XStack gap="$2" justifyContent="flex-end">
      {showMenu ? (
        <NftCollectionMenu
          collection={collection}
          trigger={
            <Popover.Trigger asChild>
              <IconButton icon={MoreHorizontal} />
            </Popover.Trigger>
          }
        />
      ) : (
        <IconButton icon={MoreHorizontal} />
      )}
    </XStack>
  );
});

const Title = memo(({ collection }: { collection: SimpleHashCollection }) => {
  return (
    <XStack alignItems="center" gap="$2" flexShrink={1}>
      <NookText
        fontSize="$5"
        fontWeight="700"
        ellipsizeMode="tail"
        numberOfLines={1}
        flexShrink={1}
      >
        {collection.name}
      </NookText>
    </XStack>
  );
});
