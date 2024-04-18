import {
  HubRpcClient,
  Message,
  MessageType,
  getSSLHubRpcClient,
} from "@farcaster/hub-nodejs";
import { Prisma, PrismaClient } from "@nook/common/prisma/farcaster";
import {
  findRootParent,
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
} from "@nook/common/farcaster";
import {
  bufferToHex,
  bufferToHexAddress,
  getCastEmbeds,
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

export class FarcasterEventProcessor {
  private client: PrismaClient;
  private hub: HubRpcClient;

  constructor() {
    this.client = new PrismaClient();
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
  }

  async process(message: Message) {
    switch (message.data?.type) {
      case MessageType.CAST_ADD: {
        await this.processCastAdd(message);
        break;
      }
      case MessageType.CAST_REMOVE: {
        await this.processCastRemove(message);
        break;
      }
      case MessageType.LINK_ADD: {
        await this.processLinkAdd(message);
        break;
      }
      case MessageType.LINK_REMOVE: {
        await this.processLinkRemove(message);
        break;
      }
      case MessageType.REACTION_ADD: {
        await this.processCastReactionAdd(message);
        break;
      }
      case MessageType.REACTION_REMOVE: {
        await this.processCastReactionRemove(message);
        break;
      }
      case MessageType.VERIFICATION_ADD_ETH_ADDRESS: {
        await this.processVerificationAdd(message);
        break;
      }
      case MessageType.VERIFICATION_REMOVE: {
        await this.processVerificationRemove(message);
        break;
      }
      case MessageType.USER_DATA_ADD: {
        await this.userDataAdd(message);
        break;
      }
      case MessageType.USERNAME_PROOF: {
        await this.usernameProofAdd(message);
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

    const statsPromises = [];

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
      statsPromises.push(
        this.client.farcasterCastStats.upsert({
          where: {
            hash: embedCast.embedHash,
          },
          create: {
            fid: embedCast.embedFid,
            hash: embedCast.embedHash,
            quotes: 1,
          },
          update: {
            quotes: {
              increment: 1,
            },
          },
        }),
      );
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

    if (cast.parentHash && cast.parentFid) {
      statsPromises.push(
        this.client.farcasterCastStats.upsert({
          where: {
            hash: cast.parentHash,
          },
          create: {
            fid: cast.parentFid,
            hash: cast.parentHash,
            replies: 1,
          },
          update: {
            replies: {
              increment: 1,
            },
          },
        }),
      );
      statsPromises.push(
        this.client.farcasterUserStats.upsert({
          where: {
            fid: cast.fid,
          },
          create: {
            fid: cast.fid,
            replies: 1,
          },
          update: {
            replies: {
              increment: 1,
            },
          },
        }),
      );
      statsPromises.push(
        this.client.farcasterUserStats.upsert({
          where: {
            fid: cast.parentFid,
          },
          create: {
            fid: cast.parentFid,
            repliesReceived: 1,
          },
          update: {
            repliesReceived: {
              increment: 1,
            },
          },
        }),
      );
      if (cast.parentUrl) {
        statsPromises.push(
          this.client.farcasterParentUrlStats.upsert({
            where: {
              url: cast.parentUrl,
            },
            create: {
              url: cast.parentUrl,
              replies: 1,
            },
            update: {
              replies: {
                increment: 1,
              },
            },
          }),
        );
      }
    } else {
      statsPromises.push(
        this.client.farcasterUserStats.upsert({
          where: {
            fid: cast.fid,
          },
          create: {
            fid: cast.fid,
            casts: 1,
          },
          update: {
            casts: {
              increment: 1,
            },
          },
        }),
      );
      if (cast.parentUrl) {
        statsPromises.push(
          this.client.farcasterParentUrlStats.upsert({
            where: {
              url: cast.parentUrl,
            },
            create: {
              url: cast.parentUrl,
              casts: 1,
            },
            update: {
              casts: {
                increment: 1,
              },
            },
          }),
        );
      }
    }

    await Promise.all(statsPromises);

    console.log(`[cast-add] [${cast.fid}] added ${cast.hash}`);

    await publishEvent(
      transformToCastEvent(FarcasterEventType.CAST_ADD, cast),
      true,
    );

    return cast;
  }

  async processCastRemove(message: Message) {
    if (!message.data?.castRemoveBody) return;

    const hash = bufferToHex(message.data.castRemoveBody.targetHash);
    const deletedAt = timestampToDate(message.data.timestamp);

    const cast = await this.client.farcasterCast.findUnique({
      where: { hash },
    });

    if (!cast || cast.deletedAt) {
      return;
    }

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

    const statsPromises = [];

    for (const embedCast of getCastEmbeds(cast)) {
      statsPromises.push(
        this.client.farcasterCastStats.updateMany({
          where: {
            hash: embedCast.hash,
          },
          data: {
            quotes: {
              decrement: 1,
            },
          },
        }),
      );
    }

    if (cast.parentHash && cast.parentFid) {
      statsPromises.push(
        this.client.farcasterCastStats.updateMany({
          where: {
            hash: cast.parentHash,
          },
          data: {
            replies: {
              decrement: 1,
            },
          },
        }),
      );
      statsPromises.push(
        this.client.farcasterUserStats.updateMany({
          where: {
            fid: cast.fid,
          },
          data: {
            replies: {
              decrement: 1,
            },
          },
        }),
      );
      statsPromises.push(
        this.client.farcasterUserStats.updateMany({
          where: {
            fid: cast.parentFid,
          },
          data: {
            repliesReceived: {
              decrement: 1,
            },
          },
        }),
      );
      if (cast.parentUrl) {
        statsPromises.push(
          this.client.farcasterParentUrlStats.updateMany({
            where: {
              url: cast.parentUrl,
            },
            data: {
              replies: {
                decrement: 1,
              },
            },
          }),
        );
      }
    } else {
      statsPromises.push(
        this.client.farcasterUserStats.updateMany({
          where: {
            fid: cast.fid,
          },
          data: {
            casts: {
              decrement: 1,
            },
          },
        }),
      );
      if (cast.parentUrl) {
        statsPromises.push(
          this.client.farcasterParentUrlStats.updateMany({
            where: {
              url: cast.parentUrl,
            },
            data: {
              casts: {
                decrement: 1,
              },
            },
          }),
        );
      }
    }

    await Promise.all(statsPromises);

    console.log(`[cast-remove] [${message.data?.fid}] removed ${hash}`);

    await publishEvent(
      transformToCastEvent(FarcasterEventType.CAST_REMOVE, cast),
    );

    return cast;
  }

  async processLinkAdd(message: Message) {
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

    if (existingLink && !existingLink.deletedAt) {
      return existingLink;
    }

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

    if (link.linkType === "follow") {
      await Promise.all([
        this.client.farcasterUserStats.upsert({
          where: {
            fid: link.fid,
          },
          create: {
            fid: link.fid,
            following: 1,
          },
          update: {
            following: {
              increment: 1,
            },
          },
        }),
        this.client.farcasterUserStats.upsert({
          where: {
            fid: link.targetFid,
          },
          create: {
            fid: link.targetFid,
            followers: 1,
          },
          update: {
            followers: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    console.log(
      `[link-add] [${link.fid}] added ${link.linkType} to ${link.targetFid}`,
    );

    await publishEvent(transformToLinkEvent(FarcasterEventType.LINK_ADD, link));

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

    if (existingLink?.deletedAt) {
      return existingLink;
    }

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

    if (link.linkType === "follow") {
      await Promise.all([
        this.client.farcasterUserStats.updateMany({
          where: {
            fid: link.fid,
          },
          data: {
            following: {
              decrement: 1,
            },
          },
        }),
        this.client.farcasterUserStats.updateMany({
          where: {
            fid: link.targetFid,
          },
          data: {
            followers: {
              decrement: 1,
            },
          },
        }),
      ]);
    }

    console.log(
      `[link-remove] [${link.fid}] removed ${link.linkType} to ${link.targetFid}`,
    );

    if (existingLink) {
      await publishEvent(
        transformToLinkEvent(FarcasterEventType.LINK_REMOVE, link),
      );
    }

    return link;
  }

  async processCastReactionAdd(message: Message) {
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

    if (existingReaction && !existingReaction.deletedAt) {
      return existingReaction;
    }

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

    if (reaction.reactionType === 1 || reaction.reactionType === 2) {
      const reactionType = reaction.reactionType === 1 ? "likes" : "recasts";
      await Promise.all([
        this.client.farcasterCastStats.upsert({
          where: {
            hash: reaction.targetHash,
          },
          create: {
            fid: reaction.fid,
            hash: reaction.targetHash,
            [reactionType]: 1,
          },
          update: {
            [reactionType]: {
              increment: 1,
            },
          },
        }),
        this.client.farcasterUserStats.upsert({
          where: {
            fid: reaction.fid,
          },
          create: {
            fid: reaction.fid,
            [reactionType]: 1,
          },
          update: {
            [reactionType]: {
              increment: 1,
            },
          },
        }),
        this.client.farcasterUserStats.upsert({
          where: {
            fid: reaction.targetFid,
          },
          create: {
            fid: reaction.targetFid,
            [`${reactionType}Received`]: 1,
          },
          update: {
            [`${reactionType}Received`]: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    console.log(
      `[reaction-add] [${reaction.fid}] added ${reaction.reactionType} from ${reaction.targetHash}`,
    );

    await publishEvent(
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

    if (existingReaction?.deletedAt) {
      return existingReaction;
    }

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

    if (reaction.reactionType === 1 || reaction.reactionType === 2) {
      const reactionType = reaction.reactionType === 1 ? "likes" : "recasts";
      await Promise.all([
        this.client.farcasterCastStats.updateMany({
          where: {
            hash: reaction.targetHash,
          },
          data: {
            [reactionType]: {
              decrement: 1,
            },
          },
        }),
        this.client.farcasterUserStats.updateMany({
          where: {
            fid: reaction.fid,
          },
          data: {
            [reactionType]: {
              decrement: 1,
            },
          },
        }),
        this.client.farcasterUserStats.updateMany({
          where: {
            fid: reaction.targetFid,
          },
          data: {
            [`${reactionType}Received`]: {
              decrement: 1,
            },
          },
        }),
      ]);
    }

    console.log(
      `[reaction-remove] [${reaction.fid}] removed ${reaction.reactionType} from ${reaction.targetHash}`,
    );

    if (existingReaction) {
      await publishEvent(
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

    const existingReaction = await this.client.farcasterUrlReaction.findUnique({
      where: {
        targetUrl_reactionType_fid: {
          targetUrl: reaction.targetUrl,
          reactionType: reaction.reactionType,
          fid: reaction.fid,
        },
      },
    });

    if (existingReaction && !existingReaction.deletedAt) {
      return existingReaction;
    }

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

    await publishEvent(
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

    if (existingReaction?.deletedAt) {
      return existingReaction;
    }

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
      await publishEvent(
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

    await publishEvent(
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
      await publishEvent(
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

    await publishEvent(transformToUserDataEvent(userData));

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

    await publishEvent(transformToUsernameProofEvent(proof));

    return proof;
  }
}
