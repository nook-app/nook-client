import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { MessageType } from "@farcaster/hub-nodejs";
import { handleCastAdd, handleCastRemove } from "./casts";
import {
  handleVerificationAdd,
  handleVerificationRemove,
} from "./verifications";
import { handleReactionAdd, handleReactionRemove } from "./reactions";
import { handleLinkAdd, handleLinkRemove } from "./links";
import { handleUserDataAdd } from "./users";
import { Job } from "bullmq";
import { handleUsernameProofAdd } from "./usernames";
import {
  EntityEventData,
  FarcasterEventType,
  EntityEvent,
} from "@nook/common/types";
import {
  transformToCastEvent,
  transformToCastReactionEvent,
  transformToLinkEvent,
  transformToUrlReactionEvent,
  transformToUserDataEvent,
  transformToUsernameProofEvent,
  transformToVerificationEvent,
} from "@nook/common/farcaster";
import { publishEvents } from "@nook/common/queues";
import { PrismaClient } from "@nook/common/prisma/farcaster";

export const getFarcasterHandler = () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);

  const prisma = new PrismaClient();

  return async (job: Job<Message>) => {
    const message = job.data;

    const events: EntityEvent<EntityEventData>[] = [];

    switch (message.data?.type) {
      case MessageType.CAST_ADD: {
        const record = await handleCastAdd(prisma, message, client);
        if (record) {
          events.push(
            transformToCastEvent(FarcasterEventType.CAST_ADD, record),
          );
        }
        break;
      }
      case MessageType.CAST_REMOVE: {
        const record = await handleCastRemove(prisma, message);
        if (record) {
          events.push(
            transformToCastEvent(FarcasterEventType.CAST_REMOVE, record),
          );
        }
        break;
      }
      case MessageType.VERIFICATION_ADD_ETH_ADDRESS: {
        const record = await handleVerificationAdd(prisma, message);
        if (record) {
          events.push(
            transformToVerificationEvent(
              FarcasterEventType.VERIFICATION_ADD,
              record,
            ),
          );
        }
        break;
      }
      case MessageType.VERIFICATION_REMOVE: {
        const record = await handleVerificationRemove(prisma, message);
        if (record) {
          events.push(
            transformToVerificationEvent(
              FarcasterEventType.VERIFICATION_REMOVE,
              record,
            ),
          );
        }
        break;
      }
      case MessageType.REACTION_ADD: {
        const record = await handleReactionAdd(prisma, message);
        if (record) {
          if ("targetUrl" in record) {
            events.push(
              transformToUrlReactionEvent(
                FarcasterEventType.URL_REACTION_ADD,
                record,
              ),
            );
          } else if ("targetHash" in record) {
            events.push(
              transformToCastReactionEvent(
                FarcasterEventType.CAST_REACTION_ADD,
                record,
              ),
            );
          }
        }
        break;
      }
      case MessageType.REACTION_REMOVE: {
        const record = await handleReactionRemove(prisma, message);
        if (record) {
          if ("targetUrl" in record) {
            events.push(
              transformToUrlReactionEvent(
                FarcasterEventType.URL_REACTION_REMOVE,
                record,
              ),
            );
          } else if ("targetHash" in record) {
            events.push(
              transformToCastReactionEvent(
                FarcasterEventType.CAST_REACTION_REMOVE,
                record,
              ),
            );
          }
        }
        break;
      }
      case MessageType.LINK_ADD: {
        const record = await handleLinkAdd(prisma, message);
        if (record) {
          events.push(
            transformToLinkEvent(FarcasterEventType.LINK_ADD, record),
          );
        }
        break;
      }
      case MessageType.LINK_REMOVE: {
        const record = await handleLinkRemove(prisma, message);
        if (record) {
          events.push(
            transformToLinkEvent(FarcasterEventType.LINK_REMOVE, record),
          );
        }
        break;
      }
      case MessageType.USER_DATA_ADD: {
        const record = await handleUserDataAdd(prisma, message);
        if (record) {
          events.push(transformToUserDataEvent(record));
        }
        break;
      }
      case MessageType.USERNAME_PROOF: {
        const record = await handleUsernameProofAdd(prisma, message);
        if (record) {
          events.push(transformToUsernameProofEvent(record));
        }
        break;
      }
      default:
        break;
    }

    await publishEvents(events);
  };
};
