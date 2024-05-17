"use client";

import { NookText, Separator, YStack } from "@nook/app-ui";
import { ItemUser } from "./item-user";
import { Channel, FarcasterUser, List, ListType } from "@nook/common/types";
import { ItemChannel } from "./item-channel";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";

export const ItemFeed = ({
  list,
  paddingTop,
  paddingBottom,
}: { list: List; paddingTop?: number; paddingBottom?: number }) => {
  if (list.type === ListType.USERS) {
    return (
      <InfiniteScrollList
        data={list.users}
        renderItem={({ item }) => (
          <ItemUser list={list} user={item as FarcasterUser} />
        )}
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
      />
    );
  }

  return (
    <InfiniteScrollList
      data={list.channels}
      renderItem={({ item }) => (
        <ItemChannel list={list} channel={item as Channel} />
      )}
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
    />
  );
};
