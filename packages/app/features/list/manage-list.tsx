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
import { useFollowedLists } from "../../api/list";
import { Separator } from "@nook/app-ui";
import { ManageListItem } from "./manage-list-item";
import { ListEmptyState } from "./list-empty-state";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";

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

  if (isLoading) {
    return <Loading />;
  }

  const lists = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteScrollList
      data={lists}
      renderItem={({ item }) => (
        <ManageListItem list={item as List} user={user} channel={channel} />
      )}
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      onEndReachedThreshold={5}
      estimatedItemSize={300}
      ListEmptyComponent={
        <ListEmptyState type={user ? ListType.USERS : ListType.PARENT_URLS} />
      }
    />
  );
};
