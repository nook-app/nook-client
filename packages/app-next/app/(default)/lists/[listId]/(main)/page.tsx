import { fetchList } from "@nook/app/api/list";
import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { Display, UserFilterType } from "@nook/common/types";

export default async function Home({ params }: { params: { listId: string } }) {
  const list = await fetchList(params.listId);

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
