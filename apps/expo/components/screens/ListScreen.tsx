import { useList } from "@nook/app/hooks/useList";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import {
  ChannelFilterType,
  Display,
  List,
  ListType,
  UserFilterType,
} from "@nook/common/types";
import { Button, NookText, Popover, XStack, YStack } from "@nook/app-ui";
import { Loading } from "@nook/app/components/loading";
import { ListHeader } from "@nook/app/features/list/list-header";
import { useAuth } from "@nook/app/context/auth";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { Tabs } from "react-native-collapsible-tab-view";
import { CollapsibleGradientLayout } from "../CollapsibleGradientLayout";
import { IconButton } from "../IconButton";
import { TransactionFeed } from "@nook/app/features/transactions/transaction-feed";
import { ListMenu } from "@nook/app/features/list/list-menu";
import { memo, useCallback, useState } from "react";
import { ListItemEmptyState } from "@nook/app/features/list/list-item-empty-state";

export default function ListScreen() {
  const { listId } = useLocalSearchParams();
  const { list } = useList(listId as string);

  if (!list) return <Loading />;

  return (
    <CollapsibleGradientLayout
      title={
        <XStack alignItems="center" gap="$2" flexShrink={1}>
          <NookText
            fontSize="$5"
            fontWeight="700"
            ellipsizeMode="tail"
            numberOfLines={1}
            flexShrink={1}
          >
            {list.name}
          </NookText>
        </XStack>
      }
      src={list.imageUrl || list.name}
      header={<ListHeader list={list} disableMenu />}
      pages={getPages({ list })}
      right={<Menu list={list} />}
    />
  );
}

const getPages = ({ list }: { list: List }) => {
  if (list.type === ListType.USERS && list.users && list.users.length > 0) {
    return [
      {
        name: "Casts",
        component: (
          <FarcasterFilteredFeed
            filter={{
              users: {
                type: UserFilterType.FIDS,
                data: {
                  fids: list.users?.map(({ fid }) => fid) ?? [],
                },
              },
              ...getDisplayModeFilters(list.displayMode),
            }}
            displayMode={list.displayMode}
            asTabs
          />
        ),
      },
      {
        name: "Transactions",
        component: (
          <TransactionFeed
            filter={{
              users: {
                type: UserFilterType.FIDS,
                data: {
                  fids: list.users?.map(({ fid }) => fid) ?? [],
                },
              },
            }}
            asTabs
          />
        ),
      },
    ];
  }

  if (
    list.type === ListType.PARENT_URLS &&
    list.channels &&
    list.channels.length > 0
  ) {
    return [
      {
        name: "Relevant",
        component: (
          <FarcasterFilteredFeed
            filter={{
              users: {
                type: UserFilterType.POWER_BADGE,
                data: {
                  badge: true,
                },
              },
              channels: {
                type: ChannelFilterType.CHANNEL_URLS,
                data: {
                  urls: list.channels?.map(({ url }) => url) ?? [],
                },
              },
              ...getDisplayModeFilters(list.displayMode),
            }}
            displayMode={list.displayMode}
            asTabs
          />
        ),
      },
      {
        name: "All",
        component: (
          <FarcasterFilteredFeed
            filter={{
              channels: {
                type: ChannelFilterType.CHANNEL_URLS,
                data: {
                  urls: list.channels?.map(({ url }) => url) ?? [],
                },
              },
              ...getDisplayModeFilters(list.displayMode),
            }}
            displayMode={list.displayMode}
            asTabs
          />
        ),
      },
    ];
  }

  return [
    {
      name: "Casts",
      component: (
        <Tabs.ScrollView>
          <ListItemEmptyState list={list} />
        </Tabs.ScrollView>
      ),
    },
  ];
};

const getDisplayModeFilters = (displayMode?: Display) => {
  switch (displayMode) {
    case Display.FRAMES:
      return {
        onlyFrames: true,
      };
    case Display.MEDIA:
      return {
        contentTypes: ["image", "video"],
      };
    case Display.GRID:
      return {
        contentTypes: ["image"],
      };
  }
  return {};
};

const Menu = memo(({ list }: { list: List }) => {
  const { session } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  useFocusEffect(useCallback(() => setShowMenu(true), []));

  if (session?.id !== list.creatorId) return null;

  if (!showMenu) return <IconButton icon={MoreHorizontal} />;

  return (
    <ListMenu
      list={list}
      trigger={
        <Popover.Trigger asChild>
          <IconButton icon={MoreHorizontal} />
        </Popover.Trigger>
      }
    />
  );
});
