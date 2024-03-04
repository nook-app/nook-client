import {
  ContentClient,
  FarcasterClient,
  FeedClient,
} from "@nook/common/clients";
import { FARCASTER_OG_FIDS } from "@nook/common/farcaster";
import {
  FarcasterCast,
  FarcasterUsernameProof,
  FarcasterVerification,
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
      case FarcasterEventType.CAST_REMOVE: {
        await this.processCastRemove(event.data as FarcasterCast);
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
      case FarcasterEventType.CAST_REACTION_ADD:
      case FarcasterEventType.CAST_REACTION_REMOVE:
      case FarcasterEventType.LINK_ADD:
      case FarcasterEventType.LINK_REMOVE:
      case FarcasterEventType.USER_DATA_ADD:
        break;
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

  async processCastAdd(data: FarcasterCast) {
    const cast = await this.farcasterClient.fetchCast(data.hash);
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
    } else {
      promises.push(
        this.feedClient.addToFeed(
          `user:casts:${data.fid.toString()}`,
          data.hash,
          cast.timestamp,
        ),
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
  }

  async processCastRemove(data: FarcasterCast) {
    const cast = await this.farcasterClient.fetchCast(data.hash);
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
    } else {
      promises.push(
        this.feedClient.removeFromFeed(
          `user:casts:${data.fid.toString()}`,
          data.hash,
        ),
      );
    }

    if (FARCASTER_OG_FIDS.includes(data.fid.toString())) {
      promises.push(
        this.feedClient.removeFromFeed("custom:farcaster-og", data.hash),
      );
    }

    await Promise.all(promises);
  }
}
