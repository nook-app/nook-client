import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { MessageType } from "@farcaster/hub-nodejs";
import { handleCastAdd, handleCastRemove } from "./casts";
import {
  handleVerificationAdd,
  handleVerificationRemove,
} from "./verifications";
import { handleReactionAdd, handleReactionRemove } from "./reactions";
import { handleLinkAdd, handleLinkRemove } from "./links";
import { handleUserDataAdd, handleUsernameProofAdd } from "./users";
import { Job } from "bullmq";

export const getFarcasterHandler = () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);

  return async (job: Job<Message>) => {
    const message = job.data;
    console.log(`[farcaster-consumer] processing event ${job.id}`);

    const args = { message, client };
    switch (message.data.type) {
      case MessageType.CAST_ADD:
        await handleCastAdd(args);
        break;
      case MessageType.CAST_REMOVE:
        await handleCastRemove(args);
        break;
      case MessageType.VERIFICATION_ADD_ETH_ADDRESS:
        await handleVerificationAdd(args);
        break;
      case MessageType.VERIFICATION_REMOVE:
        await handleVerificationRemove(args);
        break;
      case MessageType.REACTION_ADD:
        await handleReactionAdd(args);
        break;
      case MessageType.REACTION_REMOVE:
        await handleReactionRemove(args);
        break;
      case MessageType.LINK_ADD:
        await handleLinkAdd(args);
        break;
      case MessageType.LINK_REMOVE:
        await handleLinkRemove(args);
        break;
      case MessageType.USER_DATA_ADD:
        await handleUserDataAdd(args);
        break;
      case MessageType.USERNAME_PROOF:
        await handleUsernameProofAdd(args);
        break;
      default:
        break;
    }
  };
};
