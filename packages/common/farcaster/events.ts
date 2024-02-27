import {
  FarcasterCast,
  FarcasterCastReaction,
  FarcasterLink,
  FarcasterUrlReaction,
  FarcasterUserData,
  FarcasterUsernameProof,
  FarcasterVerification,
} from "@nook/common/prisma/farcaster";
import { toJobId } from "@nook/common/queues";
import {
  EventService,
  FarcasterEventType,
  EntityEvent,
} from "@nook/common/types";

export const transformToCastEvent = (
  type: FarcasterEventType,
  data: FarcasterCast,
): EntityEvent<FarcasterCast> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: data.hash,
  };

  return {
    eventId: toJobId(source),
    source,
    data,
  };
};

export const transformToVerificationEvent = (
  type: FarcasterEventType,
  data: FarcasterVerification,
): EntityEvent<FarcasterVerification> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: data.hash,
  };
  return {
    eventId: toJobId(source),
    source,
    data,
  };
};

export const transformToUserDataEvent = (
  data: FarcasterUserData,
): EntityEvent<FarcasterUserData> => {
  const source = {
    service: EventService.FARCASTER,
    type: FarcasterEventType.USER_DATA_ADD,
    id: data.hash,
  };
  return {
    eventId: toJobId(source),
    source,
    data,
  };
};

export const transformToUsernameProofEvent = (
  data: FarcasterUsernameProof,
): EntityEvent<FarcasterUsernameProof> => {
  const source = {
    service: EventService.FARCASTER,
    type: FarcasterEventType.USERNAME_PROOF,
    id: data.signature,
  };
  return {
    eventId: toJobId(source),
    source,
    data,
  };
};

export const transformToCastReactionEvent = (
  type: FarcasterEventType,
  data: FarcasterCastReaction,
): EntityEvent<FarcasterCastReaction> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: data.hash,
  };
  return {
    eventId: toJobId(source),
    source,
    data,
  };
};

export const transformToUrlReactionEvent = (
  type: FarcasterEventType,
  data: FarcasterUrlReaction,
): EntityEvent<FarcasterUrlReaction> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: data.hash,
  };
  return {
    eventId: toJobId(source),
    source,
    data,
  };
};

export const transformToLinkEvent = (
  type: FarcasterEventType,
  data: FarcasterLink,
): EntityEvent<FarcasterLink> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: data.hash,
  };
  return {
    eventId: toJobId(source),
    source,
    data,
  };
};
