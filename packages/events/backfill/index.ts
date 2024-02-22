import {
  transformToCastEvent,
  transformToCastReactionEvent,
  transformToLinkEvent,
  transformToUrlReactionEvent,
  transformToUserDataEvent,
  transformToUsernameProofEvent,
  transformToVerificationEvent,
} from "@nook/common/farcaster";
import { MongoClient } from "@nook/common/mongo";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import { FarcasterProcessor } from "../handlers/farcaster/processor";
import { RedisClient } from "@nook/common/cache";
import { EventType } from "@nook/common/types";

const prisma = new PrismaClient();

const processFid = async (processor: FarcasterProcessor, fid: number) => {
  console.time(`[${fid}] backfill took`);

  console.log("fetching initial data");
  const [
    userDatas,
    verifications,
    usernames,
    links,
    urlReactions,
    castReactions,
    casts,
  ] = await Promise.all([
    prisma.farcasterUserData.findMany({
      where: { fid: fid },
    }),
    prisma.farcasterVerification.findMany({
      where: { fid: fid },
    }),
    prisma.farcasterUsernameProof.findMany({
      where: { fid: fid },
    }),
    prisma.farcasterLink.findMany({
      where: { fid: fid },
    }),
    prisma.farcasterUrlReaction.findMany({
      where: { fid: fid },
    }),
    prisma.farcasterCastReaction.findMany({
      where: { fid: fid },
    }),
    prisma.farcasterCast.findMany({
      where: { fid: fid },
    }),
  ]);

  console.log({
    userData: userDatas.length,
    verification: verifications.length,
    username: usernames.length,
    link: links.length,
    urlReaction: urlReactions.length,
    castReaction: castReactions.length,
    cast: casts.length,
  });

  console.time(`[${fid}] batchProcessUserDataAdd took`);
  const userDataResponse = await processor.processUserDataAdd(
    userDatas.map(transformToUserDataEvent),
  );
  console.timeEnd(`[${fid}] batchProcessUserDataAdd took`);
  console.log(`[${fid}] userDataEvents`, userDataResponse.events.length);

  console.time(`[${fid}] batchProcessVerificationAdd took`);
  const verificationResponse = await processor.processVerificationAddOrRemove(
    verifications.map((verification) =>
      transformToVerificationEvent(EventType.VERIFICATION_ADD, verification),
    ),
  );
  console.timeEnd(`[${fid}] batchProcessVerificationAdd took`);
  console.log(
    `[${fid}] verificationEvents`,
    verificationResponse.events.length,
  );

  console.time(`[${fid}] batchProcessUsernameProofAdd took`);
  const usernameProofResponse = await processor.processUsernameProofAdd(
    usernames.map(transformToUsernameProofEvent),
  );
  console.timeEnd(`[${fid}] batchProcessUsernameProofAdd took`);
  console.log(
    `[${fid}] usernameProofEvents`,
    usernameProofResponse.events.length,
  );

  console.time(`[${fid}] batchProcessLinkAdd took`);
  const linkResponse = await processor.processLinkAddOrRemove(
    links.map((link) => transformToLinkEvent(EventType.LINK_ADD, link)),
  );
  console.timeEnd(`[${fid}] batchProcessLinkAdd took`);
  console.log(`[${fid}] linkEvents`, linkResponse.events.length);

  console.time(`[${fid}] batchProcessUrlReactionAdd took`);
  const urlReactionResponse = await processor.processUrlReactionAddOrRemove(
    urlReactions.map((reaction) =>
      transformToUrlReactionEvent(EventType.URL_REACTION_ADD, reaction),
    ),
  );
  console.timeEnd(`[${fid}] batchProcessUrlReactionAdd took`);
  console.log(`[${fid}] urlReactionEvents`, urlReactionResponse.events.length);

  console.time(`[${fid}] batchProcessCastAdd took`);
  const castResponse = await processor.processCastAddOrRemove(
    casts.map((cast) => transformToCastEvent(EventType.CAST_ADD, cast)),
  );
  console.timeEnd(`[${fid}] batchProcessCastAdd took`);
  console.log(`[${fid}] castEvents`, castResponse.events.length);

  console.time(`[${fid}] batchProcessCastReactionAdd took`);
  const castReactionResponse = await processor.processCastReactionAddOrRemove(
    castReactions.map((reaction) =>
      transformToCastReactionEvent(EventType.CAST_REACTION_ADD, reaction),
    ),
  );
  console.timeEnd(`[${fid}] batchProcessCastReactionAdd took`);
  console.log(
    `[${fid}] castReactionEvents`,
    castReactionResponse.events.length,
  );

  console.timeEnd(`[${fid}] backfill took`);
};

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  const redis = new RedisClient();
  await redis.connect();

  const inputFid = process.argv[2];
  if (inputFid) {
    const processor = new FarcasterProcessor(client, redis);
    await processFid(processor, Number(inputFid));
    process.exit(0);
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
