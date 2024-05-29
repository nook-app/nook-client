import {
  HubRpcClient,
  UserDataType,
  getSSLHubRpcClient,
} from "@farcaster/hub-nodejs";
import {
  ContentAPIClient,
  FarcasterAPIClient,
  FarcasterCacheClient,
} from "@nook/common/clients";
import { RedisClient } from "@nook/common/clients";
import {
  FarcasterCast,
  FarcasterCastReaction,
  FarcasterLink,
  FarcasterUserData,
  FarcasterUsernameProof,
  FarcasterVerification,
} from "@nook/common/prisma/farcaster";
import { EntityEvent, FarcasterEventType } from "@nook/common/types";
import {
  bufferToHex,
  hexToBuffer,
  parseNotificationsFromCast,
  parseNotificationsFromLink,
  parseNotificationsFromReaction,
} from "@nook/common/farcaster";
import { publishNotification } from "@nook/common/queues";

export class FarcasterProcessor {
  private farcasterClient: FarcasterAPIClient;
  private cacheClient: FarcasterCacheClient;
  private contentClient: ContentAPIClient;
  private hub: HubRpcClient;

  constructor() {
    this.farcasterClient = new FarcasterAPIClient();
    this.cacheClient = new FarcasterCacheClient(new RedisClient());
    this.contentClient = new ContentAPIClient();
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
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

  async processCastAdd(data: FarcasterCast) {
    const cast = await this.farcasterClient.getCast(
      data.hash,
      data.parentFid?.toString(),
    );
    if (!cast) return;

    const promises = [];

    if (
      data.parentHash &&
      data.fid === data.rootParentFid &&
      data.parentFid === data.fid
    ) {
      promises.push(this.cacheClient.resetCastThread(data.rootParentHash));
    }

    if (cast.parentHash) {
      promises.push(
        this.cacheClient.updateCastEngagement(cast.parentHash, "replies", 1),
        this.cacheClient.updateCastEngagementV1(cast.parentHash, "replies", 1),
      );
      promises.push(
        this.cacheClient.updateCastReplyScore(
          cast.hash,
          cast.parentHash,
          cast.timestamp,
          "new",
        ),
      );
      promises.push(
        this.cacheClient.updateCastReplyScore(
          cast.hash,
          cast.parentHash,
          0,
          "top",
        ),
      );
      if (cast.parent?.parentHash && cast.user.fid === cast.parent?.parentFid) {
        promises.push(
          this.cacheClient.updateCastReplyScore(
            cast.parentHash,
            cast.parent.parentHash,
            4_000_000,
            "best",
          ),
        );
      }
      if (cast.user.context?.following) {
        promises.push(
          this.cacheClient.updateCastReplyScore(
            cast.hash,
            cast.parentHash,
            2_000_000,
            "best",
          ),
        );
      } else if (cast.user.badges?.powerBadge) {
        promises.push(
          this.cacheClient.updateCastReplyScore(
            cast.hash,
            cast.parentHash,
            1_000_000,
            "best",
          ),
        );
      } else {
        promises.push(
          this.cacheClient.updateCastReplyScore(
            cast.hash,
            cast.parentHash,
            0,
            "best",
          ),
        );
      }
    }

    for (const { hash } of cast.embedCasts) {
      promises.push(
        this.cacheClient.updateCastEngagement(hash, "quotes", 1),
        this.cacheClient.updateCastEngagementV1(hash, "quotes", 1),
      );
    }

    const notifications = parseNotificationsFromCast(cast);
    promises.push(...notifications.map((n) => publishNotification(n)));

    await Promise.all(promises);
  }

  async processCastRemove(data: FarcasterCast) {
    const cast = await this.farcasterClient.getCast(data.hash);
    if (!cast) return;

    const promises = [];
    promises.push(this.cacheClient.removeCast(data.hash));
    promises.push(
      this.contentClient.deleteReferences(
        cast.embeds.map((e) => ({
          fid: cast.user.fid.toString(),
          hash: cast.hash,
          parentFid: cast.parent?.user.fid,
          parentHash: cast.parent?.hash,
          parentUrl: cast.parentUrl,
          uri: e.uri,
          timestamp: new Date(cast.timestamp),
          text: cast.text,
          rootParentFid: cast.rootParentFid,
          rootParentHash: cast.rootParentHash,
          rootParentUrl: cast.rootParentUrl,
        })),
      ),
    );

    if (cast.parentHash) {
      promises.push(
        this.cacheClient.updateCastEngagement(cast.parentHash, "replies", -1),
        this.cacheClient.updateCastEngagementV1(cast.parentHash, "replies", -1),
      );
      if (cast.parent?.parentHash && cast.user.fid === cast.parent?.parentFid) {
        promises.push(
          this.cacheClient.updateCastReplyScore(
            cast.parentHash,
            cast.parent.parentHash,
            -4_000_000,
            "best",
          ),
        );
      }
      promises.push(
        this.cacheClient.removeCastReply(cast.hash, cast.parentHash, "best"),
      );
      promises.push(
        this.cacheClient.removeCastReply(cast.hash, cast.parentHash, "top"),
      );
      promises.push(
        this.cacheClient.removeCastReply(cast.hash, cast.parentHash, "new"),
      );
    }

    for (const { hash } of cast.embedCasts) {
      promises.push(
        this.cacheClient.updateCastEngagement(hash, "quotes", -1),
        this.cacheClient.updateCastEngagementV1(hash, "quotes", -1),
      );
    }

    const notifications = parseNotificationsFromCast(cast);
    promises.push(
      ...notifications.map((n) =>
        publishNotification({ ...n, deletedAt: new Date() }),
      ),
    );

    await Promise.all(promises);
  }

  async processCastReactionAdd(data: FarcasterCastReaction) {
    const promises = [];
    if (data.reactionType === 1) {
      const cast = await this.hub.getCast({
        fid: Number(data.targetFid),
        hash: hexToBuffer(data.targetHash),
      });

      let parentFid;
      let parentHash;

      if (cast.isOk() && cast.value.data?.castAddBody) {
        const rawParentHash = cast.value.data?.castAddBody.parentCastId?.hash;
        parentFid = cast.value.data?.castAddBody.parentCastId?.fid.toString();
        parentHash = rawParentHash ? bufferToHex(rawParentHash) : undefined;
      }

      if (parentFid && parentHash) {
        const isOp = data.fid.toString() === parentFid;
        promises.push(
          this.cacheClient.updateCastReplyScore(
            data.targetHash,
            parentHash,
            isOp ? 3_000_000 : 1,
            "best",
          ),
        );
        promises.push(
          this.cacheClient.updateCastReplyScore(
            data.targetHash,
            parentHash,
            1,
            "top",
          ),
        );
      }
      promises.push(
        this.cacheClient.updateCastEngagement(data.targetHash, "likes", 1),
        this.cacheClient.updateCastEngagementV1(data.targetHash, "likes", 1),
      );
      promises.push(
        this.cacheClient.updateCastContext(
          data.fid.toString(),
          data.targetHash,
          "likes",
          true,
        ),
      );
    } else if (data.reactionType === 2) {
      promises.push(
        this.cacheClient.updateCastEngagement(data.targetHash, "recasts", 1),
        this.cacheClient.updateCastEngagementV1(data.targetHash, "recasts", 1),
      );
      promises.push(
        this.cacheClient.updateCastContext(
          data.fid.toString(),
          data.targetHash,
          "recasts",
          true,
        ),
      );
    }

    const notifications = parseNotificationsFromReaction(data);
    promises.push(...notifications.map((n) => publishNotification(n)));

    await Promise.all(promises);
  }

  async processCastReactionRemove(data: FarcasterCastReaction) {
    const promises = [];
    if (data.reactionType === 1) {
      const cast = await this.hub.getCast({
        fid: Number(data.targetFid),
        hash: hexToBuffer(data.targetHash),
      });

      let parentFid;
      let parentHash;

      if (cast.isOk() && cast.value.data?.castAddBody) {
        const rawParentHash = cast.value.data?.castAddBody.parentCastId?.hash;
        parentFid = cast.value.data?.castAddBody.parentCastId?.fid.toString();
        parentHash = rawParentHash ? bufferToHex(rawParentHash) : undefined;
      }

      if (parentFid && parentHash) {
        const isOp = data.fid.toString() === parentFid;
        promises.push(
          this.cacheClient.updateCastReplyScore(
            data.targetHash,
            parentHash,
            isOp ? -3_000_000 : -1,
            "best",
          ),
        );
        promises.push(
          this.cacheClient.updateCastReplyScore(
            data.targetHash,
            parentHash,
            -1,
            "top",
          ),
        );
      }
      promises.push(
        this.cacheClient.updateCastEngagement(data.targetHash, "likes", -1),
        this.cacheClient.updateCastEngagementV1(data.targetHash, "likes", -1),
      );
      promises.push(
        this.cacheClient.updateCastContext(
          data.fid.toString(),
          data.targetHash,
          "likes",
          false,
        ),
      );
    } else if (data.reactionType === 2) {
      promises.push(
        this.cacheClient.updateCastEngagement(data.targetHash, "recasts", -1),
        this.cacheClient.updateCastEngagementV1(data.targetHash, "recasts", -1),
      );
      promises.push(
        this.cacheClient.updateCastContext(
          data.fid.toString(),
          data.targetHash,
          "recasts",
          false,
        ),
      );
    }

    const notifications = parseNotificationsFromReaction(data);
    promises.push(
      ...notifications.map((n) =>
        publishNotification({ ...n, deletedAt: new Date() }),
      ),
    );

    await Promise.all(promises);
  }

  async processLinkAdd(data: FarcasterLink) {
    const promises = [];
    if (data.linkType === "follow") {
      promises.push(
        this.cacheClient.updateUserEngagement(
          data.fid.toString(),
          "following",
          1,
        ),
      );
      promises.push(
        this.cacheClient.updateUserEngagement(
          data.targetFid.toString(),
          "followers",
          1,
        ),
      );
      promises.push(
        this.cacheClient.updateUserEngagementV1(
          data.fid.toString(),
          "following",
          1,
        ),
      );
      promises.push(
        this.cacheClient.updateUserEngagementV1(
          data.targetFid.toString(),
          "followers",
          1,
        ),
      );
      promises.push(
        this.cacheClient.updateUserContext(
          data.targetFid.toString(),
          data.fid.toString(),
          "following",
          true,
        ),
      );
      promises.push(
        this.cacheClient.addUserFollowingFid(
          data.fid.toString(),
          data.targetFid.toString(),
        ),
      );
      promises.push(
        this.cacheClient.addUserFollowerFid(
          data.targetFid.toString(),
          data.fid.toString(),
        ),
      );
    }

    const notifications = parseNotificationsFromLink(data);
    promises.push(...notifications.map((n) => publishNotification(n)));

    await Promise.all(promises);
  }

  async processLinkRemove(data: FarcasterLink) {
    const promises = [];
    if (data.linkType === "follow") {
      promises.push(
        this.cacheClient.updateUserEngagement(
          data.fid.toString(),
          "following",
          -1,
        ),
      );
      promises.push(
        this.cacheClient.updateUserEngagement(
          data.targetFid.toString(),
          "followers",
          -1,
        ),
      );
      promises.push(
        this.cacheClient.updateUserEngagementV1(
          data.fid.toString(),
          "following",
          -1,
        ),
      );
      promises.push(
        this.cacheClient.updateUserEngagementV1(
          data.targetFid.toString(),
          "followers",
          -1,
        ),
      );
      promises.push(
        this.cacheClient.updateUserContext(
          data.targetFid.toString(),
          data.fid.toString(),
          "following",
          false,
        ),
      );
      promises.push(
        this.cacheClient.removeUserFollowingFid(
          data.fid.toString(),
          data.targetFid.toString(),
        ),
      );
      promises.push(
        this.cacheClient.removeUserFollowerFid(
          data.targetFid.toString(),
          data.fid.toString(),
        ),
      );
    }

    const notifications = parseNotificationsFromLink(data);
    promises.push(
      ...notifications.map((n) =>
        publishNotification({ ...n, deletedAt: new Date() }),
      ),
    );

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

  async processVerificationAdd(data: FarcasterVerification) {
    const user = await this.farcasterClient.getUser(data.fid.toString());
    if (!user) return;

    user.verifiedAddresses = user.verifiedAddresses || [];
    user.verifiedAddresses.push({
      protocol: data.protocol,
      address: data.address,
    });

    await this.cacheClient.setUser(data.fid.toString(), user);
  }

  async processVerificationRemove(data: FarcasterVerification) {
    const user = await this.farcasterClient.getUser(data.fid.toString());
    if (!user) return;

    user.verifiedAddresses = user.verifiedAddresses || [];
    user.verifiedAddresses = user.verifiedAddresses.filter(
      (a) => a.address !== data.address,
    );

    await this.cacheClient.setUser(data.fid.toString(), user);
  }

  async processUsernameProof(data: FarcasterUsernameProof) {
    return;
  }
}
