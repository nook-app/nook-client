import { ContentAPIClient, FarcasterAPIClient } from "@nook/common/clients";
import { Shelf, ShelfInstance } from "@nook/common/prisma/nook";
import {
  FarcasterEmbedArgs,
  FarcasterFrameArgs,
  FarcasterMediaArgs,
  FarcasterPostArgs,
  FarcasterUser,
  FarcasterUserListArgs,
  ShelfArgs,
  ShelfDataRequest,
  ShelfDataResponse,
  ShelfType,
  UserFilterType,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";

const NOOK_FID = "262426";

export class ShelfService {
  private farcaster: FarcasterAPIClient;
  private content: ContentAPIClient;

  constructor(fastify: FastifyInstance) {
    this.farcaster = new FarcasterAPIClient();
    this.content = new ContentAPIClient();
  }

  async getData(
    shelf: Shelf,
    instance: ShelfInstance,
    viewerFid?: string,
    cursor?: string,
  ): Promise<ShelfDataResponse> {
    const body: ShelfDataRequest = {
      data: instance.data as ShelfArgs,
      context: {
        viewerFid,
      },
      cursor,
    };
    switch (shelf.type) {
      case ShelfType.FARCASTER_USERS: {
        if (shelf.creatorFid === NOOK_FID) {
          return this.getUserListData(
            body as ShelfDataRequest<FarcasterUserListArgs>,
          );
        }
        break;
      }
      case ShelfType.FARCASTER_POSTS: {
        const data = body as ShelfDataRequest<FarcasterPostArgs>;
        if (shelf.creatorFid === NOOK_FID) {
          return await this.farcaster.getNewPosts(data);
        }

        let hashes: string[] = [];
        let nextCursor: string | undefined;
        switch (shelf.api) {
          case "https://api.neynar.com/v2/farcaster/feed/trending": {
            const response = await fetch(
              `${shelf.api}?time_window=${data.data.timeWindow}&cursor=${cursor}`,
              {
                headers: {
                  accept: "application/json",
                  api_key: process.env.NEYNAR_API_KEY as string,
                },
              },
            );
            if (!response.ok) return { data: [], nextCursor: undefined };
            const { casts, next } = await response.json();
            hashes = casts.map((cast: { hash: string }) => cast.hash);
            nextCursor = next.cursor;
            break;
          }
          default: {
            const response = await this.getFarcasterCastHashes(shelf.api, data);
            hashes = response.data;
            nextCursor = response.nextCursor;
          }
        }

        const posts = await this.farcaster.getCasts(hashes, viewerFid);
        return {
          data: posts.data,
          nextCursor,
        };
      }
      case ShelfType.FARCASTER_MEDIA: {
        const response = await this.content.getNewMedia(
          body as ShelfDataRequest<FarcasterMediaArgs>,
        );
        const media = await this.farcaster.getCasts(response.data, viewerFid);
        return {
          data: media.data,
          nextCursor: response.nextCursor,
        };
      }
      case ShelfType.FARCASTER_FRAMES: {
        const response = await this.content.getNewFrames(
          body as ShelfDataRequest<FarcasterFrameArgs>,
        );
        const frames = await this.farcaster.getCasts(response.data, viewerFid);
        return {
          data: frames.data,
          nextCursor: response.nextCursor,
        };
      }
      case ShelfType.FARCASTER_EMBEDS: {
        const response = await this.content.getNewEmbeds(
          body as ShelfDataRequest<FarcasterEmbedArgs>,
        );
        const embeds = await this.farcaster.getCasts(response.data, viewerFid);
        return {
          data: embeds.data,
          nextCursor: response.nextCursor,
        };
      }
      default:
        throw new Error(`Unsupported shelf type: ${shelf.type}`);
    }

    throw new Error("Not implemented");
  }

  async getUserListData(
    request: ShelfDataRequest<FarcasterUserListArgs>,
  ): Promise<ShelfDataResponse<FarcasterUser>> {
    const { data, context } = request;
    switch (data.users.type) {
      case UserFilterType.FIDS:
        return await this.farcaster.getUsers(
          { fids: data.users.data.fids },
          context.viewerFid,
        );
      default:
        throw new Error(`Unsupported user filter type: ${data.users.type}`);
    }
  }

  async getFarcasterCastHashes(
    path: string,
    body: ShelfDataRequest,
  ): Promise<ShelfDataResponse<string>> {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
}
