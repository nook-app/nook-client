import { useList } from "@nook/app/hooks/useList";
import { useLocalSearchParams } from "expo-router";
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
import { Link } from "@nook/app/components/link";
import { Tabs } from "react-native-collapsible-tab-view";
import { CollapsibleGradientLayout } from "../CollapsibleGradientLayout";
import { IconButton } from "../IconButton";
import { TransactionFeed } from "@nook/app/features/transactions/transaction-feed";
import { ListMenu } from "@nook/app/features/list/list-menu";

export default function ListScreen() {
  const { listId } = useLocalSearchParams();
  const { list } = useList(listId as string);
  const { session } = useAuth();

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
      right={
        session?.id === list.creatorId ? (
          <XStack gap="$2">
            <ListMenu
              list={list}
              trigger={
                <Popover.Trigger asChild>
                  <IconButton icon={MoreHorizontal} />
                </Popover.Trigger>
              }
            />
          </XStack>
        ) : undefined
      }
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
          <YStack
            gap="$4"
            padding="$4"
            justifyContent="center"
            alignItems="center"
          >
            <NookText muted>
              {`Add ${
                list.type === ListType.USERS ? "users" : "channels"
              } to this list to see casts here.`}
            </NookText>
            <Link href={`/lists/${list.id}/settings/items`} unpressable>
              <Button
                height="$4"
                width="100%"
                borderRadius="$10"
                fontWeight="600"
                fontSize="$5"
                backgroundColor="$mauve12"
                borderWidth="$0"
                color="$mauve1"
                pressStyle={{
                  backgroundColor: "$mauve11",
                }}
                disabledStyle={{
                  backgroundColor: "$mauve10",
                }}
              >
                {`Add ${list.type === ListType.USERS ? "Users" : "Channels"}`}
              </Button>
            </Link>
          </YStack>
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
