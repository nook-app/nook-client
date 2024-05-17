import { useCallback, useRef, useState } from "react";
import { useScroll } from "../../context/scroll";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useSearchUsers } from "../../api/farcaster";
import { Input, Separator, Spinner, View } from "@nook/app-ui";
import { FlashList } from "@shopify/flash-list";
import { ItemUser } from "./item-user";
import { List } from "@nook/common/types";

export const ListUserSearch = ({
  list,
  paddingTop,
  paddingBottom,
}: {
  list: List;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { setIsScrolling } = useScroll();
  const [lastScrollY, setLastScrollY] = useState(0);
  const ref = useRef(null);

  const [query, setQuery] = useState("");
  const { data, isFetchingNextPage, fetchNextPage } = useSearchUsers(query);

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

  const users = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FlashList
      ref={ref}
      data={users}
      renderItem={({ item }) => <ItemUser list={list} user={item} />}
      ListHeaderComponent={
        <View theme="surface2" padding="$2.5">
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search..."
          />
        </View>
      }
      ListFooterComponent={() =>
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={5}
      estimatedItemSize={300}
      onScroll={handleScroll}
      scrollEventThrottle={128}
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
      keyboardDismissMode="on-drag"
    />
  );
};
