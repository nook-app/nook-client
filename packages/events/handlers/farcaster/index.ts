import { UserDataType } from "@farcaster/hub-nodejs";
import {
  ContentAPIClient,
  FarcasterAPIClient,
  FarcasterCacheClient,
} from "@nook/common/clients";
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
  private farcasterClient: FarcasterAPIClient;
  private cacheClient: FarcasterCacheClient;
  private contentClient: ContentAPIClient;

  constructor() {
    this.farcasterClient = new FarcasterAPIClient();
    this.cacheClient = new FarcasterCacheClient();
    this.contentClient = new ContentAPIClient();
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
        await this.processUserDataAdd(event.data as FarcasterUserData);
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

  async processCastAdd(data: FarcasterCast) {
    const cast = await this.farcasterClient.getCast(data.hash);
    if (!cast) return;

    const promises = [];
    promises.push(this.contentClient.addContentReferences(cast));

    if (cast.parentHash) {
      promises.push(
        this.cacheClient.resetCastEngagement(cast.parentHash, "replies"),
      );
    }

    for (const { hash } of cast.embedCasts) {
      promises.push(this.cacheClient.resetCastEngagement(hash, "quotes"));
    }

    await Promise.all(promises);
  }

  async processCastRemove(data: FarcasterCast) {
    const cast = await this.farcasterClient.getCast(data.hash);
    if (!cast) return;

    const promises = [];
    promises.push(this.contentClient.removeContentReferences(cast));

    if (cast.parentHash) {
      promises.push(
        this.cacheClient.resetCastEngagement(cast.parentHash, "replies"),
      );
    }

    for (const { hash } of cast.embedCasts) {
      promises.push(this.cacheClient.resetCastEngagement(hash, "quotes"));
    }

    await Promise.all(promises);
  }

  async processCastReactionAdd(data: FarcasterCastReaction) {
    const promises = [];
    if (data.reactionType === 1) {
      promises.push(
        this.cacheClient.resetCastEngagement(data.targetHash, "likes"),
      );
      promises.push(
        this.cacheClient.setCastContext(
          data.hash,
          "likes",
          data.fid.toString(),
          true,
        ),
      );
    } else if (data.reactionType === 2) {
      promises.push(
        this.cacheClient.resetCastEngagement(data.targetHash, "recasts"),
      );
      promises.push(
        this.cacheClient.setCastContext(
          data.hash,
          "recasts",
          data.fid.toString(),
          true,
        ),
      );
    }

    await Promise.all(promises);
  }

  async processCastReactionRemove(data: FarcasterCastReaction) {
    const promises = [];
    if (data.reactionType === 1) {
      promises.push(
        this.cacheClient.resetCastEngagement(data.targetHash, "likes"),
      );
      promises.push(
        this.cacheClient.setCastContext(
          data.hash,
          "likes",
          data.fid.toString(),
          false,
        ),
      );
    } else if (data.reactionType === 2) {
      promises.push(
        this.cacheClient.resetCastEngagement(data.targetHash, "recasts"),
      );
      promises.push(
        this.cacheClient.setCastContext(
          data.hash,
          "recasts",
          data.fid.toString(),
          false,
        ),
      );
    }

    await Promise.all(promises);
  }

  async processLinkAdd(data: FarcasterLink) {
    const promises = [];
    if (data.linkType === "follow") {
      promises.push(
        this.cacheClient.incrementUserEngagement(
          data.fid.toString(),
          "following",
        ),
      );
      promises.push(
        this.cacheClient.incrementUserEngagement(
          data.targetFid.toString(),
          "followers",
        ),
      );
      promises.push(
        this.cacheClient.setUserContext(
          data.fid.toString(),
          "following",
          data.targetFid.toString(),
          true,
        ),
      );
    }
    await Promise.all(promises);
  }

  async processLinkRemove(data: FarcasterLink) {
    const promises = [];
    if (data.linkType === "follow") {
      promises.push(
        this.cacheClient.decrementUserEngagement(
          data.fid.toString(),
          "following",
        ),
      );
      promises.push(
        this.cacheClient.decrementUserEngagement(
          data.targetFid.toString(),
          "followers",
        ),
      );
      promises.push(
        this.cacheClient.setUserContext(
          data.fid.toString(),
          "following",
          data.targetFid.toString(),
          false,
        ),
      );
    }
    await Promise.all(promises);
  }

  async processUserDataAdd(data: FarcasterUserData) {
    const user = await this.farcasterClient.getUser(data.fid.toString());
    if (!user) return;

    switch (data.type) {
      case UserDataType.USERNAME: {
        user.username = data.value;
        break;
      }
      case UserDataType.BIO: {
        user.bio = data.value;
        break;
      }
      case UserDataType.PFP: {
        user.pfp = data.value;
        break;
      }
      case UserDataType.DISPLAY: {
        user.displayName = data.value;
        break;
      }
      case UserDataType.URL: {
        user.url = data.value;
        break;
      }
    }

    await this.cacheClient.setUser(data.fid.toString(), user);
  }
}
