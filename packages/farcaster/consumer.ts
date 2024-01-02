import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { QueueName, getWorker } from "@flink/common/queues";
import { Job } from "bullmq";
import { MessageType } from "@farcaster/hub-nodejs";
import { handleCastAdd, handleCastRemove } from "./handlers/casts";
import {
  handleVerificationAdd,
  handleVerificationRemove,
} from "./handlers/verifications";
import { handleReactionAdd, handleReactionRemove } from "./handlers/reactions";
import { handleLinkAdd, handleLinkRemove } from "./handlers/links";
import { handleUserDataAdd, handleUsernameProofAdd } from "./handlers/users";

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);

  const worker = getWorker(QueueName.FarcasterIngress, async (job) => {
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
  });

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(
        `[farcaster-consumer] [${job.id}] failed with ${err.message}`,
      );
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
