import { QueueName, getWorker } from "@nook/common/queues";
import { HubRpcClient, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { backfillCastAdd } from "../consumer/handlers/casts";
import { backfillVerificationAdd } from "../consumer/handlers/verifications";
import { backfillUsernameProofAdd } from "../consumer/handlers/usernames";
import { backfillUserDataAdd } from "../consumer/handlers/users";
import { backfillReactionAdd } from "../consumer/handlers/reactions";
import { backfillLinkAdd } from "../consumer/handlers/links";
import { PrismaClient } from "@nook/common/prisma/farcaster";

const prisma = new PrismaClient();

const processFid = async (client: HubRpcClient, fid: number) => {
  console.time(`[${fid}] backfill took`);

  const [userDatas, usernameProofs, verifications, casts, reactions, links] =
    await Promise.all([
      client.getUserDataByFid({ fid }),
      client.getUserNameProofsByFid({ fid }),
      client.getVerificationsByFid({ fid }),
      client.getCastsByFid({ fid }),
      client.getReactionsByFid({ fid }),
      client.getLinksByFid({ fid }),
    ]);

  if (userDatas.isErr()) {
    console.error("u", userDatas.error);
    throw new Error(userDatas.error.message);
  }
  if (usernameProofs.isErr()) {
    console.error("p", usernameProofs.error);
    throw new Error(usernameProofs.error.message);
  }
  if (verifications.isErr()) {
    console.error("v", verifications.error);
    throw new Error(verifications.error.message);
  }
  if (casts.isErr()) {
    console.error("c", casts.error);
    throw new Error(casts.error.message);
  }
  if (reactions.isErr()) {
    console.error("r", reactions.error);
    throw new Error(reactions.error.message);
  }
  if (links.isErr()) {
    console.error("l", links.error);
    throw new Error(links.error.message);
  }

  await Promise.all([
    prisma.farcasterUserData.deleteMany({ where: { fid: fid } }),
    prisma.farcasterUsernameProof.deleteMany({ where: { fid: fid } }),
    prisma.farcasterVerification.deleteMany({ where: { fid: fid } }),
    prisma.farcasterCast.deleteMany({ where: { fid: fid } }),
    prisma.farcasterCastMention.deleteMany({ where: { fid: fid } }),
    prisma.farcasterCastEmbedCast.deleteMany({ where: { fid: fid } }),
    prisma.farcasterCastEmbedUrl.deleteMany({ where: { fid: fid } }),
    prisma.farcasterCastReaction.deleteMany({ where: { fid: fid } }),
    prisma.farcasterUrlReaction.deleteMany({ where: { fid: fid } }),
    prisma.farcasterLink.deleteMany({ where: { fid: fid } }),
  ]);

  await Promise.all([
    backfillUserDataAdd(userDatas.value.messages),
    backfillUsernameProofAdd(usernameProofs.value.proofs),
    backfillVerificationAdd(verifications.value.messages),
    backfillCastAdd(client, casts.value.messages),
    backfillReactionAdd(reactions.value.messages),
    backfillLinkAdd(links.value.messages),
  ]);

  console.log(
    `[${fid}] backfilled user datas - ${userDatas.value.messages.length}\n` +
      `[${fid}] backfilled username proofs - ${usernameProofs.value.proofs.length}\n` +
      `[${fid}] backfilled verifications - ${verifications.value.messages.length}\n` +
      `[${fid}] backfilled casts - ${casts.value.messages.length}\n` +
      `[${fid}] backfilled reactions - ${reactions.value.messages.length}\n` +
      `[${fid}] backfilled links - ${links.value.messages.length}`,
  );

  console.timeEnd(`[${fid}] backfill took`);
};

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint, {
    "grpc.max_receive_message_length": 4300000,
  });

  const inputFid = process.argv[2];
  if (inputFid) {
    await processFid(client, Number(inputFid));
    process.exit(0);
  }

  const worker = getWorker(QueueName.FarcasterBackfill, async (job) => {
    const fid = Number(job.data.fid);
    await processFid(client, fid);

    console.log(`processing fid: ${fid}`);
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
