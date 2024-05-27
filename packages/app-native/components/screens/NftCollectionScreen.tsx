import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { SimpleHashCollection } from "@nook/common/types";
import { Button, NookText, Popover, Text, XStack } from "@nook/app-ui";
import { CollapsibleGradientLayout } from "../CollapsibleGradientLayout";
import { Loading } from "@nook/app/components/loading";
import { IconButton } from "../IconButton";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { memo, useCallback, useState } from "react";
import { useNftCollection } from "@nook/app/hooks/useNftCollection";
import { NftCollectionMenu } from "@nook/app/features/nft/nft-collection-menu";
import { NftCollectionHeader } from "@nook/app/features/nft/nft-collection-header";
import { CollectionNftsFeed } from "@nook/app/features/nft/nft-feed";
import { NftCollectionEvents } from "@nook/app/features/nft/nft-events";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { NftCollectionFarcasterCollectors } from "@nook/app/features/nft/nft-collection-collectors";
import { Link } from "@nook/app/components/link";

export default function NftCollectionScreen() {
  const { collectionId } = useLocalSearchParams();
  const { collection } = useNftCollection(collectionId as string);
  const paddingBottom = useBottomTabBarHeight();

  if (!collection) return <Loading />;

  return (
    <CollapsibleGradientLayout
      title={<Title collection={collection} />}
      src={collection.image_url || collection.name}
      header={<NftCollectionHeader collection={collection} disableMenu />}
      pages={[
        {
          name: "Activity",
          component: (
            <NftCollectionEvents
              req={{ collectionId: collectionId as string }}
              paddingBottom={paddingBottom}
              asTabs
            />
          ),
        },
        {
          name: "Items",
          component: (
            <CollectionNftsFeed
              collectionId={collectionId as string}
              paddingBottom={paddingBottom}
              asTabs
            />
          ),
        },
        {
          name: "Holders",
          component: (
            <NftCollectionFarcasterCollectors
              req={{
                collectionId: collectionId as string,
              }}
              paddingBottom={paddingBottom}
              asTabs
              ListHeaderComponent={
                <XStack
                  justifyContent="space-between"
                  paddingHorizontal="$2.5"
                  gap="$2.5"
                  paddingTop="$2.5"
                  paddingBottom="$1.5"
                  alignItems="center"
                >
                  <Text color="$mauve11">Collectors on Farcaster</Text>
                  <Link
                    href={`/collections/${collectionId}/collectors-following`}
                    unpressable
                  >
                    <Button
                      borderWidth="$0"
                      backgroundColor="$color4"
                      borderRadius="$10"
                      height="$2.5"
                      minHeight="$2.5"
                      padding="$0"
                      paddingHorizontal="$3"
                      fontWeight="500"
                      flexGrow={1}
                    >
                      View following
                    </Button>
                  </Link>
                  <Link
                    href={`/collections/${collectionId}/collectors`}
                    unpressable
                  >
                    <Button
                      borderWidth="$0"
                      backgroundColor="$color4"
                      borderRadius="$10"
                      height="$2.5"
                      minHeight="$2.5"
                      padding="$0"
                      paddingHorizontal="$3"
                      fontWeight="500"
                      flexGrow={1}
                    >
                      View all
                    </Button>
                  </Link>
                </XStack>
              }
            />
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
