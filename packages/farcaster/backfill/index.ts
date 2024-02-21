import { QueueName, getWorker } from "@nook/common/queues";
import { HubRpcClient, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { backfillCasts } from "../consumer/handlers/casts";
import { backfillVerifications } from "../consumer/handlers/verifications";
import { backfillUsernameProofs } from "../consumer/handlers/usernames";
import { backfillUserDatas } from "../consumer/handlers/users";
import { backfillReactions } from "../consumer/handlers/reactions";
import { backfillLinks } from "../consumer/handlers/links";
import { PrismaClient } from "@nook/common/prisma/farcaster";

const prisma = new PrismaClient();

const processFid = async (client: HubRpcClient, fid: number) => {
  console.time(`[${fid}] backfill took`);

  const [
    userDatas,
    usernameProofs,
    //  verifications,
    //  casts,
    //  reactions,
    //  links
  ] = await Promise.all([
    client.getUserDataByFid({ fid }),
    client.getUserNameProofsByFid({ fid }),
    // client.getVerificationsByFid({ fid }),
    // client.getCastsByFid({ fid }),
    // client.getReactionsByFid({ fid }),
    // client.getLinksByFid({ fid }),
  ]);

  if (userDatas.isErr()) {
    console.error(userDatas.error);
    throw new Error(userDatas.error.message);
  }
  if (usernameProofs.isErr()) {
    console.error(usernameProofs.error);
    throw new Error(usernameProofs.error.message);
  }
  // if (verifications.isErr()) {
  //   console.error(verifications.error);
  //   throw new Error(verifications.error.message);
  // }
  // if (casts.isErr()) {
  //   console.error(casts.error);
  //   throw new Error(casts.error.message);
  // }
  // if (reactions.isErr()) {
  //   console.error(reactions.error);
  //   throw new Error(reactions.error.message);
  // }
  // if (links.isErr()) {
  //   console.error(links.error);
  //   throw new Error(links.error.message);
  // }

  await Promise.all([
    prisma.farcasterUserData.deleteMany({ where: { fid: fid } }),
    prisma.farcasterUsernameProof.deleteMany({ where: { fid: fid } }),
    // prisma.farcasterVerification.deleteMany({ where: { fid: fid } }),
    // prisma.farcasterCast.deleteMany({ where: { fid: fid } }),
    // prisma.farcasterCastMention.deleteMany({ where: { fid: fid } }),
    // prisma.farcasterCastEmbedCast.deleteMany({ where: { fid: fid } }),
    // prisma.farcasterCastEmbedUrl.deleteMany({ where: { fid: fid } }),
    // prisma.farcasterCastReaction.deleteMany({ where: { fid: fid } }),
    // prisma.farcasterUrlReaction.deleteMany({ where: { fid: fid } }),
    // prisma.farcasterLink.deleteMany({ where: { fid: fid } }),
  ]);

  await Promise.all([
    backfillUserDatas(userDatas.value.messages),
    backfillUsernameProofs(usernameProofs.value.proofs),
    // backfillVerifications(verifications.value.messages),
    // backfillCasts(client, casts.value.messages),
    // backfillReactions(reactions.value.messages),
    // backfillLinks(links.value.messages),
  ]);

  console.log(
    `[${fid}] backfilled user datas - ${userDatas.value.messages.length}\n` +
      `[${fid}] backfilled username proofs - ${usernameProofs.value.proofs.length}\n`,
    // `[${fid}] backfilled verifications - ${verifications.value.messages.length}\n` +
    // `[${fid}] backfilled casts - ${casts.value.messages.length}\n` +
    // `[${fid}] backfilled reactions - ${reactions.value.messages.length}\n` +
    // `[${fid}] backfilled links - ${links.value.messages.length}`,
  );

  console.timeEnd(`[${fid}] backfill took`);
};

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);

  const inputFid = process.argv[2];
  if (inputFid) {
    for (let i = 10909; i < 18000; i++) {
      await processFid(client, i);
    }
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
