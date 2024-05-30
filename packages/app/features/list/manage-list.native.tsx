"use client";

import {
  Channel,
  FarcasterUserV1,
  FetchListsResponse,
  GetListsRequest,
  List,
  ListType,
} from "@nook/common/types";
import { Loading } from "../../components/loading";
import { useCallback, useRef, useState } from "react";
import { useFollowedLists } from "../../hooks/api/lists";
import { useScroll } from "../../context/scroll";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Separator } from "@nook/app-ui";
import { ManageListItem } from "./manage-list-item";
import { FlashList } from "@shopify/flash-list";
import { ListEmptyState } from "./list-empty-state";

export const ManageListFeed = ({
  filter,
  initialData,
  paddingTop,
  paddingBottom,
  asTabs,
  user,
  channel,
}: {
  filter: GetListsRequest;
  initialData?: FetchListsResponse;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
  user?: FarcasterUserV1;
  channel?: Channel;
}) => {
  const { data, isLoading } = useFollowedLists(filter, initialData);

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

  if (isLoading) {
    return <Loading />;
  }

  const lists = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FlashList
      ref={ref}
      data={lists}
      renderItem={({ item }) => (
        <ManageListItem list={item} user={user} channel={channel} />
      )}
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      onEndReachedThreshold={5}
      estimatedItemSize={300}
      onScroll={handleScroll}
      scrollEventThrottle={128}
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
      ListEmptyComponent={
        <ListEmptyState type={user ? ListType.USERS : ListType.PARENT_URLS} />
      }
    />
  );
};
