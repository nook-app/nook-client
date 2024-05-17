"use client";

import { useState } from "react";
import { useSearchUsers } from "../../api/farcaster";
import { Input, Separator, Spinner, View } from "@nook/app-ui";
import { ItemUser } from "./item-user";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { FarcasterUser, List } from "@nook/common/types";
import { Loading } from "../../components/loading";

export const ListUserSearch = ({
  list,
  paddingTop,
  paddingBottom,
}: {
  list: List;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const [query, setQuery] = useState("");
  const { data, isLoading, isFetchingNextPage, fetchNextPage } =
    useSearchUsers(query);

  const users = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteScrollList
      data={users}
      renderItem={({ item }) => (
        <ItemUser list={list} user={item as FarcasterUser} />
      )}
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
      ListEmptyComponent={isLoading ? <Loading /> : undefined}
    />
  );
};
