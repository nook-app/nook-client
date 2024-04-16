import { FarcasterAPIClient } from "@nook/common/clients";
import { PrismaClient } from "@nook/common/prisma/nook";
import { ChannelFilterType, UserFilterType } from "@nook/common/types";
import { FarcasterFeedFilter, PanelRequest } from "@nook/common/types/feed";
import { FastifyInstance } from "fastify";

export class PanelService {
  private farcaster: FarcasterAPIClient;
  private client: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.farcaster = new FarcasterAPIClient();
    this.client = fastify.nook.client;
  }

  async getPanel(req: PanelRequest) {
    switch (req.type) {
      case "default":
        switch (req.key) {
          case "following":
            return await this.getDefaultFollowing(req);
          case "trending":
            return await this.getDefaultTrending(req);
          case "latest":
            return await this.getDefaultLatest(req);
          case "frames-following":
            return await this.getFramesFollowing(req);
          case "frames-latest":
            return await this.getFramesLatest(req);
          case "media-following":
            return await this.getMediaFollowing(req);
          case "media-latest":
            return await this.getMediaLatest(req);
          case "videos-latest":
            return await this.getVideosLatest(req);
          default:
            return {
              status: 404,
              message: "Panel not found",
            };
        }
      case "feed":
        return await this.getFeed(req);
      case "channel":
        return await this.getChannel(req);
      default:
        return {
          status: 404,
          message: "Panel not found",
        };
    }
  }

  async getFeed(req: PanelRequest) {
    const feed = await this.client.feed.findUnique({
      where: {
        id: req.key,
      },
    });

    if (!feed) return { status: 404, message: "Feed not found" };

    const filter = feed.filter as FarcasterFeedFilter;

    return await this.farcaster.getCastFeed({
      ...req,
      filter,
    });
  }

  async getChannel(req: PanelRequest) {
    const channel = await this.farcaster.getChannel(req.key);
    if (!channel) return { status: 404, message: "Channel not found" };

    return await this.farcaster.getCastFeed({
      ...req,
      filter: {
        channels: {
          type: ChannelFilterType.CHANNEL_URLS,
          data: {
            urls: [channel.url],
          },
        },
      },
    });
  }

  async getDefaultFollowing(req: PanelRequest) {
    return await this.farcaster.getCastFeed({
      ...req,
      filter: {
        users: {
          type: UserFilterType.FOLLOWING,
          data: {
            fid: req.fid,
          },
        },
      },
    });
  }

  async getDefaultTrending(req: PanelRequest) {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/feed/trending?time_window=1h&cursor=${req.cursor}`,
      {
        headers: {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY as string,
        },
      },
    );
    const { casts, next } = await response.json();
    const hashes = casts.map((cast: { hash: string }) => cast.hash);
    return {
      data: (await this.farcaster.getCasts(hashes, req.context.viewerFid)).data,
      nextCursor: next.cursor,
    };
  }

  async getDefaultLatest(req: PanelRequest) {
    return await this.farcaster.getCastFeed({
      ...req,
      filter: {
        users: {
          type: UserFilterType.POWER_BADGE,
          data: {
            badge: true,
            fid: req.fid,
          },
        },
      },
    });
  }

  async getFramesFollowing(req: PanelRequest) {
    return await this.farcaster.getCastFeed({
      ...req,
      filter: {
        users: {
          type: UserFilterType.FOLLOWING,
          data: {
            fid: req.fid,
          },
        },
        onlyFrames: true,
      },
    });
  }

  async getFramesLatest(req: PanelRequest) {
    return await this.farcaster.getCastFeed({
      ...req,
      filter: {
        users: {
          type: UserFilterType.POWER_BADGE,
          data: {
            badge: true,
            fid: req.fid,
          },
        },
        onlyFrames: true,
      },
    });
  }

  async getMediaFollowing(req: PanelRequest) {
    return await this.farcaster.getCastFeed({
      ...req,
      filter: {
        users: {
          type: UserFilterType.FOLLOWING,
          data: {
            fid: req.fid,
          },
        },
        contentTypes: ["image", "application/x-mpegURL"],
      },
    });
  }

  async getMediaLatest(req: PanelRequest) {
    return await this.farcaster.getCastFeed({
      ...req,
      filter: {
        users: {
          type: UserFilterType.POWER_BADGE,
          data: {
            badge: true,
            fid: req.fid,
          },
        },
        contentTypes: ["image", "application/x-mpegURL"],
      },
    });
  }

  async getVideosLatest(req: PanelRequest) {
    return await this.farcaster.getCastFeed({
      ...req,
      filter: {
        users: {
          type: UserFilterType.POWER_BADGE,
          data: {
            badge: true,
            fid: req.fid,
          },
        },
        contentTypes: ["application/x-mpegURL"],
      },
    });
  }
}
