import { toFarcasterURI } from "@nook/common/farcaster";
import {
  FarcasterCast,
  FarcasterCastEmbedCast,
  FarcasterCastMention,
  FarcasterCastReaction,
  FarcasterLink,
  FarcasterUrlReaction,
  FarcasterUserData,
  FarcasterUsernameProof,
  FarcasterVerification,
  Prisma,
} from "@nook/common/prisma/farcaster";
import { toJobId } from "@nook/common/queues";
import {
  EventService,
  FarcasterEventType,
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
  FarcasterUserDataAddData,
  FarcasterUsernameProofData,
  FarcasterVerificationData,
  EntityEvent,
} from "@nook/common/types";

export const transformToCastEvent = (
  type: FarcasterEventType,
  cast: FarcasterCast,
): EntityEvent<FarcasterCastData> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: cast.hash,
  };

  const mentions = [];
  // @ts-ignore
  if (cast.rawMentions && cast.rawMentions !== Prisma.DbNull) {
    for (const mention of cast.rawMentions as unknown as FarcasterCastMention[]) {
      mentions.push({
        mention: mention.mention.toString(),
        mentionPosition: mention.mentionPosition.toString(),
      });
    }
  }

  const embeds: string[] = [];
  // @ts-ignore
  if (cast.rawUrlEmbeds && cast.rawUrlEmbeds !== Prisma.DbNull) {
    for (const url of cast.rawUrlEmbeds as string[]) {
      embeds.push(url);
    }
  }

  if (cast.rawCastEmbeds && (cast.rawCastEmbeds as unknown) !== Prisma.DbNull) {
    for (const embed of cast.rawCastEmbeds as unknown as FarcasterCastEmbedCast[]) {
      embeds.push(
        toFarcasterURI({
          fid: embed.embedFid.toString(),
          hash: embed.embedHash,
        }),
      );
    }
  }

  return {
    eventId: toJobId(source),
    source,
    userId: cast.fid.toString(),
    timestamp: cast.timestamp.getTime(),
    data: {
      timestamp: cast.timestamp.getTime(),
      fid: cast.fid.toString(),
      hash: cast.hash,
      text: cast.text,
      parentFid: cast.parentFid?.toString(),
      parentHash: cast.parentHash || undefined,
      parentUrl: cast.parentUrl || undefined,
      rootParentFid: cast.rootParentFid.toString(),
      rootParentHash: cast.rootParentHash,
      rootParentUrl: cast.rootParentUrl || undefined,
      mentions,
      embeds,
      signature: {
        hash: cast.hash,
        hashScheme: cast.hashScheme,
        signature: cast.signature,
        signatureScheme: cast.signatureScheme,
        signer: cast.signer,
      },
    },
  };
};

export const transformToVerificationEvent = (
  type: FarcasterEventType,
  data: FarcasterVerification,
): EntityEvent<FarcasterVerificationData> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: data.hash,
  };
  return {
    eventId: toJobId(source),
    source,
    userId: data.fid.toString(),
    timestamp: data.timestamp.getTime(),
    data: {
      fid: data.fid.toString(),
      address: data.address,
      protocol: data.protocol,
      verificationType: data.verificationType,
      blockHash: data.blockHash,
      chainId: data.chainId,
      claimSignature: data.claimSignature,
      signature: {
        hash: data.hash,
        hashScheme: data.hashScheme,
        signature: data.signature,
        signatureScheme: data.signatureScheme,
        signer: data.signer,
      },
    },
  };
};

export const transformToUserDataEvent = (
  data: FarcasterUserData,
): EntityEvent<FarcasterUserDataAddData> => {
  const source = {
    service: EventService.FARCASTER,
    type: FarcasterEventType.USER_DATA_ADD,
    id: data.hash,
  };
  return {
    eventId: toJobId(source),
    source,
    userId: data.fid.toString(),
    timestamp: data.timestamp.getTime(),
    data: {
      fid: data.fid.toString(),
      type: data.type,
      value: data.value,
      signature: {
        hash: data.hash,
        hashScheme: data.hashScheme,
        signature: data.signature,
        signatureScheme: data.signatureScheme,
        signer: data.signer,
      },
    },
  };
};

export const transformToUsernameProofEvent = (
  data: FarcasterUsernameProof,
): EntityEvent<FarcasterUsernameProofData> => {
  const source = {
    service: EventService.FARCASTER,
    type: FarcasterEventType.USERNAME_PROOF,
    id: data.signature,
  };
  return {
    eventId: toJobId(source),
    source,
    userId: data.fid.toString(),
    timestamp: data.timestamp.getTime(),
    data: {
      fid: data.fid.toString(),
      username: data.username,
      owner: data.owner,
      claimSignature: data.signature,
      type: data.type,
    },
  };
};

export const transformToCastReactionEvent = (
  type: FarcasterEventType,
  reaction: FarcasterCastReaction,
): EntityEvent<FarcasterCastReactionData> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: reaction.hash,
  };

  return {
    eventId: toJobId(source),
    source,
    userId: reaction.fid.toString(),
    timestamp: reaction.timestamp.getTime(),
    data: {
      timestamp: reaction.timestamp.getTime(),
      fid: reaction.fid.toString(),
      reactionType: reaction.reactionType,
      targetFid: reaction.targetFid.toString(),
      targetHash: reaction.targetHash,
      signature: {
        hash: reaction.hash,
        hashScheme: reaction.hashScheme,
        signature: reaction.signature,
        signatureScheme: reaction.signatureScheme,
        signer: reaction.signer,
      },
    },
  };
};

export const transformToUrlReactionEvent = (
  type: FarcasterEventType,
  reaction: FarcasterUrlReaction,
): EntityEvent<FarcasterUrlReactionData> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: reaction.hash,
  };

  return {
    eventId: toJobId(source),
    source,
    userId: reaction.fid.toString(),
    timestamp: reaction.timestamp.getTime(),
    data: {
      timestamp: reaction.timestamp.getTime(),
      fid: reaction.fid.toString(),
      reactionType: reaction.reactionType,
      url: reaction.targetUrl,
      signature: {
        hash: reaction.hash,
        hashScheme: reaction.hashScheme,
        signature: reaction.signature,
        signatureScheme: reaction.signatureScheme,
        signer: reaction.signer,
      },
    },
  };
};

export const transformToLinkEvent = (
  type: FarcasterEventType,
  link: FarcasterLink,
): EntityEvent<FarcasterLinkData> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: link.hash,
  };
  return {
    eventId: toJobId(source),
    source,
    userId: link.fid.toString(),
    timestamp: link.timestamp.getTime(),
    data: {
      fid: link.fid.toString(),
      linkType: link.linkType,
      targetFid: link.targetFid.toString(),
      timestamp: link.timestamp.getTime(),
      signature: {
        hash: link.hash,
        hashScheme: link.hashScheme,
        signature: link.signature,
        signatureScheme: link.signatureScheme,
        signer: link.signer,
      },
    },
  };
};
