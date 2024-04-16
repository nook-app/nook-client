import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";
import { PrismaClient } from "@nook/common/prisma/nook";
import {
  ChannelFilter,
  PanelDisplay,
  ShelfArgs,
  UserFilter,
} from "@nook/common/types";

const run = async () => {
  const client = new PrismaClient();

  const shelves = await client.shelfInstance.findMany({
    where: {
      deletedAt: null,
      nook: {
        deletedAt: null,
      },
      name: {
        notIn: [
          "Following",
          "Trending",
          "Popular",
          "Favorite Channels",
          "Media Feed",
          "Frames Feed",
          "Global",
          "Posts",
          "Media",
          "Frames",
          "Team Posts",
          "Team",
        ],
      },
      shelf: {
        name: {
          notIn: ["Trending", "Pin Frame", "User Profile"],
        },
      },
    },
    include: {
      shelf: true,
    },
  });

  const toCreate = [];

  for (const shelf of shelves) {
    let type = "default";
    let display: PanelDisplay | undefined;
    if (shelf.shelf.name === "Media Feed") {
      display = PanelDisplay.MEDIA;
      type = "media";
    } else if (shelf.shelf.name === "Frame Feed") {
      display = PanelDisplay.FRAMES;
      type = "frames";
    } else if (shelf.shelf.name === "Embed Feed") {
      display = PanelDisplay.EMBEDS;
      type = "embeds";
    }
    const args = shelf.data as {
      channels?: ChannelFilter;
      users?: UserFilter;
      query?: string;
      queries?: string[];
      urls?: string[];
      includeReplies?: boolean;
      onlyReplies?: boolean;
    };
    toCreate.push({
      fid: shelf.creatorFid,
      type,
      name: shelf.name,
      display,
      filter: {
        channels: args.channels,
        users: args.users,
        text: args.query ? [args.query] : args.queries,
        embeds: args.urls,
        contentTypes:
          shelf.shelf.name === "Media Feed"
            ? ["image", "application/x-mpegURL"]
            : undefined,
        includeReplies: args.includeReplies,
        onlyReplies: args.onlyReplies,
        onlyFrames: shelf.shelf.name === "Frame Feed" || undefined,
      },
    });
  }

  await client.feed.createMany({
    data: toCreate,
  });
};

run().finally(() => {
  process.exit(0);
});
