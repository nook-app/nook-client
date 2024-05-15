import { List, ListType } from "@nook/common/types";
import {
  AnimatePresence,
  Button,
  NookText,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { memo } from "react";
import { GradientIcon } from "../../components/gradient-icon";
import { Link } from "../../components/link";
import { formatNumber } from "../../utils";
import { CdnAvatar } from "../../components/cdn-avatar";
import { useListStore } from "../../store/useListStore";

export const ListFeedItem = memo(({ list }: { list: List }) => {
  const deletedLists = useListStore((state) => state.deletedLists);
  const itemCount = useListStore((state) => state.lists[list.id]?.itemCount);
  if (deletedLists[list.id]) return null;

  return (
    <AnimatePresence>
      <View
        enterStyle={{
          opacity: 0,
        }}
        exitStyle={{
          opacity: 0,
        }}
        animation="quick"
        opacity={1}
        scale={1}
        y={0}
      >
        <Link href={`/lists/${list.id}`}>
          <XStack
            gap="$2.5"
            padding="$2.5"
            hoverStyle={{
              transform: "all 0.2s ease-in-out",
              backgroundColor: "$color2",
            }}
            alignItems="center"
          >
            {list.imageUrl && <CdnAvatar src={list.imageUrl} size="$5" />}
            {!list.imageUrl && (
              <GradientIcon label={list.name} size="$5" borderRadius="$10">
                <NookText
                  textTransform="uppercase"
                  fontWeight="700"
                  fontSize="$8"
                >
                  {list.name.slice(0, 1)}
                </NookText>
              </GradientIcon>
            )}
            <YStack flexShrink={1} flexGrow={1} gap="$1">
              <XStack justifyContent="space-between" gap="$2">
                <YStack flexShrink={1}>
                  <NookText variant="label" fontSize="$6">
                    {list.name}
                  </NookText>
                  <XStack gap="$2">
                    <NookText muted>{`${formatNumber(itemCount || 0)} ${
                      list.type === ListType.USERS ? "user" : "channel"
                    }${itemCount === 1 ? "" : "s"}`}</NookText>
                  </XStack>
                </YStack>
              </XStack>
              {list.description && (
                <NookText numberOfLines={1}>{list.description}</NookText>
              )}
            </YStack>
          </XStack>
        </Link>
      </View>
    </AnimatePresence>
  );
});
