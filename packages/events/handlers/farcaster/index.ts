import {
  EntityClient,
  FarcasterClient,
  FeedClient,
  NookClient,
} from "@nook/common/clients";
import { FarcasterCast } from "@nook/common/prisma/farcaster";
import {
  EntityEvent,
  EntityResponse,
  FarcasterEventType,
} from "@nook/common/types";

export class FarcasterProcessor {
  private nookClient: NookClient;
  private entityClient: EntityClient;
  private farcasterClient: FarcasterClient;
  private feedClient: FeedClient;

  constructor() {
    this.entityClient = new EntityClient();
    this.farcasterClient = new FarcasterClient();
    this.feedClient = new FeedClient();
    this.nookClient = new NookClient();
  }

  async process(event: EntityEvent) {
    switch (event.source.type) {
      case FarcasterEventType.CAST_ADD: {
        await this.processCastAdd(event.data as FarcasterCast);
        break;
      }
      default:
        // console.error(`Unknown event type: ${event.source.type}`);
        return;
    }
  }

  async processCastAdd(data: FarcasterCast) {
    const cast = await this.farcasterClient.getCast(data.hash);
    const fids = this.farcasterClient.getFidsFromCast(cast);
    const entities = await this.entityClient.getEntitiesByFid(fids);
    const entityMap = entities.reduce(
      (acc, entity) => {
        acc[entity.farcaster.fid] = entity;
        return acc;
      },
      {} as Record<string, EntityResponse>,
    );

    if (data.parentUrl) {
      await this.nookClient.getChannel(data.parentUrl);
      await this.feedClient.addToFeed(`channel:${data.parentUrl}`, cast.hash);
    }

    if (data.parentHash) {
      await this.feedClient.addToFeed(
        `entity:replies:${entityMap[data.fid.toString()].id}`,
        cast.hash,
      );
    } else {
      await this.feedClient.addToFeed(
        `entity:casts:${entityMap[data.fid.toString()].id}`,
        cast.hash,
      );
    }

    const followers = await this.farcasterClient.getFollowers(data.fid);
    await this.feedClient.addToFeeds(
      followers.map((fid) => `entity:following:${fid}`),
      cast.hash,
    );
  }
}
