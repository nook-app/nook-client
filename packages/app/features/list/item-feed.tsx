import { NookText, Separator, YStack } from "@nook/app-ui";
import { useListStore } from "../../store/useListStore";
import { ItemUser } from "./item-user";
import { useScroll } from "../../context/scroll";
import { useCallback, useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ListType } from "@nook/common/types";
import { ItemChannel } from "./item-channel";

export const ItemFeed = ({
  listId,
  paddingTop,
  paddingBottom,
}: { listId: string; paddingTop?: number; paddingBottom?: number }) => {
  const list = useListStore((state) => state.lists[listId]);

  const { setIsScrolling } = useScroll();
  const [lastScrollY, setLastScrollY] = useState(0);

  const ref = useRef(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const delta = currentScrollY - lastScrollY;

      if (delta > 0 && currentScrollY > 50) {
        setIsScrolling(true);
      } else if (delta < -50) {
        setIsScrolling(false);
      }

      setLastScrollY(currentScrollY);
    },
    [lastScrollY, setIsScrolling],
  );

  if (list.type === ListType.USERS) {
    return (
      <FlashList
        ref={ref}
        data={list.users}
        renderItem={({ item }) => <ItemUser listId={listId} user={item} />}
        ItemSeparatorComponent={() => (
          <Separator width="100%" borderBottomColor="$borderColorBg" />
        )}
        ListEmptyComponent={
          <YStack
            gap="$4"
            padding="$4"
            justifyContent="center"
            alignItems="center"
          >
            <NookText muted>
              No users have been added to this list yet.
            </NookText>
          </YStack>
        }
        estimatedItemSize={300}
        onScroll={handleScroll}
        scrollEventThrottle={128}
        contentContainerStyle={{
          paddingTop,
          paddingBottom,
        }}
      />
    );
  }

  return (
    <FlashList
      ref={ref}
      data={list.channels}
      renderItem={({ item }) => <ItemChannel listId={listId} channel={item} />}
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      ListEmptyComponent={
        <YStack
          gap="$4"
          padding="$4"
          justifyContent="center"
          alignItems="center"
        >
          <NookText muted>No users have been added to this list yet.</NookText>
        </YStack>
      }
      estimatedItemSize={300}
      onScroll={handleScroll}
      scrollEventThrottle={128}
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
    />
  );
};
