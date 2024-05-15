"use client";

import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { List, ListType } from "@nook/common/types";
import { ZoomableImage } from "../../components/zoomable-image";
import { CdnAvatar } from "../../components/cdn-avatar";
import { FarcasterBioText } from "../../components/farcaster/bio-text";
import { formatNumber } from "../../utils";
import { GradientIcon } from "../../components/gradient-icon";
import { useListStore } from "../../store/useListStore";
import { Link } from "../../components/link";

export const ListHeader = ({ list }: { list: List }) => {
  const itemCount = useListStore((state) => state.lists[list.id]?.itemCount);
  return (
    <YStack gap="$3" padding="$2.5">
      <YStack gap="$2">
        <XStack justifyContent="space-between" gap="$2">
          {list.imageUrl && (
            <ZoomableImage uri={list.imageUrl}>
              <View cursor="pointer">
                <CdnAvatar src={list.imageUrl} size="$6" />
              </View>
            </ZoomableImage>
          )}
          {!list.imageUrl && (
            <GradientIcon label={list.name} size="$6" borderRadius="$10">
              <NookText
                textTransform="uppercase"
                fontWeight="700"
                fontSize="$8"
              >
                {list.name.slice(0, 1)}
              </NookText>
            </GradientIcon>
          )}
          <View />
        </XStack>
        <NookText fontWeight="700" fontSize="$6">
          {list.name}
        </NookText>
        {list.description && (
          <FarcasterBioText text={list.description} selectable />
        )}
      </YStack>
      <XStack gap="$2">
        <Link href={`/lists/${list.id}/items`}>
          <View flexDirection="row" alignItems="center" gap="$1">
            <NookText fontWeight="600">{formatNumber(itemCount || 0)}</NookText>
            <NookText muted>
              {`${list.type === ListType.USERS ? "user" : "channel"}${
                itemCount === 1 ? "" : "s"
              }`}
            </NookText>
          </View>
        </Link>
      </XStack>
    </YStack>
  );
};
