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
import { Payload } from "../types";
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
  const userDataEvents = await processor.batchProcessUserDataAdd(
    userDatas.map(transformToUserDataEvent),
  );
  console.timeEnd(`[${fid}] batchProcessUserDataAdd took`);
  console.log(`[${fid}] userDataEvents`, userDataEvents.length);

  console.time(`[${fid}] batchProcessVerificationAdd took`);
  const verificationEvents = await processor.batchProcessVerificationAdd(
    verifications.map((verification) =>
      transformToVerificationEvent(EventType.VERIFICATION_ADD, verification),
    ),
  );
  console.timeEnd(`[${fid}] batchProcessVerificationAdd took`);
  console.log(`[${fid}] verificationEvents`, verificationEvents.length);

  console.time(`[${fid}] batchProcessUsernameProofAdd took`);
  const usernameProofEvents = await processor.batchProcessUsernameProofAdd(
    usernames.map(transformToUsernameProofEvent),
  );
  console.timeEnd(`[${fid}] batchProcessUsernameProofAdd took`);
  console.log(`[${fid}] usernameProofEvents`, usernameProofEvents.length);

  console.time(`[${fid}] batchProcessLinkAdd took`);
  const linkEvents = await processor.batchProcessLinkAdd(
    links.map((link) => transformToLinkEvent(EventType.LINK_ADD, link)),
  );
  console.timeEnd(`[${fid}] batchProcessLinkAdd took`);
  console.log(`[${fid}] linkEvents`, linkEvents.length);

  console.time(`[${fid}] batchProcessUrlReactionAdd took`);
  const urlReactionEvents = await processor.batchProcessUrlReactionAdd(
    urlReactions.map((reaction) =>
      transformToUrlReactionEvent(EventType.URL_REACTION_ADD, reaction),
    ),
  );
  console.timeEnd(`[${fid}] batchProcessUrlReactionAdd took`);
  console.log(`[${fid}] urlReactionEvents`, urlReactionEvents.length);

  console.time(`[${fid}] batchProcessCastAdd took`);
  const castEvents = await processor.batchProcessCastAdd(
    casts.map((cast) => transformToCastEvent(EventType.CAST_ADD, cast)),
  );
  console.timeEnd(`[${fid}] batchProcessCastAdd took`);
  console.log(`[${fid}] castEvents`, castEvents.length);

  console.time(`[${fid}] batchProcessCastReactionAdd took`);
  const castReactionEvents = await processor.batchProcessCastReactionAdd(
    castReactions.map((reaction) =>
      transformToCastReactionEvent(EventType.CAST_REACTION_ADD, reaction),
    ),
  );
  console.timeEnd(`[${fid}] batchProcessCastReactionAdd took`);
  console.log(`[${fid}] castReactionEvents`, castReactionEvents.length);

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
