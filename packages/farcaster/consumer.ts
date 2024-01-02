import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
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
import { MessageHandlerArgs } from "./types";

export const handlerForType: {
  [K in MessageType]?: (args: MessageHandlerArgs) => Promise<void>;
} = {
  [MessageType.CAST_ADD]: handleCastAdd,
  [MessageType.CAST_REMOVE]: handleCastRemove,
  [MessageType.VERIFICATION_ADD_ETH_ADDRESS]: handleVerificationAdd,
  [MessageType.VERIFICATION_REMOVE]: handleVerificationRemove,
  [MessageType.REACTION_ADD]: handleReactionAdd,
  [MessageType.REACTION_REMOVE]: handleReactionRemove,
  [MessageType.LINK_ADD]: handleLinkAdd,
  [MessageType.LINK_REMOVE]: handleLinkRemove,
  [MessageType.USER_DATA_ADD]: handleUserDataAdd,
  [MessageType.USERNAME_PROOF]: handleUsernameProofAdd,
};

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);

  const worker = getWorker(QueueName.FarcasterIngress, async (job: Job) => {
    const message = job.data;
    console.log(`[farcaster-consumer] processing event ${job.id}`);

    const handler = handlerForType[message.data.type];
    if (handler) {
      await handler({ message, client });
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
