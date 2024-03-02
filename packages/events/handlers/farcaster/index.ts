import { UserDataType } from "@farcaster/hub-nodejs";
import {
  ContentClient,
  EntityClient,
  FarcasterClient,
  FeedClient,
} from "@nook/common/clients";
import { FARCASTER_OG_FIDS } from "@nook/common/farcaster";
import {
  FarcasterCast,
  FarcasterCastReaction,
  FarcasterLink,
  FarcasterUserData,
  FarcasterUsernameProof,
  FarcasterVerification,
} from "@nook/common/prisma/farcaster";
import { EntityEvent, FarcasterEventType } from "@nook/common/types";

export class FarcasterProcessor {
  private farcasterClient: FarcasterClient;
  private feedClient: FeedClient;
  private contentClient: ContentClient;
  private entityClient: EntityClient;

  constructor() {
    this.farcasterClient = new FarcasterClient();
    this.feedClient = new FeedClient();
    this.contentClient = new ContentClient();
    this.entityClient = new EntityClient();
  }

  async process(event: EntityEvent) {
    switch (event.source.type) {
      case FarcasterEventType.CAST_ADD: {
        await this.processCastAdd(event.data as FarcasterCast);
        break;
      }
      case FarcasterEventType.CAST_REACTION_ADD: {
        await this.processCastReactionAdd(event.data as FarcasterCastReaction);
        break;
      }
      case FarcasterEventType.CAST_REACTION_REMOVE: {
        await this.processCastReactionRemove(
          event.data as FarcasterCastReaction,
        );
        break;
      }
      case FarcasterEventType.LINK_ADD: {
        await this.processLinkAdd(event.data as FarcasterLink);
        break;
      }
      case FarcasterEventType.LINK_REMOVE: {
        await this.processLinkRemove(event.data as FarcasterLink);
        break;
      }
      case FarcasterEventType.USER_DATA_ADD: {
        await this.processUserData(event.data as FarcasterUserData);
        break;
      }
      case FarcasterEventType.VERIFICATION_ADD: {
        await this.processVerificationAdd(event.data as FarcasterVerification);
        break;
      }
      case FarcasterEventType.VERIFICATION_REMOVE: {
        await this.processVerificationRemove(
          event.data as FarcasterVerification,
        );
        break;
      }
      case FarcasterEventType.USERNAME_PROOF: {
        await this.processUsernameProof(event.data as FarcasterUsernameProof);
        break;
      }
      default: {
        throw new Error(`Unknown event type: ${event.source.type}`);
      }
    }
  }

  async processUsernameProof(data: FarcasterUsernameProof) {
    return;
  }

  async processVerificationAdd(data: FarcasterVerification) {
    return;
  }

  async processVerificationRemove(data: FarcasterVerification) {
    return;
  }

  async processUserData(data: FarcasterUserData) {
    const entity = await this.entityClient.getEntityByFid(data.fid);
    switch (data.type) {
      case UserDataType.USERNAME:
        entity.farcaster.username = data.value;
        break;
      case UserDataType.DISPLAY:
        entity.farcaster.displayName = data.value;
        break;
      case UserDataType.BIO:
        entity.farcaster.bio = data.value;
        break;
      case UserDataType.URL:
        entity.farcaster.url = data.value;
        break;
      case UserDataType.PFP:
        entity.farcaster.pfp = data.value;
        break;
    }

    await this.entityClient.cacheEntity(entity);
  }

  async processLinkAdd(data: FarcasterLink) {
    const [entity, targetEntity] = await this.entityClient.getEntitiesByFid([
      data.fid,
      data.targetFid,
    ]);

    entity.farcaster.following += 1;
    targetEntity.farcaster.followers += 1;

    await Promise.all([
      this.entityClient.cacheEntity(entity),
      this.entityClient.cacheEntity(targetEntity),
    ]);
  }

  async processLinkRemove(data: FarcasterLink) {
    const [entity, targetEntity] = await this.entityClient.getEntitiesByFid([
      data.fid,
      data.targetFid,
    ]);

    entity.farcaster.following -= 1;
    targetEntity.farcaster.followers -= 1;

    await Promise.all([
      this.entityClient.cacheEntity(entity),
      this.entityClient.cacheEntity(targetEntity),
    ]);
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

    if (FARCASTER_OG_FIDS.includes(data.fid.toString())) {
      promises.push(
        this.feedClient.addToFeed(
          "custom:farcaster-og",
          data.hash,
          cast.timestamp,
        ),
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

    if (FARCASTER_OG_FIDS.includes(data.fid.toString())) {
      promises.push(
        this.feedClient.removeFromFeed("custom:farcaster-og", data.hash),
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
