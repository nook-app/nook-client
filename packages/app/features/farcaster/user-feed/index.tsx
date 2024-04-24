"use client";

import { Display, FarcasterUser } from "../../../types";
import { Spinner, View, XStack, YStack } from "@nook/ui";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";
import { InfiniteScrollList } from "../../../components/infinite-scroll-list";
import { FarcasterUserFollowButton } from "../../../components/farcaster/users/user-follow-button";
import { memo } from "react";
import { FarcasterBioText } from "../../../components/farcaster/bio-text";
import { Link } from "solito/link";

export const FarcasterUserInfiniteFeed = ({
  users,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  displayMode = Display.CASTS,
}: {
  users: FarcasterUser[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  displayMode?: Display;
}) => {
  return (
    <InfiniteScrollList
      data={users}
      renderItem={({ item }) => (
        <FarcasterUserItem user={item as FarcasterUser} />
      )}
      onEndReached={fetchNextPage}
      numColumns={displayMode === Display.GRID ? 3 : 1}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner size="small" color="$color9" />
          </View>
        ) : null
      }
    />
  );
};

const FarcasterUserItem = memo(({ user }: { user: FarcasterUser }) => {
  return (
    <Link href={`/users/${user.username}`}>
      <YStack
        gap="$2"
        paddingHorizontal="$3.5"
        paddingVertical="$3"
        hoverStyle={{
          transform: "all 0.2s ease-in-out",
          backgroundColor: "$color2",
        }}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <FarcasterUserDisplay user={user} withBio />
          <FarcasterUserFollowButton username={user.username} />
        </XStack>
      </YStack>
    </Link>
  );
});
