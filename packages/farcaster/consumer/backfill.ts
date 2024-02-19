import { QueueName, getWorker } from "@nook/common/queues";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { backfillCasts } from "./handlers/casts";
import { backfillVerifications } from "./handlers/verifications";
import { backfillUsernameProofs } from "./handlers/usernames";
import { backfillUserDatas } from "./handlers/users";
import { backfillReactions } from "./handlers/reactions";
import { backfillLinks } from "./handlers/links";

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);

  const worker = getWorker(QueueName.FarcasterBackfill, async (job) => {
    const fid = Number(job.data.fid);

    console.log(`processing fid: ${fid}`);

    const userDatas = await client.getUserDataByFid({ fid });
    if (userDatas.isErr()) {
      console.error(userDatas.error);
      process.exit(1);
    }

    await backfillUserDatas(userDatas.value.messages);

    const usernameProofs = await client.getUserNameProofsByFid({ fid });
    if (usernameProofs.isErr()) {
      console.error(usernameProofs.error);
      process.exit(1);
    }

    await backfillUsernameProofs(usernameProofs.value.proofs);

    const verifications = await client.getVerificationsByFid({ fid });
    if (verifications.isErr()) {
      console.error(verifications.error);
      process.exit(1);
    }

    await backfillVerifications(verifications.value.messages);

    const casts = await client.getCastsByFid({ fid });
    if (casts.isErr()) {
      console.error(casts.error);
      process.exit(1);
    }

    await backfillCasts(client, casts.value.messages);

    const reactions = await client.getReactionsByFid({ fid });
    if (reactions.isErr()) {
      console.error(reactions.error);
      process.exit(1);
    }

    await backfillReactions(reactions.value.messages);

    const links = await client.getLinksByFid({ fid });
    if (links.isErr()) {
      console.error(links.error);
      process.exit(1);
    }

    await backfillLinks(links.value.messages);
  });

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
