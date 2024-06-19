import { fetchList } from "@nook/app/api/list";
import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { ListItemEmptyState } from "@nook/app/features/list/list-item-empty-state";
import {
  ChannelFilterType,
  Display,
  ListType,
  UserFilterType,
} from "@nook/common/types";

export default async function Home({ params }: { params: { listId: string } }) {
  const list = await fetchList(params.listId);

  if (list.type === ListType.USERS && list.users && list.users.length > 0) {
    return (
      <FarcasterFilteredFeedServer
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
      />
    );
  }

  if (
    list.type === ListType.PARENT_URLS &&
    list.channels &&
    list.channels.length > 0
  ) {
    return (
      <FarcasterFilteredFeedServer
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
      />
    );
  }
  return <ListItemEmptyState list={list} />;
}

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
