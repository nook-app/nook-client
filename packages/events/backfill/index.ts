import {
  transformToCastEvent,
  transformToCastReactionEvent,
  transformToLinkEvent,
  transformToUrlReactionEvent,
  transformToUserDataEvent,
  transformToUsernameProofEvent,
  transformToVerificationEvent,
} from "@nook/common/farcaster";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import { FarcasterProcessor } from "../handlers/farcaster/processor";
import { RedisClient } from "@nook/common/cache";
import { Content, ContentData, EventType } from "@nook/common/types";
import { QueueName, getWorker } from "@nook/common/queues";

const prisma = new PrismaClient();

const processUserDatas = async (processor: FarcasterProcessor, fid: number) => {
  const userDatas = await prisma.farcasterUserData.findMany({
    where: { fid: fid },
  });
  const userDataResponse = await processor.processUserDataAdd(
    userDatas.map(transformToUserDataEvent),
  );
  return userDataResponse;
};

const processVerifications = async (
  processor: FarcasterProcessor,
  fid: number,
) => {
  const verifications = await prisma.farcasterVerification.findMany({
    where: { fid: fid },
  });
  const verificationResponse = await processor.processVerificationAddOrRemove(
    verifications.map((verification) =>
      transformToVerificationEvent(EventType.VERIFICATION_ADD, verification),
    ),
  );
  return verificationResponse;
};

const processUsernames = async (processor: FarcasterProcessor, fid: number) => {
  const usernames = await prisma.farcasterUsernameProof.findMany({
    where: { fid: fid },
  });
  const usernameProofResponse = await processor.processUsernameProofAdd(
    usernames.map(transformToUsernameProofEvent),
  );
  return usernameProofResponse;
};

const processLinks = async (processor: FarcasterProcessor, fid: number) => {
  const links = await prisma.farcasterLink.findMany({
    where: { fid: fid },
  });
  const linkResponse = await processor.processLinkAddOrRemove(
    links.map((link) => transformToLinkEvent(EventType.LINK_ADD, link)),
  );
  return linkResponse;
};

const processUrlReactions = async (
  processor: FarcasterProcessor,
  fid: number,
) => {
  const urlReactions = await prisma.farcasterUrlReaction.findMany({
    where: { fid: fid },
  });
  const urlReactionResponse = await processor.processUrlReactionAddOrRemove(
    urlReactions.map((reaction) =>
      transformToUrlReactionEvent(EventType.URL_REACTION_ADD, reaction),
    ),
  );
  return urlReactionResponse;
};

const processCastReactions = async (
  processor: FarcasterProcessor,
  fid: number,
) => {
  const castReactions = await prisma.farcasterCastReaction.findMany({
    where: { fid: fid },
  });
  const castReactionResponse = await processor.processCastReactionAddOrRemove(
    castReactions.map((reaction) =>
      transformToCastReactionEvent(EventType.CAST_REACTION_ADD, reaction),
    ),
  );
  return castReactionResponse;
};

const processCasts = async (processor: FarcasterProcessor, fid: number) => {
  const casts = await prisma.farcasterCast.findMany({
    where: { fid: fid },
  });
  const castResponse = await processor.processCastAddOrRemove(
    casts.map((cast) => transformToCastEvent(EventType.CAST_ADD, cast)),
  );
  return castResponse;
};

const processFid = async (processor: FarcasterProcessor, fid: number) => {
  console.time(`[${fid}] backfill took`);

  const responses = [];
  responses.push(await processUserDatas(processor, fid));
  responses.push(await processVerifications(processor, fid));
  responses.push(await processUsernames(processor, fid));
  responses.push(await processLinks(processor, fid));
  responses.push(await processUrlReactions(processor, fid));
  responses.push(await processCastReactions(processor, fid));
  responses.push(await processCasts(processor, fid));

  const responseEvents = responses.flatMap((response) => response.events);
  const events = responseEvents.map(({ event }) => event);
  const actions = responseEvents.flatMap(({ actions }) => actions);
  const contents = responses.flatMap((response) => response.contents || []);
  const contentMap = contents.reduce(
    (acc, content) => {
      acc[content.contentId] = content;
      return acc;
    },
    {} as Record<string, Content<ContentData>>,
  );

  let duplicateEvents = 0;
  let duplicateActions = 0;
  let duplicateContents = 0;

  const promises = [];
  if (events.length > 0) {
    promises.push(
      processor.client
        .getCollection(MongoCollection.Events)
        .insertMany(events, {
          ordered: false,
        })
        .catch((err) => {
          if (err?.code === 11000) {
            duplicateEvents++;
            return;
          }
          console.error(`[${fid}] ERROR`, err);
        }),
    );
  }

  if (actions.length > 0) {
    promises.push(
      processor.client
        .getCollection(MongoCollection.Actions)
        .insertMany(actions, {
          ordered: false,
        })
        .catch((err) => {
          if (err?.code === 11000) {
            duplicateActions++;
            return;
          }
          console.error(`[${fid}] ERROR`, err);
        }),
    );
  }

  if (Object.keys(contentMap).length > 0) {
    promises.push(
      processor.client
        .getCollection(MongoCollection.Content)
        .insertMany(Object.values(contentMap), {
          ordered: false,
        })
        .catch((err) => {
          if (err?.code === 11000) {
            duplicateContents++;
            return;
          }
          console.error(`[${fid}] ERROR`, err);
        }),
    );
  }

  await Promise.all(promises);

  console.timeEnd(`[${fid}] backfill took`);
  console.log(
    `[${fid}] ${events.length} events, duplicates ${duplicateEvents}`,
  );
  console.log(
    `[${fid}] ${actions.length} actions, duplicates ${duplicateActions}`,
  );
  console.log(
    `[${fid}] ${
      Object.keys(contents).length
    } contents, duplicates ${duplicateContents}`,
  );
};

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  const redis = new RedisClient();
  await redis.connect();

  const processor = new FarcasterProcessor(client, redis);

  const inputFid = process.argv[2];
  if (inputFid) {
    await processFid(processor, Number(inputFid));
    process.exit(0);
  }

  const worker = getWorker(QueueName.EventsBackfill, async (job) => {
    const fid = Number(job.data.fid);
    await processFid(processor, fid);

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
