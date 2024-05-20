import { List, ListType } from "@nook/common/types";
import { AnimatePresence, NookText, View, XStack, YStack } from "@nook/app-ui";
import { memo } from "react";
import { GradientIcon } from "../../components/gradient-icon";
import { Link } from "../../components/link";
import { formatNumber } from "../../utils";
import { CdnAvatar } from "../../components/cdn-avatar";
import { useListStore } from "../../store/useListStore";

export const ListFeedItem = memo(({ list }: { list: List }) => {
  const storeList = useListStore((state) => state.lists[list.id]);
  const deletedLists = useListStore((state) => state.deletedLists);
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
        animation="100ms"
        opacity={1}
        scale={1}
        y={0}
      >
        <Link href={`/lists/${storeList.id}`}>
          <XStack
            gap="$2.5"
            padding="$2.5"
            hoverStyle={{
              transform: "all 0.2s ease-in-out",
              backgroundColor: "$color2",
            }}
            alignItems="center"
          >
            {storeList.imageUrl && (
              <CdnAvatar src={storeList.imageUrl} size="$5" />
            )}
            {!storeList.imageUrl && (
              <GradientIcon label={storeList.name} size="$5" borderRadius="$10">
                <NookText
                  textTransform="uppercase"
                  fontWeight="700"
                  fontSize="$8"
                >
                  {storeList.name.slice(0, 1)}
                </NookText>
              </GradientIcon>
            )}
            <YStack flexShrink={1} flexGrow={1} gap="$1">
              <XStack justifyContent="space-between" gap="$2">
                <YStack flexShrink={1}>
                  <NookText variant="label" fontSize="$6">
                    {storeList.name}
                  </NookText>
                  <XStack gap="$2">
                    <NookText muted>{`${formatNumber(
                      storeList.itemCount || 0,
                    )} ${
                      storeList.type === ListType.USERS ? "user" : "channel"
                    }${storeList.itemCount === 1 ? "" : "s"}`}</NookText>
                    <View
                      paddingVertical="$1"
                      paddingHorizontal="$2"
                      borderRadius="$2"
                      backgroundColor="$color5"
                    >
                      <NookText fontSize="$2" fontWeight="500">
                        {list.visibility}
                      </NookText>
                    </View>
                  </XStack>
                </YStack>
              </XStack>
              {storeList.description && (
                <NookText numberOfLines={1}>{storeList.description}</NookText>
              )}
            </YStack>
          </XStack>
        </Link>
      </View>
    </AnimatePresence>
  );
});
