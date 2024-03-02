import {
  HubRpcClient,
  Message,
  MessageType,
  UserDataType,
  getSSLHubRpcClient,
} from "@farcaster/hub-nodejs";
import { Prisma, PrismaClient } from "@nook/common/prisma/farcaster";
import {
  findRootParent,
  getCastEmbeds,
  messageToCast,
  messageToCastEmbedCast,
  messageToCastEmbedUrl,
  messageToCastMentions,
  messageToCastReaction,
  messageToLink,
  messageToUrlReaction,
  messageToUserData,
  messageToUsernameProof,
  messageToVerification,
} from "../utils";
import {
  bufferToHex,
  bufferToHexAddress,
  timestampToDate,
  transformToCastEvent,
  transformToCastReactionEvent,
  transformToLinkEvent,
  transformToUrlReactionEvent,
  transformToUserDataEvent,
  transformToUsernameProofEvent,
  transformToVerificationEvent,
} from "@nook/common/farcaster";
import { FarcasterEventType } from "@nook/common/types";
import { publishEvent } from "@nook/common/queues";
import { RedisClient } from "@nook/common/redis";
import { CastService } from "../../service/cast";
import { UserService } from "../../service/user";

export class FarcasterEventProcessor {
  private client: PrismaClient;
  private hub: HubRpcClient;
  private redis: RedisClient;
  private castService: CastService;
  private userService: UserService;

  CAST_CACHE_PREFIX = "farcaster:cast";
  USER_CACHE_PREFIX = "farcaster:user";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
    this.castService = new CastService(this.client, this.redis);
    this.userService = new UserService(this.client, this.redis);
  }

  async process(message: Message) {
    switch (message.data?.type) {
      case MessageType.CAST_ADD: {
        const cast = await this.processCastAdd(message);
        if (cast) {
          const promises = [];
          promises.push(this.castService.getCast(cast.hash, cast));
          if (cast.parentHash) {
            promises.push(
              this.castService.incrementEngagement(cast.parentHash, "replies"),
            );
          }
          for (const { hash } of getCastEmbeds(cast)) {
            promises.push(this.castService.incrementEngagement(hash, "quotes"));
          }
          await Promise.all(promises);
        }
        break;
      }
      case MessageType.CAST_REMOVE: {
        const cast = await this.processCastRemove(message);
        if (cast) {
          const promises = [];
          if (cast.parentHash) {
            promises.push(
              this.castService.decrementEngagement(cast.parentHash, "replies"),
            );
          }
          for (const { hash } of getCastEmbeds(cast)) {
            promises.push(this.castService.decrementEngagement(hash, "quotes"));
          }
          await Promise.all(promises);
        }
        break;
      }
      case MessageType.LINK_ADD: {
        const link = await this.processLinkAdd(message);
        if (link) {
          const promises = [];
          promises.push(
            this.userService.incrementFollowing(link.fid.toString()),
          );
          promises.push(
            this.userService.incrementFollowers(link.targetFid.toString()),
          );
          await Promise.all(promises);
        }
        break;
      }
      case MessageType.LINK_REMOVE: {
        const link = await this.processLinkRemove(message);
        if (link) {
          const promises = [];
          promises.push(
            this.userService.decrementFollowing(link.fid.toString()),
          );
          promises.push(
            this.userService.decrementFollowers(link.targetFid.toString()),
          );
          await Promise.all(promises);
        }
        break;
      }
      case MessageType.REACTION_ADD: {
        const reaction = await this.processCastReactionAdd(message);
        if (reaction) {
          const promises = [];
          let type: "likes" | "recasts" | undefined;
          if (reaction.reactionType === 1) {
            type = "likes";
          } else if (reaction.reactionType === 2) {
            type = "recasts";
          }
          if (type) {
            promises.push(
              this.castService.incrementEngagement(reaction.targetHash, type),
            );
          }
          await Promise.all(promises);
        }
        break;
      }
      case MessageType.REACTION_REMOVE: {
        const reaction = await this.processCastReactionRemove(message);
        if (reaction) {
          const promises = [];
          let type: "likes" | "recasts" | undefined;
          if (reaction.reactionType === 1) {
            type = "likes";
          } else if (reaction.reactionType === 2) {
            type = "recasts";
          }
          if (type) {
            promises.push(
              this.castService.decrementEngagement(reaction.targetHash, type),
            );
          }
        }
        break;
      }
      case MessageType.VERIFICATION_ADD_ETH_ADDRESS: {
        const verification = await this.processVerificationAdd(message);
        break;
      }
      case MessageType.VERIFICATION_REMOVE: {
        const verification = await this.processVerificationRemove(message);
        break;
      }
      case MessageType.USER_DATA_ADD: {
        const userData = await this.userDataAdd(message);
        if (userData) {
          const key = `${this.USER_CACHE_PREFIX}:${userData.fid}`;
          const user = await this.userService.getUser(userData.fid.toString());
          if (!user) break;
          switch (userData.type) {
            case UserDataType.USERNAME:
              user.username = userData.value;
              break;
            case UserDataType.PFP:
              user.pfp = userData.value;
              break;
            case UserDataType.DISPLAY:
              user.displayName = userData.value;
              break;
            case UserDataType.BIO:
              user.bio = userData.value;
              break;
            case UserDataType.URL:
              user.url = userData.value;
              break;
            default:
              break;
          }
          await this.redis.setJson(key, user);
        }
        break;
      }
      case MessageType.USERNAME_PROOF: {
        const proof = await this.usernameProofAdd(message);
        break;
      }
      default:
        console.log(`[farcaster] unknown message type: ${message.data?.type}`);
        break;
    }
  }

  async processCastAdd(message: Message) {
    const cast = messageToCast(message);
    if (!cast) return;

    if (cast.parentHash) {
      const { rootParentFid, rootParentHash, rootParentUrl } =
        await findRootParent(this.hub, cast);
      cast.rootParentFid = rootParentFid;
      cast.rootParentHash = rootParentHash;
      cast.rootParentUrl = rootParentUrl;
    }

    await this.client.farcasterCast.upsert({
      where: {
        hash: cast.hash,
      },
      create: cast as Prisma.FarcasterCastCreateInput,
      update: cast as Prisma.FarcasterCastCreateInput,
    });

    const embedCasts = messageToCastEmbedCast(message);

    for (const embedCast of embedCasts) {
      await this.client.farcasterCastEmbedCast.upsert({
        where: {
          hash_embedHash: {
            hash: embedCast.hash,
            embedHash: embedCast.embedHash,
          },
        },
        create: embedCast,
        update: embedCast,
      });
    }

    const embedUrls = messageToCastEmbedUrl(message);

    for (const embedUrl of embedUrls) {
      await this.client.farcasterCastEmbedUrl.upsert({
        where: {
          hash_url: {
            hash: embedUrl.hash,
            url: embedUrl.url,
          },
        },
        create: embedUrl,
        update: embedUrl,
      });
    }

    const mentions = messageToCastMentions(message);

    for (const mention of mentions) {
      await this.client.farcasterCastMention.upsert({
        where: {
          hash_mention_mentionPosition: {
            hash: mention.hash,
            mention: mention.mention,
            mentionPosition: mention.mentionPosition,
          },
        },
        create: mention,
        update: mention,
      });
    }

    console.log(`[cast-add] [${cast.fid}] added ${cast.hash}`);

    publishEvent(transformToCastEvent(FarcasterEventType.CAST_ADD, cast));

    return cast;
  }

  async processCastRemove(message: Message) {
    if (!message.data?.castRemoveBody) return;

    const hash = bufferToHex(message.data.castRemoveBody.targetHash);
    const deletedAt = timestampToDate(message.data.timestamp);

    await this.client.farcasterCast.updateMany({
      where: { hash },
      data: { deletedAt },
    });

    await this.client.farcasterCastEmbedCast.updateMany({
      where: { hash },
      data: { deletedAt },
    });

    await this.client.farcasterCastEmbedUrl.updateMany({
      where: { hash },
      data: { deletedAt },
    });

    await this.client.farcasterCastMention.updateMany({
      where: { hash },
      data: { deletedAt },
    });

    console.log(`[cast-remove] [${message.data?.fid}] removed ${hash}`);

    const cast = await this.client.farcasterCast.findUnique({
      where: { hash },
    });
    if (cast) {
      publishEvent(transformToCastEvent(FarcasterEventType.CAST_REMOVE, cast));
    }

    return cast;
  }

  async processLinkAdd(message: Message) {
    const link = messageToLink(message);
    if (!link) return;

    await this.client.farcasterLink.upsert({
      where: {
        fid_linkType_targetFid: {
          fid: link.fid,
          linkType: link.linkType,
          targetFid: link.targetFid,
        },
      },
      create: link,
      update: link,
    });

    console.log(
      `[link-add] [${link.fid}] added ${link.linkType} to ${link.targetFid}`,
    );

    publishEvent(transformToLinkEvent(FarcasterEventType.LINK_ADD, link));

    return link;
  }

  async processLinkRemove(message: Message) {
    const link = messageToLink(message);
    if (!link) return;

    const existingLink = await this.client.farcasterLink.findUnique({
      where: {
        fid_linkType_targetFid: {
          fid: link.fid,
          linkType: link.linkType,
          targetFid: link.targetFid,
        },
      },
    });

    await this.client.farcasterLink.updateMany({
      where: {
        fid: link.fid,
        linkType: link.linkType,
        targetFid: link.targetFid,
      },
      data: {
        deletedAt: link.timestamp,
      },
    });

    console.log(
      `[link-remove] [${link.fid}] removed ${link.linkType} to ${link.targetFid}`,
    );

    if (existingLink) {
      publishEvent(transformToLinkEvent(FarcasterEventType.LINK_REMOVE, link));
    }

    return link;
  }

  async processCastReactionAdd(message: Message) {
    const reaction = messageToCastReaction(message);
    if (!reaction) return;

    await this.client.farcasterCastReaction.upsert({
      where: {
        targetHash_reactionType_fid: {
          targetHash: reaction.targetHash,
          reactionType: reaction.reactionType,
          fid: reaction.fid,
        },
      },
      create: reaction,
      update: reaction,
    });

    console.log(
      `[reaction-add] [${reaction.fid}] added ${reaction.reactionType} from ${reaction.targetHash}`,
    );

    publishEvent(
      transformToCastReactionEvent(
        FarcasterEventType.CAST_REACTION_ADD,
        reaction,
      ),
    );

    return reaction;
  }

  async processCastReactionRemove(message: Message) {
    const reaction = messageToCastReaction(message);
    if (!reaction) return;

    const existingReaction = await this.client.farcasterCastReaction.findUnique(
      {
        where: {
          targetHash_reactionType_fid: {
            targetHash: reaction.targetHash,
            reactionType: reaction.reactionType,
            fid: reaction.fid,
          },
        },
      },
    );

    await this.client.farcasterCastReaction.updateMany({
      where: {
        targetHash: reaction.targetHash,
        reactionType: reaction.reactionType,
        fid: reaction.fid,
      },
      data: {
        deletedAt: reaction.timestamp,
      },
    });

    console.log(
      `[reaction-remove] [${reaction.fid}] removed ${reaction.reactionType} from ${reaction.targetHash}`,
    );

    if (existingReaction) {
      publishEvent(
        transformToCastReactionEvent(
          FarcasterEventType.CAST_REACTION_REMOVE,
          existingReaction,
        ),
      );
    }

    return existingReaction;
  }

  async processUrlReactionAdd(message: Message) {
    const reaction = messageToUrlReaction(message);
    if (!reaction) return;

    await this.client.farcasterUrlReaction.upsert({
      where: {
        targetUrl_reactionType_fid: {
          targetUrl: reaction.targetUrl,
          reactionType: reaction.reactionType,
          fid: reaction.fid,
        },
      },
      create: reaction,
      update: reaction,
    });

    console.log(
      `[reaction-add] [${reaction.fid}] added ${reaction.reactionType} from ${reaction.targetUrl}`,
    );

    publishEvent(
      transformToUrlReactionEvent(
        FarcasterEventType.URL_REACTION_ADD,
        reaction,
      ),
    );

    return reaction;
  }

  async processUrlReactionRemove(message: Message) {
    const reaction = messageToUrlReaction(message);
    if (!reaction) return;

    const existingReaction = await this.client.farcasterUrlReaction.findUnique({
      where: {
        targetUrl_reactionType_fid: {
          targetUrl: reaction.targetUrl,
          reactionType: reaction.reactionType,
          fid: reaction.fid,
        },
      },
    });

    await this.client.farcasterUrlReaction.updateMany({
      where: {
        targetUrl: reaction.targetUrl,
        reactionType: reaction.reactionType,
        fid: reaction.fid,
      },
      data: {
        deletedAt: reaction.timestamp,
      },
    });

    console.log(
      `[reaction-remove] [${reaction.fid}] removed ${reaction.reactionType} from ${reaction.targetUrl}`,
    );

    if (existingReaction) {
      publishEvent(
        transformToUrlReactionEvent(
          FarcasterEventType.URL_REACTION_REMOVE,
          existingReaction,
        ),
      );
    }

    return existingReaction;
  }

  async processVerificationAdd(message: Message) {
    const verification = messageToVerification(message);
    if (!verification) return;

    await this.client.farcasterVerification.upsert({
      where: {
        fid_address: {
          fid: verification.fid,
          address: verification.address,
        },
      },
      create: verification,
      update: verification,
    });

    console.log(
      `[verification-add] [${verification.fid}] added ${verification.address}`,
    );

    publishEvent(
      transformToVerificationEvent(
        FarcasterEventType.VERIFICATION_ADD,
        verification,
      ),
    );

    return verification;
  }

  async processVerificationRemove(message: Message) {
    if (!message.data?.verificationRemoveBody?.address) return;

    const fid = BigInt(message.data.fid);
    const address = bufferToHexAddress(
      message.data.verificationRemoveBody.address,
    );
    const protocol = message.data.verificationRemoveBody.protocol;

    await this.client.farcasterVerification.updateMany({
      where: {
        fid,
        address,
      },
      data: {
        deletedAt: timestampToDate(message.data.timestamp),
      },
    });

    console.log(`[verification-remove] [${fid}] removed ${address}`);

    const verification = await this.client.farcasterVerification.findFirst({
      where: { address, protocol },
    });

    if (verification) {
      publishEvent(
        transformToVerificationEvent(
          FarcasterEventType.VERIFICATION_REMOVE,
          verification,
        ),
      );
    }

    return verification;
  }

  async userDataAdd(message: Message) {
    const userData = messageToUserData(message);
    if (!userData) return;

    await this.client.farcasterUserData.upsert({
      where: {
        fid_type: {
          fid: userData.fid,
          type: userData.type,
        },
      },
      create: userData,
      update: userData,
    });

    console.log(
      `[user-data-add] [${userData.fid}] added ${userData.type} with value ${userData.value}`,
    );

    publishEvent(transformToUserDataEvent(userData));

    return userData;
  }

  async usernameProofAdd(message: Message) {
    if (!message?.data?.usernameProofBody) return;
    const proof = messageToUsernameProof(message.data.usernameProofBody);

    await this.client.farcasterUsernameProof.upsert({
      where: {
        username: proof.username,
      },
      create: proof,
      update: proof,
    });

    console.log(`[username-proof-add] [${proof.fid}] added ${proof.username}`);

    publishEvent(transformToUsernameProofEvent(proof));

    return proof;
  }
}
