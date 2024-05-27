"use client";

import {
  NookButton,
  NookText,
  Popover,
  Text,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { SimpleHashCollection } from "@nook/common/types";
import { ZoomableImage } from "../../components/zoomable-image";
import { CdnAvatar } from "../../components/cdn-avatar";
import { FarcasterBioText } from "../../components/farcaster/bio-text";
import { formatAddress, formatNumber } from "../../utils";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { Link } from "../../components/link";
import { memo } from "react";
import { NftCollectionMenu } from "./nft-collection-menu";
import { useAuth } from "../../context/auth";
import { fetchCollectionMutualsPreview } from "../../api/nft";
import { useQuery } from "@tanstack/react-query";
import { ChainBadge } from "../../components/blockchain/chain-badge";
import { SIMPLEHASH_CHAINS } from "@nook/common/utils";

export const NftCollectionHeader = memo(
  ({
    collection,
    disableMenu,
  }: { collection: SimpleHashCollection; disableMenu?: boolean }) => {
    const bio = collection?.description?.trim().replace(/\n\s*\n/g, "\n");
    const contract = collection?.top_contracts?.[0];
    const chainId = SIMPLEHASH_CHAINS.find(
      (c) => c.id === contract?.split(".")[0],
    )?.crossChainId;
    return (
      <YStack gap="$3" padding="$2.5">
        <YStack gap="$2">
          <XStack justifyContent="space-between" gap="$2">
            <ZoomableImage uri={collection.image_url}>
              <View cursor="pointer">
                <CdnAvatar
                  src={collection.image_url}
                  size="$10"
                  skipCdn
                  borderRadius="$4"
                />
              </View>
            </ZoomableImage>
            <XStack gap="$2">
              {!disableMenu && (
                <NftCollectionMenu
                  collection={collection}
                  trigger={
                    <Popover.Trigger asChild>
                      <NookButton
                        variant="active-action"
                        width="$3"
                        height="$3"
                        padding="$0"
                      >
                        <MoreHorizontal size={20} color="$mauve12" />
                      </NookButton>
                    </Popover.Trigger>
                  }
                />
              )}
            </XStack>
          </XStack>
          <YStack gap="$1">
            <XStack gap="$1.5" alignItems="center">
              <NookText fontWeight="700" fontSize="$6">
                {collection.name}
              </NookText>
            </XStack>
            {contract && chainId && (
              <XStack gap="$2">
                <ChainBadge chainId={chainId} hideLabel />
                <NookText muted>
                  {formatAddress(contract.split(".")[1])}
                </NookText>
              </XStack>
            )}
          </YStack>
        </YStack>
        {bio && <FarcasterBioText text={bio} selectable numberOfLines={4} />}
        <XStack gap="$2">
          <View flexDirection="row" alignItems="center" gap="$1.5">
            <NookText fontWeight="600">
              {formatNumber(collection.distinct_nft_count || 0)}
            </NookText>
            <NookText muted>items</NookText>
          </View>
          <Link
            href={`/collections/${collection.collection_id}/collectors-farcaster`}
            touchable
          >
            <View flexDirection="row" alignItems="center" gap="$1.5">
              <NookText fontWeight="600">
                {formatNumber(collection.distinct_owner_count || 0)}
              </NookText>
              <NookText muted>collectors</NookText>
            </View>
          </Link>
        </XStack>
        <NftCollectionMutuals collection_id={collection.collection_id} />
      </YStack>
    );
  },
);

export const NftCollectionMutuals = ({
  collection_id,
}: { collection_id: string }) => {
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["nftCollectionMutualsPreview", collection_id],
    queryFn: async () => {
      return await fetchCollectionMutualsPreview(collection_id);
    },
    enabled: !!session?.fid,
  });

  if (!session || !data) return null;

  const total = data?.total || 0;
  const previews = data?.preview || [];
  const other = total - previews.length;

  let label = "Not collected by anyone you’re following";

  switch (previews.length) {
    case 3:
      if (other > 0) {
        label = `Collected by ${previews[0].username}, ${
          previews[1].username
        }, and ${other} other${other > 1 ? "s" : ""} you follow`;
      } else {
        label = `Collected by ${previews[0].username}, ${previews[1].username}, and ${previews[2].username}`;
      }
      break;
    case 2:
      label = `Collected by ${previews[0].username} and ${previews[1].username}`;
      break;
    case 1:
      label = `Collected by ${previews[0].username}`;
  }

  return (
    <Link href={`/collections/${collection_id}/collectors-following`} touchable>
      <XStack
        gap="$3"
        alignItems="center"
        cursor="pointer"
        group
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        {previews.length > 0 && (
          <XStack>
            {previews.map((user) => (
              <View key={user.fid} marginRight="$-2">
                <CdnAvatar src={user.pfp} size="$1" />
              </View>
            ))}
          </XStack>
        )}
        {/* @ts-ignore */}
        <Text
          opacity={0.8}
          $group-hover={{
            textDecoration: "underline",
          }}
          flexShrink={1}
        >
          {label}
        </Text>
      </XStack>
    </Link>
  );
};
