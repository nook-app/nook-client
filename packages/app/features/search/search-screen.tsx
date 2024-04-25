"use client";

import { NookButton, View, XStack } from "@nook/ui";
import { Tabs } from "../../components/tabs/tabs";
import { SearchBar } from "./search-bar";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useRouter } from "solito/navigation";
import { FarcasterFilteredFeed } from "../farcaster/cast-feed/filtered-feed";
import { useSearchChannels, useSearchUsers } from "../../api/farcaster";
import { Loading } from "../../components/loading";
import { FarcasterUserInfiniteFeed } from "../farcaster/user-feed";
import { FarcasterChannelInfiniteFeed } from "../farcaster/channel-feed";

export const SearchScreen = ({ q, f }: { q: string; f?: string }) => {
  const router = useRouter();
  const activeTab = f || "casts";
  return (
    <View>
      <XStack height="$5" paddingHorizontal="$3" alignItems="center">
        <NookButton
          icon={<ArrowLeft />}
          circular
          size="$3"
          scaleIcon={1.5}
          backgroundColor="transparent"
          borderWidth="$0"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color3",
          }}
          onPress={router.back}
        />
        <View flexGrow={1}>
          <SearchBar defaultValue={q} />
        </View>
      </XStack>
      <Tabs
        tabs={[
          {
            id: "casts",
            label: "Casts",
            href: `/search?q=${q}`,
          },
          {
            id: "users",
            label: "Users",
            href: `/search?q=${q}&f=users`,
          },
          {
            id: "channels",
            label: "Channels",
            href: `/search?q=${q}&f=channels`,
          },
        ]}
        activeTab={activeTab}
      />
      <SearchTabItem q={q} activeTab={activeTab} />
    </View>
  );
};

export const SearchTabItem = ({
  q,
  activeTab,
}: { q: string; activeTab: string }) => {
  switch (activeTab) {
    case "casts":
      return (
        <FarcasterFilteredFeed
          filter={{
            text: [q],
          }}
        />
      );
    case "users":
      return <SearchUsersTab q={q} />;
    case "channels":
      return <SearchChannelsTab q={q} />;
    default:
      return null;
  }
};

export const SearchUsersTab = ({ q }: { q: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSearchUsers(q);

  if (isLoading) {
    return <Loading />;
  }

  const users = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FarcasterUserInfiniteFeed
      users={users}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};

export const SearchChannelsTab = ({ q }: { q: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSearchChannels(q);

  if (isLoading) {
    return <Loading />;
  }

  const channels = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FarcasterChannelInfiniteFeed
      channels={channels}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};
