import {
  ContentClient,
  FarcasterClient,
  FeedClient,
} from "@nook/common/clients";
import {
  FarcasterCast,
  FarcasterCastReaction,
} from "@nook/common/prisma/farcaster";
import { EntityEvent, FarcasterEventType } from "@nook/common/types";

export class FarcasterProcessor {
  private farcasterClient: FarcasterClient;
  private feedClient: FeedClient;
  private contentClient: ContentClient;

  constructor() {
    this.farcasterClient = new FarcasterClient();
    this.feedClient = new FeedClient();
    this.contentClient = new ContentClient();
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

  async processCastReactionAdd(data: FarcasterCastReaction) {
    await this.farcasterClient.incrementEngagement(
      data.hash,
      data.reactionType === 1 ? "likes" : "recasts",
    );
  }

  async processCastReactionRemove(data: FarcasterCastReaction) {
    await this.farcasterClient.decrementEngagement(
      data.hash,
      data.reactionType === 1 ? "likes" : "recasts",
    );
  }

  async processCastAdd(data: FarcasterCast) {
    const cast = await this.farcasterClient.getCast(data.hash);
    if (!cast) return;

    const promises = [];
    promises.push(this.contentClient.addReferencedContent(cast));

    if (data.parentUrl) {
      promises.push(
        this.feedClient.addToFeed(
          `channel:${data.parentUrl}`,
          data.hash,
          cast.timestamp,
        ),
      );
    }

    if (data.parentHash) {
      promises.push(
        this.feedClient.addToFeed(
          `user:replies:${data.fid.toString()}`,
          data.hash,
          cast.timestamp,
        ),
      );
      promises.push(
        this.farcasterClient.incrementEngagement(data.parentHash, "replies"),
      );
    } else {
      promises.push(
        this.feedClient.addToFeed(
          `user:casts:${data.fid.toString()}`,
          data.hash,
          cast.timestamp,
        ),
      );
    }

    for (const embed of this.farcasterClient.getCastEmbeds(data)) {
      promises.push(
        this.farcasterClient.incrementEngagement(embed.hash, "quotes"),
      );
    }

    await Promise.all(promises);

    if (!data.parentHash) {
      const followers = await this.farcasterClient.getFollowers(data.fid);
      await this.feedClient.addToFeeds(
        followers.map(({ fid }) => `user:following:${fid.toString()}`),
        data.hash,
        cast.timestamp,
      );
    }
  }

  async processCastRemove(data: FarcasterCast) {
    const cast = await this.farcasterClient.getCast(data.hash);
    if (!cast) return;

    const promises = [];
    promises.push(this.contentClient.removeReferencedContent(cast));

    if (data.parentUrl) {
      promises.push(
        this.feedClient.removeFromFeed(
          `channel:casts:${data.parentUrl}`,
          data.hash,
        ),
      );
    }

    if (data.parentHash) {
      promises.push(
        this.feedClient.removeFromFeed(
          `user:replies:${data.fid.toString()}`,
          data.hash,
        ),
      );
      promises.push(
        this.farcasterClient.decrementEngagement(data.parentHash, "replies"),
      );
    } else {
      promises.push(
        this.feedClient.removeFromFeed(
          `user:casts:${data.fid.toString()}`,
          data.hash,
        ),
      );
    }

    for (const embed of this.farcasterClient.getCastEmbeds(data)) {
      promises.push(
        this.farcasterClient.decrementEngagement(embed.hash, "quotes"),
      );
    }

    await Promise.all(promises);

    if (!data.parentHash) {
      const followers = await this.farcasterClient.getFollowers(data.fid);
      await this.feedClient.removeFromFeeds(
        followers.map(({ fid }) => `user:following:${fid.toString()}`),
        data.hash,
      );
    }
  }
}
